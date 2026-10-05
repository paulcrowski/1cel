import React, { useState } from 'react';
import { Plus, Trash2, ArrowRight, Lightbulb } from 'lucide-react';
import { DailyGoal, Step } from '../types';

interface GoalFormProps {
  onSaveGoal: (goal: DailyGoal) => void;
  initialGoal?: DailyGoal | null;
}

export const GoalForm: React.FC<GoalFormProps> = ({ onSaveGoal, initialGoal }) => {
  const [title, setTitle] = useState(initialGoal?.title || '');
  const [steps, setSteps] = useState<string[]>(
    initialGoal?.steps?.length
      ? initialGoal.steps.map(s => s.text)
      : ['', '', '']
  );
  const [error, setError] = useState<string | null>(null);

  const handleStepChange = (index: number, value: string) => {
    const updated = [...steps];
    updated[index] = value;
    setSteps(updated);
  };

  const handleAddStepInput = () => {
    if (steps.length >= 10) return;
    setSteps([...steps, '']);
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

    const validStepTexts = steps.map(s => s.trim()).filter(s => s.length > 0);
    if (validStepTexts.length === 0) {
      setError('Dodaj przynajmniej jeden konkretny krok.');
      return;
    }

    setError(null);

    const formattedSteps: Step[] = validStepTexts.map((text, idx) => ({
      id: `step-${Date.now()}-${idx}`,
      text,
      completed: false,
    }));

    const todayStr = new Date().toISOString().split('T')[0];

    const newGoal: DailyGoal = {
      id: initialGoal?.id || `goal-${Date.now()}`,
      date: initialGoal?.date || todayStr,
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
              {steps.length}/10
            </span>
          </div>

          <div className="space-y-2.5">
            {steps.map((stepText, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-stone-400 w-5 text-right select-none">
                  {idx + 1}.
                </span>
                <input
                  type="text"
                  value={stepText}
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
            disabled={steps.length >= 10}
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
            <span>Startuj dzisiejszy cel</span>
            <ArrowRight className="w-4 h-4" />
          </button>
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
