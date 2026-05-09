// Business Analytics Unit Tests – wensday.ch
import { describe, it, expect } from 'vitest';
import { testUtils } from './setup';

// ── Hilfsfunktionen (spiegel server-logic) ──────────────────────────────────
function calcConfidence(messages: { confidenceScore?: number }[]): number {
  if (messages.length === 0) return 0;
  const scores = messages.filter(m => m.confidenceScore !== undefined);
  if (scores.length === 0) return 0;
  return scores.reduce((sum, m) => sum + (m.confidenceScore ?? 0), 0) / scores.length;
}

function calcVerificationRate(messages: { isVerified?: boolean }[]): number {
  if (messages.length === 0) return 0;
  return messages.filter(m => m.isVerified).length / messages.length;
}

function groupByCategory(messages: { businessCategory?: string }[]) {
  return messages.reduce((acc, m) => {
    const cat = m.businessCategory ?? 'unknown';
    acc[cat] = (acc[cat] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}
// ────────────────────────────────────────────────────────────────────────────

describe('Confidence Score Berechnung', () => {
  it('leere Liste → 0', () => {
    expect(calcConfidence([])).toBe(0);
  });

  it('ein Wert → exakter Wert zurück', () => {
    expect(calcConfidence([{ confidenceScore: 0.85 }])).toBe(0.85);
  });

  it('Durchschnitt über mehrere Werte', () => {
    const result = calcConfidence([
      { confidenceScore: 0.9 },
      { confidenceScore: 0.7 },
    ]);
    expect(result).toBeCloseTo(0.8);
  });

  it('liegt immer zwischen 0 und 1', () => {
    const result = calcConfidence([
      { confidenceScore: 0.4 },
      { confidenceScore: 0.6 },
      { confidenceScore: 1.0 },
    ]);
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThanOrEqual(1);
  });
});

describe('Verification Rate Berechnung', () => {
  it('leere Liste → 0', () => {
    expect(calcVerificationRate([])).toBe(0);
  });

  it('alle verifiziert → 1.0', () => {
    expect(calcVerificationRate([{ isVerified: true }, { isVerified: true }])).toBe(1.0);
  });

  it('keine verifiziert → 0.0', () => {
    expect(calcVerificationRate([{ isVerified: false }, { isVerified: false }])).toBe(0.0);
  });

  it('50% verifiziert → 0.5', () => {
    expect(calcVerificationRate([{ isVerified: true }, { isVerified: false }])).toBe(0.5);
  });
});

describe('Business Category Grouping', () => {
  it('gruppiert nach Kategorie korrekt', () => {
    const msgs = [
      { businessCategory: 'strategy' },
      { businessCategory: 'finance'  },
      { businessCategory: 'strategy' },
    ];
    const grouped = groupByCategory(msgs);
    expect(grouped['strategy']).toBe(2);
    expect(grouped['finance']).toBe(1);
  });

  it('ohne Kategorie → "unknown"', () => {
    const grouped = groupByCategory([{}, {}]);
    expect(grouped['unknown']).toBe(2);
  });
});

describe('Test Utilities – Analytics Szenarien', () => {
  it('Business-User hat Pflichtfelder', () => {
    const user = testUtils.createTestUser({ subscriptionTier: 'pro' });
    expect(user.subscriptionTier).toBe('pro');
  });

  it('Nachrichten mit Confidence Score werden korrekt erstellt', () => {
    const msg = testUtils.createTestMessage('conv_1', {
      businessCategory: 'strategy',
      confidenceScore:  0.85,
      isVerified:       true,
    });
    expect(msg.businessCategory).toBe('strategy');
    expect(msg.isVerified).toBe(true);
  });

  it('Konfidenz-Berechnung für gemischte Nachrichten', () => {
    const messages = [0.9, 0.7, 0.85, 0.95].map(s =>
      testUtils.createTestMessage('conv_1', { confidenceScore: s })
    );
    const avg = calcConfidence(messages.map(m => ({ confidenceScore: m.confidenceScore as number })));
    expect(avg).toBeCloseTo(0.85);
  });
});

describe('Subscription Analytics Logik', () => {
  const tiers = ['free', 'ultra', 'pro', 'wensday_core'];

  it('alle Tier-Namen sind gültige Strings', () => {
    for (const t of tiers) {
      expect(typeof t).toBe('string');
      expect(t.length).toBeGreaterThan(0);
    }
  });

  it('4 Abo-Stufen definiert', () => {
    expect(tiers).toHaveLength(4);
  });
});
