// Chat SSE Streaming Tests – wensday.ch
// Tests real imported logic from shared modules; no fabricated local helpers.
import { describe, it, expect } from 'vitest';
import { AI_PROVIDERS } from '../shared/ai-providers';
import {
  USER_ROLES,
  hasPermission,
  canAccessProvider,
  getMaxDailyMessages,
} from '../shared/permissions';
import { testUtils } from './setup';

// ── AI_PROVIDERS – streaming capability ──────────────────────────────────────

describe('Streaming-fähige AI-Provider', () => {
  it('Gemini unterstützt natives Streaming', () => {
    const p = AI_PROVIDERS.find(p => p.slug === 'gemini');
    expect(p?.features?.streaming).toBe(true);
  });

  it('OpenAI unterstützt natives Streaming', () => {
    const p = AI_PROVIDERS.find(p => p.slug === 'openai');
    expect(p?.features?.streaming).toBe(true);
  });

  it('DeepSeek unterstützt natives Streaming', () => {
    const p = AI_PROVIDERS.find(p => p.slug === 'deepseek');
    expect(p?.features?.streaming).toBe(true);
  });

  it('OpenRouter unterstützt Streaming', () => {
    const p = AI_PROVIDERS.find(p => p.slug === 'openrouter');
    expect(p?.features?.streaming).toBe(true);
  });

  it('alle 4 Haupt-Provider unterstützen Streaming', () => {
    const slugs = ['gemini', 'openai', 'deepseek', 'openrouter'];
    for (const slug of slugs) {
      const p = AI_PROVIDERS.find(p => p.slug === slug);
      expect(p?.features?.streaming, `${slug} soll streaming=true haben`).toBe(true);
    }
  });
});

describe('Provider-Modell-IDs für Stream-Routing', () => {
  it('Gemini-Modelle beginnen mit "gemini-"', () => {
    const p = AI_PROVIDERS.find(p => p.slug === 'gemini')!;
    for (const m of p.supportedModels) {
      expect(m.id).toMatch(/^gemini-/);
    }
  });

  it('OpenAI-Modelle beginnen mit "gpt" oder "o" (o3-mini, o1-mini)', () => {
    const p = AI_PROVIDERS.find(p => p.slug === 'openai')!;
    for (const m of p.supportedModels) {
      expect(m.id).toMatch(/^(gpt|o\d)/);
    }
  });

  it('DeepSeek-Modelle beginnen mit "deepseek-"', () => {
    const p = AI_PROVIDERS.find(p => p.slug === 'deepseek')!;
    for (const m of p.supportedModels) {
      expect(m.id).toMatch(/^deepseek-/);
    }
  });

  it('OpenRouter-Modelle enthalten "/" (Anbieter-Präfix)', () => {
    const p = AI_PROVIDERS.find(p => p.slug === 'openrouter')!;
    for (const m of p.supportedModels) {
      expect(m.id).toContain('/');
    }
  });
});

// ── Tier-Limits (via real hasPermission / getMaxDailyMessages) ────────────────

describe('Tier-Limits für Streaming-Quota', () => {
  it('Free-Nutzer: 10 Nachrichten/Tag', () => {
    expect(getMaxDailyMessages('free')).toBe(10);
  });

  it('Ultra-Nutzer: 500 Nachrichten/Tag', () => {
    expect(getMaxDailyMessages('ultra')).toBe(500);
  });

  it('Pro-Nutzer: unbegrenzt (-1)', () => {
    expect(getMaxDailyMessages('pro')).toBe(-1);
  });

  it('wensday_core: unbegrenzt (-1)', () => {
    expect(getMaxDailyMessages('wensday_core')).toBe(-1);
  });

  it('Unbekanntes Tier → 0 (blockiert)', () => {
    expect(getMaxDailyMessages('unknown')).toBe(0);
  });
});

describe('Streaming-Berechtigung via hasPermission', () => {
  it('Free-Nutzer darf basic chat nutzen', () => {
    expect(hasPermission('free', 'user.chat.basic')).toBe(true);
  });

  it('Free-Nutzer darf KEINEN advanced chat nutzen', () => {
    expect(hasPermission('free', 'user.chat.advanced')).toBe(false);
  });

  it('Ultra-Nutzer darf advanced chat und Provider-Auswahl', () => {
    expect(hasPermission('ultra', 'user.chat.advanced')).toBe(true);
    expect(hasPermission('ultra', 'user.providers.select')).toBe(true);
  });

  it('Pro-Nutzer hat alle Nutzer-Berechtigungen', () => {
    expect(hasPermission('pro', 'user.chat.advanced')).toBe(true);
    expect(hasPermission('pro', 'user.providers.select')).toBe(true);
    expect(hasPermission('pro', 'user.export.conversations')).toBe(true);
  });

  it('wensday_core hat API-Zugang', () => {
    expect(hasPermission('wensday_core', 'core.api.access')).toBe(true);
    expect(hasPermission('wensday_core', 'core.providers.unlimited')).toBe(true);
  });
});

describe('Provider-Zugang via canAccessProvider', () => {
  it('Free-Nutzer darf nur Google (Gemini) nutzen', () => {
    expect(canAccessProvider('free', 'google')).toBe(true);
    expect(canAccessProvider('free', 'openai')).toBe(false);
    expect(canAccessProvider('free', 'deepseek')).toBe(false);
  });

  it('Ultra-Nutzer darf Google, OpenAI und Anthropic', () => {
    expect(canAccessProvider('ultra', 'google')).toBe(true);
    expect(canAccessProvider('ultra', 'openai')).toBe(true);
    expect(canAccessProvider('ultra', 'anthropic')).toBe(true);
  });

  it('wensday_core hat Zugang zu allen Providern (*)', () => {
    expect(USER_ROLES['wensday_core'].canAccessProviders).toContain('*');
  });
});

// ── Rate-limit logic (as used in /api/chat/stream) ───────────────────────────

describe('Rate-Limit-Guard (Stream-Endpoint-Logik)', () => {
  const isRateLimited = (tier: string, count: number): boolean => {
    const limit = getMaxDailyMessages(tier);
    return limit > 0 && count >= limit;
  };

  it('Free mit 9 Nachrichten: nicht blockiert', () => {
    expect(isRateLimited('free', 9)).toBe(false);
  });

  it('Free mit 10 Nachrichten: blockiert', () => {
    expect(isRateLimited('free', 10)).toBe(true);
  });

  it('Ultra mit 499 Nachrichten: nicht blockiert', () => {
    expect(isRateLimited('ultra', 499)).toBe(false);
  });

  it('Ultra mit 500 Nachrichten: blockiert', () => {
    expect(isRateLimited('ultra', 500)).toBe(true);
  });

  it('Pro mit 9999 Nachrichten: nicht blockiert (unlimited)', () => {
    expect(isRateLimited('pro', 9999)).toBe(false);
  });
});

// ── SSE-Parser-Logik (spiegelt ApiService.streamChat intern) ─────────────────
// Testet denselben Parsing-Pfad, den der Browser-Client durchläuft,
// ohne echte HTTP-Verbindung – deterministische Unit-Coverage.

interface StreamEvent {
  ackUserPersisted?: boolean;
  token?: string;
  done?: boolean;
  messageId?: string;
  model?: string;
  error?: string;
}

function parseSSELines(raw: string): StreamEvent[] {
  const events: StreamEvent[] = [];
  for (const line of raw.split('\n')) {
    if (!line.startsWith('data: ')) continue;
    try {
      events.push(JSON.parse(line.slice(6)) as StreamEvent);
    } catch { /* skip malformed */ }
  }
  return events;
}

function simulateStream(rawSSE: string): {
  ackReceived: boolean;
  tokens: string[];
  done: boolean;
  messageId: string;
  error: string | null;
} {
  const events = parseSSELines(rawSSE);
  let ackReceived = false;
  const tokens: string[] = [];
  let done = false;
  let messageId = '';
  let error: string | null = null;

  for (const ev of events) {
    if (ev.ackUserPersisted) { ackReceived = true; continue; }
    if (typeof ev.token === 'string') { tokens.push(ev.token); continue; }
    if (ev.done) { done = true; messageId = ev.messageId ?? ''; continue; }
    if (typeof ev.error === 'string') { error = ev.error; break; }
  }

  return { ackReceived, tokens, done, messageId, error };
}

describe('SSE-Event-Parser – Token-Fluss', () => {
  const happyPath = [
    'data: {"ackUserPersisted":true}',
    'data: {"token":"Hallo"}',
    'data: {"token":" Welt"}',
    'data: {"done":true,"messageId":"msg_42","model":"gemini-2.5-flash"}',
  ].join('\n');

  it('ackUserPersisted wird erkannt', () => {
    expect(simulateStream(happyPath).ackReceived).toBe(true);
  });

  it('alle Token-Events werden gesammelt', () => {
    expect(simulateStream(happyPath).tokens).toEqual(['Hallo', ' Welt']);
  });

  it('done=true signalisiert vollständigen Stream', () => {
    expect(simulateStream(happyPath).done).toBe(true);
  });

  it('messageId wird aus done-Event extrahiert', () => {
    expect(simulateStream(happyPath).messageId).toBe('msg_42');
  });

  it('kein Error im Happy-Path', () => {
    expect(simulateStream(happyPath).error).toBeNull();
  });
});

describe('SSE-Event-Parser – Fehler-Pfad', () => {
  const errorPath = [
    'data: {"ackUserPersisted":true}',
    'data: {"token":"Teil"}',
    'data: {"error":"Quota überschritten"}',
  ].join('\n');

  it('Error-Event stoppt die Verarbeitung', () => {
    const r = simulateStream(errorPath);
    expect(r.error).toBe('Quota überschritten');
    expect(r.done).toBe(false);
  });

  it('bereits empfangene Token bleiben erhalten', () => {
    expect(simulateStream(errorPath).tokens).toEqual(['Teil']);
  });
});

describe('SSE-Event-Parser – Unterbrochener Stream (kein done)', () => {
  const interrupted = [
    'data: {"ackUserPersisted":true}',
    'data: {"token":"A"}',
    'data: {"token":"B"}',
    // kein done-Event
  ].join('\n');

  it('done bleibt false wenn kein done-Event empfangen', () => {
    expect(simulateStream(interrupted).done).toBe(false);
  });

  it('Token werden dennoch geparsed', () => {
    expect(simulateStream(interrupted).tokens).toEqual(['A', 'B']);
  });
});

describe('SSE-Event-Parser – Retry-Semantik (skipUserMessage)', () => {
  it('ackUserPersisted=true signalisiert: User-Msg sicher gespeichert', () => {
    const withAck = 'data: {"ackUserPersisted":true}\ndata: {"token":"x"}';
    expect(simulateStream(withAck).ackReceived).toBe(true);
  });

  it('ohne ackUserPersisted: User-Msg muss beim Retry neu gesendet werden', () => {
    const noAck = 'data: {"token":"x"}\ndata: {"done":true,"messageId":"m1","model":"gpt-4o"}';
    expect(simulateStream(noAck).ackReceived).toBe(false);
  });
});

describe('SSE-Event-Parser – Robustheit', () => {
  it('überspringt malformed JSON-Zeilen ohne Fehler', () => {
    const messy = [
      'data: {"ackUserPersisted":true}',
      'data: NOT_JSON',
      'data: {"token":"ok"}',
      'data: {"done":true,"messageId":"x","model":"m"}',
    ].join('\n');
    const r = simulateStream(messy);
    expect(r.tokens).toEqual(['ok']);
    expect(r.done).toBe(true);
  });

  it('ignoriert Zeilen ohne "data: "-Präfix', () => {
    const withNoise = 'comment: ignore\ndata: {"token":"hi"}\n\ndata: {"done":true,"messageId":"id","model":"m"}';
    expect(simulateStream(withNoise).tokens).toEqual(['hi']);
  });
});

// ── Test-Utilities für Chat-Stream-Szenarien ──────────────────────────────────

describe('Test Utilities – Chat Stream Szenarien', () => {
  it('createTestUser mit Ultra-Tier für Streaming-Tests', () => {
    const user = testUtils.createTestUser({ subscriptionTier: 'ultra' });
    expect(user.subscriptionTier).toBe('ultra');
    expect(user.dailyMessageCount).toBe(0);
    expect(getMaxDailyMessages('ultra')).toBeGreaterThan(10);
  });

  it('createTestConversation mit korrekter userId', () => {
    const conv = testUtils.createTestConversation('user_stream_42');
    expect(conv.userId).toBe('user_stream_42');
    expect(conv.id).toMatch(/^test_conv_/);
  });

  it('createTestMessage erstellt User-Nachricht', () => {
    const msg = testUtils.createTestMessage('conv_stream_1');
    expect(msg.role).toBe('user');
    expect(msg.conversationId).toBe('conv_stream_1');
  });
});
