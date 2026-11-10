import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { GoalForm } from './GoalForm';
import { MAX_STEPS } from '../constants';
import { makeGoal, makeStep } from '../test/factories';
import { DailyGoal } from '../types';

function setup(initialGoal?: DailyGoal | null) {
  const onSaveGoal = vi.fn();
  const onCancel = vi.fn();
  const user = userEvent.setup();
  render(<GoalForm onSaveGoal={onSaveGoal} onCancel={onCancel} initialGoal={initialGoal} />);
  return { user, onSaveGoal, onCancel };
}

const titleInput = () => screen.getByLabelText('Cel dnia');
const stepInputs = () => screen.getAllByPlaceholderText(/^Krok \d+\.\.\.$/);
const addStepButton = () => screen.getByRole('button', { name: 'Dodaj krok' });
async function addSteps(user: ReturnType<typeof userEvent.setup>, n: number) {
  for (let i = 0; i < n; i++) await user.click(addStepButton());
}
const submitButton = () => screen.getByRole('button', { name: /Startuj dzisiejszy cel|Zapisz zmiany/ });

describe('GoalForm — nowy cel', () => {
  it('startuje z pustym tytułem i bez kroków (kroki są opcjonalne)', () => {
    setup();
    expect(titleInput()).toHaveValue('');
    expect(screen.queryAllByPlaceholderText(/^Krok \d+\.\.\.$/)).toHaveLength(0);
  });

  it('zapisuje sam cel bez kroków', async () => {
    const { user, onSaveGoal } = setup();
    await user.type(titleInput(), 'Tylko cel');
    await user.click(submitButton());
    expect(onSaveGoal).toHaveBeenCalledTimes(1);
    const saved: DailyGoal = onSaveGoal.mock.calls[0][0];
    expect(saved.title).toBe('Tylko cel');
    expect(saved.steps).toEqual([]);
  });

  it('nie pokazuje przycisku Anuluj przy tworzeniu nowego celu', () => {
    setup();
    expect(screen.queryByRole('button', { name: 'Anuluj' })).not.toBeInTheDocument();
  });

  it('pusty tytuł pokazuje błąd i nie zapisuje', async () => {
    const { user, onSaveGoal } = setup();
    await addSteps(user, 1);
    await user.type(stepInputs()[0], 'Coś do zrobienia');
    await user.click(submitButton());
    expect(screen.getByText('Wprowadź cel na dzisiejszy dzień.')).toBeInTheDocument();
    expect(onSaveGoal).not.toHaveBeenCalled();
  });

  it('tytuł z samych spacji jest traktowany jak pusty', async () => {
    const { user, onSaveGoal } = setup();
    await user.type(titleInput(), '    ');
    await addSteps(user, 1);
    await user.type(stepInputs()[0], 'Krok');
    await user.click(submitButton());
    expect(screen.getByText('Wprowadź cel na dzisiejszy dzień.')).toBeInTheDocument();
    expect(onSaveGoal).not.toHaveBeenCalled();
  });

  it('puste pola kroków są pomijane przy zapisie (cel zapisuje się bez kroków)', async () => {
    const { user, onSaveGoal } = setup();
    await user.type(titleInput(), 'Mój cel');
    await addSteps(user, 2);
    await user.type(stepInputs()[1], '   ');
    await user.click(submitButton());
    expect(onSaveGoal.mock.calls[0][0].steps).toEqual([]);
  });

  it('błąd znika, gdy użytkownik zaczyna pisać tytuł', async () => {
    const { user } = setup();
    await user.click(submitButton());
    expect(screen.getByText('Wprowadź cel na dzisiejszy dzień.')).toBeInTheDocument();
    await user.type(titleInput(), 'A');
    expect(screen.queryByText('Wprowadź cel na dzisiejszy dzień.')).not.toBeInTheDocument();
  });

  it('zapisuje cel: przycina spacje i pomija puste kroki', async () => {
    const { user, onSaveGoal } = setup();
    await addSteps(user, 3);
    await user.type(titleInput(), '  Mój cel  ');
    await user.type(stepInputs()[0], '  Pierwszy  ');
    await user.type(stepInputs()[2], 'Trzeci');
    await user.click(submitButton());

    expect(onSaveGoal).toHaveBeenCalledTimes(1);
    const saved: DailyGoal = onSaveGoal.mock.calls[0][0];
    expect(saved.title).toBe('Mój cel');
    expect(saved.steps.map((s) => s.text)).toEqual(['Pierwszy', 'Trzeci']);
    expect(saved.steps.every((s) => !s.completed)).toBe(true);
    expect(saved.status).toBe('active');
    expect(saved.id).toMatch(/^goal-/);
    expect(saved.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(Number.isNaN(Date.parse(saved.createdAt))).toBe(false);
  });

  it('zapis Enterem w polu tytułu działa jak kliknięcie przycisku', async () => {
    const { user, onSaveGoal } = setup();
    await user.type(titleInput(), 'Cel{Enter}');
    expect(onSaveGoal).toHaveBeenCalledTimes(1);
  });

  it('kroki mają unikalne id', async () => {
    const { user, onSaveGoal } = setup();
    await user.type(titleInput(), 'Cel');
    await addSteps(user, 4);
    for (const input of stepInputs()) await user.type(input, 'x');
    await user.click(submitButton());
    const ids = (onSaveGoal.mock.calls[0][0] as DailyGoal).steps.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('przyjmuje bardzo długi tekst, emoji i znaki HTML bez zmian', async () => {
    const { user, onSaveGoal } = setup();
    const longTitle = 'Ł'.repeat(500);
    await addSteps(user, 1);
    await user.click(titleInput());
    await user.paste(longTitle);
    await user.click(stepInputs()[0]);
    await user.paste('<b>krok</b> 🚀');
    await user.click(submitButton());
    const saved: DailyGoal = onSaveGoal.mock.calls[0][0];
    expect(saved.title).toBe(longTitle);
    expect(saved.steps[0].text).toBe('<b>krok</b> 🚀');
  });
});

describe('GoalForm — kroki', () => {
  it('dodaje i usuwa kroki, aktualizując licznik', async () => {
    const { user } = setup();
    await addSteps(user, 4);
    expect(stepInputs()).toHaveLength(4);
    expect(screen.getByText(`4/${MAX_STEPS}`)).toBeInTheDocument();

    await user.click(screen.getAllByTitle('Usuń krok')[0]);
    expect(stepInputs()).toHaveLength(3);
  });

  it('blokuje dodawanie powyżej limitu kroków', async () => {
    const { user } = setup();
    const addButton = addStepButton();
    for (let i = 0; i < MAX_STEPS; i++) await user.click(addButton);
    expect(stepInputs()).toHaveLength(MAX_STEPS);
    expect(addButton).toBeDisabled();
  });

  it('pozwala usunąć wszystkie kroki', async () => {
    const { user } = setup();
    await addSteps(user, 3);
    let removeButtons = screen.getAllByTitle('Usuń krok');
    while (removeButtons.length > 0) {
      await user.click(removeButtons[0]);
      removeButtons = screen.queryAllByTitle('Usuń krok');
    }
    expect(screen.queryAllByPlaceholderText(/^Krok \d+\.\.\.$/)).toHaveLength(0);
  });

  it('usunięcie kroku zachowuje teksty pozostałych', async () => {
    const { user } = setup();
    await addSteps(user, 3);
    await user.type(stepInputs()[0], 'A');
    await user.type(stepInputs()[1], 'B');
    await user.type(stepInputs()[2], 'C');
    await user.click(screen.getAllByTitle('Usuń krok')[1]);
    expect(stepInputs().map((i) => (i as HTMLInputElement).value)).toEqual(['A', 'C']);
  });
});

describe('GoalForm — edycja istniejącego celu', () => {
  const existing = makeGoal({
    id: 'goal-stary',
    date: '2026-01-02',
    createdAt: '2026-01-02T07:00:00.000Z',
    title: 'Stary tytuł',
    steps: [
      makeStep({ id: 's1', text: 'Zrobiony', completed: true }),
      makeStep({ id: 's2', text: 'Niezrobiony', completed: false }),
    ],
  });

  it('wypełnia formularz danymi celu i zmienia teksty przycisków', () => {
    setup(existing);
    expect(titleInput()).toHaveValue('Stary tytuł');
    expect(stepInputs().map((i) => (i as HTMLInputElement).value)).toEqual(['Zrobiony', 'Niezrobiony']);
    expect(screen.getByRole('button', { name: 'Zapisz zmiany' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Anuluj' })).toBeInTheDocument();
  });

  it('zachowuje id, datę, createdAt i postęp kroków', async () => {
    const { user, onSaveGoal } = setup(existing);
    await user.clear(titleInput());
    await user.type(titleInput(), 'Nowy tytuł');
    await user.click(submitButton());

    const saved: DailyGoal = onSaveGoal.mock.calls[0][0];
    expect(saved.id).toBe('goal-stary');
    expect(saved.date).toBe('2026-01-02');
    expect(saved.createdAt).toBe('2026-01-02T07:00:00.000Z');
    expect(saved.title).toBe('Nowy tytuł');
    expect(saved.steps).toEqual([
      { id: 's1', text: 'Zrobiony', completed: true },
      { id: 's2', text: 'Niezrobiony', completed: false },
    ]);
  });

  it('Anuluj wywołuje onCancel i nic nie zapisuje', async () => {
    const { user, onCancel, onSaveGoal } = setup(existing);
    await user.type(titleInput(), ' zmiana');
    await user.click(screen.getByRole('button', { name: 'Anuluj' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onSaveGoal).not.toHaveBeenCalled();
  });

  it('edycja celu bez kroków nie dodaje pustych pól', () => {
    setup(makeGoal({ steps: [] }));
    expect(screen.queryAllByPlaceholderText(/^Krok \d+\.\.\.$/)).toHaveLength(0);
  });

  it('formularz ma dostępne pole tytułu przez etykietę', () => {
    setup();
    const form = titleInput().closest('form') as HTMLElement;
    expect(within(form).getByLabelText('Cel dnia')).toBeInTheDocument();
  });
});
