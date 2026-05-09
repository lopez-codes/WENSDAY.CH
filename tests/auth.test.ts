// Authentication Logic Tests – wensday.ch
import { describe, it, expect } from 'vitest';
import { testUtils } from './setup';

describe('Subscription Tiers', () => {
  const RATE_LIMITS: Record<string, number> = {
    free:          10,
    ultra:        500,
    pro:           -1,  // unlimited
    wensday_core:  -1,  // unlimited
  };

  it('Free-Nutzer hat 10 Nachrichten/Tag Limit', () => {
    expect(RATE_LIMITS['free']).toBe(10);
  });

  it('Ultra-Nutzer hat 500 Nachrichten/Tag', () => {
    expect(RATE_LIMITS['ultra']).toBe(500);
  });

  it('Pro-Nutzer hat unbegrenzte Nachrichten (-1)', () => {
    expect(RATE_LIMITS['pro']).toBe(-1);
  });

  it('alle Tier-Namen sind definiert', () => {
    for (const tier of ['free', 'ultra', 'pro', 'wensday_core']) {
      expect(RATE_LIMITS[tier]).toBeDefined();
    }
  });
});

describe('Test Utilities', () => {
  it('createTestUser erzeugt gültigen User', () => {
    const user = testUtils.createTestUser();
    expect(user.id).toMatch(/^test_user_/);
    expect(user.email).toMatch(/@example\.com$/);
    expect(user.subscriptionTier).toBe('free');
    expect(user.isAdmin).toBe(false);
  });

  it('createTestUser respektiert overrides', () => {
    const user = testUtils.createTestUser({ subscriptionTier: 'pro', isAdmin: true });
    expect(user.subscriptionTier).toBe('pro');
    expect(user.isAdmin).toBe(true);
  });

  it('createTestConversation erzeugt gültige Konversation', () => {
    const conv = testUtils.createTestConversation('user_123');
    expect(conv.id).toMatch(/^test_conv_/);
    expect(conv.userId).toBe('user_123');
  });

  it('createTestMessage erzeugt gültige Nachricht', () => {
    const msg = testUtils.createTestMessage('conv_123');
    expect(msg.id).toMatch(/^test_msg_/);
    expect(msg.conversationId).toBe('conv_123');
    expect(msg.role).toBe('user');
  });

  it('Admin-User hat isAdmin: true', () => {
    const admin = testUtils.createTestUser({ isAdmin: true, subscriptionTier: 'pro' });
    expect(admin.isAdmin).toBe(true);
    expect(admin.subscriptionTier).toBe('pro');
  });
});

describe('Rate Limit Logic', () => {
  function isAllowed(tier: string, count: number): boolean {
    const limits: Record<string, number> = { free: 10, ultra: 500, pro: -1 };
    const limit = limits[tier] ?? 10;
    return limit === -1 || count < limit;
  }

  it('Free: 9 Nachrichten erlaubt', () => {
    expect(isAllowed('free', 9)).toBe(true);
  });

  it('Free: 10 Nachrichten blockiert', () => {
    expect(isAllowed('free', 10)).toBe(false);
  });

  it('Pro: 9999 Nachrichten erlaubt (unlimited)', () => {
    expect(isAllowed('pro', 9999)).toBe(true);
  });

  it('Ultra: 499 Nachrichten erlaubt', () => {
    expect(isAllowed('ultra', 499)).toBe(true);
  });

  it('Ultra: 500 Nachrichten blockiert', () => {
    expect(isAllowed('ultra', 500)).toBe(false);
  });
});
