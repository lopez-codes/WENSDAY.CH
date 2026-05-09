// AI Provider definitions – used by tests and frontend
export interface AiProviderModel {
  id: string;
  name: string;
}

export interface AiProviderFeatures {
  streaming?: boolean;
  vision?: boolean;
  search?: boolean;
  citations?: boolean;
  reasoning?: boolean;
}

export interface AiProviderDef {
  name: string;
  slug: string;
  description: string;
  baseUrl: string;
  apiKeyName: string;
  supportedModels: AiProviderModel[];
  defaultModel: string;
  adminOnly: boolean;
  requiresApproval: boolean;
  features?: AiProviderFeatures;
}

export const AI_PROVIDERS: AiProviderDef[] = [
  {
    name: 'Google Gemini',
    slug: 'gemini',
    description: 'Google Gemini 2.5 Flash / Pro',
    baseUrl: 'https://generativelanguage.googleapis.com',
    apiKeyName: 'GEMINI_API_KEY',
    supportedModels: [
      { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
      { id: 'gemini-2.5-pro',   name: 'Gemini 2.5 Pro'   },
    ],
    defaultModel: 'gemini-2.5-flash',
    adminOnly: false,
    requiresApproval: false,
    features: { streaming: true, vision: true },
  },
  {
    name: 'OpenAI',
    slug: 'openai',
    description: 'GPT-4o and GPT-5',
    baseUrl: 'https://api.openai.com',
    apiKeyName: 'OPENAI_API_KEY',
    supportedModels: [
      { id: 'gpt-4o',   name: 'GPT-4o'   },
      { id: 'gpt-5',    name: 'GPT-5'    },
      { id: 'o3-mini',  name: 'o3-mini'  },
    ],
    defaultModel: 'gpt-4o',
    adminOnly: false,
    requiresApproval: false,
    features: { streaming: true, vision: true, reasoning: true },
  },
  {
    name: 'Anthropic',
    slug: 'anthropic',
    description: 'Claude 3.5 / 4 Sonnet',
    baseUrl: 'https://api.anthropic.com',
    apiKeyName: 'ANTHROPIC_API_KEY',
    supportedModels: [
      { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet' },
      { id: 'claude-opus-4-5',            name: 'Claude 4.5 Opus'   },
    ],
    defaultModel: 'claude-3-5-sonnet-20241022',
    adminOnly: false,
    requiresApproval: false,
    features: { streaming: true, vision: true },
  },
  {
    name: 'DeepSeek',
    slug: 'deepseek',
    description: 'DeepSeek R1 / V3',
    baseUrl: 'https://api.deepseek.com',
    apiKeyName: 'DEEPSEEK_API_KEY',
    supportedModels: [
      { id: 'deepseek-reasoner', name: 'DeepSeek R1' },
      { id: 'deepseek-chat',     name: 'DeepSeek V3' },
    ],
    defaultModel: 'deepseek-reasoner',
    adminOnly: false,
    requiresApproval: false,
    features: { streaming: true, reasoning: true },
  },
  {
    name: 'Perplexity',
    slug: 'perplexity',
    description: 'Perplexity Sonar – Web Search',
    baseUrl: 'https://api.perplexity.ai',
    apiKeyName: 'PERPLEXITY_API_KEY',
    supportedModels: [
      { id: 'sonar-pro',   name: 'Sonar Pro'   },
      { id: 'sonar-turbo', name: 'Sonar Turbo' },
    ],
    defaultModel: 'sonar-pro',
    adminOnly: false,
    requiresApproval: false,
    features: { streaming: true, search: true, citations: true },
  },
  {
    name: 'OpenRouter',
    slug: 'openrouter',
    description: '100+ Modelle via OpenRouter',
    baseUrl: 'https://openrouter.ai/api',
    apiKeyName: 'OPENROUTER_API_KEY',
    supportedModels: [
      { id: 'meta-llama/llama-3.3-70b-instruct', name: 'Llama 3.3 70B' },
      { id: 'mistralai/mistral-large',            name: 'Mistral Large' },
      { id: 'google/gemini-2.0-flash:free',       name: 'Gemini 2.0 Flash (free)' },
    ],
    defaultModel: 'google/gemini-2.0-flash:free',
    adminOnly: true,
    requiresApproval: false,
    features: { streaming: true, vision: true },
  },
];
