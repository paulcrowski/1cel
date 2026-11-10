import { useState } from 'react';
import { DailyGoal } from '../types';
import { GoalProgress, getGoalProgress } from '../utils/goalProgress';
import {
  archiveCurrentGoal,
  deleteHistoryItem,
  getCurrentGoal,
  getGoalHistory,
  saveCurrentGoal,
} from '../storage/goalStorage';

/** Przepływ aplikacji: aktualny cel, historia i akcje na nich. Bez UI. */
export function useDailyGoal() {
  const [currentGoal, setCurrentGoal] = useState<DailyGoal | null>(getCurrentGoal);
  const [history, setHistory] = useState<DailyGoal[]>(getGoalHistory);
  const [isEditing, setIsEditing] = useState(false);
  // Postęp dopiero zamkniętego celu — używany do komunikatu po zamknięciu dnia.
  const [justCompleted, setJustCompleted] = useState<GoalProgress | null>(null);

  const updateGoal = (goal: DailyGoal) => {
    setCurrentGoal(goal);
    saveCurrentGoal(goal);
  };

  const saveGoal = (goal: DailyGoal) => {
    updateGoal(goal);
    setIsEditing(false);
    setJustCompleted(null);
  };

  const completeGoal = (goal: DailyGoal) => {
    setHistory(archiveCurrentGoal(goal));
    setCurrentGoal(null);
    setIsEditing(false);
    setJustCompleted(getGoalProgress(goal));
  };

  const resetGoal = () => {
    setCurrentGoal(null);
    saveCurrentGoal(null);
    setIsEditing(false);
    setJustCompleted(null);
  };

  const deleteFromHistory = (id: string) => {
    setHistory(deleteHistoryItem(id));
  };

  return {
    currentGoal,
    history,
    isEditing,
    justCompleted,
    startEditing: () => setIsEditing(true),
    cancelEditing: () => setIsEditing(false),
    dismissCompleted: () => setJustCompleted(null),
    saveGoal,
    updateGoal,
    completeGoal,
    resetGoal,
    deleteFromHistory,
  };
}
