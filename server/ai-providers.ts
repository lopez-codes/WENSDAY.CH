import { GoogleGenAI } from "@google/genai";

// AI Provider Interface
export interface AIProvider {
  name: string;
  models: AIModel[];
  generateResponse(model: string, messages: ChatMessage[], options?: GenerateOptions): Promise<string>;
  isAvailable(): boolean;
}

export interface AIModel {
  id: string;
  name: string;
  description: string;
  provider: string;
  pricing: 'free' | 'paid' | 'freemium';
  capabilities: string[];
  contextWindow?: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface GenerateOptions {
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
}

// Swiss AI Assistant prompt for all providers
const SWISS_SYSTEM_PROMPT = `Sie sind ein KI-Assistent von wensday.ch, einer Schweizer Plattform für professionelle KI-Forschung. Antworten Sie auf Deutsch (Schweizer Hochdeutsch) und fokussieren Sie sich auf präzise, hilfreiche Informationen. Berücksichtigen Sie den Schweizer Kontext in Ihren Antworten, wo relevant.`;

// Google Gemini Provider
export class GeminiProvider implements AIProvider {
  name = 'Google Gemini';
  private client?: GoogleGenAI;

  models: AIModel[] = [
    {
      id: 'gemini-2.5-flash',
      name: 'Gemini 2.5 Flash',
      description: 'Schnelle, ausgewogene Leistung für die meisten Aufgaben',
      provider: 'google',
      pricing: 'paid',
      capabilities: ['text', 'multimodal'],
      contextWindow: 1000000
    },
    {
      id: 'gemini-2.5-pro',
      name: 'Gemini 2.5 Pro',
      description: 'Erweiterte Fähigkeiten für komplexe Aufgaben',
      provider: 'google', 
      pricing: 'paid',
      capabilities: ['text', 'multimodal', 'reasoning'],
      contextWindow: 2000000
    }
  ];

  constructor() {
    if (process.env.GEMINI_API_KEY) {
      this.client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    }
  }

  isAvailable(): boolean {
    return !!this.client;
  }

  async generateResponse(model: string, messages: ChatMessage[], options?: GenerateOptions): Promise<string> {
    if (!this.client) {
      throw new Error('Gemini provider not configured');
    }

    try {
      const prompt = messages.map(m => `${m.role}: ${m.content}`).join('\n\n');
      
      const response = await this.client.models.generateContent({
        model: model,
        contents: prompt,
        config: {
          systemInstruction: options?.systemPrompt || SWISS_SYSTEM_PROMPT,
          maxOutputTokens: options?.maxTokens || 4096,
          temperature: options?.temperature || 0.7,
        },
      });

      return response.text || "Entschuldigung, ich konnte keine Antwort generieren.";
    } catch (error: any) {
      throw new Error(`Gemini error: ${error.message}`);
    }
  }
}

// DeepSeek Provider (OpenAI-compatible)
export class DeepSeekProvider implements AIProvider {
  name = 'DeepSeek';

  models: AIModel[] = [
    {
      id: 'deepseek-chat',
      name: 'DeepSeek Chat',
      description: 'Kostengünstiges, leistungsstarkes Sprachmodell',
      provider: 'deepseek',
      pricing: 'freemium',
      capabilities: ['text', 'coding'],
      contextWindow: 128000
    },
    {
      id: 'deepseek-r1',
      name: 'DeepSeek R1',
      description: 'Erweiterte Reasoning-Fähigkeiten für komplexe Probleme',
      provider: 'deepseek',
      pricing: 'freemium',
      capabilities: ['text', 'reasoning', 'coding'],
      contextWindow: 128000
    }
  ];

  isAvailable(): boolean {
    return true; // DeepSeek has free web access, API key optional
  }

  async generateResponse(model: string, messages: ChatMessage[], options?: GenerateOptions): Promise<string> {
    try {
      // If API key is available, use DeepSeek API
      if (process.env.DEEPSEEK_API_KEY) {
        return await this.generateWithAPI(model, messages, options);
      }

      // Fallback to web scraping approach (less reliable)
      throw new Error('DeepSeek API key not configured. Please add DEEPSEEK_API_KEY for reliable access.');
    } catch (error: any) {
      throw new Error(`DeepSeek error: ${error.message}`);
    }
  }

  private async generateWithAPI(model: string, messages: ChatMessage[], options?: GenerateOptions): Promise<string> {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: options?.systemPrompt || SWISS_SYSTEM_PROMPT },
          ...messages
        ],
        max_tokens: options?.maxTokens || 4096,
        temperature: options?.temperature || 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "Keine Antwort erhalten.";
  }
}

// OpenRouter Provider (300+ models)
export class OpenRouterProvider implements AIProvider {
  name = 'OpenRouter';

  models: AIModel[] = [
    {
      id: 'deepseek/deepseek-r1:free',
      name: 'DeepSeek R1 (Free)',
      description: 'Kostenloser Zugang zu DeepSeek R1 über OpenRouter',
      provider: 'openrouter',
      pricing: 'free',
      capabilities: ['text', 'reasoning'],
      contextWindow: 128000
    },
    {
      id: 'google/gemini-2.0-flash:free',
      name: 'Gemini 2.0 Flash (Free)', 
      description: 'Kostenloser Zugang zu Gemini 2.0 Flash',
      provider: 'openrouter',
      pricing: 'free',
      capabilities: ['text', 'multimodal'],
      contextWindow: 1000000
    },
    {
      id: 'mistralai/mistral-small-3.1:free',
      name: 'Mistral Small 3.1 (Free)',
      description: '24B Parameter Modell mit Bild-Unterstützung',
      provider: 'openrouter', 
      pricing: 'free',
      capabilities: ['text', 'multimodal'],
      contextWindow: 96000
    },
    {
      id: 'meta-llama/llama-3.3-70b-instruct:free',
      name: 'Llama 3.3 70B (Free)',
      description: 'Metas neuestes Open-Source-Modell',
      provider: 'openrouter',
      pricing: 'free',
      capabilities: ['text'],
      contextWindow: 128000
    }
  ];

  isAvailable(): boolean {
    return true; // OpenRouter has free models without API key required
  }

  async generateResponse(model: string, messages: ChatMessage[], options?: GenerateOptions): Promise<string> {
    try {
      const apiKey = process.env.OPENROUTER_API_KEY || 'sk-or-v1-dummy'; // Some free models work without key
      
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': process.env.REPLIT_DOMAINS?.split(',')[0] || 'https://wensday.ch',
          'X-Title': 'wensday.ch - Swiss AI Platform'
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: 'system', content: options?.systemPrompt || SWISS_SYSTEM_PROMPT },
            ...messages
          ],
          max_tokens: options?.maxTokens || 4096,
          temperature: options?.temperature || 0.7
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || "Keine Antwort erhalten.";
    } catch (error: any) {
      throw new Error(`OpenRouter error: ${error.message}`);
    }
  }
}

// Hugging Face Provider
export class HuggingFaceProvider implements AIProvider {
  name = 'Hugging Face';

  models: AIModel[] = [
    {
      id: 'microsoft/DialoGPT-medium',
      name: 'DialoGPT Medium',
      description: 'Konversations-KI von Microsoft',
      provider: 'huggingface',
      pricing: 'free',
      capabilities: ['text'],
      contextWindow: 1024
    },
    {
      id: 'google/flan-t5-large',
      name: 'FLAN-T5 Large',
      description: 'Googles vielseitiges Sprachmodell',
      provider: 'huggingface',
      pricing: 'free',
      capabilities: ['text'],
      contextWindow: 512
    },
    {
      id: 'microsoft/DialoGPT-large',
      name: 'DialoGPT Large',
      description: 'Grösseres Konversationsmodell',
      provider: 'huggingface',
      pricing: 'free',
      capabilities: ['text'],
      contextWindow: 1024
    }
  ];

  isAvailable(): boolean {
    return true; // Hugging Face has free tier without API key
  }

  async generateResponse(model: string, messages: ChatMessage[], options?: GenerateOptions): Promise<string> {
    try {
      const apiKey = process.env.HUGGINGFACE_API_KEY;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }

      // Convert chat messages to single prompt for HF models
      const prompt = messages.map(m => `${m.role}: ${m.content}`).join('\n\n') + '\nassistant:';

      const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: options?.maxTokens || 1024,
            temperature: options?.temperature || 0.7,
            do_sample: true,
            top_p: 0.95
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Hugging Face API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      if (Array.isArray(data) && data[0]?.generated_text) {
        // Extract only the assistant's response
        const fullText = data[0].generated_text;
        const assistantResponse = fullText.split('assistant:').pop()?.trim() || fullText;
        return assistantResponse;
      }
      
      throw new Error('Unexpected response format from Hugging Face');
    } catch (error: any) {
      throw new Error(`Hugging Face error: ${error.message}`);
    }
  }
}

// AI Provider Manager
export class AIProviderManager {
  private providers: AIProvider[];

  constructor() {
    this.providers = [
      new GeminiProvider(),
      new DeepSeekProvider(), 
      new OpenRouterProvider(),
      new HuggingFaceProvider()
    ];
  }

  getAllModels(): AIModel[] {
    return this.providers.flatMap(provider => 
      provider.isAvailable() ? provider.models : []
    );
  }

  getFreeModels(): AIModel[] {
    return this.getAllModels().filter(model => model.pricing === 'free');
  }

  getProviderForModel(modelId: string): AIProvider | undefined {
    return this.providers.find(provider => 
      provider.models.some(model => model.id === modelId) && provider.isAvailable()
    );
  }

  async generateResponse(
    modelId: string,
    messages: ChatMessage[],
    options?: GenerateOptions
  ): Promise<string> {
    const provider = this.getProviderForModel(modelId);
    
    if (!provider) {
      throw new Error(`Model ${modelId} not available or provider not configured`);
    }

    return provider.generateResponse(modelId, messages, options);
  }

  getAvailableProviders(): AIProvider[] {
    return this.providers.filter(provider => provider.isAvailable());
  }
}

// Export singleton instance
export const aiProviderManager = new AIProviderManager();