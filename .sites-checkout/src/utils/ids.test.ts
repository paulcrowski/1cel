import { afterEach, describe, expect, it, vi } from 'vitest';
import { createId } from './ids';

describe('createId', () => {
  afterEach(() => vi.useRealTimers());

  it('składa prefiks i znacznik czasu', () => {
    vi.useFakeTimers();
    vi.setSystemTime(1000);
    expect(createId('goal')).toBe('goal-1000');
  });

  it('dodaje sufiks, także zerowy', () => {
    vi.useFakeTimers();
    vi.setSystemTime(1000);
    expect(createId('step', 2)).toBe('step-1000-2');
    expect(createId('step', 0)).toBe('step-1000-0');
    expect(createId('step', 'a')).toBe('step-1000-a');
  });

  it('kroki tworzone w tej samej milisekundzie są rozróżnione sufiksem', () => {
    vi.useFakeTimers();
    vi.setSystemTime(1000);
    const ids = new Set([0, 1, 2].map((i) => createId('step', i)));
    expect(ids.size).toBe(3);
  });

  it('bez sufiksu dwa wywołania w tej samej milisekundzie dają to samo id (znane ograniczenie)', () => {
    vi.useFakeTimers();
    vi.setSystemTime(1000);
    expect(createId('step')).toBe(createId('step'));
  });
});
