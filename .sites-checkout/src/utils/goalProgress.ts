import { DailyGoal } from '../types';

export interface GoalProgress {
  completed: number;
  total: number;
  percent: number;
  isAllDone: boolean;
}

export function getGoalProgress(goal: DailyGoal): GoalProgress {
  const total = goal.steps.length;
  const completed = goal.steps.filter((step) => step.completed).length;
  return {
    completed,
    total,
    percent: total > 0 ? Math.round((completed / total) * 100) : 0,
    isAllDone: total > 0 && completed === total,
  };
}
