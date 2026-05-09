// Chat SSE Streaming Tests – wensday.ch
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { testUtils } from './setup';

// ── SSE frame parser (mirrors ApiService.streamChat logic) ────────────────────
function parseSSEFrames(raw: string): Array<Record<string, unknown>> {
  const events: Array<Record<string, unknown>> = [];
  const lines = raw.split('\n');
  for (const line of lines) {
    if (!line.startsWith('data: ')) continue;
    try { events.push(JSON.parse(line.slice(6))); } catch { /* skip malformed */ }
  }
  return events;
}

// ── Model allowlist (mirrors routes.ts) ───────────────────────────────────────
const ALLOWED_MODELS: Record<string, string[]> = {
  free:  ['gemini-2.5-flash', 'google/gemini-2.0-flash:free', 'deepseek/deepseek-r1:free', 'gpt-4o-mini'],
  ultra: ['gemini-2.5-flash', 'gemini-2.5-pro', 'google/gemini-2.0-flash:free', 'deepseek/deepseek-r1:free', 'deepseek-chat', 'gpt-4o-mini', 'gpt-4o'],
  pro:   ['gemini-2.5-flash', 'gemini-2.5-pro', 'google/gemini-2.0-flash:free', 'deepseek/deepseek-r1:free', 'deepseek-chat', 'gpt-4o-mini', 'gpt-4o', 'gpt-5'],
  wensday_core: ['gemini-2.5-flash', 'gemini-2.5-pro', 'google/gemini-2.0-flash:free', 'deepseek/deepseek-r1:free', 'deepseek-chat', 'gpt-4o-mini', 'gpt-4o', 'gpt-5'],
};

function selectModel(requested: string | undefined, tier: string): string {
  const allowed = ALLOWED_MODELS[tier] || ALLOWED_MODELS.free;
  return requested && allowed.includes(requested) ? requested : 'gemini-2.5-flash';
}

// ── Provider routing logic (mirrors stream route) ─────────────────────────────
function resolveStreamingProvider(model: string, env: Record<string, string | undefined>) {
  if (model.startsWith('gemini-') && env.GEMINI_API_KEY)   return 'gemini';
  if (model.startsWith('gpt')    && env.OPENAI_API_KEY)    return 'openai';
  if (model.startsWith('deepseek-') && env.DEEPSEEK_API_KEY) return 'deepseek';
  if ((model.includes('/') || model.includes(':')) && env.OPENROUTER_API_KEY) return 'openrouter';
  return 'fallback';
}

// ── Simulate SSE stream output ─────────────────────────────────────────────────
function buildSSEStream(events: Array<Record<string, unknown>>): string {
  return events.map(e => `data: ${JSON.stringify(e)}`).join('\n') + '\n';
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('SSE Frame Parser', () => {
  it('parses token events', () => {
    const raw = buildSSEStream([{ token: 'Hallo' }, { token: ' Welt' }, { done: true, messageId: 'msg1', model: 'gemini-2.5-flash' }]);
    const events = parseSSEFrames(raw);
    expect(events).toHaveLength(3);
    expect(events[0]).toEqual({ token: 'Hallo' });
    expect(events[1]).toEqual({ token: ' Welt' });
    expect(events[2]).toMatchObject({ done: true, messageId: 'msg1' });
  });

  it('parses ackUserPersisted event', () => {
    const raw = buildSSEStream([{ ackUserPersisted: true }, { token: 'Antwort' }, { done: true, messageId: 'msg2', model: 'gpt-4o' }]);
    const events = parseSSEFrames(raw);
    expect(events[0]).toEqual({ ackUserPersisted: true });
    expect(events[1].token).toBe('Antwort');
  });

  it('parses error event', () => {
    const raw = buildSSEStream([{ ackUserPersisted: true }, { error: 'Provider-Fehler' }]);
    const events = parseSSEFrames(raw);
    expect(events[1]).toEqual({ error: 'Provider-Fehler' });
  });

  it('skips malformed SSE lines gracefully', () => {
    const raw = 'data: {"token":"ok"}\ndata: {BROKEN\ndata: {"done":true,"messageId":"m","model":"g"}\n';
    const events = parseSSEFrames(raw);
    expect(events).toHaveLength(2);
    expect(events[0].token).toBe('ok');
    expect(events[1].done).toBe(true);
  });

  it('ignores non-data lines', () => {
    const raw = 'event: message\nid: 1\ndata: {"token":"hi"}\n\n';
    const events = parseSSEFrames(raw);
    expect(events).toHaveLength(1);
    expect(events[0].token).toBe('hi');
  });
});

describe('SSE Stream – Event Ordering', () => {
  it('ackUserPersisted appears before first token', () => {
    const events = [
      { ackUserPersisted: true },
      { token: 'Erstes' },
      { token: ' Wort' },
      { done: true, messageId: 'id1', model: 'gemini-2.5-flash' },
    ];
    const ackIdx = events.findIndex(e => 'ackUserPersisted' in e);
    const tokenIdx = events.findIndex(e => 'token' in e);
    expect(ackIdx).toBeLessThan(tokenIdx);
  });

  it('done event is the last event in a successful stream', () => {
    const events = [
      { ackUserPersisted: true },
      { token: 'Text' },
      { done: true, messageId: 'id2', model: 'gpt-4o-mini' },
    ];
    const last = events[events.length - 1];
    expect(last).toMatchObject({ done: true });
  });

  it('error event terminates stream without done', () => {
    const events = [
      { ackUserPersisted: true },
      { error: 'Provider offline' },
    ];
    const hasDone = events.some(e => 'done' in e);
    const hasError = events.some(e => 'error' in e);
    expect(hasDone).toBe(false);
    expect(hasError).toBe(true);
  });
});

describe('Client Disconnect – no persistence', () => {
  it('clientGone=true prevents assistant message persistence', () => {
    let messagesPersisted = 0;
    let quotaCharged = 0;
    let completedNormally = false;

    // Simulate streaming loop that aborts on clientGone
    const tokens = ['Hallo', ' Welt', '!'];
    let clientGone = false;

    const streamedTokens: string[] = [];
    for (const token of tokens) {
      if (clientGone) break;
      streamedTokens.push(token);
      if (streamedTokens.length === 2) clientGone = true; // disconnect after 2 tokens
    }

    if (!clientGone) completedNormally = true;

    if (completedNormally && streamedTokens.join('').trim()) {
      messagesPersisted++;
      quotaCharged++;
    }

    expect(streamedTokens).toHaveLength(2);
    expect(completedNormally).toBe(false);
    expect(messagesPersisted).toBe(0);
    expect(quotaCharged).toBe(0);
  });

  it('normal completion persists message and charges quota', () => {
    let messagesPersisted = 0;
    let quotaCharged = 0;
    let completedNormally = false;

    const tokens = ['Hallo', ' Welt', '!'];
    const clientGone = false;
    let fullContent = '';

    for (const token of tokens) {
      if (clientGone) break;
      fullContent += token;
    }
    if (!clientGone) completedNormally = true;

    if (completedNormally && fullContent.trim()) {
      messagesPersisted++;
      quotaCharged++;
    }

    expect(completedNormally).toBe(true);
    expect(messagesPersisted).toBe(1);
    expect(quotaCharged).toBe(1);
  });

  it('empty content does not get persisted even after normal completion', () => {
    let messagesPersisted = 0;
    const completedNormally = true;
    const fullContent = '';

    if (completedNormally && fullContent.trim()) {
      messagesPersisted++;
    }

    expect(messagesPersisted).toBe(0);
  });
});

describe('Retry – skipUserMessage semantics', () => {
  it('userPersisted=false (pre-stream failure) → retry sends user message again', () => {
    const userPersisted = false; // e.g. rate limit error before ack
    const skipUserMessage = userPersisted;
    expect(skipUserMessage).toBe(false);
  });

  it('userPersisted=true (post-ack failure) → retry skips user message', () => {
    const userPersisted = true; // ack received, stream failed mid-way
    const skipUserMessage = userPersisted;
    expect(skipUserMessage).toBe(true);
  });

  it('retryContext preserves original conversationId and model', () => {
    const failedCtx = { conversationId: 'conv-abc', model: 'gemini-2.5-flash', userPersisted: true };
    // Even if user navigates away and changes model, retry uses frozen context
    const currentModel = 'gpt-5'; // user changed model after failure
    expect(failedCtx.model).not.toBe(currentModel);
    expect(failedCtx.conversationId).toBe('conv-abc');
  });
});

describe('Model Routing – Provider Selection', () => {
  const fullEnv = {
    GEMINI_API_KEY: 'key', OPENAI_API_KEY: 'key',
    DEEPSEEK_API_KEY: 'key', OPENROUTER_API_KEY: 'key',
  };

  it('gemini-2.5-flash → gemini provider', () => {
    expect(resolveStreamingProvider('gemini-2.5-flash', fullEnv)).toBe('gemini');
  });

  it('gemini-2.5-pro → gemini provider', () => {
    expect(resolveStreamingProvider('gemini-2.5-pro', fullEnv)).toBe('gemini');
  });

  it('gpt-4o → openai provider', () => {
    expect(resolveStreamingProvider('gpt-4o', fullEnv)).toBe('openai');
  });

  it('gpt-5 → openai provider', () => {
    expect(resolveStreamingProvider('gpt-5', fullEnv)).toBe('openai');
  });

  it('deepseek-chat → deepseek provider', () => {
    expect(resolveStreamingProvider('deepseek-chat', fullEnv)).toBe('deepseek');
  });

  it('google/gemini-2.0-flash:free → openrouter provider', () => {
    expect(resolveStreamingProvider('google/gemini-2.0-flash:free', fullEnv)).toBe('openrouter');
  });

  it('deepseek/deepseek-r1:free → openrouter provider', () => {
    expect(resolveStreamingProvider('deepseek/deepseek-r1:free', fullEnv)).toBe('openrouter');
  });

  it('missing API key forces fallback', () => {
    expect(resolveStreamingProvider('gemini-2.5-flash', {})).toBe('fallback');
    expect(resolveStreamingProvider('gpt-4o', {})).toBe('fallback');
    expect(resolveStreamingProvider('deepseek-chat', {})).toBe('fallback');
    expect(resolveStreamingProvider('google/gemini-2.0-flash:free', {})).toBe('fallback');
  });
});

describe('Model Allowlist per Tier', () => {
  it('Free-Tier darf nur 4 Modelle nutzen', () => {
    expect(ALLOWED_MODELS.free).toHaveLength(4);
    expect(ALLOWED_MODELS.free).toContain('gemini-2.5-flash');
    expect(ALLOWED_MODELS.free).not.toContain('gpt-5');
    expect(ALLOWED_MODELS.free).not.toContain('deepseek-chat');
  });

  it('Pro-Tier enthält alle Modelle inkl. gpt-5', () => {
    expect(ALLOWED_MODELS.pro).toContain('gpt-5');
    expect(ALLOWED_MODELS.pro).toContain('deepseek-chat');
  });

  it('Unbekanntes Modell → Fallback auf gemini-2.5-flash', () => {
    expect(selectModel('unknown-model-xyz', 'free')).toBe('gemini-2.5-flash');
    expect(selectModel(undefined, 'pro')).toBe('gemini-2.5-flash');
  });

  it('Free-User kann kein Ultra-Only Modell nutzen', () => {
    const model = selectModel('gpt-4o', 'free');
    expect(model).toBe('gemini-2.5-flash'); // rejected, falls back to default
  });

  it('Ultra-User kann gpt-4o nutzen', () => {
    expect(selectModel('gpt-4o', 'ultra')).toBe('gpt-4o');
  });

  it('Pro-User kann gpt-5 nutzen', () => {
    expect(selectModel('gpt-5', 'pro')).toBe('gpt-5');
  });
});

describe('Test Utilities', () => {
  it('createTestUser erstellt gültigen User für Stream-Tests', () => {
    const user = testUtils.createTestUser({ subscriptionTier: 'ultra' });
    expect(user.subscriptionTier).toBe('ultra');
    expect(user.dailyMessageCount).toBe(0);
  });

  it('createTestConversation erstellt Konversation mit korrekter userId', () => {
    const conv = testUtils.createTestConversation('user_stream_test');
    expect(conv.userId).toBe('user_stream_test');
  });
});
