import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { GoalCard } from './GoalCard';
import { MAX_STEPS } from '../constants';
import { makeGoal, makeStep } from '../test/factories';
import { DailyGoal } from '../types';

function setup(goal: DailyGoal = makeGoal()) {
  const handlers = {
    onUpdateGoal: vi.fn(),
    onCompleteGoal: vi.fn(),
    onEditGoal: vi.fn(),
    onResetGoal: vi.fn(),
  };
  const user = userEvent.setup();
  render(<GoalCard goal={goal} {...handlers} />);
  return { user, ...handlers };
}

const lastUpdate = (fn: ReturnType<typeof vi.fn>): DailyGoal => fn.mock.calls.at(-1)![0];

describe('GoalCard — widok', () => {
  it('pokazuje tytuł, kroki i postęp', () => {
    setup(
      makeGoal({
        title: 'Napisać raport',
        steps: [
          makeStep({ id: 'a', text: 'Szkic', completed: true }),
          makeStep({ id: 'b', text: 'Poprawki', completed: false }),
        ],
      }),
    );
    expect(screen.getByRole('heading', { name: 'Napisać raport' })).toBeInTheDocument();
    expect(screen.getByText('Szkic')).toBeInTheDocument();
    expect(screen.getByText('Poprawki')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.getByText('Kroki: 1 z 2')).toBeInTheDocument();
  });

  it('gdy wszystkie kroki są wykonane, pokazuje odznakę i 100%', () => {
    setup(makeGoal({ steps: [makeStep({ completed: true })] }));
    expect(screen.getByText('Wszystkie kroki wykonane!')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('tekst z HTML jest wyświetlany jako zwykły tekst', () => {
    const payload = '<img src=x onerror="alert(1)">';
    setup(makeGoal({ title: payload, steps: [makeStep({ text: payload })] }));
    expect(screen.getByRole('heading', { name: payload })).toBeInTheDocument();
    expect(document.querySelector('img')).toBeNull();
  });

  it('przycisk kroku ma opisową nazwę i stan aria-pressed', () => {
    setup(
      makeGoal({
        steps: [
          makeStep({ id: 'a', text: 'Zrobiony', completed: true }),
          makeStep({ id: 'b', text: 'Do zrobienia', completed: false }),
        ],
      }),
    );
    expect(screen.getByRole('button', { name: 'Cofnij wykonanie: Zrobiony' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Oznacz jako wykonany: Do zrobienia' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });
});

describe('GoalCard — kroki', () => {
  it('kliknięcie w krok przełącza jego wykonanie', async () => {
    const { user, onUpdateGoal } = setup();
    await user.click(screen.getByText('Pierwszy'));
    expect(onUpdateGoal).toHaveBeenCalledTimes(1);
    const updated = lastUpdate(onUpdateGoal);
    expect(updated.steps.map((s) => s.completed)).toEqual([true, false]);
  });

  it('kliknięcie w przycisk kroku też przełącza go tylko raz', async () => {
    const { user, onUpdateGoal } = setup();
    await user.click(screen.getByRole('button', { name: 'Oznacz jako wykonany: Drugi' }));
    expect(onUpdateGoal).toHaveBeenCalledTimes(1);
    expect(lastUpdate(onUpdateGoal).steps.map((s) => s.completed)).toEqual([false, true]);
  });

  it('można cofnąć wykonanie kroku', async () => {
    const { user, onUpdateGoal } = setup(
      makeGoal({
        steps: [makeStep({ id: 'a', text: 'Zrobiony', completed: true }), makeStep({ id: 'b', text: 'Drugi' })],
      }),
    );
    await user.click(screen.getByRole('button', { name: 'Cofnij wykonanie: Zrobiony' }));
    expect(lastUpdate(onUpdateGoal).steps[0].completed).toBe(false);
  });

  it('nie zmienia obiektu celu przekazanego z zewnątrz', async () => {
    const goal = makeGoal();
    const { user } = setup(goal);
    await user.click(screen.getByText('Pierwszy'));
    expect(goal.steps[0].completed).toBe(false);
  });

  it('usuwa krok bez przełączania pozostałych', async () => {
    const { user, onUpdateGoal } = setup();
    await user.click(screen.getByRole('button', { name: 'Usuń krok: Pierwszy' }));
    expect(onUpdateGoal).toHaveBeenCalledTimes(1);
    expect(lastUpdate(onUpdateGoal).steps.map((s) => s.id)).toEqual(['step-2']);
  });

  it('pozwala usunąć ostatni krok — cel zostaje bez kroków', async () => {
    const { user, onUpdateGoal } = setup(makeGoal({ steps: [makeStep({ text: 'Jedyny' })] }));
    await user.click(screen.getByRole('button', { name: /Usuń krok: Jedyny/ }));
    expect(onUpdateGoal.mock.calls[0][0].steps).toEqual([]);
  });

  it('cel bez kroków nie pokazuje postępu, ale pozwala dodać krok i zamknąć dzień', () => {
    setup(makeGoal({ steps: [] }));
    expect(screen.queryByText('Postęp realizacji')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Dodaj krok' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Zrobione/ })).toBeInTheDocument();
  });
});

describe('GoalCard — dodawanie kroku', () => {
  it('dodaje nowy, niewykonany krok z przyciętym tekstem', async () => {
    const { user, onUpdateGoal } = setup();
    await user.click(screen.getByRole('button', { name: 'Dodaj krok' }));
    await user.type(screen.getByPlaceholderText('Wpisz kolejny mały krok...'), '  Nowy krok  ');
    await user.click(screen.getByRole('button', { name: 'Dodaj' }));

    const updated = lastUpdate(onUpdateGoal);
    expect(updated.steps).toHaveLength(3);
    expect(updated.steps[2]).toMatchObject({ text: 'Nowy krok', completed: false });
    expect(updated.steps[2].id).toMatch(/^step-/);
    expect(screen.queryByPlaceholderText('Wpisz kolejny mały krok...')).not.toBeInTheDocument();
  });

  it('puste i same-spacje kroki są ignorowane', async () => {
    const { user, onUpdateGoal } = setup();
    await user.click(screen.getByRole('button', { name: 'Dodaj krok' }));
    await user.type(screen.getByPlaceholderText('Wpisz kolejny mały krok...'), '   {Enter}');
    expect(onUpdateGoal).not.toHaveBeenCalled();
  });

  it('Anuluj zamyka pole i czyści wpisany tekst', async () => {
    const { user, onUpdateGoal } = setup();
    await user.click(screen.getByRole('button', { name: 'Dodaj krok' }));
    await user.type(screen.getByPlaceholderText('Wpisz kolejny mały krok...'), 'coś');
    await user.click(screen.getByRole('button', { name: 'Anuluj' }));
    expect(onUpdateGoal).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Dodaj krok' }));
    expect(screen.getByPlaceholderText('Wpisz kolejny mały krok...')).toHaveValue('');
  });

  it('chowa przycisk „Dodaj krok” po osiągnięciu limitu kroków', () => {
    const steps = Array.from({ length: MAX_STEPS }, (_, i) => makeStep({ id: `s${i}`, text: `Krok ${i}` }));
    setup(makeGoal({ steps }));
    expect(screen.queryByRole('button', { name: 'Dodaj krok' })).not.toBeInTheDocument();
  });
});

describe('GoalCard — akcje', () => {
  it('„Zrobione” przekazuje aktualny cel do onCompleteGoal', async () => {
    const goal = makeGoal();
    const { user, onCompleteGoal } = setup(goal);
    await user.click(screen.getByRole('button', { name: /Zrobione/ }));
    expect(onCompleteGoal).toHaveBeenCalledWith(goal);
  });

  it('można zamknąć dzień także przy niewykonanych krokach', async () => {
    const { user, onCompleteGoal } = setup(makeGoal({ steps: [makeStep({ completed: false })] }));
    await user.click(screen.getByRole('button', { name: /Zrobione/ }));
    expect(onCompleteGoal).toHaveBeenCalledTimes(1);
  });

  it('„Edytuj cel” i „Nowy cel” wywołują odpowiednie akcje', async () => {
    const { user, onEditGoal, onResetGoal } = setup();
    await user.click(screen.getByRole('button', { name: /Edytuj cel/ }));
    await user.click(screen.getByRole('button', { name: 'Nowy cel' }));
    expect(onEditGoal).toHaveBeenCalledTimes(1);
    // Obecne zachowanie: reset bez potwierdzenia.
    expect(onResetGoal).toHaveBeenCalledTimes(1);
  });
});

describe('GoalCard — edycja kroku', () => {
  const editButton = (text: string) => screen.getByRole('button', { name: `Edytuj krok: ${text}` });

  it('Enter zapisuje przycięty tekst, nie zmieniając wykonania ani innych kroków', async () => {
    const { user, onUpdateGoal } = setup();
    await user.click(editButton('Pierwszy'));
    const input = screen.getByLabelText('Edytuj tekst kroku 1');
    await user.clear(input);
    await user.type(input, '  Poprawiony  {Enter}');

    expect(onUpdateGoal).toHaveBeenCalledTimes(1);
    expect(lastUpdate(onUpdateGoal).steps).toEqual([
      { id: 'step-1', text: 'Poprawiony', completed: false },
      { id: 'step-2', text: 'Drugi', completed: false },
    ]);
    expect(screen.queryByLabelText('Edytuj tekst kroku 1')).not.toBeInTheDocument();
  });

  it('klikanie w pole edycji nie przełącza wykonania kroku', async () => {
    const { user, onUpdateGoal } = setup();
    await user.click(editButton('Pierwszy'));
    await user.click(screen.getByLabelText('Edytuj tekst kroku 1'));
    expect(onUpdateGoal).not.toHaveBeenCalled();
  });

  it('Escape anuluje bez zapisu', async () => {
    const { user, onUpdateGoal } = setup();
    await user.click(editButton('Pierwszy'));
    await user.type(screen.getByLabelText('Edytuj tekst kroku 1'), ' zmiana{Escape}');
    expect(onUpdateGoal).not.toHaveBeenCalled();
    expect(screen.getByText('Pierwszy')).toBeInTheDocument();
  });

  it('pusty tekst nie zapisuje się i zachowuje stary krok', async () => {
    const { user, onUpdateGoal } = setup();
    await user.click(editButton('Pierwszy'));
    await user.clear(screen.getByLabelText('Edytuj tekst kroku 1'));
    await user.keyboard('{Enter}');
    expect(onUpdateGoal).not.toHaveBeenCalled();
    expect(screen.getByText('Pierwszy')).toBeInTheDocument();
  });

  it('utrata fokusu zapisuje zmianę (tylko raz)', async () => {
    const { user, onUpdateGoal } = setup();
    await user.click(editButton('Pierwszy'));
    await user.type(screen.getByLabelText('Edytuj tekst kroku 1'), '!');
    await user.click(document.body);
    expect(onUpdateGoal).toHaveBeenCalledTimes(1);
    expect(lastUpdate(onUpdateGoal).steps[0].text).toBe('Pierwszy!');
  });
});

describe('GoalCard — cel z poprzedniego dnia', () => {
  it('pokazuje baner i pozwala przenieść cel na dziś', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-11-12T12:00:00'));
    const { user, onUpdateGoal } = setup(makeGoal({ date: '2026-11-10' }));
    expect(screen.getByText('Ten cel jest z dnia 10 lis 2026.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Przenieś na dziś' }));
    expect(lastUpdate(onUpdateGoal).date).toBe('2026-11-12');
  });

  it('dla dzisiejszego celu baner się nie pokazuje', () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-11-10T12:00:00'));
    setup(makeGoal({ date: '2026-11-10' }));
    expect(screen.queryByRole('button', { name: 'Przenieś na dziś' })).not.toBeInTheDocument();
  });
});
