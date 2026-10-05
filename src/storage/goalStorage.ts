import { DailyGoal } from '../types';

const STORAGE_KEY_CURRENT = 'jeden_cel_current_goal_v1';
const STORAGE_KEY_HISTORY = 'jeden_cel_history_v1';

export function getCurrentGoal(): DailyGoal | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY_CURRENT);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Błąd podczas odczytu aktualnego celu z localStorage:', error);
    return null;
  }
}

export function saveCurrentGoal(goal: DailyGoal | null): void {
  try {
    if (goal === null) {
      localStorage.removeItem(STORAGE_KEY_CURRENT);
    } else {
      localStorage.setItem(STORAGE_KEY_CURRENT, JSON.stringify(goal));
    }
  } catch (error) {
    console.error('Błąd podczas zapisu aktualnego celu w localStorage:', error);
  }
}

export function getGoalHistory(): DailyGoal[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY_HISTORY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Błąd podczas odczytu historii celów z localStorage:', error);
    return [];
  }
}

export function saveGoalHistory(history: DailyGoal[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));
  } catch (error) {
    console.error('Błąd podczas zapisu historii celów w localStorage:', error);
  }
}

export function archiveCurrentGoal(goal: DailyGoal): DailyGoal[] {
  const currentHistory = getGoalHistory();
  const updatedGoal: DailyGoal = {
    ...goal,
    status: 'completed',
    completedAt: new Date().toISOString(),
  };

  // Dodajemy na początek listy historii
  const newHistory = [updatedGoal, ...currentHistory.filter(item => item.id !== updatedGoal.id)];
  saveGoalHistory(newHistory);
  saveCurrentGoal(null);
  return newHistory;
}

export function deleteHistoryItem(id: string): DailyGoal[] {
  const currentHistory = getGoalHistory();
  const filtered = currentHistory.filter(item => item.id !== id);
  saveGoalHistory(filtered);
  return filtered;
}
