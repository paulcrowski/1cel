import { useCallback, useState } from 'react';
import { DailyGoal } from '../types';
import { GoalProgress, getGoalProgress } from '../utils/goalProgress';
import {
  archiveCurrentGoal,
  deleteHistoryItem,
  getCurrentGoal,
  getGoalHistory,
  restoreHistoryItem,
  saveCurrentGoal,
} from '../storage/goalStorage';

/** Ostatnia usunięta rzecz, którą można jeszcze przywrócić. */
type UndoEntry =
  | { kind: 'goal'; goal: DailyGoal }
  | { kind: 'history'; item: DailyGoal; index: number };

export interface UndoNotice {
  message: string;
}

/** Przepływ aplikacji: aktualny cel, historia i akcje na nich. Bez UI. */
export function useDailyGoal() {
  const [currentGoal, setCurrentGoal] = useState<DailyGoal | null>(getCurrentGoal);
  const [history, setHistory] = useState<DailyGoal[]>(getGoalHistory);
  const [isEditing, setIsEditing] = useState(false);
  // Postęp dopiero zamkniętego celu — używany do komunikatu po zamknięciu dnia.
  const [justCompleted, setJustCompleted] = useState<GoalProgress | null>(null);
  const [undoEntry, setUndoEntry] = useState<UndoEntry | null>(null);

  const updateGoal = (goal: DailyGoal) => {
    setCurrentGoal(goal);
    saveCurrentGoal(goal);
  };

  const saveGoal = (goal: DailyGoal) => {
    updateGoal(goal);
    setIsEditing(false);
    setJustCompleted(null);
    setUndoEntry(null);
  };

  const completeGoal = (goal: DailyGoal) => {
    setHistory(archiveCurrentGoal(goal));
    setCurrentGoal(null);
    setIsEditing(false);
    setJustCompleted(getGoalProgress(goal));
  };

  const resetGoal = () => {
    if (currentGoal) setUndoEntry({ kind: 'goal', goal: currentGoal });
    setCurrentGoal(null);
    saveCurrentGoal(null);
    setIsEditing(false);
    setJustCompleted(null);
  };

  const deleteFromHistory = (id: string) => {
    const index = history.findIndex((item) => item.id === id);
    if (index !== -1) setUndoEntry({ kind: 'history', item: history[index], index });
    setHistory(deleteHistoryItem(id));
  };

  const undo = () => {
    if (!undoEntry) return;
    if (undoEntry.kind === 'goal') {
      // Cel wraca tylko wtedy, gdy w międzyczasie nie zaczęto nowego.
      if (!currentGoal) updateGoal(undoEntry.goal);
    } else {
      setHistory(restoreHistoryItem(undoEntry.item, undoEntry.index));
    }
    setUndoEntry(null);
  };

  const dismissUndo = useCallback(() => setUndoEntry(null), []);

  const undoNotice: UndoNotice | null = undoEntry
    ? { message: undoEntry.kind === 'goal' ? 'Cel usunięty.' : 'Wpis usunięty z historii.' }
    : null;

  return {
    currentGoal,
    history,
    isEditing,
    justCompleted,
    undoNotice,
    startEditing: () => setIsEditing(true),
    cancelEditing: () => setIsEditing(false),
    dismissCompleted: () => setJustCompleted(null),
    saveGoal,
    updateGoal,
    completeGoal,
    resetGoal,
    deleteFromHistory,
    undo,
    dismissUndo,
  };
}
