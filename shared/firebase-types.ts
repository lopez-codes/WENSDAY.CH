// Firebase-compatible type definitions for wensday.ch MVP
// These types will be used for Firestore migration

export interface FirebaseUser {
  uid: string;
  email: string | null;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  subscriptionTier: 'guest' | 'free' | 'ultra' | 'pro' | 'wensday_core';
  
  // Payment Information
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  postfinanceSubscriptionId?: number;
  postfinanceTransactionId?: number;
  paymentMethod: 'stripe' | 'postfinance';
  
  // AI Preferences
  preferredAiModel?: string;
  
  // Admin & Core Access
  isAdmin: boolean;
  adminLevel?: 'admin' | 'super_admin';
  adminId?: string; // "00" for super admin
  permissions: string[]; // Array of permission IDs
  
  // wensday-core Features
  hasCoreAccess: boolean;
  coreApiKey?: string;
  unlimitedAccess: boolean;
  directKiIntegration: boolean;
  fullControlMode: boolean;
  coreConnectors?: any;
  developerResponsibility: boolean;
  
  // Usage Tracking
  dailyMessageCount: number;
  lastMessageDate: Date | null;
  
  // Business Information
  companyName?: string;
  jobTitle?: string;
  industry?: string;
  companySize?: 'startup' | 'sme' | 'enterprise';
  businessGoals?: any;
  qualitySettings?: any;
  errorToleranceLevel: 'low' | 'medium' | 'high';
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface FirebaseConversation {
  id: string;
  userId: string;
  title: string;
  
  // Business Context
  businessCategory?: string;
  industry?: string;
  confidenceThreshold: number;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface FirebaseMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  
  // AI Quality Control
  providerId?: string; // Which AI provider was used
  modelId?: string; // Which specific model
  confidenceScore?: number;
  isVerified: boolean;
  needsReview: boolean;
  factChecked: boolean;
  businessCategory?: string;
  sources?: any;
  
  // Timestamps
  createdAt: Date;
}

export interface FirebaseAiProvider {
  id: string;
  name: string;
  slug: string;
  description: string;
  baseUrl: string;
  apiKeyName: string;
  isActive: boolean;
  supportedModels: {
    id: string;
    name: string;
    context?: number;
    vision?: boolean;
    search?: boolean;
    streaming?: boolean;
  }[];
  defaultModel: string;
  pricing?: any;
  rateLimit?: any;
  features?: {
    streaming?: boolean;
    vision?: boolean;
    search?: boolean;
    functions?: boolean;
    citations?: boolean;
    realtime?: boolean;
  };
  adminOnly: boolean;
  requiresApproval: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface FirebaseUserProviderConfig {
  id: string;
  userId: string;
  providerId: string;
  isEnabled: boolean;
  preferredModel?: string;
  customSettings?: any;
  usage?: {
    totalMessages: number;
    totalTokens: number;
    lastUsed: Date;
    monthlySpent: number;
  };
  lastUsed?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface FirebaseAdminLog {
  id: string;
  adminId: string;
  action: string;
  targetUserId?: string;
  details: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

export interface FirebaseSystemSetting {
  id: string;
  settingKey: string;
  settingValue: any;
  description?: string;
  lastUpdatedBy?: string;
  updatedAt: Date;
}

// Firestore Collection Names
export const FIREBASE_COLLECTIONS = {
  USERS: 'users',
  CONVERSATIONS: 'conversations',
  MESSAGES: 'messages',
  AI_PROVIDERS: 'aiProviders',
  USER_PROVIDER_CONFIGS: 'userProviderConfigs',
  ADMIN_LOGS: 'adminLogs',
  SYSTEM_SETTINGS: 'systemSettings'
} as const;

// Firebase Configuration Interface
export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

// Migration Helper Types
export interface MigrationStatus {
  userId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  migratedAt?: Date;
  errorMessage?: string;
  dataIntegrity: {
    conversationsMigrated: number;
    messagesMigrated: number;
    configsMigrated: number;
  };
}

export interface MigrationBatch {
  batchId: string;
  userIds: string[];
  startedAt: Date;
  completedAt?: Date;
  status: 'running' | 'completed' | 'failed';
  errors: string[];
}