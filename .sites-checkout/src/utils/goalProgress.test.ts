import { describe, expect, it } from 'vitest';
import { getGoalProgress } from './goalProgress';
import { makeGoal, makeStep } from '../test/factories';

const stepsWith = (flags: boolean[]) =>
  flags.map((completed, i) => makeStep({ id: `s${i}`, completed }));

describe('getGoalProgress', () => {
  it('cel bez kroków ma 0% i nie jest ukończony (bez dzielenia przez zero)', () => {
    expect(getGoalProgress(makeGoal({ steps: [] }))).toEqual({
      completed: 0,
      total: 0,
      percent: 0,
      isAllDone: false,
    });
  });

  it('żaden krok nieukończony', () => {
    const progress = getGoalProgress(makeGoal({ steps: stepsWith([false, false]) }));
    expect(progress).toMatchObject({ completed: 0, total: 2, percent: 0, isAllDone: false });
  });

  it('część kroków ukończona', () => {
    const progress = getGoalProgress(makeGoal({ steps: stepsWith([true, false, false, false]) }));
    expect(progress).toMatchObject({ completed: 1, total: 4, percent: 25, isAllDone: false });
  });

  it('wszystkie kroki ukończone', () => {
    const progress = getGoalProgress(makeGoal({ steps: stepsWith([true, true, true]) }));
    expect(progress).toMatchObject({ completed: 3, total: 3, percent: 100, isAllDone: true });
  });

  it('jeden krok ukończony = 100%', () => {
    expect(getGoalProgress(makeGoal({ steps: stepsWith([true]) })).isAllDone).toBe(true);
  });

  it.each([
    [[true, false, false], 33],
    [[true, true, false], 67],
    [[true, false, false, false, false, false, false], 14],
  ])('zaokrągla procent (%j → %i%%)', (flags, expected) => {
    expect(getGoalProgress(makeGoal({ steps: stepsWith(flags) })).percent).toBe(expected);
  });
});
