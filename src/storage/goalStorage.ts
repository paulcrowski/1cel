import { DailyGoal } from '../types';

// Klucze są częścią formatu danych użytkownika — nie zmieniać bez migracji.
const STORAGE_KEY_CURRENT = 'jeden_cel_current_goal_v1';
const STORAGE_KEY_HISTORY = 'jeden_cel_history_v1';

function isDailyGoal(value: unknown): value is DailyGoal {
  if (typeof value !== 'object' || value === null) return false;
  const goal = value as Partial<DailyGoal>;
  return (
    typeof goal.id === 'string' &&
    typeof goal.title === 'string' &&
    Array.isArray(goal.steps)
  );
}

function readJson(key: string): unknown {
  let data: string | null = null;
  try {
    data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Błąd podczas odczytu "${key}" z localStorage:`, error);
    if (data) backupCorrupted(key, data);
    return null;
  }
}

// Nieczytelne dane trafiają do kopii, żeby następny zapis ich nie skasował bez śladu.
function backupCorrupted(key: string, data: string): void {
  try {
    localStorage.setItem(`${key}_corrupted_backup`, data);
  } catch (error) {
    console.error(`Nie udało się zapisać kopii uszkodzonych danych "${key}":`, error);
  }
}

function writeJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Błąd podczas zapisu "${key}" w localStorage:`, error);
  }
}

export function getCurrentGoal(): DailyGoal | null {
  const value = readJson(STORAGE_KEY_CURRENT);
  return isDailyGoal(value) ? value : null;
}

export function saveCurrentGoal(goal: DailyGoal | null): void {
  if (goal === null) {
    try {
      localStorage.removeItem(STORAGE_KEY_CURRENT);
    } catch (error) {
      console.error('Błąd podczas usuwania aktualnego celu z localStorage:', error);
    }
    return;
  }
  writeJson(STORAGE_KEY_CURRENT, goal);
}

export function getGoalHistory(): DailyGoal[] {
  const value = readJson(STORAGE_KEY_HISTORY);
  return Array.isArray(value) ? value.filter(isDailyGoal) : [];
}

function saveGoalHistory(history: DailyGoal[]): void {
  writeJson(STORAGE_KEY_HISTORY, history);
}

/** Przenosi cel do historii (na początek listy) i czyści aktualny cel. */
export function archiveCurrentGoal(goal: DailyGoal): DailyGoal[] {
  const archived: DailyGoal = {
    ...goal,
    status: 'completed',
    completedAt: new Date().toISOString(),
  };
  const newHistory = [archived, ...getGoalHistory().filter((item) => item.id !== archived.id)];
  saveGoalHistory(newHistory);
  saveCurrentGoal(null);
  return newHistory;
}

export function deleteHistoryItem(id: string): DailyGoal[] {
  const filtered = getGoalHistory().filter((item) => item.id !== id);
  saveGoalHistory(filtered);
  return filtered;
}

/** Przywraca usunięty wpis na jego dawne miejsce (np. po „Cofnij”). */
export function restoreHistoryItem(item: DailyGoal, index: number): DailyGoal[] {
  const rest = getGoalHistory().filter((existing) => existing.id !== item.id);
  const position = Math.min(Math.max(index, 0), rest.length);
  const restored = [...rest.slice(0, position), item, ...rest.slice(position)];
  saveGoalHistory(restored);
  return restored;
}

/** Prosi przeglądarkę o trwałą pamięć, żeby nie czyściła danych celu przy braku miejsca. */
export async function requestPersistentStorage(): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.storage?.persist) return false;
  try {
    if (await navigator.storage.persisted()) return true;
    return await navigator.storage.persist();
  } catch (error) {
    console.warn('Nie udało się włączyć trwałej pamięci:', error);
    return false;
  }
}
