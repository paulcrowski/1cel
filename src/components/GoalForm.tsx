import React, { useRef, useState } from 'react';
import { Plus, Trash2, ArrowRight } from 'lucide-react';
import { DailyGoal, Step } from '../types';
import { MAX_STEPS } from '../constants';
import { createId } from '../utils/ids';
import { getTodayIso } from '../utils/date';

interface GoalFormProps {
  onSaveGoal: (goal: DailyGoal) => void;
  onCancel: () => void;
  initialGoal?: DailyGoal | null;
}

const newEmptyStep = (index: number): Step => ({
  id: createId('step', index),
  text: '',
  completed: false,
});

export const GoalForm: React.FC<GoalFormProps> = ({ onSaveGoal, onCancel, initialGoal }) => {
  const isEditing = !!initialGoal;
  const [title, setTitle] = useState(initialGoal?.title || '');
  // Kroki trzymamy z ich id i stanem ukończenia, żeby edycja nie zerowała postępu.
  // Kroki są opcjonalne: nowy cel startuje bez nich, użytkownik dodaje je w razie potrzeby.
  const [steps, setSteps] = useState<Step[]>(() => initialGoal?.steps ?? []);
  const nextStepIndex = useRef(steps.length);
  const [error, setError] = useState<string | null>(null);

  const handleStepChange = (index: number, value: string) => {
    setSteps(steps.map((step, i) => (i === index ? { ...step, text: value } : step)));
  };

  const handleAddStepInput = () => {
    if (steps.length >= MAX_STEPS) return;
    setSteps([...steps, newEmptyStep(nextStepIndex.current++)]);
  };

  const handleRemoveStepInput = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Wprowadź cel na dzisiejszy dzień.');
      return;
    }

    const formattedSteps: Step[] = steps
      .map(step => ({ ...step, text: step.text.trim() }))
      .filter(step => step.text.length > 0);
    setError(null);

    const newGoal: DailyGoal = {
      id: initialGoal?.id || createId('goal'),
      date: initialGoal?.date || getTodayIso(),
      title: title.trim(),
      steps: formattedSteps,
      status: 'active',
      createdAt: initialGoal?.createdAt || new Date().toISOString(),
    };

    onSaveGoal(newGoal);
  };

  return (
    <section className="w-full">
      <h2 className="font-display text-[2rem] sm:text-4xl font-bold leading-[1.05] tracking-tight">
        Wyznacz dzisiejszy cel
      </h2>
      <p className="text-muted mt-2">
        Wybierz jedną najpotrzebniejszą rzecz, na której skupisz całą uwagę.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-8">
        <div>
          <label htmlFor="goal-title" className="block text-sm font-semibold mb-2">
            Cel dnia
          </label>
          <input
            id="goal-title"
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (error) setError(null);
            }}
            placeholder="np. Napisać pierwszą wersję raportu kwartalnego"
            className="w-full px-4 py-4 rounded-2xl border border-line text-lg font-medium"
            autoFocus
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold">Kroki do celu (opcjonalne)</span>
            {steps.length > 0 && (
              <span className="text-sm text-muted font-display font-semibold">
                {steps.length}/{MAX_STEPS}
              </span>
            )}
          </div>

          <div className="space-y-2.5">
            {steps.map((step, idx) => (
              <div key={step.id} className="flex items-center gap-2">
                <input
                  type="text"
                  value={step.text}
                  onChange={(e) => handleStepChange(idx, e.target.value)}
                  placeholder={`Krok ${idx + 1}...`}
                  aria-label={`Krok ${idx + 1}`}
                  className="flex-1 min-w-0 px-4 py-3 text-base rounded-xl border border-line"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveStepInput(idx)}
                  title="Usuń krok"
                  className="p-3 text-faint hover:text-danger rounded-xl transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAddStepInput}
            disabled={steps.length >= MAX_STEPS}
            className="mt-2 inline-flex items-center gap-2 py-2.5 text-accent font-semibold text-[0.9375rem] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Dodaj krok</span>
          </button>
          {steps.length === 0 && (
            <p className="text-sm text-muted">
              Możesz zostawić sam cel — kroki dodasz, jeśli będą potrzebne.
            </p>
          )}
          {steps.length > 0 && (
            <p className="text-sm text-muted">
              Wskazówka: jeden krok to nie więcej niż 15–30 minut skupienia.
            </p>
          )}
        </div>

        {error && (
          <div role="alert" className="px-4 py-3 text-sm font-medium bg-danger-soft text-danger rounded-xl">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-ink text-paper font-semibold text-base cursor-pointer"
          >
            <span>{isEditing ? 'Zapisz zmiany' : 'Startuj dzisiejszy cel'}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
          {isEditing && (
            <button
              type="button"
              onClick={onCancel}
              className="w-full py-3 text-sm font-medium text-muted hover:text-ink transition-colors cursor-pointer"
            >
              Anuluj
            </button>
          )}
        </div>
      </form>
    </section>
  );
};
