import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
// import { aiProviderManager } from "./ai-providers"; // Disabled for now
import { insertMessageSchema, insertConversationSchema, users } from "@shared/schema";
import { z } from "zod";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { 
  postfinanceClient, 
  POSTFINANCE_PRODUCTS, 
  validatePostFinanceWebhook,
  createSubscriptionLineItem
} from "./postfinance";

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
};

export async function registerRoutes(app: Express): Promise<Server> {
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

      // Back to simple working Gemini system
      const aiModel = 'gemini-2.5-flash';

      // Skip AI title generation for now - keep simple titles
      // conversation.title is already set above

      // Direct Gemini API call - back to original working version
      const { GoogleGenAI } = await import('@google/genai');
      if (!process.env.GEMINI_API_KEY) {
        throw new Error('Gemini API not configured');
      }
      
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = [...conversationHistory, { role: 'user', content: message }]
        .map(m => `${m.role}: ${m.content}`).join('\n\n');
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction: `Sie sind ein KI-Assistent von wensday.ch, einer Schweizer Plattform für professionelle KI-Forschung. Antworten Sie auf Deutsch (Schweizer Hochdeutsch) und fokussieren Sie sich auf präzise, hilfreiche Informationen.`,
          maxOutputTokens: user.subscriptionTier === 'pro' ? 8192 : 4096,
          temperature: 0.7,
        },
      });
      
      const aiResponse = response.text || "Entschuldigung, ich konnte keine Antwort generieren.";

      // Save AI response
      const aiMessage = await storage.createMessage({
        conversationId: conversation.id,
        role: "assistant",
        content: aiResponse,
        aiModel: aiModel
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

  // AI Models route - simplified for now (only Gemini available)
  app.get('/api/ai-models', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Simple response - only Gemini available for now
      const allModels = [
        {
          id: 'gemini-2.5-flash',
          name: 'Gemini 2.5 Flash',
          description: 'Schnelle, ausgewogene Leistung für die meisten Aufgaben',
          provider: 'google',
          pricing: 'paid',
          capabilities: ['text'],
          contextWindow: 1000000
        }
      ];
      const availableProviders = [{ name: 'Google Gemini', models: allModels, isAvailable: true }];
      
      // Everyone gets Gemini for now - simplified
      const userModels = allModels;

      res.json({
        models: userModels,
        providers: availableProviders,
        userTier: user.subscriptionTier
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
          
          // Activate the subscription based on transaction amount
          // This is a simplified version - in production you'd want to verify the transaction details
          await storage.updateUserSubscription(userData.id, userData.subscriptionTier || 'ultra', {
            paymentMethod: 'postfinance'
          });
        }
      }

      res.json({ received: true });
    } catch (error) {
      console.error("PostFinance webhook error:", error);
      res.status(500).json({ message: "Webhook processing failed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
