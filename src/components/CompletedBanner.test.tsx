import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CompletedBanner } from './CompletedBanner';

describe('CompletedBanner', () => {
  it('gdy wszystkie kroki wykonane, gratuluje', () => {
    render(
      <CompletedBanner
        progress={{ completed: 3, total: 3, percent: 100, isAllDone: true, hasSteps: true }}
        onDismiss={() => {}}
      />,
    );
    expect(screen.getByText('Dzień zamknięty z sukcesem!')).toBeInTheDocument();
  });

  it('gdy nie wszystkie, pokazuje neutralny komunikat z liczbą kroków', () => {
    render(
      <CompletedBanner
        progress={{ completed: 1, total: 3, percent: 33, isAllDone: false, hasSteps: true }}
        onDismiss={() => {}}
      />,
    );
    expect(screen.getByText('Dzień zamknięty')).toBeInTheDocument();
    expect(screen.queryByText('Dzień zamknięty z sukcesem!')).not.toBeInTheDocument();
    expect(screen.getByText(/ukończonymi krokami: 1 z 3/)).toBeInTheDocument();
  });

  it('przycisk wywołuje onDismiss', async () => {
    const onDismiss = vi.fn();
    render(
      <CompletedBanner
        progress={{ completed: 1, total: 1, percent: 100, isAllDone: true, hasSteps: true }}
        onDismiss={onDismiss}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Wyznacz nowy cel' }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
