// Test Setup for wensday.ch MVP
import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { execSync } from 'child_process';
import { storage } from '../server/storage';

// Test Database Setup
const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/wensday_test';

beforeAll(async () => {
  // Setup test database
  console.log('🔧 Setting up test environment...');
  
  try {
    // Run database migrations for test environment
    execSync('npm run db:push', { 
      env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL },
      stdio: 'inherit' 
    });
    
    console.log('✅ Test database setup complete');
  } catch (error) {
    console.error('❌ Failed to setup test database:', error);
    process.exit(1);
  }
});

beforeEach(async () => {
  // Clean up test data before each test
  await cleanupTestData();
});

afterEach(async () => {
  // Optional: Additional cleanup after each test
});

afterAll(async () => {
  // Final cleanup
  console.log('🧹 Cleaning up test environment...');
  await cleanupTestData();
});

async function cleanupTestData() {
  try {
    // Delete test data in proper order (respect foreign keys)
    await storage.query('DELETE FROM messages WHERE conversation_id IN (SELECT id FROM conversations WHERE user_id LIKE $1)', ['test_%']);
    await storage.query('DELETE FROM conversations WHERE user_id LIKE $1', ['test_%']);
    await storage.query('DELETE FROM user_provider_configs WHERE user_id LIKE $1', ['test_%']);
    await storage.query('DELETE FROM users WHERE id LIKE $1', ['test_%']);
    await storage.query('DELETE FROM ai_providers WHERE id LIKE $1', ['test_%']);
  } catch (error) {
    console.warn('⚠️ Cleanup warning:', error.message);
  }
}

// Test Utilities
export const testUtils = {
  // Create test user
  async createTestUser(overrides: any = {}) {
    const defaultUser = {
      id: `test_user_${Date.now()}`,
      email: `test${Date.now()}@example.com`,
      firstName: 'Test',
      lastName: 'User',
      subscriptionTier: 'free',
      isAdmin: false,
      dailyMessageCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const user = { ...defaultUser, ...overrides };
    await storage.createUser(user);
    return user;
  },

  // Create test conversation
  async createTestConversation(userId: string, overrides: any = {}) {
    const defaultConversation = {
      id: `test_conv_${Date.now()}`,
      userId,
      title: 'Test Conversation',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const conversation = { ...defaultConversation, ...overrides };
    await storage.createConversation(conversation);
    return conversation;
  },

  // Create test message
  async createTestMessage(conversationId: string, overrides: any = {}) {
    const defaultMessage = {
      id: `test_msg_${Date.now()}`,
      conversationId,
      role: 'user' as const,
      content: 'Test message',
      createdAt: new Date()
    };
    
    const message = { ...defaultMessage, ...overrides };
    await storage.createMessage(message);
    return message;
  },

  // Create test AI provider
  async createTestAiProvider(overrides: any = {}) {
    const defaultProvider = {
      id: `test_provider_${Date.now()}`,
      name: 'Test Provider',
      slug: 'test-provider',
      description: 'Test AI Provider',
      baseUrl: 'https://api.test.com',
      apiKeyName: 'TEST_API_KEY',
      isActive: true,
      supportedModels: [{ id: 'test-model', name: 'Test Model' }],
      defaultModel: 'test-model',
      adminOnly: false,
      requiresApproval: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const provider = { ...defaultProvider, ...overrides };
    await storage.createAiProvider(provider);
    return provider;
  },

  // Mock AI responses
  mockAiResponse: {
    success: {
      content: 'This is a test AI response',
      confidenceScore: 0.85,
      isVerified: false,
      needsReview: false
    },
    error: {
      error: 'API_ERROR',
      message: 'Test API error'
    }
  },

  // Wait for async operations
  async wait(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
};