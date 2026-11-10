import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  archiveCurrentGoal,
  deleteHistoryItem,
  getCurrentGoal,
  getGoalHistory,
  saveCurrentGoal,
} from './goalStorage';
import { makeGoal } from '../test/factories';

// Klucze są częścią formatu danych użytkownika — test pilnuje, żeby się nie zmieniły.
const CURRENT_KEY = 'jeden_cel_current_goal_v1';
const HISTORY_KEY = 'jeden_cel_history_v1';

const setRaw = (key: string, value: string) => localStorage.setItem(key, value);
const setJson = (key: string, value: unknown) => setRaw(key, JSON.stringify(value));

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.useRealTimers();
});

describe('zgodność ze starszymi zapisami', () => {
  it('wczytuje cel zapisany pod obecnym kluczem', () => {
    const goal = makeGoal({ id: 'stary-cel' });
    setJson(CURRENT_KEY, goal);
    expect(getCurrentGoal()).toEqual(goal);
  });

  it('wczytuje historię zapisaną pod obecnym kluczem', () => {
    const history = [makeGoal({ id: 'a' }), makeGoal({ id: 'b' })];
    setJson(HISTORY_KEY, history);
    expect(getGoalHistory()).toEqual(history);
  });

  it('zapisuje dane pod tymi samymi kluczami', () => {
    saveCurrentGoal(makeGoal());
    expect(localStorage.getItem(CURRENT_KEY)).not.toBeNull();
    archiveCurrentGoal(makeGoal({ id: 'x' }));
    expect(localStorage.getItem(HISTORY_KEY)).not.toBeNull();
  });
});

describe('getCurrentGoal', () => {
  it('zwraca null, gdy nie ma danych', () => {
    expect(getCurrentGoal()).toBeNull();
  });

  it('zwraca null i nie rzuca przy uszkodzonym JSON', () => {
    setRaw(CURRENT_KEY, '{nie-json');
    expect(getCurrentGoal()).toBeNull();
  });

  it('przy uszkodzonym JSON zachowuje kopię surowych danych', () => {
    setRaw(CURRENT_KEY, '{nie-json');
    getCurrentGoal();
    expect(localStorage.getItem(`${CURRENT_KEY}_corrupted_backup`)).toBe('{nie-json');
  });

  it.each([
    ['null', 'null'],
    ['liczba', '42'],
    ['napis', '"tekst"'],
    ['tablica', '[]'],
    ['pusty obiekt', '{}'],
  ])('zwraca null dla zapisu typu: %s', (_name, raw) => {
    setRaw(CURRENT_KEY, raw);
    expect(getCurrentGoal()).toBeNull();
  });

  it.each([
    ['brak id', { title: 'x', steps: [] }],
    ['id nie jest napisem', { id: 1, title: 'x', steps: [] }],
    ['brak tytułu', { id: 'a', steps: [] }],
    ['kroki nie są tablicą', { id: 'a', title: 'x', steps: 'abc' }],
  ])('odrzuca cel: %s', (_name, value) => {
    setJson(CURRENT_KEY, value);
    expect(getCurrentGoal()).toBeNull();
  });

  it('zwraca null, gdy localStorage rzuca wyjątek przy odczycie', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('Brak dostępu', 'SecurityError');
    });
    expect(getCurrentGoal()).toBeNull();
  });

  // Znany błąd: walidacja nie sprawdza zawartości kroków, więc takie dane
  // przechodzą i potem wywracają widok. Po poprawce zmień it.fails na it.
  it.fails('odrzuca cel z uszkodzonymi krokami (null w tablicy kroków)', () => {
    setJson(CURRENT_KEY, { id: 'a', title: 'x', steps: [null] });
    expect(getCurrentGoal()).toBeNull();
  });
});

describe('saveCurrentGoal', () => {
  it('zapisuje cel i da się go odczytać', () => {
    const goal = makeGoal();
    saveCurrentGoal(goal);
    expect(getCurrentGoal()).toEqual(goal);
  });

  it('null usuwa aktualny cel', () => {
    saveCurrentGoal(makeGoal());
    saveCurrentGoal(null);
    expect(localStorage.getItem(CURRENT_KEY)).toBeNull();
  });

  it('nie rzuca, gdy zapis się nie uda (np. pełna pamięć)', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Limit', 'QuotaExceededError');
    });
    expect(() => saveCurrentGoal(makeGoal())).not.toThrow();
    expect(console.error).toHaveBeenCalled();
  });

  it('nie rzuca, gdy usunięcie się nie uda', () => {
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new DOMException('Brak dostępu', 'SecurityError');
    });
    expect(() => saveCurrentGoal(null)).not.toThrow();
  });
});

describe('getGoalHistory', () => {
  it('zwraca pustą tablicę, gdy nie ma danych', () => {
    expect(getGoalHistory()).toEqual([]);
  });

  it('zwraca pustą tablicę przy uszkodzonym JSON i zachowuje kopię', () => {
    setRaw(HISTORY_KEY, '[[[');
    expect(getGoalHistory()).toEqual([]);
    expect(localStorage.getItem(`${HISTORY_KEY}_corrupted_backup`)).toBe('[[[');
  });

  it('zwraca pustą tablicę, gdy zapis nie jest tablicą', () => {
    setJson(HISTORY_KEY, { id: 'a', title: 'x', steps: [] });
    expect(getGoalHistory()).toEqual([]);
  });

  it('odrzuca błędne wpisy, a poprawne zostawia', () => {
    const good = makeGoal({ id: 'dobry' });
    setJson(HISTORY_KEY, [good, null, 5, { id: 'zly' }, 'tekst']);
    expect(getGoalHistory()).toEqual([good]);
  });
});

describe('archiveCurrentGoal', () => {
  it('oznacza cel jako ukończony i ustawia completedAt', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-10T18:00:00.000Z'));
    const [archived] = archiveCurrentGoal(makeGoal({ status: 'active' }));
    expect(archived.status).toBe('completed');
    expect(archived.completedAt).toBe('2026-11-10T18:00:00.000Z');
  });

  it('dodaje cel na początek historii', () => {
    archiveCurrentGoal(makeGoal({ id: 'pierwszy' }));
    const history = archiveCurrentGoal(makeGoal({ id: 'drugi' }));
    expect(history.map((g) => g.id)).toEqual(['drugi', 'pierwszy']);
  });

  it('nie dubluje wpisu o tym samym id (nowszy zastępuje starszy)', () => {
    archiveCurrentGoal(makeGoal({ id: 'a', title: 'Stary' }));
    const history = archiveCurrentGoal(makeGoal({ id: 'a', title: 'Nowy' }));
    expect(history).toHaveLength(1);
    expect(history[0].title).toBe('Nowy');
  });

  it('zapisuje historię i czyści aktualny cel w pamięci', () => {
    const goal = makeGoal({ id: 'a' });
    saveCurrentGoal(goal);
    archiveCurrentGoal(goal);
    expect(getCurrentGoal()).toBeNull();
    expect(getGoalHistory().map((g) => g.id)).toEqual(['a']);
  });

  it('nie zmienia oryginalnego obiektu celu', () => {
    const goal = makeGoal({ status: 'active' });
    archiveCurrentGoal(goal);
    expect(goal.status).toBe('active');
    expect(goal.completedAt).toBeUndefined();
  });

  it('zachowuje istniejącą historię, pomijając w niej uszkodzone wpisy', () => {
    const old = makeGoal({ id: 'stary' });
    setJson(HISTORY_KEY, [old, null]);
    const history = archiveCurrentGoal(makeGoal({ id: 'nowy' }));
    expect(history.map((g) => g.id)).toEqual(['nowy', 'stary']);
  });

  // Znany błąd: gdy zapis historii się nie uda, aktualny cel i tak jest usuwany,
  // więc dane znikają z obu miejsc. Po poprawce zmień it.fails na it.
  it.fails('nie kasuje aktualnego celu, gdy zapis historii się nie powiódł', () => {
    const goal = makeGoal({ id: 'a' });
    saveCurrentGoal(goal);
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Limit', 'QuotaExceededError');
    });
    archiveCurrentGoal(goal);
    setItem.mockRestore();
    expect(getCurrentGoal()).toEqual(goal);
  });
});

describe('deleteHistoryItem', () => {
  it('usuwa wpis o podanym id', () => {
    setJson(HISTORY_KEY, [makeGoal({ id: 'a' }), makeGoal({ id: 'b' })]);
    const result = deleteHistoryItem('a');
    expect(result.map((g) => g.id)).toEqual(['b']);
    expect(getGoalHistory().map((g) => g.id)).toEqual(['b']);
  });

  it('nieistniejące id nic nie zmienia', () => {
    setJson(HISTORY_KEY, [makeGoal({ id: 'a' })]);
    expect(deleteHistoryItem('brak')).toHaveLength(1);
  });

  it('działa na pustej historii', () => {
    expect(deleteHistoryItem('a')).toEqual([]);
  });
});
