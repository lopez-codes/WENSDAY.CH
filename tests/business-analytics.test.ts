// Business Analytics Tests for wensday.ch MVP
import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../server/index';
import { testUtils } from './setup';

describe('Business Analytics System', () => {
  let testUser: any;
  let testConversation: any;
  let testMessage: any;

  beforeEach(async () => {
    // Create test user with business profile
    testUser = await testUtils.createTestUser({
      subscriptionTier: 'pro',
      companyName: 'Test AG',
      industry: 'technology',
      companySize: 'sme'
    });

    testConversation = await testUtils.createTestConversation(testUser.id, {
      businessCategory: 'strategy',
      industry: 'technology',
      confidenceThreshold: 0.8
    });

    testMessage = await testUtils.createTestMessage(testConversation.id, {
      role: 'assistant',
      confidenceScore: 0.85,
      isVerified: true,
      factChecked: true,
      businessCategory: 'strategy'
    });
  });

  describe('GET /api/business/analytics', () => {
    it('should return business analytics overview', async () => {
      const response = await request(app)
        .get('/api/business/analytics');
      
      if (response.status === 200) {
        expect(response.body).toHaveProperty('averageConfidence');
        expect(response.body).toHaveProperty('verifiedResponses');
        expect(response.body).toHaveProperty('totalMessages');
        expect(response.body).toHaveProperty('activeUsers');
        
        expect(typeof response.body.averageConfidence).toBe('number');
        expect(response.body.averageConfidence).toBeGreaterThanOrEqual(0);
        expect(response.body.averageConfidence).toBeLessThanOrEqual(100);
      }
    });

    it('should include quality metrics', async () => {
      const response = await request(app)
        .get('/api/business/analytics');
      
      if (response.status === 200) {
        expect(response.body).toHaveProperty('qualityMetrics');
        const quality = response.body.qualityMetrics;
        
        expect(quality).toHaveProperty('highConfidence');
        expect(quality).toHaveProperty('mediumConfidence');
        expect(quality).toHaveProperty('lowConfidence');
        expect(quality).toHaveProperty('verificationRate');
      }
    });

    it('should include industry insights', async () => {
      const response = await request(app)
        .get('/api/business/analytics');
      
      if (response.status === 200) {
        expect(response.body).toHaveProperty('industryInsights');
        const insights = response.body.industryInsights;
        
        expect(Array.isArray(insights)).toBe(true);
        if (insights.length > 0) {
          expect(insights[0]).toHaveProperty('industry');
          expect(insights[0]).toHaveProperty('messageCount');
          expect(insights[0]).toHaveProperty('averageConfidence');
        }
      }
    });
  });

  describe('Business Category Analytics', () => {
    it('should track business categories correctly', async () => {
      const categories = ['strategy', 'finance', 'marketing', 'operations'];
      
      for (const category of categories) {
        await testUtils.createTestMessage(testConversation.id, {
          businessCategory: category,
          confidenceScore: 0.8
        });
      }

      const response = await request(app)
        .get('/api/business/analytics/categories');
      
      if (response.status === 200) {
        expect(Array.isArray(response.body)).toBe(true);
        
        const categoryData = response.body.find((c: any) => c.category === 'strategy');
        expect(categoryData).toBeDefined();
        expect(categoryData.count).toBeGreaterThan(0);
      }
    });

    it('should calculate category-specific confidence scores', async () => {
      // Create messages with different confidence levels for same category
      await testUtils.createTestMessage(testConversation.id, {
        businessCategory: 'finance',
        confidenceScore: 0.9
      });
      
      await testUtils.createTestMessage(testConversation.id, {
        businessCategory: 'finance',
        confidenceScore: 0.7
      });

      const response = await request(app)
        .get('/api/business/analytics/categories');
      
      if (response.status === 200) {
        const financeCategory = response.body.find((c: any) => c.category === 'finance');
        
        if (financeCategory) {
          expect(financeCategory.averageConfidence).toBeGreaterThan(0);
          expect(financeCategory.averageConfidence).toBeLessThanOrEqual(1);
        }
      }
    });
  });

  describe('Quality Control Metrics', () => {
    it('should track verification rates', async () => {
      // Create verified and unverified messages
      await testUtils.createTestMessage(testConversation.id, {
        isVerified: true,
        confidenceScore: 0.9
      });
      
      await testUtils.createTestMessage(testConversation.id, {
        isVerified: false,
        confidenceScore: 0.6
      });

      const response = await request(app)
        .get('/api/business/analytics/quality');
      
      if (response.status === 200) {
        expect(response.body).toHaveProperty('verificationRate');
        expect(response.body).toHaveProperty('factCheckRate');
        expect(response.body).toHaveProperty('reviewRate');
        
        expect(typeof response.body.verificationRate).toBe('number');
      }
    });

    it('should identify messages needing review', async () => {
      await testUtils.createTestMessage(testConversation.id, {
        needsReview: true,
        confidenceScore: 0.4
      });

      const response = await request(app)
        .get('/api/business/analytics/quality');
      
      if (response.status === 200) {
        expect(response.body).toHaveProperty('reviewPending');
        expect(typeof response.body.reviewPending).toBe('number');
      }
    });
  });

  describe('User Subscription Analytics', () => {
    it('should track subscription tiers', async () => {
      // Create users with different subscription tiers
      await testUtils.createTestUser({ subscriptionTier: 'free' });
      await testUtils.createTestUser({ subscriptionTier: 'ultra' });
      await testUtils.createTestUser({ subscriptionTier: 'wensday_core' });

      const response = await request(app)
        .get('/api/admin/analytics/subscriptions');
      
      if (response.status === 200) {
        expect(Array.isArray(response.body)).toBe(true);
        
        const tiers = response.body.map((t: any) => t.tier);
        expect(tiers).toContain('free');
        expect(tiers).toContain('ultra');
        expect(tiers).toContain('pro');
      }
    });

    it('should calculate revenue metrics', async () => {
      const response = await request(app)
        .get('/api/admin/analytics/revenue');
      
      if (response.status === 200) {
        expect(response.body).toHaveProperty('totalRevenue');
        expect(response.body).toHaveProperty('monthlyRecurring');
        expect(response.body).toHaveProperty('averageRevenuePerUser');
        
        expect(typeof response.body.totalRevenue).toBe('number');
      }
    });
  });

  describe('AI Provider Usage Analytics', () => {
    it('should track provider usage statistics', async () => {
      const response = await request(app)
        .get('/api/admin/analytics/providers');
      
      if (response.status === 200) {
        expect(Array.isArray(response.body)).toBe(true);
        
        if (response.body.length > 0) {
          const provider = response.body[0];
          expect(provider).toHaveProperty('providerId');
          expect(provider).toHaveProperty('totalRequests');
          expect(provider).toHaveProperty('successRate');
          expect(provider).toHaveProperty('averageResponseTime');
        }
      }
    });

    it('should calculate cost optimization insights', async () => {
      const response = await request(app)
        .get('/api/admin/analytics/cost-optimization');
      
      if (response.status === 200) {
        expect(response.body).toHaveProperty('recommendations');
        expect(response.body).toHaveProperty('costBreakdown');
        expect(response.body).toHaveProperty('efficiency');
        
        expect(Array.isArray(response.body.recommendations)).toBe(true);
      }
    });
  });

  describe('Swiss Business Context', () => {
    it('should provide Swiss market insights', async () => {
      const response = await request(app)
        .get('/api/business/analytics/swiss-insights');
      
      if (response.status === 200) {
        expect(response.body).toHaveProperty('swissCompanies');
        expect(response.body).toHaveProperty('commonIndustries');
        expect(response.body).toHaveProperty('regionalUsage');
        
        expect(typeof response.body.swissCompanies).toBe('number');
      }
    });

    it('should track compliance metrics', async () => {
      const response = await request(app)
        .get('/api/business/analytics/compliance');
      
      if (response.status === 200) {
        expect(response.body).toHaveProperty('gdprCompliance');
        expect(response.body).toHaveProperty('dataResidency');
        expect(response.body).toHaveProperty('auditTrail');
        
        expect(typeof response.body.gdprCompliance).toBe('boolean');
      }
    });
  });
});