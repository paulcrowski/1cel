export type GoalStatus = 'draft' | 'active' | 'completed';

export interface Step {
  id: string;
  text: string;
  completed: boolean;
}

export interface DailyGoal {
  id: string;
  date: string; // Format: YYYY-MM-DD
  title: string;
  steps: Step[];
  status: GoalStatus;
  createdAt: string;
  completedAt?: string;
}
