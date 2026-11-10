import React, { useRef, useState } from 'react';
import { Plus, Trash2, ArrowRight, Lightbulb } from 'lucide-react';
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
  const [steps, setSteps] = useState<Step[]>(() =>
    initialGoal?.steps?.length
      ? initialGoal.steps
      : [0, 1, 2].map(i => newEmptyStep(i))
  );
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
    if (steps.length <= 1) return;
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
    if (formattedSteps.length === 0) {
      setError('Dodaj przynajmniej jeden konkretny krok.');
      return;
    }

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
    <div className="w-full max-w-xl mx-auto bg-white rounded-2xl border border-stone-200/90 shadow-sm p-6 sm:p-8">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-stone-900 tracking-tight">
          Wyznacz dzisiejszy cel
        </h2>
        <p className="text-sm text-stone-500 mt-1">
          Wybierz jedną najpotrzebniejszą rzecz, na której skupisz całą uwagę.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="goal-title" className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-2">
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
            className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent text-stone-900 placeholder:text-stone-400 font-medium text-base transition-all"
            autoFocus
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600">
              Kroki do celu (zalecane 3–5 kroków)
            </label>
            <span className="text-xs text-stone-400 font-mono">
              {steps.length}/{MAX_STEPS}
            </span>
          </div>

          <div className="space-y-2.5">
            {steps.map((step, idx) => (
              <div key={step.id} className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-stone-400 w-5 text-right select-none">
                  {idx + 1}.
                </span>
                <input
                  type="text"
                  value={step.text}
                  onChange={(e) => handleStepChange(idx, e.target.value)}
                  placeholder={`Krok ${idx + 1}...`}
                  className="flex-1 px-3.5 py-2.5 text-sm rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-800 text-stone-800 placeholder:text-stone-400 transition-all"
                />
                {steps.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveStepInput(idx)}
                    title="Usuń krok"
                    className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAddStepInput}
            disabled={steps.length >= MAX_STEPS}
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Dodaj krok</span>
          </button>
        </div>

        {error && (
          <div className="p-3 text-xs font-medium bg-rose-50 border border-rose-200 text-rose-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-stone-900 text-white font-medium hover:bg-stone-800 transition-colors cursor-pointer shadow-sm text-sm"
          >
            <span>{isEditing ? 'Zapisz zmiany' : 'Startuj dzisiejszy cel'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          {isEditing && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3.5 rounded-xl border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-50 text-sm font-medium transition-colors cursor-pointer"
            >
              Anuluj
            </button>
          )}
        </div>

        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-stone-50 border border-stone-200/60 text-stone-500 text-xs">
          <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <span>
            Wskazówka: Dziel zadania tak, aby każdy krok wymagał nie więcej niż 15-30 minut skupienia.
          </span>
        </div>
      </form>
    </div>
  );
};
