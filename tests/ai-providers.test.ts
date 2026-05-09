// AI Providers Unit Tests – wensday.ch
import { describe, it, expect } from 'vitest';
import { AI_PROVIDERS } from '../shared/ai-providers';

describe('AI_PROVIDERS – Vollständigkeit', () => {
  it('hat mindestens 4 Anbieter definiert', () => {
    expect(AI_PROVIDERS.length).toBeGreaterThanOrEqual(4);
  });

  it('jeder Anbieter hat die Pflichtfelder', () => {
    for (const p of AI_PROVIDERS) {
      expect(p.name,         `${p.slug}: name`).toBeTruthy();
      expect(p.slug,         `${p.slug}: slug`).toBeTruthy();
      expect(p.baseUrl,      `${p.slug}: baseUrl`).toMatch(/^https:\/\//);
      expect(p.apiKeyName,   `${p.slug}: apiKeyName`).toBeTruthy();
      expect(p.defaultModel, `${p.slug}: defaultModel`).toBeTruthy();
      expect(p.supportedModels.length, `${p.slug}: supportedModels`).toBeGreaterThan(0);
    }
  });

  it('defaultModel ist in supportedModels vorhanden', () => {
    for (const p of AI_PROVIDERS) {
      const ids = p.supportedModels.map(m => m.id);
      expect(ids, `${p.name}: defaultModel "${p.defaultModel}" nicht in supportedModels`).toContain(p.defaultModel);
    }
  });

  it('keine doppelten slugs', () => {
    const slugs = AI_PROVIDERS.map(p => p.slug);
    const unique = new Set(slugs);
    expect(unique.size).toBe(slugs.length);
  });
});

describe('AI_PROVIDERS – bekannte Anbieter', () => {
  it('OpenAI ist vorhanden', () => {
    const p = AI_PROVIDERS.find(p => p.slug === 'openai');
    expect(p).toBeDefined();
    expect(p?.name).toBe('OpenAI');
  });

  it('Gemini ist vorhanden', () => {
    const p = AI_PROVIDERS.find(p => p.slug === 'gemini');
    expect(p).toBeDefined();
  });

  it('DeepSeek ist vorhanden', () => {
    const p = AI_PROVIDERS.find(p => p.slug === 'deepseek');
    expect(p).toBeDefined();
  });

  it('Perplexity unterstützt Websuche', () => {
    const p = AI_PROVIDERS.find(p => p.slug === 'perplexity');
    expect(p?.features?.search).toBe(true);
    expect(p?.features?.citations).toBe(true);
  });

  it('mindestens 2 Anbieter unterstützen Streaming', () => {
    const streaming = AI_PROVIDERS.filter(p => p.features?.streaming);
    expect(streaming.length).toBeGreaterThanOrEqual(2);
  });

  it('mindestens 1 Anbieter unterstützt Vision', () => {
    const vision = AI_PROVIDERS.filter(p => p.features?.vision);
    expect(vision.length).toBeGreaterThanOrEqual(1);
  });
});

describe('Subscription Access Levels', () => {
  it('es gibt öffentliche Anbieter (kein adminOnly)', () => {
    const publicP = AI_PROVIDERS.filter(p => !p.adminOnly && !p.requiresApproval);
    expect(publicP.length).toBeGreaterThan(0);
  });
});
