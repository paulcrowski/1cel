import { afterEach, describe, expect, it, vi } from 'vitest';
import { formatLongDate, formatShortDate, getTodayIso, isBeforeToday } from './date';

// Strefa czasowa jest ustawiona na Europe/Warsaw w vitest.config.ts.
describe('getTodayIso', () => {
  afterEach(() => vi.useRealTimers());

  const at = (iso: string) => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(iso));
  };

  it('zwraca datę w formacie YYYY-MM-DD', () => {
    at('2026-11-10T12:00:00Z');
    expect(getTodayIso()).toBe('2026-11-10');
  });

  it('po północy czasu polskiego (zima) używa polskiej daty, nie UTC', () => {
    at('2026-11-09T23:30:00Z'); // 00:30 w Polsce
    expect(getTodayIso()).toBe('2026-11-10');
  });

  it('po północy czasu polskiego (lato) używa polskiej daty, nie UTC', () => {
    at('2026-06-30T22:30:00Z'); // 00:30 w Polsce
    expect(getTodayIso()).toBe('2026-07-01');
  });

  it('tuż przed północą nie przeskakuje na następny dzień', () => {
    at('2026-12-31T22:59:00Z'); // 23:59 w Polsce
    expect(getTodayIso()).toBe('2026-12-31');
  });

  it('dopełnia zerami miesiąc i dzień', () => {
    at('2026-02-03T12:00:00Z');
    expect(getTodayIso()).toBe('2026-02-03');
  });

  it('obsługuje rok przestępny', () => {
    at('2028-02-29T12:00:00Z');
    expect(getTodayIso()).toBe('2028-02-29');
  });
});

describe('formatLongDate', () => {
  it('zawiera polską nazwę miesiąca i rok', () => {
    expect(formatLongDate(new Date(2026, 10, 10))).toContain('10 listopada 2026');
  });

  it('zaczyna się wielką literą', () => {
    expect(formatLongDate(new Date(2026, 10, 10))).toMatch(/^\p{Lu}/u);
  });
});

describe('formatShortDate', () => {
  it('formatuje poprawną datę po polsku', () => {
    expect(formatShortDate('2026-11-10')).toBe('10 lis 2026');
  });

  it.each(['', 'nie-data', '2026-13-45'])('niepoprawną datę "%s" zwraca bez zmian', (value) => {
    expect(formatShortDate(value)).toBe(value);
  });
});

describe('formatShortDate — strefy na zachód od UTC', () => {
  const original = process.env.TZ;
  afterEach(() => {
    process.env.TZ = original;
    vi.resetModules();
  });

  it('nie cofa daty o dzień (YYYY-MM-DD to data lokalna, nie UTC)', async () => {
    process.env.TZ = 'America/Los_Angeles';
    // Formatter w date.ts zapamiętuje strefę przy imporcie — ładujemy moduł od nowa.
    vi.resetModules();
    const { formatShortDate: format } = await import('./date');
    expect(format('2026-11-10')).toBe('10 lis 2026');
  });
});

describe('isBeforeToday', () => {
  afterEach(() => vi.useRealTimers());

  it('rozpoznaje wcześniejszy dzień, dzisiejszy i przyszły', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-10T12:00:00Z'));
    expect(isBeforeToday('2026-11-09')).toBe(true);
    expect(isBeforeToday('2026-11-10')).toBe(false);
    expect(isBeforeToday('2026-11-11')).toBe(false);
  });

  it.each(['', 'kiedyś', '2026-13-45'])('niepoprawna data "%s" nie jest stara', (value) => {
    expect(isBeforeToday(value)).toBe(false);
  });
});
