import { describe, expect, it } from 'vitest';
import { getStreak } from './streak';

describe('getStreak', () => {
  it('pusta historia daje 0', () => {
    expect(getStreak([], '2026-11-10')).toBe(0);
  });

  it('liczy kolejne dni razem z dzisiejszym', () => {
    expect(getStreak(['2026-11-10', '2026-11-09', '2026-11-08'], '2026-11-10')).toBe(3);
  });

  it('gdy dziś nie ma wpisu, liczy od wczoraj', () => {
    expect(getStreak(['2026-11-09', '2026-11-08'], '2026-11-10')).toBe(2);
  });

  it('luka przerywa serię', () => {
    expect(getStreak(['2026-11-10', '2026-11-08'], '2026-11-10')).toBe(1);
  });

  it('starsza historia bez wczoraj i dziś daje 0', () => {
    expect(getStreak(['2026-11-07'], '2026-11-10')).toBe(0);
  });

  it('duplikaty tego samego dnia liczą się raz', () => {
    expect(getStreak(['2026-11-10', '2026-11-10'], '2026-11-10')).toBe(1);
  });

  it('działa na granicy miesięcy i lat', () => {
    expect(getStreak(['2027-01-01', '2026-12-31', '2026-12-30'], '2027-01-01')).toBe(3);
    expect(getStreak(['2028-03-01', '2028-02-29'], '2028-03-01')).toBe(2);
  });

  it('ignoruje niepoprawne daty', () => {
    expect(getStreak(['kiedyś', '2026-11-10'], '2026-11-10')).toBe(1);
  });
});
