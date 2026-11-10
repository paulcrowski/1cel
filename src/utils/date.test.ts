import { afterEach, describe, expect, it, vi } from 'vitest';
import { formatLongDate, formatShortDate, getTodayIso } from './date';

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
