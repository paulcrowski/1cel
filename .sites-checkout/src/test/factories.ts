import { DailyGoal, Step } from '../types';

export function makeStep(overrides: Partial<Step> = {}): Step {
  return { id: 'step-1', text: 'Krok testowy', completed: false, ...overrides };
}

export function makeGoal(overrides: Partial<DailyGoal> = {}): DailyGoal {
  return {
    id: 'goal-1',
    date: '2026-11-10',
    title: 'Cel testowy',
    steps: [makeStep({ id: 'step-1', text: 'Pierwszy' }), makeStep({ id: 'step-2', text: 'Drugi' })],
    status: 'active',
    createdAt: '2026-11-10T08:00:00.000Z',
    ...overrides,
  };
}
