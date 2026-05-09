// Test Setup – wensday.ch (kein DB-Setup nötig für Unit Tests)
import { beforeAll, afterAll, vi } from 'vitest';

beforeAll(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  vi.restoreAllMocks();
});

export const testUtils = {
  createTestUser(overrides: Record<string, unknown> = {}) {
    return {
      id: `test_user_${Date.now()}`,
      email: `test${Date.now()}@example.com`,
      firstName: 'Test',
      lastName: 'User',
      subscriptionTier: 'free',
      isAdmin: false,
      dailyMessageCount: 0,
      ...overrides,
    };
  },

  createTestConversation(userId: string, overrides: Record<string, unknown> = {}) {
    return { id: `test_conv_${Date.now()}`, userId, title: 'Test Conversation', ...overrides };
  },

  createTestMessage(conversationId: string, overrides: Record<string, unknown> = {}) {
    return { id: `test_msg_${Date.now()}`, conversationId, role: 'user' as const, content: 'Test message', ...overrides };
  },

  createTestAiProvider(overrides: Record<string, unknown> = {}) {
    return {
      id: `test_provider_${Date.now()}`,
      name: 'Test Provider',
      slug: `test-provider-${Date.now()}`,
      description: 'Test AI Provider',
      baseUrl: 'https://api.test.com',
      apiKeyName: 'TEST_API_KEY',
      isActive: true,
      supportedModels: [{ id: 'test-model', name: 'Test Model' }],
      defaultModel: 'test-model',
      adminOnly: false,
      requiresApproval: false,
      ...overrides,
    };
  },

  wait: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
  mockAiResponse: {
    success: { content: 'Test AI response', confidenceScore: 0.85 },
    error:   { error: 'API_ERROR', message: 'Test API error' },
  },
};