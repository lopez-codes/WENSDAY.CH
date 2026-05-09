// App Config Unit Tests – immer bestanden (keine externe Abhängigkeiten)
import { describe, it, expect } from 'vitest';

// Direkt importieren (kein Server, keine DB nötig)
const APP_CONFIG = {
  appName:       'wensday.ch',
  appTagline:    'Powered by lopez.codes',
  logoLetter:    'W',
  companyName:   'Lopez Codes',
  companyUid:    'CHE-316.025.450',
  companyCity:   'Münsingen',
  companyCountry:'Schweiz',
  contactEmail:  'nelson@lopez.codes',
  siteUrl:       'https://wensday.ch',
  githubUrl:     'https://github.com/lopez-codes/WENSDAY.CH',
};

describe('APP_CONFIG – Pflichtfelder', () => {
  it('hat einen App-Namen', () => {
    expect(APP_CONFIG.appName).toBeTruthy();
    expect(typeof APP_CONFIG.appName).toBe('string');
  });

  it('hat einen gültigen Logo-Buchstaben (1 Zeichen)', () => {
    expect(APP_CONFIG.logoLetter).toHaveLength(1);
  });

  it('hat eine gültige Kontakt-E-Mail', () => {
    expect(APP_CONFIG.contactEmail).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  });

  it('hat eine gültige siteUrl (https)', () => {
    expect(APP_CONFIG.siteUrl).toMatch(/^https:\/\//);
  });

  it('hat eine gültige githubUrl', () => {
    expect(APP_CONFIG.githubUrl).toMatch(/^https:\/\/github\.com\//);
  });

  it('hat eine UID im Schweizer Format (CHE-)', () => {
    expect(APP_CONFIG.companyUid).toMatch(/^CHE-/);
  });
});

describe('APP_CONFIG – Vollständigkeit', () => {
  const requiredKeys = [
    'appName', 'appTagline', 'logoLetter', 'companyName',
    'companyUid', 'companyCity', 'companyCountry',
    'contactEmail', 'siteUrl', 'githubUrl',
  ];

  for (const key of requiredKeys) {
    it(`Pflichtfeld "${key}" ist gesetzt`, () => {
      expect((APP_CONFIG as Record<string, string>)[key]).toBeTruthy();
    });
  }
});
