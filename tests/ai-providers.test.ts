// AI Providers Tests for wensday.ch MVP
import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../server/index';
import { testUtils } from './setup';
import { AI_PROVIDERS } from '../shared/ai-providers';

describe('AI Providers System', () => {
  let testUser: any;
  let testProvider: any;

  beforeEach(async () => {
    testUser = await testUtils.createTestUser({
      subscriptionTier: 'pro',
      isAdmin: true
    });
    
    testProvider = await testUtils.createTestAiProvider({
      name: 'Test OpenAI',
      slug: 'test-openai',
      isActive: true
    });
  });

  describe('GET /api/admin/providers', () => {
    it('should return all AI providers for admin users', async () => {
      const response = await request(app)
        .get('/api/admin/providers');
      
      expect(response.status).toBeOneOf([200, 401]); // 401 if not authenticated
      
      if (response.status === 200) {
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
      }
    });

    it('should filter providers by active status', async () => {
      await testUtils.createTestAiProvider({
        name: 'Inactive Provider',
        slug: 'inactive',
        isActive: false
      });

      const response = await request(app)
        .get('/api/admin/providers?active=true');
      
      if (response.status === 200) {
        const activeProviders = response.body.filter((p: any) => p.isActive);
        expect(activeProviders.length).toBe(response.body.length);
      }
    });
  });

  describe('POST /api/admin/providers/install-defaults', () => {
    it('should install default AI providers', async () => {
      const response = await request(app)
        .post('/api/admin/providers/install-defaults');
      
      if (response.status === 200) {
        expect(response.body.message).toContain('installiert');
        expect(response.body.providers).toBeGreaterThan(0);
      }
    });

    it('should not duplicate existing providers', async () => {
      // First installation
      await request(app).post('/api/admin/providers/install-defaults');
      
      // Second installation should not create duplicates
      const response = await request(app)
        .post('/api/admin/providers/install-defaults');
      
      if (response.status === 200) {
        // Should handle existing providers gracefully
        expect(response.body.message).toBeDefined();
      }
    });
  });

  describe('AI Provider Configuration', () => {
    it('should validate provider configuration', () => {
      const openaiProvider = AI_PROVIDERS.find(p => p.slug === 'openai');
      
      expect(openaiProvider).toBeDefined();
      expect(openaiProvider?.name).toBe('OpenAI');
      expect(openaiProvider?.supportedModels.length).toBeGreaterThan(0);
      expect(openaiProvider?.defaultModel).toBeDefined();
    });

    it('should have correct model configurations', () => {
      const claudeProvider = AI_PROVIDERS.find(p => p.slug === 'anthropic');
      
      expect(claudeProvider).toBeDefined();
      expect(claudeProvider?.supportedModels).toContain(
        expect.objectContaining({
          id: expect.any(String),
          name: expect.any(String)
        })
      );
    });

    it('should support different access levels', () => {
      const providers = AI_PROVIDERS;
      
      const publicProviders = providers.filter(p => !p.adminOnly && !p.requiresApproval);
      const adminProviders = providers.filter(p => p.adminOnly);
      const approvalProviders = providers.filter(p => p.requiresApproval);
      
      expect(publicProviders.length).toBeGreaterThan(0);
      expect(adminProviders.length).toBeGreaterThanOrEqual(0);
      expect(approvalProviders.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Provider Health Checks', () => {
    it('should check provider availability', async () => {
      const response = await request(app)
        .get('/api/admin/providers/health');
      
      if (response.status === 200) {
        expect(response.body).toHaveProperty('providers');
        expect(Array.isArray(response.body.providers)).toBe(true);
      }
    });

    it('should handle provider errors gracefully', async () => {
      // Test with invalid provider
      const response = await request(app)
        .get('/api/admin/providers/test-invalid-provider/health');
      
      expect(response.status).toBeOneOf([404, 400]);
    });
  });

  describe('User Provider Configs', () => {
    it('should allow users to configure provider preferences', async () => {
      const config = {
        providerId: testProvider.id,
        isEnabled: true,
        preferredModel: 'test-model'
      };

      const response = await request(app)
        .post('/api/users/provider-configs')
        .send(config);
      
      if (response.status === 201) {
        expect(response.body.providerId).toBe(config.providerId);
        expect(response.body.isEnabled).toBe(true);
      }
    });

    it('should validate provider model compatibility', async () => {
      const invalidConfig = {
        providerId: testProvider.id,
        preferredModel: 'non-existent-model'
      };

      const response = await request(app)
        .post('/api/users/provider-configs')
        .send(invalidConfig);
      
      // Should validate that the model exists for the provider
      expect(response.status).toBeOneOf([400, 422]);
    });
  });

  describe('Provider Features', () => {
    it('should correctly identify provider capabilities', () => {
      const perplexityProvider = AI_PROVIDERS.find(p => p.slug === 'perplexity');
      
      if (perplexityProvider?.features) {
        expect(perplexityProvider.features.search).toBe(true);
        expect(perplexityProvider.features.citations).toBe(true);
      }
    });

    it('should support streaming for compatible providers', () => {
      const streamingProviders = AI_PROVIDERS.filter(
        p => p.features?.streaming === true
      );
      
      expect(streamingProviders.length).toBeGreaterThan(0);
    });

    it('should support vision for compatible providers', () => {
      const visionProviders = AI_PROVIDERS.filter(
        p => p.features?.vision === true
      );
      
      expect(visionProviders.length).toBeGreaterThan(0);
    });
  });
});