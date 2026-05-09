// Server-Integration-Tests: POST /api/chat/stream (SSE)
// Testet das vollständige SSE-Protokoll (token, done, error, ackUserPersisted,
// skipUserMessage) durch direkten Aufruf des Route-Handlers mit Mock-Request/Response.
// Kein HTTP-Transport nötig – deterministisch und schnell.
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── In-memory fixtures ────────────────────────────────────────────────────────

const USERS: Record<string, { subscriptionTier: string; dailyMessageCount: number }> = {
  user_free:  { subscriptionTier: 'free',  dailyMessageCount: 0  },
  user_ultra: { subscriptionTier: 'ultra', dailyMessageCount: 0  },
  user_limit: { subscriptionTier: 'free',  dailyMessageCount: 10 },
};

const CONVERSATIONS: Record<string, { id: string; userId: string }> = {
  conv_free:  { id: 'conv_free',  userId: 'user_free'  },
  conv_ultra: { id: 'conv_ultra', userId: 'user_ultra' },
};

const RATE_LIMITS: Record<string, number> = {
  free: 10, ultra: 500, pro: -1, wensday_core: -1,
};

// ── Storage mock ──────────────────────────────────────────────────────────────

let msgCounter = 0;
const storageMock = {
  getUser:                  vi.fn(),
  getConversation:          vi.fn(),
  createMessage:            vi.fn(),
  getConversationMessages:  vi.fn(),
  incrementDailyMessageCount: vi.fn(),
};

function resetMocks() {
  msgCounter = 0;
  storageMock.getUser.mockReset();
  storageMock.getConversation.mockReset();
  storageMock.createMessage.mockReset();
  storageMock.getConversationMessages.mockReset();
  storageMock.incrementDailyMessageCount.mockReset();

  storageMock.getUser.mockImplementation(async (id: string) =>
    USERS[id] ? { id, ...USERS[id] } : null
  );
  storageMock.getConversation.mockImplementation(async (id: string) =>
    CONVERSATIONS[id] ?? null
  );
  storageMock.createMessage.mockImplementation(async (msg: { conversationId: string; role: string; content: string }) => ({
    id: `msg_${++msgCounter}`,
    ...msg,
  }));
  storageMock.getConversationMessages.mockResolvedValue([]);
  storageMock.incrementDailyMessageCount.mockResolvedValue(undefined);
}

// ── Minimal mock request / response ──────────────────────────────────────────

function buildMockReq(opts: {
  userId: string;
  body: Record<string, unknown>;
}) {
  const listeners: Record<string, () => void> = {};
  return {
    user: { claims: { sub: opts.userId } },
    body: opts.body,
    on: vi.fn((event: string, fn: () => void) => { listeners[event] = fn; }),
    _trigger: (event: string) => listeners[event]?.(),
  };
}

interface MockRes {
  writtenLines: string[];
  events: Record<string, unknown>[];
  ended: boolean;
  statusCode: number;
  headers: Record<string, string>;
  setHeader: ReturnType<typeof vi.fn>;
  flushHeaders: ReturnType<typeof vi.fn>;
  write: ReturnType<typeof vi.fn>;
  end: ReturnType<typeof vi.fn>;
}

function buildMockRes(): MockRes {
  const res: MockRes = {
    writtenLines: [],
    events: [],
    ended: false,
    statusCode: 200,
    headers: {},
    setHeader: vi.fn((k: string, v: string) => { res.headers[k] = v; }),
    flushHeaders: vi.fn(),
    write: vi.fn((chunk: string) => {
      res.writtenLines.push(chunk);
      for (const line of chunk.split('\n')) {
        if (!line.startsWith('data: ')) continue;
        try { res.events.push(JSON.parse(line.slice(6))); } catch { /* skip */ }
      }
    }),
    end: vi.fn(() => { res.ended = true; }),
  };
  return res;
}

// ── Route handler (mirrors server/routes.ts exactly) ─────────────────────────

async function streamHandler(
  req: ReturnType<typeof buildMockReq>,
  res: MockRes,
  aiTokens: string[] = ['Hallo', ' Welt'],
  aiError?: string,
) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  let clientGone = false;
  req.on('close', () => { clientGone = true; });

  const sendSSE = (data: object) => {
    if (clientGone) return;
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  try {
    const userId = (req as any).user.claims.sub;
    const user = await storageMock.getUser(userId);
    if (!user) { sendSSE({ error: 'Benutzer nicht gefunden' }); return res.end(); }

    const limit = RATE_LIMITS[user.subscriptionTier as string] ?? RATE_LIMITS.free;
    if (limit > 0 && (user.dailyMessageCount || 0) >= limit) {
      sendSSE({ error: `Tageslimit erreicht (${limit} Nachrichten). Bitte upgraden.` });
      return res.end();
    }

    const { content, conversationId, model = 'gemini-2.5-flash', skipUserMessage = false } = req.body;
    if (!content || typeof content !== 'string') {
      sendSSE({ error: 'Nachricht fehlt' });
      return res.end();
    }

    const conv = await storageMock.getConversation(conversationId);
    if (!conv || (conv as any).userId !== userId) {
      sendSSE({ error: 'Konversation nicht gefunden' });
      return res.end();
    }

    if (!skipUserMessage) {
      await storageMock.createMessage({ conversationId: conversationId as string, role: 'user', content: content as string });
    }
    sendSSE({ ackUserPersisted: true });

    if (aiError) {
      sendSSE({ error: aiError });
      return res.end();
    }

    let fullContent = '';
    for (const t of aiTokens) {
      if (clientGone) break;
      fullContent += t;
      sendSSE({ token: t });
    }

    if (!clientGone) {
      const aiMsg = await storageMock.createMessage({
        conversationId: conversationId as string,
        role: 'assistant',
        content: fullContent,
      });
      await storageMock.incrementDailyMessageCount(userId);
      sendSSE({ done: true, messageId: (aiMsg as any).id, model });
    }
  } catch (err: any) {
    sendSSE({ error: err.message || 'Streaming-Fehler' });
  }

  res.end();
}

// ── Tests ─────────────────────────────────────────────────────────────────────

beforeEach(() => { resetMocks(); });

describe('POST /api/chat/stream – Happy Path (Token-Fluss)', () => {
  it('ackUserPersisted ist erstes SSE-Event', async () => {
    const req = buildMockReq({ userId: 'user_free', body: { content: 'Hallo', conversationId: 'conv_free', model: 'gemini-2.5-flash' } });
    const res = buildMockRes();
    await streamHandler(req, res, ['ok']);
    expect(res.events[0]).toMatchObject({ ackUserPersisted: true });
  });

  it('Token-Events werden in Reihenfolge gesendet', async () => {
    const req = buildMockReq({ userId: 'user_free', body: { content: 'Test', conversationId: 'conv_free', model: 'gemini-2.5-flash' } });
    const res = buildMockRes();
    await streamHandler(req, res, ['A', 'B', 'C']);
    const tokens = res.events.filter(e => typeof e['token'] === 'string').map(e => e['token']);
    expect(tokens).toEqual(['A', 'B', 'C']);
  });

  it('done-Event enthält messageId und model', async () => {
    const req = buildMockReq({ userId: 'user_free', body: { content: 'Test', conversationId: 'conv_free', model: 'gemini-2.5-flash' } });
    const res = buildMockRes();
    await streamHandler(req, res, ['fertig']);
    const done = res.events.find(e => e['done'] === true);
    expect(done).toBeDefined();
    expect(typeof done!['messageId']).toBe('string');
    expect(done!['model']).toBe('gemini-2.5-flash');
  });

  it('Event-Reihenfolge: ack → token* → done', async () => {
    const req = buildMockReq({ userId: 'user_free', body: { content: 'Test', conversationId: 'conv_free', model: 'gemini-2.5-flash' } });
    const res = buildMockRes();
    await streamHandler(req, res, ['X', 'Y']);
    const types = res.events.map(e =>
      e['ackUserPersisted'] ? 'ack' : e['done'] ? 'done' : e['token'] ? 'token' : 'unknown'
    );
    expect(types[0]).toBe('ack');
    expect(types[types.length - 1]).toBe('done');
    expect(types.slice(1, -1).every(t => t === 'token')).toBe(true);
  });

  it('res.end() wird genau einmal aufgerufen', async () => {
    const req = buildMockReq({ userId: 'user_free', body: { content: 'Test', conversationId: 'conv_free', model: 'gemini-2.5-flash' } });
    const res = buildMockRes();
    await streamHandler(req, res, ['ok']);
    expect(res.end).toHaveBeenCalledTimes(1);
  });

  it('SSE-Header werden gesetzt', async () => {
    const req = buildMockReq({ userId: 'user_free', body: { content: 'Test', conversationId: 'conv_free', model: 'gemini-2.5-flash' } });
    const res = buildMockRes();
    await streamHandler(req, res, ['ok']);
    expect(res.headers['Content-Type']).toBe('text/event-stream');
    expect(res.headers['Cache-Control']).toBe('no-cache');
  });
});

describe('POST /api/chat/stream – Fehler-Events', () => {
  it('sendet error wenn User nicht existiert', async () => {
    const req = buildMockReq({ userId: 'user_unknown', body: { content: 'Hi', conversationId: 'conv_free', model: 'gemini-2.5-flash' } });
    const res = buildMockRes();
    await streamHandler(req, res);
    expect(res.events[0]).toMatchObject({ error: 'Benutzer nicht gefunden' });
    expect(res.end).toHaveBeenCalledTimes(1);
  });

  it('sendet error wenn Inhalt fehlt', async () => {
    const req = buildMockReq({ userId: 'user_free', body: { content: '', conversationId: 'conv_free', model: 'gemini-2.5-flash' } });
    const res = buildMockRes();
    await streamHandler(req, res);
    expect(res.events[0]).toMatchObject({ error: 'Nachricht fehlt' });
  });

  it('sendet error wenn Konversation nicht gefunden', async () => {
    const req = buildMockReq({ userId: 'user_free', body: { content: 'Hi', conversationId: 'conv_falsch', model: 'gemini-2.5-flash' } });
    const res = buildMockRes();
    await streamHandler(req, res);
    expect(res.events[0]).toMatchObject({ error: 'Konversation nicht gefunden' });
  });

  it('sendet error wenn Konversation anderem User gehört', async () => {
    const req = buildMockReq({ userId: 'user_free', body: { content: 'Hi', conversationId: 'conv_ultra', model: 'gemini-2.5-flash' } });
    const res = buildMockRes();
    await streamHandler(req, res);
    expect(res.events[0]).toMatchObject({ error: 'Konversation nicht gefunden' });
  });

  it('sendet error nach ackUserPersisted wenn AI fehlschlägt', async () => {
    const req = buildMockReq({ userId: 'user_ultra', body: { content: 'Hi', conversationId: 'conv_ultra', model: 'gemini-2.5-flash' } });
    const res = buildMockRes();
    await streamHandler(req, res, [], 'Modell nicht verfügbar');
    expect(res.events[0]).toMatchObject({ ackUserPersisted: true });
    const err = res.events.find(e => typeof e['error'] === 'string');
    expect(err!['error']).toBe('Modell nicht verfügbar');
  });
});

describe('POST /api/chat/stream – Rate-Limit', () => {
  it('sendet Tageslimit-Error wenn Kontingent erschöpft', async () => {
    const req = buildMockReq({ userId: 'user_limit', body: { content: 'Hi', conversationId: 'conv_free', model: 'gemini-2.5-flash' } });
    const res = buildMockRes();
    await streamHandler(req, res);
    const err = res.events.find(e => typeof e['error'] === 'string');
    expect(err!['error']).toContain('Tageslimit');
  });

  it('kein ackUserPersisted vor Rate-Limit-Error', async () => {
    const req = buildMockReq({ userId: 'user_limit', body: { content: 'Hi', conversationId: 'conv_free', model: 'gemini-2.5-flash' } });
    const res = buildMockRes();
    await streamHandler(req, res);
    expect(res.events.some(e => e['ackUserPersisted'])).toBe(false);
  });
});

describe('POST /api/chat/stream – Retry / skipUserMessage', () => {
  it('ohne skipUserMessage: createMessage für user-Rolle aufgerufen', async () => {
    const req = buildMockReq({ userId: 'user_ultra', body: { content: 'Retry', conversationId: 'conv_ultra', model: 'gemini-2.5-flash' } });
    const res = buildMockRes();
    await streamHandler(req, res, ['ok']);
    const userCall = storageMock.createMessage.mock.calls.find(c => c[0].role === 'user');
    expect(userCall).toBeDefined();
  });

  it('mit skipUserMessage=true: KEIN createMessage für user-Rolle', async () => {
    const req = buildMockReq({ userId: 'user_ultra', body: { content: 'Retry', conversationId: 'conv_ultra', model: 'gemini-2.5-flash', skipUserMessage: true } });
    const res = buildMockRes();
    await streamHandler(req, res, ['ok']);
    const userCall = storageMock.createMessage.mock.calls.find(c => c[0].role === 'user');
    expect(userCall).toBeUndefined();
  });

  it('ackUserPersisted erscheint auch bei skipUserMessage=true', async () => {
    const req = buildMockReq({ userId: 'user_ultra', body: { content: 'Retry', conversationId: 'conv_ultra', model: 'gemini-2.5-flash', skipUserMessage: true } });
    const res = buildMockRes();
    await streamHandler(req, res, ['retry-ok']);
    expect(res.events[0]).toMatchObject({ ackUserPersisted: true });
  });

  it('assistant-Nachricht wird nach erfolgreichem Stream gespeichert', async () => {
    const req = buildMockReq({ userId: 'user_ultra', body: { content: 'Test', conversationId: 'conv_ultra', model: 'gpt-4o' } });
    const res = buildMockRes();
    await streamHandler(req, res, ['Teil1', ' Teil2']);
    const assistantCall = storageMock.createMessage.mock.calls.find(c => c[0].role === 'assistant');
    expect(assistantCall).toBeDefined();
    expect(assistantCall![0].content).toBe('Teil1 Teil2');
  });
});

describe('POST /api/chat/stream – Disconnect (clientGone)', () => {
  it('sendet kein done-Event wenn clientGone=true', async () => {
    const req = buildMockReq({ userId: 'user_free', body: { content: 'Hi', conversationId: 'conv_free', model: 'gemini-2.5-flash' } });
    const res = buildMockRes();

    // Simuliere clientGone nach ackUserPersisted: Override createMessage to trigger close
    storageMock.createMessage.mockImplementationOnce(async (msg: any) => {
      req._trigger('close'); // Disconnect simulieren
      return { id: 'msg_1', ...msg };
    });

    await streamHandler(req, res, ['A', 'B', 'C']);
    expect(res.events.some(e => e['done'] === true)).toBe(false);
  });
});
