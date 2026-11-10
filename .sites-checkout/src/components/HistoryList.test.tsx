import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { HistoryList } from './HistoryList';
import { makeGoal, makeStep } from '../test/factories';
import { DailyGoal } from '../types';

function setup(history: DailyGoal[]) {
  const onDeleteHistoryItem = vi.fn();
  const user = userEvent.setup();
  render(<HistoryList history={history} onDeleteHistoryItem={onDeleteHistoryItem} />);
  return { user, onDeleteHistoryItem };
}

describe('HistoryList', () => {
  it('pusta historia pokazuje komunikat zachęcający', () => {
    setup([]);
    expect(screen.getByText('Brak historii poprzednich dni')).toBeInTheDocument();
  });

  it('pokazuje licznik, tytuły, daty i procent wykonania', () => {
    setup([
      makeGoal({
        id: 'a',
        title: 'Cel A',
        date: '2026-11-10',
        steps: [makeStep({ id: '1', completed: true }), makeStep({ id: '2', completed: false })],
      }),
      makeGoal({ id: 'b', title: 'Cel B', date: '2026-11-09', steps: [makeStep({ completed: true })] }),
    ]);
    expect(screen.getByText('Historia poprzednich dni (2)')).toBeInTheDocument();
    expect(screen.getByText('Cel A')).toBeInTheDocument();
    expect(screen.getByText('10 lis 2026')).toBeInTheDocument();
    expect(screen.getByText('50% wykonane')).toBeInTheDocument();
    expect(screen.getByText('100% wykonane')).toBeInTheDocument();
  });

  it('wpis ze złą datą pokazuje oryginalny tekst zamiast się wywracać', () => {
    setup([makeGoal({ date: 'kiedyś' })]);
    expect(screen.getByText('kiedyś')).toBeInTheDocument();
  });

  it('rozwija i zwija listę kroków', async () => {
    const { user } = setup([
      makeGoal({
        title: 'Cel A',
        steps: [makeStep({ id: '1', text: 'Szczegółowy krok', completed: true })],
      }),
    ]);
    const toggle = screen.getByRole('button', { name: /Cel A/, expanded: false });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('Szczegółowy krok')).not.toBeInTheDocument();

    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Szczegółowy krok')).toBeInTheDocument();
    expect(screen.getByText('Zrealizowane kroki (1/1)')).toBeInTheDocument();

    await user.click(toggle);
    expect(screen.queryByText('Szczegółowy krok')).not.toBeInTheDocument();
  });

  it('rozwinięcie jednego wpisu nie rozwija pozostałych', async () => {
    const { user } = setup([
      makeGoal({ id: 'a', title: 'Cel A', steps: [makeStep({ id: '1', text: 'Krok A' })] }),
      makeGoal({ id: 'b', title: 'Cel B', steps: [makeStep({ id: '2', text: 'Krok B' })] }),
    ]);
    await user.click(screen.getByRole('button', { name: /Cel A/, expanded: false }));
    expect(screen.getByText('Krok A')).toBeInTheDocument();
    expect(screen.queryByText('Krok B')).not.toBeInTheDocument();
  });

  it('usuwa wpis o właściwym id, nie rozwijając go', async () => {
    const { user, onDeleteHistoryItem } = setup([
      makeGoal({ id: 'a', title: 'Cel A' }),
      makeGoal({ id: 'b', title: 'Cel B' }),
    ]);
    await user.click(screen.getByRole('button', { name: 'Usuń wpis z historii: Cel B' }));
    expect(onDeleteHistoryItem).toHaveBeenCalledWith('b');
    expect(onDeleteHistoryItem).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: /Cel B/, expanded: false })).toHaveAttribute('aria-expanded', 'false');
  });

  it('tekst z HTML w tytule jest wyświetlany jako zwykły tekst', () => {
    setup([makeGoal({ title: '<script>alert(1)</script>' })]);
    expect(screen.getByText('<script>alert(1)</script>')).toBeInTheDocument();
    expect(document.querySelector('script')).toBeNull();
  });
});
