import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useDailyGoal } from './useDailyGoal';
import { makeGoal, makeStep } from '../test/factories';

const CURRENT_KEY = 'jeden_cel_current_goal_v1';
const HISTORY_KEY = 'jeden_cel_history_v1';

const stored = (key: string) => JSON.parse(localStorage.getItem(key) ?? 'null');

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('stan początkowy', () => {
  it('jest pusty, gdy w pamięci nic nie ma', () => {
    const { result } = renderHook(() => useDailyGoal());
    expect(result.current.currentGoal).toBeNull();
    expect(result.current.history).toEqual([]);
    expect(result.current.isEditing).toBe(false);
    expect(result.current.justCompleted).toBeNull();
  });

  it('wczytuje cel i historię z pamięci', () => {
    const goal = makeGoal({ id: 'aktualny' });
    const old = makeGoal({ id: 'stary' });
    localStorage.setItem(CURRENT_KEY, JSON.stringify(goal));
    localStorage.setItem(HISTORY_KEY, JSON.stringify([old]));

    const { result } = renderHook(() => useDailyGoal());
    expect(result.current.currentGoal).toEqual(goal);
    expect(result.current.history).toEqual([old]);
  });

  it('nie rzuca przy uszkodzonych danych', () => {
    localStorage.setItem(CURRENT_KEY, '{zepsute');
    localStorage.setItem(HISTORY_KEY, 'też-zepsute');
    const { result } = renderHook(() => useDailyGoal());
    expect(result.current.currentGoal).toBeNull();
    expect(result.current.history).toEqual([]);
  });
});

describe('saveGoal', () => {
  it('ustawia cel, zapisuje go i wychodzi z edycji', () => {
    const { result } = renderHook(() => useDailyGoal());
    const goal = makeGoal();

    act(() => result.current.startEditing());
    act(() => result.current.saveGoal(goal));

    expect(result.current.currentGoal).toEqual(goal);
    expect(result.current.isEditing).toBe(false);
    expect(stored(CURRENT_KEY)).toEqual(goal);
  });

  it('czyści komunikat o zamkniętym dniu', () => {
    const { result } = renderHook(() => useDailyGoal());
    act(() => result.current.completeGoal(makeGoal()));
    expect(result.current.justCompleted).not.toBeNull();

    act(() => result.current.saveGoal(makeGoal({ id: 'nowy' })));
    expect(result.current.justCompleted).toBeNull();
  });
});

describe('updateGoal', () => {
  it('aktualizuje stan i pamięć, nie ruszając trybu edycji', () => {
    const { result } = renderHook(() => useDailyGoal());
    act(() => result.current.saveGoal(makeGoal()));
    act(() => result.current.startEditing());

    const updated = makeGoal({ steps: [makeStep({ completed: true })] });
    act(() => result.current.updateGoal(updated));

    expect(result.current.currentGoal).toEqual(updated);
    expect(result.current.isEditing).toBe(true);
    expect(stored(CURRENT_KEY)).toEqual(updated);
  });
});

describe('editing', () => {
  it('startEditing i cancelEditing przełączają tryb edycji bez zmiany celu', () => {
    const goal = makeGoal();
    localStorage.setItem(CURRENT_KEY, JSON.stringify(goal));
    const { result } = renderHook(() => useDailyGoal());

    act(() => result.current.startEditing());
    expect(result.current.isEditing).toBe(true);

    act(() => result.current.cancelEditing());
    expect(result.current.isEditing).toBe(false);
    expect(result.current.currentGoal).toEqual(goal);
    expect(stored(CURRENT_KEY)).toEqual(goal);
  });
});

describe('completeGoal', () => {
  it('przenosi cel do historii i czyści aktualny', () => {
    const goal = makeGoal({ id: 'a' });
    localStorage.setItem(CURRENT_KEY, JSON.stringify(goal));
    const { result } = renderHook(() => useDailyGoal());

    act(() => result.current.completeGoal(goal));

    expect(result.current.currentGoal).toBeNull();
    expect(result.current.history).toHaveLength(1);
    expect(result.current.history[0]).toMatchObject({ id: 'a', status: 'completed' });
    expect(localStorage.getItem(CURRENT_KEY)).toBeNull();
    expect(stored(HISTORY_KEY)).toHaveLength(1);
  });

  it('zapamiętuje postęp zamkniętego celu na potrzeby komunikatu', () => {
    const goal = makeGoal({
      steps: [makeStep({ id: 'a', completed: true }), makeStep({ id: 'b', completed: false })],
    });
    const { result } = renderHook(() => useDailyGoal());

    act(() => result.current.completeGoal(goal));

    expect(result.current.justCompleted).toMatchObject({
      completed: 1,
      total: 2,
      percent: 50,
      isAllDone: false,
    });
  });

  it('wychodzi z trybu edycji', () => {
    const goal = makeGoal();
    const { result } = renderHook(() => useDailyGoal());
    act(() => result.current.saveGoal(goal));
    act(() => result.current.startEditing());
    act(() => result.current.completeGoal(goal));
    expect(result.current.isEditing).toBe(false);
  });

  it('dismissCompleted ukrywa komunikat', () => {
    const { result } = renderHook(() => useDailyGoal());
    act(() => result.current.completeGoal(makeGoal()));
    act(() => result.current.dismissCompleted());
    expect(result.current.justCompleted).toBeNull();
  });
});

describe('resetGoal', () => {
  it('usuwa aktualny cel ze stanu i z pamięci, historia zostaje', () => {
    const { result } = renderHook(() => useDailyGoal());
    act(() => result.current.completeGoal(makeGoal({ id: 'stary' })));
    act(() => result.current.saveGoal(makeGoal({ id: 'nowy' })));

    act(() => result.current.resetGoal());

    expect(result.current.currentGoal).toBeNull();
    expect(localStorage.getItem(CURRENT_KEY)).toBeNull();
    expect(result.current.history).toHaveLength(1);
    expect(result.current.justCompleted).toBeNull();
  });
});

describe('deleteFromHistory', () => {
  it('usuwa wpis ze stanu i z pamięci', () => {
    const { result } = renderHook(() => useDailyGoal());
    act(() => result.current.completeGoal(makeGoal({ id: 'a' })));
    act(() => result.current.completeGoal(makeGoal({ id: 'b' })));

    act(() => result.current.deleteFromHistory('a'));

    expect(result.current.history.map((g) => g.id)).toEqual(['b']);
    expect(stored(HISTORY_KEY).map((g: { id: string }) => g.id)).toEqual(['b']);
  });
});
