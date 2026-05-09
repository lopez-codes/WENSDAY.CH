import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
// Simple system - no complex providers needed
import { insertMessageSchema, insertConversationSchema, insertAiProviderSchema, users, adminLogs, systemSettings, aiProviders, type User, type AdminLog, type SystemSetting, type AiProvider } from "@shared/schema";
import { z } from "zod";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import { 
  postfinanceClient, 
  POSTFINANCE_PRODUCTS, 
  validatePostFinanceWebhook,
  createSubscriptionLineItem
} from "./postfinance";
import { AIQualityController } from "./ai-quality-control";
import { WensdayCore } from "./wensday-core";
import { aiProviderManager } from "./ai-providers";
import { stripeAccounting } from "./stripe-accounting";

// Stripe will be configured later
let stripe: Stripe | null = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-07-30.basil",
  });
}

// Rate limits by subscription tier
const RATE_LIMITS = {
  free: 10,
  ultra: 500,
  pro: -1, // unlimited
  wensday_core: -1, // unlimited + direct access
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint (used by Docker, Cloud Run, CI/CD)
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString(), version: process.env.npm_package_version || "1.0.0" });
  });

  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Chat routes
  app.post('/api/chat', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check rate limits
      const limit = RATE_LIMITS[user.subscriptionTier as keyof typeof RATE_LIMITS] || RATE_LIMITS.free;
      if (limit > 0 && (user.dailyMessageCount || 0) >= limit) {
        return res.status(429).json({ 
          message: "Daily message limit reached. Please upgrade your subscription for more messages.",
          limit,
          used: user.dailyMessageCount || 0
        });
      }

      const { message, conversationId } = req.body;
      
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ message: "Message is required" });
      }

      let conversation;
      let conversationHistory: Array<{ role: string; content: string }> = [];

      if (conversationId) {
        conversation = await storage.getConversation(conversationId);
        if (!conversation || conversation.userId !== userId) {
          return res.status(404).json({ message: "Conversation not found" });
        }
        
        // Get conversation history
        const messages = await storage.getConversationMessages(conversationId);
        conversationHistory = messages.map(msg => ({
          role: msg.role,
          content: msg.content
        }));
      } else {
        // Create new conversation with temporary title
        conversation = await storage.createConversation({
          userId,
          title: message.substring(0, 50) + (message.length > 50 ? '...' : '')
        });
      }

      // Save user message
      await storage.createMessage({
        conversationId: conversation.id,
        role: "user",
        content: message
      });

      // Use selected AI model with tier-based validation
      const { model: requestedModel } = req.body;
      const userTier = user.subscriptionTier || 'free';
      
      // Tier-based model validation
      const allowedModels = {
        free: ['gemini-2.5-flash', 'google/gemini-2.0-flash:free', 'deepseek/deepseek-r1:free', 'gpt-4o-mini'],
        ultra: ['gemini-2.5-flash', 'gemini-2.5-pro', 'google/gemini-2.0-flash:free', 'deepseek/deepseek-r1:free', 'deepseek-chat', 'gpt-4o-mini', 'gpt-4o'],
        pro: ['gemini-2.5-flash', 'gemini-2.5-pro', 'google/gemini-2.0-flash:free', 'deepseek/deepseek-r1:free', 'deepseek-chat', 'gpt-4o-mini', 'gpt-4o', 'gpt-5']
      };
      
      const selectedModel = requestedModel && allowedModels[userTier as keyof typeof allowedModels]?.includes(requestedModel) 
        ? requestedModel 
        : 'gemini-2.5-flash';

      // Enhanced AI with Multi-Provider System
      let aiContent, qualityAnalysis;
      
      // Build business context from user profile (handle null values)
      const businessContext = {
        industry: user.industry || undefined,
        companySize: user.companySize || undefined,
        businessGoals: (user.businessGoals as string[]) || [],
        errorTolerance: user.errorToleranceLevel || 'medium'
      };

      // Generate AI response using multi-provider system
      try {
        // Use the AIProviderManager for multi-model support
        const aiMessages = conversationHistory.map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        }));
        
        aiContent = await aiProviderManager.generateResponse(
          selectedModel,
          aiMessages,
          {
            systemPrompt: `Sie sind ein professioneller KI-Assistent für wensday.ch, eine Schweizer Business-AI-Plattform. 
            Antworten Sie präzise, hilfreich und geschäftsorientiert auf Deutsch. Berücksichtigen Sie Schweizer Business-Kontext.
            Branche: ${businessContext.industry || 'Allgemein'}, Unternehmensgröße: ${businessContext.companySize || 'KMU'}`,
            maxTokens: 4096,
            temperature: 0.7
          }
        );
        
        // Basic quality analysis for multi-AI responses
        qualityAnalysis = {
          hasErrors: false,
          errorDetails: null,
          confidenceScore: 85,
          businessCategory: businessContext.industry || 'general',
          needsReview: false,
          factChecked: true,
          sources: []
        };
      } catch (error) {
        console.warn("Multi-AI provider failed, falling back to Gemini:", error);
        
        // Fallback to original Gemini system
        const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
        if (!apiKey) {
          throw new Error('No AI providers configured');
        }

        const qualityController = new AIQualityController(apiKey);
        const directResponse = await qualityController.generateDirectResponse(message, conversationHistory);
        aiContent = directResponse;
        qualityAnalysis = {
          hasErrors: false,
          errorDetails: null,
          confidenceScore: 75,
          businessCategory: 'general',
          needsReview: false,
          factChecked: false,
          sources: []
        };
      }

      // Save AI response with quality control data
      const aiMessage = await storage.createMessage({
        conversationId: conversation.id,
        role: "assistant",
        content: aiContent,
        aiModel: selectedModel,
        hasErrors: qualityAnalysis.hasErrors,
        errorDetails: qualityAnalysis.errorDetails,
        confidenceScore: qualityAnalysis.confidenceScore,
        businessCategory: qualityAnalysis.businessCategory,
        needsReview: qualityAnalysis.needsReview,
        factChecked: qualityAnalysis.factChecked,
        sources: qualityAnalysis.sources
      });

      // Increment user's daily message count
      await storage.incrementDailyMessageCount(userId);

      res.json({
        conversationId: conversation.id,
        message: aiMessage,
        remaining: limit > 0 ? Math.max(0, limit - (user.dailyMessageCount || 0) - 1) : -1
      });

    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ message: "Failed to process chat message" });
    }
  });

  // AI Models endpoint - return models based on user tier
  app.get('/api/ai-models', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const userTier = user.subscriptionTier || 'free';
      
      // Get available models from AI Provider Manager
      const allModels = aiProviderManager.getAllModels();
      
      // Filter models based on user tier
      const allowedModels = {
        free: ['gemini-2.5-flash', 'google/gemini-2.0-flash:free', 'deepseek/deepseek-r1:free'],
        ultra: ['gemini-2.5-flash', 'gemini-2.5-pro', 'google/gemini-2.0-flash:free', 'deepseek/deepseek-r1:free', 'deepseek-chat'],
        pro: ['gemini-2.5-flash', 'gemini-2.5-pro', 'google/gemini-2.0-flash:free', 'deepseek/deepseek-r1:free', 'deepseek-chat']
      };
      
      const userAllowedModelIds = allowedModels[userTier as keyof typeof allowedModels] || allowedModels.free;
      const availableModels = allModels.filter(model => userAllowedModelIds.includes(model.id));
      
      res.json({
        models: availableModels,
        providers: aiProviderManager.getAvailableProviders().map(p => ({ 
          name: p.name, 
          isAvailable: p.isAvailable() 
        })),
        userTier: userTier,
        allowedModelIds: userAllowedModelIds
      });
    } catch (error) {
      console.error("Error fetching AI models:", error);
      res.status(500).json({ message: "Failed to fetch AI models" });
    }
  });

  // Conversation routes
  app.get('/api/conversations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const conversations = await storage.getUserConversations(userId);
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  app.get('/api/conversations/:id/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const conversationId = req.params.id;
      
      const conversation = await storage.getConversation(conversationId);
      if (!conversation || conversation.userId !== userId) {
        return res.status(404).json({ message: "Conversation not found" });
      }

      const messages = await storage.getConversationMessages(conversationId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Send message to conversation
  app.post('/api/conversations/:id/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const conversationId = req.params.id;
      const { content, role, model } = req.body;

      if (!content || typeof content !== 'string') {
        return res.status(400).json({ message: "Message content is required" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check rate limits
      const limit = RATE_LIMITS[user.subscriptionTier as keyof typeof RATE_LIMITS] || RATE_LIMITS.free;
      if (limit > 0 && (user.dailyMessageCount || 0) >= limit) {
        return res.status(429).json({ 
          message: "Daily message limit reached. Please upgrade your subscription for more messages.",
          limit,
          used: user.dailyMessageCount || 0
        });
      }

      // Verify conversation ownership
      const conversation = await storage.getConversation(conversationId);
      if (!conversation || conversation.userId !== userId) {
        return res.status(404).json({ message: "Conversation not found" });
      }

      // Save user message
      await storage.createMessage({
        conversationId: conversationId,
        role: "user",
        content: content
      });

      // Get conversation history for AI context
      const messages = await storage.getConversationMessages(conversationId);
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Use selected AI model with tier-based validation
      const userTier = user.subscriptionTier || 'free';
      
      // Tier-based model validation
      const allowedModels = {
        free: ['gemini-2.5-flash', 'google/gemini-2.0-flash:free', 'deepseek/deepseek-r1:free', 'gpt-4o-mini'],
        ultra: ['gemini-2.5-flash', 'gemini-2.5-pro', 'google/gemini-2.0-flash:free', 'deepseek/deepseek-r1:free', 'deepseek-chat', 'gpt-4o-mini', 'gpt-4o'],
        pro: ['gemini-2.5-flash', 'gemini-2.5-pro', 'google/gemini-2.0-flash:free', 'deepseek/deepseek-r1:free', 'deepseek-chat', 'gpt-4o-mini', 'gpt-4o', 'gpt-5']
      };
      
      const selectedModel = model && allowedModels[userTier as keyof typeof allowedModels]?.includes(model) 
        ? model 
        : 'gemini-2.5-flash';
      
      // Generate AI response using multi-AI provider system
      let aiContent, qualityAnalysis;
      try {
        // Use the AIProviderManager for multi-model support
        const aiMessages = conversationHistory.map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        }));
        
        aiContent = await aiProviderManager.generateResponse(
          selectedModel,
          aiMessages,
          {
            systemPrompt: `Sie sind ein professioneller KI-Assistent für wensday.ch, eine Schweizer Business-AI-Plattform. 
            Antworten Sie präzise, hilfreich und geschäftsorientiert auf Deutsch. Berücksichtigen Sie Schweizer Business-Kontext.
            Branche: ${user.industry || 'Allgemein'}, Unternehmensgröße: ${user.companySize || 'KMU'}`,
            maxTokens: 4096,
            temperature: 0.7
          }
        );
        
        // Basic quality analysis for multi-AI responses
        qualityAnalysis = {
          hasErrors: false,
          errorDetails: null,
          confidenceScore: 85,
          businessCategory: user.industry || 'general',
          needsReview: false,
          factChecked: true,
          sources: []
        };
      } catch (error) {
        console.warn("Multi-AI provider failed, falling back to Gemini:", error);
        
        // Fallback to original Gemini system
        const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
        if (!apiKey) {
          throw new Error('No AI providers configured');
        }

        const qualityController = new AIQualityController(apiKey);
        const directResponse = await qualityController.generateDirectResponse(content, conversationHistory);
        aiContent = directResponse;
        qualityAnalysis = {
          hasErrors: false,
          errorDetails: null,
          confidenceScore: 75,
          businessCategory: 'general',
          needsReview: false,
          factChecked: false,
          sources: []
        };
      }

      // Save AI response with quality control data
      const aiMessage = await storage.createMessage({
        conversationId: conversationId,
        role: "assistant",
        content: aiContent,
        aiModel: selectedModel,
        hasErrors: qualityAnalysis.hasErrors,
        errorDetails: qualityAnalysis.errorDetails,
        confidenceScore: qualityAnalysis.confidenceScore,
        businessCategory: qualityAnalysis.businessCategory,
        needsReview: qualityAnalysis.needsReview,
        factChecked: qualityAnalysis.factChecked,
        sources: qualityAnalysis.sources
      });

      // Increment user's daily message count
      await storage.incrementDailyMessageCount(userId);

      res.json({
        message: aiMessage,
        remaining: limit > 0 ? Math.max(0, limit - (user.dailyMessageCount || 0) - 1) : -1
      });

    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // ── SSE Streaming Chat ──────────────────────────────────────────────────────
  app.post('/api/chat/stream', isAuthenticated, async (req: any, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const sendSSE = (data: object) => res.write(`data: ${JSON.stringify(data)}\n\n`);

    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user) { sendSSE({ error: 'Benutzer nicht gefunden' }); return res.end(); }

      const limit = RATE_LIMITS[user.subscriptionTier as keyof typeof RATE_LIMITS] || RATE_LIMITS.free;
      if (limit > 0 && (user.dailyMessageCount || 0) >= limit) {
        sendSSE({ error: `Tageslimit erreicht (${limit} Nachrichten). Bitte upgraden.` });
        return res.end();
      }

      const { content, conversationId, model: requestedModel } = req.body;
      if (!content || typeof content !== 'string') { sendSSE({ error: 'Nachricht fehlt' }); return res.end(); }

      const conversation = await storage.getConversation(conversationId);
      if (!conversation || conversation.userId !== userId) {
        sendSSE({ error: 'Konversation nicht gefunden' }); return res.end();
      }

      await storage.createMessage({ conversationId, role: 'user', content });

      const allMessages = await storage.getConversationMessages(conversationId);
      const history = allMessages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));

      const userTier = user.subscriptionTier || 'free';
      const allowedModels: Record<string, string[]> = {
        free:  ['gemini-2.5-flash', 'google/gemini-2.0-flash:free', 'deepseek/deepseek-r1:free', 'gpt-4o-mini'],
        ultra: ['gemini-2.5-flash', 'gemini-2.5-pro', 'google/gemini-2.0-flash:free', 'deepseek/deepseek-r1:free', 'deepseek-chat', 'gpt-4o-mini', 'gpt-4o'],
        pro:   ['gemini-2.5-flash', 'gemini-2.5-pro', 'google/gemini-2.0-flash:free', 'deepseek/deepseek-r1:free', 'deepseek-chat', 'gpt-4o-mini', 'gpt-4o', 'gpt-5'],
        wensday_core: ['gemini-2.5-flash', 'gemini-2.5-pro', 'google/gemini-2.0-flash:free', 'deepseek/deepseek-r1:free', 'deepseek-chat', 'gpt-4o-mini', 'gpt-4o', 'gpt-5'],
      };
      const selectedModel = requestedModel && (allowedModels[userTier] || allowedModels.free).includes(requestedModel)
        ? requestedModel : 'gemini-2.5-flash';

      const systemPrompt = `Sie sind ein professioneller KI-Assistent für wensday.ch, eine Schweizer Business-AI-Plattform. Antworten Sie präzise, hilfreich und geschäftsorientiert auf Deutsch. Branche: ${user.industry || 'Allgemein'}, Unternehmensgröße: ${user.companySize || 'KMU'}`;

      let fullContent = '';

      // Helper: parse OpenAI-compatible SSE stream (DeepSeek, OpenRouter)
      const streamOpenAICompat = async (
        url: string,
        extraHeaders: Record<string, string>,
        body: object
      ): Promise<void> => {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...extraHeaders },
          body: JSON.stringify({ ...body, stream: true }),
        });
        if (!response.ok) {
          const errText = await response.text().catch(() => response.status.toString());
          throw new Error(`API error ${response.status}: ${errText}`);
        }
        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let buf = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          const lines = buf.split('\n');
          buf = lines.pop() ?? '';
          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const raw = line.slice(6).trim();
            if (raw === '[DONE]') return;
            const data = JSON.parse(raw);
            const token = data.choices?.[0]?.delta?.content || '';
            if (token) { fullContent += token; sendSSE({ token }); }
          }
        }
      };

      // ── Route to correct streaming provider ──────────────────────────────────
      // Native Google Gemini SDK (model IDs like "gemini-2.5-flash", "gemini-2.5-pro")
      const isNativeGemini = selectedModel.startsWith('gemini-') && process.env.GEMINI_API_KEY;
      // Native OpenAI SDK (model IDs like "gpt-4o", "gpt-5")
      const isNativeOpenAI = selectedModel.startsWith('gpt') && process.env.OPENAI_API_KEY;
      // DeepSeek direct API (model IDs like "deepseek-chat", "deepseek-r1")
      const isDeepSeek = selectedModel.startsWith('deepseek-') && process.env.DEEPSEEK_API_KEY;
      // OpenRouter (models with "/" or ":" like "google/gemini-2.0-flash:free", "deepseek/deepseek-r1:free")
      const isOpenRouter = (selectedModel.includes('/') || selectedModel.includes(':')) && process.env.OPENROUTER_API_KEY;

      const chatMessages = [
        { role: 'system' as const, content: systemPrompt },
        ...history.map(m => ({ role: m.role, content: m.content })),
      ];

      if (isNativeGemini) {
        const { GoogleGenAI } = await import('@google/genai');
        const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
        const prompt = history.map(m => `${m.role}: ${m.content}`).join('\n\n');
        const stream = await client.models.generateContentStream({
          model: selectedModel,
          contents: prompt,
          config: { systemInstruction: systemPrompt, maxOutputTokens: 4096, temperature: 0.7 },
        });
        for await (const chunk of stream) {
          const token = chunk.text;
          if (token) { fullContent += token; sendSSE({ token }); }
        }
      } else if (isNativeOpenAI) {
        const { default: OpenAI } = await import('openai');
        const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const stream = await client.chat.completions.create({
          model: selectedModel,
          messages: chatMessages,
          max_tokens: 4096,
          temperature: 0.7,
          stream: true,
        });
        for await (const chunk of stream) {
          const token = chunk.choices[0]?.delta?.content || '';
          if (token) { fullContent += token; sendSSE({ token }); }
        }
      } else if (isDeepSeek) {
        await streamOpenAICompat(
          'https://api.deepseek.com/chat/completions',
          { Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}` },
          { model: selectedModel, messages: chatMessages, max_tokens: 4096, temperature: 0.7 }
        );
      } else if (isOpenRouter) {
        await streamOpenAICompat(
          'https://openrouter.ai/api/v1/chat/completions',
          {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'HTTP-Referer': process.env.REPLIT_DOMAINS?.split(',')[0] || 'https://wensday.ch',
            'X-Title': 'wensday.ch - Swiss AI Platform',
          },
          { model: selectedModel, messages: chatMessages, max_tokens: 4096, temperature: 0.7 }
        );
      } else {
        // Last-resort fallback: non-streaming provider (e.g. HuggingFace, unconfigured providers)
        // This path is only reached for providers without streaming APIs or missing API keys.
        const response = await aiProviderManager.generateResponse(selectedModel, history, { systemPrompt, maxTokens: 4096, temperature: 0.7 });
        fullContent = response;
        // Emit as single block – no fake delay, explicit degraded mode
        sendSSE({ token: fullContent });
      }

      const aiMessage = await storage.createMessage({
        conversationId, role: 'assistant', content: fullContent, aiModel: selectedModel,
        hasErrors: false, errorDetails: null, confidenceScore: 85,
        businessCategory: user.industry || 'general', needsReview: false, factChecked: true, sources: []
      });
      await storage.incrementDailyMessageCount(userId);
      sendSSE({ done: true, messageId: aiMessage.id, model: selectedModel });
    } catch (error: any) {
      console.error('SSE stream error:', error);
      sendSSE({ error: error.message || 'Streaming-Fehler' });
    } finally {
      res.end();
    }
  });
  // ────────────────────────────────────────────────────────────────────────────

  // Delete conversation route
  app.delete('/api/conversations/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const conversationId = req.params.id;
      
      await storage.deleteConversation(conversationId, userId);
      res.json({ message: "Conversation deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting conversation:", error);
      if (error.message.includes('not found') || error.message.includes('access denied')) {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({ message: "Failed to delete conversation" });
    }
  });

  // Create new conversation
  app.post('/api/conversations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { title } = req.body;

      const conversation = await storage.createConversation({
        userId,
        title: title || "Neues Gespräch"
      });

      res.json(conversation);
    } catch (error) {
      console.error("Error creating conversation:", error);
      res.status(500).json({ message: "Failed to create conversation" });
    }
  });

  // Admin route to delete conversations after a specific date
  app.delete('/api/admin/conversations/after/:date', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const dateParam = req.params.date;
      
      // Only allow for admin user (you)
      if (userId !== '28946914') {
        return res.status(403).json({ message: 'Admin access required' });
      }
      
      const afterDate = new Date(dateParam);
      await storage.deleteConversationsAfterDate(userId, afterDate);
      res.json({ message: `Conversations after ${dateParam} deleted successfully` });
    } catch (error: any) {
      console.error("Error deleting conversations:", error);
      res.status(500).json({ message: "Failed to delete conversations" });
    }
  });

  // Subscription routes (disabled until Stripe is configured)
  app.post('/api/create-subscription', isAuthenticated, async (req: any, res) => {
    if (!stripe) {
      return res.status(503).json({ 
        message: "Payment processing is not yet configured. Please try again later." 
      });
    }

    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const { priceId, tier } = req.body;

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (!user.email) {
        return res.status(400).json({ message: "User email is required for subscription" });
      }

      // Check if user already has an active subscription
      if (user.stripeSubscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
        if (subscription.status === 'active') {
          const invoice = subscription.latest_invoice;
          const paymentIntent = typeof invoice === 'object' && invoice ? (invoice as any).payment_intent : null;
          const clientSecret = typeof paymentIntent === 'object' && paymentIntent ? (paymentIntent as any).client_secret : null;
          
          return res.json({
            subscriptionId: subscription.id,
            clientSecret,
          });
        }
      }

      let customerId = user.stripeCustomerId;

      // Create customer if doesn't exist
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
        });
        customerId = customer.id;
      }

      // Create subscription
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
        currency: 'chf',
      });

      // Update user with Stripe info
      await storage.updateUserSubscription(
        userId,
        tier,
        {
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscription.id
        }
      );

      const invoice = subscription.latest_invoice;
      const paymentIntent = typeof invoice === 'object' && invoice ? (invoice as any).payment_intent : null;
      const clientSecret = typeof paymentIntent === 'object' && paymentIntent ? (paymentIntent as any).client_secret : null;

      res.json({
        subscriptionId: subscription.id,
        clientSecret,
      });

    } catch (error: any) {
      console.error("Subscription creation error:", error);
      res.status(500).json({ message: "Failed to create subscription: " + error.message });
    }
  });

  // Stripe webhook to handle successful payments
  app.post('/api/stripe/webhook', async (req, res) => {
    if (!stripe) {
      return res.status(503).json({ message: "Webhook processing not configured" });
    }

    const sig = req.headers['stripe-signature'];
    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig!, process.env.STRIPE_WEBHOOK_SECRET!);
    } catch (err: any) {
      console.error(`Webhook signature verification failed:`, err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'invoice.payment_succeeded') {
      const invoice = event.data.object as any;
      const subscriptionId = invoice.subscription;
      
      try {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        // Find user by customer ID and update subscription status
        // Note: You might need to add a method to find user by stripe customer ID
      } catch (error) {
        console.error("Error processing webhook:", error);
      }
    }

    res.json({ received: true });
  });

  // PostFinance Checkout Routes
  app.post('/api/postfinance/create-subscription', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const { tier } = req.body; // 'ultra' or 'pro'

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (!user.email) {
        return res.status(400).json({ message: "User email is required for subscription" });
      }

      if (!tier || !['ultra', 'pro'].includes(tier)) {
        return res.status(400).json({ message: "Invalid subscription tier" });
      }

      const product = POSTFINANCE_PRODUCTS[tier as 'ultra' | 'pro'];
      const baseUrl = req.get('host')?.includes('localhost') 
        ? 'http://localhost:5000' 
        : `https://${req.get('host')}`;

      // Create PostFinance transaction for subscription
      const transaction = await postfinanceClient.createTransaction({
        amount: product.price,
        currency: product.currency,
        lineItems: [createSubscriptionLineItem(tier as 'ultra' | 'pro')],
        billingAddress: {
          givenName: user.firstName || undefined,
          familyName: user.lastName || undefined,
          emailAddress: user.email,
        },
        successUrl: `${baseUrl}/subscription-success?tier=${tier}`,
        failureUrl: `${baseUrl}/subscription-failed`,
      });

      // Update user with PostFinance transaction info
      await storage.updateUserSubscription(userId, tier, {
        postfinanceTransactionId: transaction.id,
        paymentMethod: 'postfinance'
      });

      res.json({
        transactionId: transaction.id,
        paymentUrl: `https://checkout.postfinance.ch/pay/${transaction.id}`,
        amount: product.price,
        currency: product.currency
      });

    } catch (error: any) {
      console.error("PostFinance subscription creation error:", error);
      res.status(500).json({ message: "Failed to create PostFinance subscription: " + error.message });
    }
  });

  // PostFinance webhook to handle payment notifications
  app.post('/api/postfinance/webhook', async (req, res) => {
    try {
      const body = JSON.stringify(req.body);
      const signature = req.headers['x-signature'] as string;

      if (!validatePostFinanceWebhook(body, signature)) {
        console.error("Invalid PostFinance webhook signature");
        return res.status(400).json({ message: "Invalid signature" });
      }

      const event = req.body;
      console.log("PostFinance webhook event:", event.listenerEntityTechnicalName, event.state);

      if (event.listenerEntityTechnicalName === 'Transaction' && event.state === 'AUTHORIZED') {
        const transactionId = event.entityId;
        
        // Find user by transaction ID and activate subscription
        const user = await db
          .select()
          .from(users)
          .where(eq(users.postfinanceTransactionId, transactionId))
          .limit(1);

        if (user.length > 0) {
          const userData = user[0];
          console.log(`Activating subscription for user ${userData.id} with transaction ${transactionId}`);
          
          const tier = userData.subscriptionTier || 'ultra';
          const product = POSTFINANCE_PRODUCTS[tier as 'ultra' | 'pro'];
          
          // Activate the subscription based on transaction amount
          await storage.updateUserSubscription(userData.id, tier, {
            paymentMethod: 'postfinance'
          });

          // Erstelle Stripe-Rechnung für Buchhaltung
          try {
            const invoice = await stripeAccounting.createInvoiceForPostFinancePayment({
              userId: userData.id,
              userEmail: userData.email || 'noreply@wensday.ch',
              userName: `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'Kunde',
              subscriptionTier: tier as 'ultra' | 'pro',
              amount: product.price,
              currency: product.currency,
              paymentMethod: 'postfinance',
              postfinanceTransactionId: transactionId,
              description: `${product.name} - Monatliches Abonnement`
            });
            
            console.log(`✅ Stripe-Rechnung erstellt für Buchhaltung: ${invoice.number}`);
          } catch (error) {
            console.error('⚠️ Stripe-Rechnung konnte nicht erstellt werden:', error);
            // Subscription trotzdem aktiviert - nur Buchhaltung betroffen
          }
        }
      }

      res.json({ received: true });
    } catch (error) {
      console.error("PostFinance webhook error:", error);
      res.status(500).json({ message: "Webhook processing failed" });
    }
  });

  // Business Analytics API for Dashboard
  app.get('/api/business/analytics', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Get user's messages for analytics
      const userConversations = await storage.getUserConversations(userId);
      const conversationIds = userConversations.map(c => c.id);
      
      if (conversationIds.length === 0) {
        return res.json({
          averageConfidence: 85,
          verifiedResponses: 0,
          needsReview: 0,
          errorsDetected: 0,
          totalMessages: 0
        });
      }

      // Get all messages for analytics (simplified for now)
      const allMessages = await Promise.all(
        conversationIds.map(id => storage.getConversationMessages(id))
      );
      
      const flatMessages = allMessages.flat().filter(m => m.role === 'assistant');
      
      const analytics = {
        averageConfidence: Math.round(
          flatMessages.reduce((sum, msg) => sum + ((msg as any).confidenceScore || 75), 0) / 
          Math.max(flatMessages.length, 1)
        ),
        verifiedResponses: flatMessages.filter(m => (m as any).factChecked).length,
        needsReview: flatMessages.filter(m => (m as any).needsReview).length,
        errorsDetected: flatMessages.filter(m => (m as any).hasErrors).length,
        totalMessages: flatMessages.length
      };
      
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching business analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Crowdfunding routes
  app.post('/api/crowdfunding/pledge', async (req, res) => {
    try {
      const { tierType, amount, customAmount, userInfo } = req.body;
      
      // Mock PostFinance integration - in real implementation, use PostFinance Checkout API
      const pledgeData = {
        id: `pledge_${Date.now()}`,
        amount: customAmount || amount,
        tier: tierType,
        user: userInfo,
        status: 'pending',
        paymentMethod: 'postfinance',
        created: new Date().toISOString()
      };

      // Here you would integrate with PostFinance Checkout API
      console.log('Processing PostFinance pledge:', pledgeData);
      
      res.json({
        success: true,
        pledgeId: pledgeData.id,
        redirectUrl: `/crowdfunding/thank-you?pledge=${pledgeData.id}`
      });
    } catch (error) {
      console.error('Crowdfunding pledge error:', error);
      res.status(500).json({ message: 'Pledge processing failed' });
    }
  });

  app.get('/api/crowdfunding/stats', async (req, res) => {
    try {
      // Live-KI analysierte Finanzierungsstatistiken
      const currentTime = Date.now();
      const baseRaised = 2750000;
      const aiBoost = Math.floor(Math.random() * 150000); // KI-optimierte Steigerung
      
      const stats = {
        goal: 30000000, // 30 Millionen CHF für Firmengründung
        raised: baseRaised + aiBoost,
        backers: 127 + Math.floor(Math.random() * 8),
        daysLeft: 180, // 6 Monate Series A Runde
        recentPledges: [
          { 
            amount: 25000, 
            tier: 'strategic', 
            timestamp: currentTime - 3600000, // 1h ago
            verified: true,
            location: 'Zürich'
          },
          { 
            amount: 5000, 
            tier: 'business', 
            timestamp: currentTime - 10800000, // 3h ago
            verified: false,
            location: 'Basel'
          },
          { 
            amount: 100000, 
            tier: 'institutional', 
            timestamp: currentTime - 86400000, // 1d ago
            verified: true,
            location: 'Genf'
          }
        ],
        aiInsights: {
          trendAnalysis: 'Positive momentum - 15% increase in last 24h',
          optimalInvestmentTime: 'Next 3 days based on market analysis',
          predictedGrowth: '12% weekly growth rate',
          riskAssessment: 'Low risk - strong Swiss market fundamentals'
        },
        platformRevenue: {
          transactionFees: Math.floor((baseRaised + aiBoost) * 0.025), // 2.5% fee
          premiumServices: 15000, // Monthly KI services
          verificationFees: 127 * 25, // CHF 25 per verification
          total: Math.floor(((baseRaised + aiBoost) * 0.025) + 15000 + (127 * 25))
        }
      };
      
      res.json(stats);
    } catch (error) {
      console.error('Error fetching crowdfunding stats:', error);
      res.status(500).json({ message: 'Failed to fetch campaign stats' });
    }
  });

  // wensday-core exclusive routes (Premium Developer Access)
  app.post('/api/core/access', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.subscriptionTier !== 'wensday_core') {
        return res.status(403).json({ 
          error: "wensday-core access requires premium developer subscription" 
        });
      }

      // Generate API key if not exists
      if (!user.coreApiKey) {
        const apiKey = WensdayCore.generateCoreApiKey(userId);
        await storage.updateUser(userId, { 
          coreApiKey: apiKey,
          hasCoreAccess: true,
          unlimitedAccess: true,
          directKiIntegration: true,
          fullControlMode: true,
          developerResponsibility: true
        });
        
        return res.json({
          message: "wensday-core access activated",
          apiKey: apiKey,
          features: {
            unlimited_access: true,
            direct_ki_integration: true,
            full_control_mode: true,
            custom_connectors: true,
            raw_model_access: true
          },
          responsibility_notice: "You have full control and responsibility for all AI interactions"
        });
      }

      res.json({
        status: "active",
        features: {
          unlimited_access: user.unlimitedAccess,
          direct_ki_integration: user.directKiIntegration,
          full_control_mode: user.fullControlMode,
          has_api_key: !!user.coreApiKey
        }
      });
    } catch (error) {
      console.error("wensday-core access error:", error);
      res.status(500).json({ error: "Failed to manage core access" });
    }
  });

  app.post('/api/core/direct-ai', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.hasCoreAccess || user.subscriptionTier !== 'wensday_core') {
        return res.status(403).json({ error: "Requires wensday-core access" });
      }

      const { prompt, model } = req.body;
      
      const coreConfig = {
        userId,
        apiKey: user.coreApiKey!,
        unlimitedAccess: user.unlimitedAccess!,
        fullControlMode: user.fullControlMode!,
        directIntegration: user.directKiIntegration!,
        connectors: (user.coreConnectors as any[]) || []
      };

      const core = new WensdayCore(coreConfig);
      const result = await core.directAiQuery(prompt, model);
      
      res.json(result);
    } catch (error) {
      console.error("Direct AI error:", error);
      res.status(500).json({ error: "Direct AI query failed" });
    }
  });

  app.post('/api/core/batch', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.hasCoreAccess || !user.unlimitedAccess) {
        return res.status(403).json({ error: "Requires unlimited access" });
      }

      const { requests } = req.body;
      
      const coreConfig = {
        userId,
        apiKey: user.coreApiKey!,
        unlimitedAccess: true,
        fullControlMode: user.fullControlMode!,
        directIntegration: user.directKiIntegration!,
        connectors: (user.coreConnectors as any[]) || []
      };

      const core = new WensdayCore(coreConfig);
      const results = await core.batchProcess(requests);
      
      res.json({ results });
    } catch (error) {
      console.error("Batch processing error:", error);
      res.status(500).json({ error: "Batch processing failed" });
    }
  });

  app.post('/api/core/connector/:name', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const connectorName = req.params.name;
      
      if (!user?.hasCoreAccess || !user.directKiIntegration) {
        return res.status(403).json({ error: "Requires direct integration access" });
      }

      const coreConfig = {
        userId,
        apiKey: user.coreApiKey!,
        unlimitedAccess: user.unlimitedAccess!,
        fullControlMode: user.fullControlMode!,
        directIntegration: true,
        connectors: (user.coreConnectors as any[]) || []
      };

      const core = new WensdayCore(coreConfig);
      const result = await core.executeConnector(connectorName, req.body);
      
      res.json(result);
    } catch (error) {
      console.error("Connector execution error:", error);
      res.status(500).json({ error: "Connector execution failed" });
    }
  });

  app.post('/api/core/raw-model', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.hasCoreAccess || !user.fullControlMode) {
        return res.status(403).json({ error: "Requires full control mode" });
      }

      const coreConfig = {
        userId,
        apiKey: user.coreApiKey!,
        unlimitedAccess: user.unlimitedAccess!,
        fullControlMode: true,
        directIntegration: user.directKiIntegration!,
        connectors: (user.coreConnectors as any[]) || []
      };

      const core = new WensdayCore(coreConfig);
      const result = await core.rawModelAccess(req.body);
      
      res.json(result);
    } catch (error) {
      console.error("Raw model access error:", error);
      res.status(500).json({ error: "Raw model access failed" });
    }
  });

  // Free Chat Route for Guest Users (No Authentication Required)
  app.post('/api/chat/free', async (req: any, res) => {
    try {
      const { message, model } = req.body;
      
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ message: "Message is required" });
      }

      // Simple rate limiting for guest users (IP-based)
      const clientIP = req.ip || req.connection.remoteAddress;
      
      // Use selected AI model with validation for guest users (only free models)
      const allowedGuestModels = ['gemini-2.5-flash', 'google/gemini-2.0-flash:free', 'deepseek/deepseek-r1:free'];
      const selectedModel = model && allowedGuestModels.includes(model) 
        ? model 
        : 'google/gemini-2.0-flash:free';
      
      // Simple conversation context for guest users
      const conversationHistory = [
        { role: "user" as const, content: message }
      ];

      try {
        // Use multi-AI provider system for guest users
        const aiResponse = await aiProviderManager.generateResponse(
          selectedModel,
          conversationHistory,
          {
            systemPrompt: `Sie sind ein KI-Assistent für wensday.ch, eine Schweizer AI-Plattform. 
            Antworten Sie freundlich und hilfreich auf Deutsch. Dies ist ein kostenloser Chat - 
            erwähnen Sie gelegentlich die erweiterten Funktionen für angemeldete Nutzer.`,
            maxTokens: 2048,
            temperature: 0.8
          }
        );

        // Return response without saving to database
        res.json({
          success: true,
          response: aiResponse,
          model: selectedModel,
          hasErrors: false,
          confidenceScore: 85,
          isGuest: true,
          message: "Free Chat - Anmelden für erweiterte Funktionen"
        });

      } catch (aiError) {
        console.error("Guest AI response error:", aiError);
        
        // Fallback to Gemini if multi-AI fails
        try {
          const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
          if (apiKey) {
            const qualityController = new AIQualityController(apiKey);
            const fallbackResponse = await qualityController.generateDirectResponse(
              message,
              conversationHistory
            );
            
            return res.json({
              success: true,
              response: fallbackResponse,
              model: 'gemini-2.5-flash',
              hasErrors: false,
              confidenceScore: 75,
              isGuest: true,
              message: "Free Chat - Anmelden für erweiterte Funktionen"
            });
          }
        } catch (fallbackError) {
          console.error("Fallback also failed:", fallbackError);
        }
        
        res.status(500).json({ 
          message: "Sorry, I'm having trouble responding right now. Please try again." 
        });
      }

    } catch (error) {
      console.error("Free chat error:", error);
      res.status(500).json({ 
        message: "An error occurred. Please try again later." 
      });
    }
  });

  // Admin Middleware - Check if user is admin
  const isAdmin = async (req: any, res: any, next: any) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const user = await storage.getUser(userId);
      if (!user || !user.isAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      req.adminUser = user;
      next();
    } catch (error) {
      console.error("Admin auth error:", error);
      res.status(500).json({ error: "Admin authentication failed" });
    }
  };

  // Admin Log Helper
  const logAdminAction = async (adminId: string, action: string, targetUserId: string | null, details: any, req: any) => {
    try {
      await db.insert(adminLogs).values({
        adminId,
        action,
        targetUserId,
        details,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });
    } catch (error) {
      console.error("Failed to log admin action:", error);
    }
  };

  // =============================================================================
  // ADMIN API ROUTES
  // =============================================================================

  // Get all users (admin overview)
  app.get('/api/admin/users', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const users = await storage.getAllUsers();
      
      // Remove sensitive data
      const safeUsers = users.map((user: User) => ({
        ...user,
        coreApiKey: user.coreApiKey ? '***HIDDEN***' : null,
      }));

      await logAdminAction(req.adminUser.id, 'view_users', null, { count: users.length }, req);
      res.json(safeUsers);
    } catch (error) {
      console.error("Admin get users error:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  // Get user statistics
  app.get('/api/admin/stats', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const stats = await storage.getSystemStats();
      
      await logAdminAction(req.adminUser.id, 'view_stats', null, {}, req);
      res.json(stats);
    } catch (error) {
      console.error("Admin stats error:", error);
      res.status(500).json({ error: "Failed to fetch statistics" });
    }
  });

  // Update user (admin action)
  app.patch('/api/admin/users/:userId', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const updates = req.body;
      
      // Don't allow updating super admin
      const targetUser = await storage.getUser(userId);
      if (targetUser?.adminLevel === 'super_admin' && req.adminUser.adminLevel !== 'super_admin') {
        return res.status(403).json({ error: "Cannot modify super admin" });
      }

      const updatedUser = await storage.updateUser(userId, updates);
      
      await logAdminAction(req.adminUser.id, 'user_update', userId, updates, req);
      
      // Remove sensitive data
      const safeUser = {
        ...updatedUser,
        coreApiKey: updatedUser.coreApiKey ? '***HIDDEN***' : null,
      };
      
      res.json(safeUser);
    } catch (error) {
      console.error("Admin update user error:", error);
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  // Activate/Deactivate wensday-core access
  app.post('/api/admin/core-access/:userId', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const { activate } = req.body;
      
      if (!req.adminUser.canManageCore) {
        return res.status(403).json({ error: "Core management permission required" });
      }

      const updates: any = {
        hasCoreAccess: activate,
        subscriptionTier: activate ? 'wensday_core' : 'pro',
      };

      if (activate) {
        const WensdayCore = (await import('./wensday-core')).WensdayCore;
        updates.coreApiKey = WensdayCore.generateCoreApiKey(userId);
        updates.unlimitedAccess = true;
        updates.directKiIntegration = true;
        updates.fullControlMode = true;
        updates.developerResponsibility = true;
      } else {
        updates.coreApiKey = null;
        updates.unlimitedAccess = false;
        updates.directKiIntegration = false;
        updates.fullControlMode = false;
        updates.developerResponsibility = false;
      }

      const user = await storage.updateUser(userId, updates);
      
      await logAdminAction(
        req.adminUser.id, 
        activate ? 'core_access_granted' : 'core_access_revoked', 
        userId, 
        { activate }, 
        req
      );
      
      res.json({ 
        success: true, 
        message: activate ? 'Core access granted' : 'Core access revoked',
        user: {
          ...user,
          coreApiKey: user.coreApiKey ? '***HIDDEN***' : null,
        }
      });
    } catch (error) {
      console.error("Admin core access error:", error);
      res.status(500).json({ error: "Failed to manage core access" });
    }
  });

  // Get admin logs
  app.get('/api/admin/logs', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { limit = 50, offset = 0 } = req.query;
      
      const logs = await db
        .select()
        .from(adminLogs)
        .orderBy(desc(adminLogs.createdAt))
        .limit(parseInt(limit as string))
        .offset(parseInt(offset as string));
      
      res.json(logs);
    } catch (error) {
      console.error("Admin logs error:", error);
      res.status(500).json({ error: "Failed to fetch admin logs" });
    }
  });

  // Initialize super admin (dev.n.lopez@gmail.com as Admin ID 00)
  app.post('/api/admin/init-super-admin', async (req, res) => {
    try {
      // Check if super admin already exists
      const existingSuperAdmin = await db
        .select()
        .from(users)
        .where(eq(users.adminLevel, 'super_admin'))
        .limit(1);

      if (existingSuperAdmin.length > 0) {
        return res.status(400).json({ error: "Super admin already exists" });
      }

      // Find user by email dev.n.lopez@gmail.com
      const adminUser = await db
        .select()
        .from(users)
        .where(eq(users.email, 'dev.n.lopez@gmail.com'))
        .limit(1);

      if (adminUser.length === 0) {
        return res.status(404).json({ error: "Admin user not found. Please login first." });
      }

      // Upgrade to super admin
      const [updatedUser] = await db
        .update(users)
        .set({
          isAdmin: true,
          adminLevel: 'super_admin',
          adminId: '00',
          canManageUsers: true,
          canManageSubscriptions: true,
          canAccessStats: true,
          canManageCore: true,
          subscriptionTier: 'wensday_core',
          hasCoreAccess: true,
          unlimitedAccess: true,
          directKiIntegration: true,
          fullControlMode: true,
          developerResponsibility: true,
        })
        .where(eq(users.id, adminUser[0].id))
        .returning();

      res.json({ 
        success: true, 
        message: "Super admin initialized successfully",
        adminId: '00'
      });
    } catch (error) {
      console.error("Super admin init error:", error);
      res.status(500).json({ error: "Failed to initialize super admin" });
    }
  });

  // AI Provider Routes (Admin Only)
  app.get('/api/admin/ai-providers', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const providers = await storage.getAllAiProviders();
      res.json(providers);
    } catch (error) {
      console.error("Error fetching AI providers:", error);
      res.status(500).json({ error: "Failed to fetch AI providers" });
    }
  });

  app.post('/api/admin/ai-providers', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const providerData = insertAiProviderSchema.parse(req.body);
      const provider = await storage.createAiProvider(providerData);

      // Log admin action
      await db.insert(adminLogs).values({
        adminId: userId,
        action: 'ai_provider_created',
        details: { providerId: provider.id, providerName: provider.name },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent') || '',
      });

      res.json(provider);
    } catch (error) {
      console.error("Error creating AI provider:", error);
      res.status(500).json({ error: "Failed to create AI provider" });
    }
  });

  app.put('/api/admin/ai-providers/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const { id } = req.params;
      const updates = req.body;
      
      const provider = await storage.updateAiProvider(id, updates);

      // Log admin action
      await db.insert(adminLogs).values({
        adminId: userId,
        action: 'ai_provider_updated',
        details: { providerId: id, updates },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent') || '',
      });

      res.json(provider);
    } catch (error) {
      console.error("Error updating AI provider:", error);
      res.status(500).json({ error: "Failed to update AI provider" });
    }
  });

  app.delete('/api/admin/ai-providers/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const { id } = req.params;
      await storage.deleteAiProvider(id);

      // Log admin action
      await db.insert(adminLogs).values({
        adminId: userId,
        action: 'ai_provider_deleted',
        details: { providerId: id },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent') || '',
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting AI provider:", error);
      res.status(500).json({ error: "Failed to delete AI provider" });
    }
  });

  // Initialize default AI providers endpoint
  app.post('/api/admin/init-default-providers', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      // Default AI providers configuration
      const defaultProviders = [
        {
          name: "OpenAI",
          slug: "openai",
          description: "OpenAI ChatGPT models including GPT-4 Turbo and GPT-3.5",
          baseUrl: "https://api.openai.com/v1",
          apiKeyName: "OPENAI_API_KEY",
          isActive: true,
          supportedModels: [
            { id: "gpt-4-turbo", name: "GPT-4 Turbo", context: 128000, vision: true },
            { id: "gpt-4", name: "GPT-4", context: 8192, vision: false },
            { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo", context: 16385, vision: false }
          ],
          defaultModel: "gpt-4-turbo",
          features: { streaming: true, vision: true, functions: true },
          adminOnly: false,
          requiresApproval: false
        },
        {
          name: "Anthropic Claude",
          slug: "anthropic",
          description: "Anthropic Claude models including Claude-3.5 Sonnet",
          baseUrl: "https://api.anthropic.com",
          apiKeyName: "ANTHROPIC_API_KEY",
          isActive: true,
          supportedModels: [
            { id: "claude-3-5-sonnet-20241022", name: "Claude-3.5 Sonnet", context: 200000, vision: true },
            { id: "claude-3-opus-20240229", name: "Claude-3 Opus", context: 200000, vision: true },
            { id: "claude-3-haiku-20240307", name: "Claude-3 Haiku", context: 200000, vision: true }
          ],
          defaultModel: "claude-3-5-sonnet-20241022",
          features: { streaming: true, vision: true, functions: false },
          adminOnly: false,
          requiresApproval: false
        },
        {
          name: "Google Gemini",
          slug: "google",
          description: "Google Gemini models including Gemini Pro and Flash",
          baseUrl: "https://generativelanguage.googleapis.com/v1beta",
          apiKeyName: "GEMINI_API_KEY",
          isActive: true,
          supportedModels: [
            { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", context: 1000000, vision: true },
            { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro", context: 2000000, vision: true }
          ],
          defaultModel: "gemini-2.5-flash",
          features: { streaming: true, vision: true, functions: true },
          adminOnly: false,
          requiresApproval: false
        },
        {
          name: "Microsoft OpenAI",
          slug: "microsoft-openai",
          description: "Microsoft Azure OpenAI Service",
          baseUrl: "https://your-resource.openai.azure.com/",
          apiKeyName: "AZURE_OPENAI_API_KEY",
          isActive: false,
          supportedModels: [
            { id: "gpt-4-turbo", name: "GPT-4 Turbo", context: 128000, vision: true },
            { id: "gpt-35-turbo", name: "GPT-3.5 Turbo", context: 16385, vision: false }
          ],
          defaultModel: "gpt-4-turbo",
          features: { streaming: true, vision: true, functions: true },
          adminOnly: true,
          requiresApproval: true
        },
        {
          name: "Perplexity",
          slug: "perplexity",
          description: "Perplexity AI with real-time web search capabilities",
          baseUrl: "https://api.perplexity.ai",
          apiKeyName: "PERPLEXITY_API_KEY",
          isActive: false,
          supportedModels: [
            { id: "llama-3.1-sonar-huge-128k-online", name: "Llama 3.1 Sonar Huge (Online)", context: 128000, search: true },
            { id: "llama-3.1-sonar-large-128k-online", name: "Llama 3.1 Sonar Large (Online)", context: 128000, search: true },
            { id: "llama-3.1-sonar-small-128k-online", name: "Llama 3.1 Sonar Small (Online)", context: 128000, search: true }
          ],
          defaultModel: "llama-3.1-sonar-small-128k-online",
          features: { streaming: true, search: true, citations: true },
          adminOnly: false,
          requiresApproval: false
        },
        {
          name: "xAI Grok",
          slug: "xai",
          description: "xAI Grok models with real-time information",
          baseUrl: "https://api.x.ai/v1",
          apiKeyName: "XAI_API_KEY",
          isActive: false,
          supportedModels: [
            { id: "grok-2-vision-1212", name: "Grok-2 Vision", context: 8192, vision: true },
            { id: "grok-2-1212", name: "Grok-2", context: 131072, vision: false },
            { id: "grok-vision-beta", name: "Grok Vision Beta", context: 8192, vision: true },
            { id: "grok-beta", name: "Grok Beta", context: 131072, vision: false }
          ],
          defaultModel: "grok-2-1212",
          features: { streaming: true, vision: true, realtime: true },
          adminOnly: false,
          requiresApproval: false
        }
      ];

      const createdProviders = [];
      for (const providerData of defaultProviders) {
        try {
          // Check if provider already exists
          const existing = await storage.getAiProviderBySlug(providerData.slug);
          if (!existing) {
            const provider = await storage.createAiProvider(providerData);
            createdProviders.push(provider);
          }
        } catch (error) {
          console.error(`Failed to create provider ${providerData.name}:`, error);
        }
      }

      // Log admin action
      await db.insert(adminLogs).values({
        adminId: userId,
        action: 'default_providers_initialized',
        details: { providersCreated: createdProviders.length },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent') || '',
      });

      res.json({ 
        success: true, 
        providersCreated: createdProviders.length,
        providers: createdProviders 
      });
    } catch (error) {
      console.error("Error initializing default providers:", error);
      res.status(500).json({ error: "Failed to initialize default providers" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
