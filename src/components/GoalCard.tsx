import React, { useRef, useState } from 'react';
import { CheckCircle2, Circle, Plus, Check, Trophy, Edit3, Trash2, Pencil } from 'lucide-react';
import { DailyGoal, Step } from '../types';
import { MAX_STEPS } from '../constants';
import { createId } from '../utils/ids';
import { formatShortDate, getTodayIso, isBeforeToday } from '../utils/date';
import { getGoalProgress } from '../utils/goalProgress';

interface GoalCardProps {
  goal: DailyGoal;
  onUpdateGoal: (updated: DailyGoal) => void;
  onCompleteGoal: (goal: DailyGoal) => void;
  onEditGoal: () => void;
  onResetGoal: () => void;
}

interface StepEdit {
  id: string;
  text: string;
}

const STEP_ACTION_CLASS =
  'p-1 text-stone-400 rounded transition-all md:opacity-0 md:group-hover:opacity-100 focus-visible:opacity-100';

export const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  onUpdateGoal,
  onCompleteGoal,
  onEditGoal,
  onResetGoal,
}) => {
  const [newStepText, setNewStepText] = useState('');
  const [isAddingStep, setIsAddingStep] = useState(false);
  // Ref chroni przed podwójnym zapisem (Enter + blur) przy zamykaniu pola edycji kroku.
  const editRef = useRef<StepEdit | null>(null);
  const [editing, setEditing] = useState<StepEdit | null>(null);

  const {
    completed: completedCount,
    total: totalCount,
    percent: progressPercent,
    isAllDone,
    hasSteps,
  } = getGoalProgress(goal);

  const isFromPastDay = isBeforeToday(goal.date);

  const setEdit = (value: StepEdit | null) => {
    editRef.current = value;
    setEditing(value);
  };

  const finishEdit = (save: boolean) => {
    const current = editRef.current;
    if (!current) return;
    setEdit(null);
    const text = current.text.trim();
    const step = goal.steps.find((s) => s.id === current.id);
    if (!save || !text || !step || step.text === text) return;
    onUpdateGoal({
      ...goal,
      steps: goal.steps.map((s) => (s.id === current.id ? { ...s, text } : s)),
    });
  };

  const handleToggleStep = (stepId: string) => {
    const updatedSteps = goal.steps.map((step) =>
      step.id === stepId ? { ...step, completed: !step.completed } : step
    );

    const updatedGoal: DailyGoal = {
      ...goal,
      steps: updatedSteps,
    };

    onUpdateGoal(updatedGoal);
  };

  const handleAddStepSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStepText.trim()) return;

    const newStep: Step = {
      id: createId('step'),
      text: newStepText.trim(),
      completed: false,
    };

    const updatedGoal: DailyGoal = {
      ...goal,
      steps: [...goal.steps, newStep],
    };

    onUpdateGoal(updatedGoal);
    setNewStepText('');
    setIsAddingStep(false);
  };

  const handleDeleteStep = (stepId: string) => {
    const updatedSteps = goal.steps.filter((s) => s.id !== stepId);
    onUpdateGoal({
      ...goal,
      steps: updatedSteps,
    });
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
      {isFromPastDay && (
        <div className="px-6 py-3 bg-amber-50 border-b border-amber-200 flex flex-wrap items-center justify-between gap-2 text-xs text-amber-900">
          <span>Ten cel jest z dnia {formatShortDate(goal.date)}.</span>
          <button
            type="button"
            onClick={() => onUpdateGoal({ ...goal, date: getTodayIso() })}
            className="px-3 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 font-semibold transition-colors cursor-pointer"
          >
            Przenieś na dziś
          </button>
        </div>
      )}

      <div className="p-6 sm:p-8 space-y-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-400 block mb-1">
              Dzisiejszy cel
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-stone-900 leading-snug break-words">
              {goal.title}
            </h2>
          </div>
          <button
            onClick={onEditGoal}
            className="shrink-0 inline-flex items-center gap-1 text-xs text-stone-500 hover:text-stone-900 px-2 py-1 rounded-md hover:bg-stone-200/60 transition-colors cursor-pointer"
            title="Edytuj cel i kroki"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edytuj cel</span>
          </button>
        </div>

        {hasSteps && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              {isAllDone ? (
                <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700">
                  <Trophy className="w-3.5 h-3.5" />
                  Wszystkie kroki wykonane!
                </span>
              ) : (
                <span className="text-stone-500">
                  Kroki: {completedCount} z {totalCount}
                </span>
              )}
              <span className="text-stone-900 font-bold font-mono">{progressPercent}%</span>
            </div>
            <div className="w-full bg-stone-200 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-1.5 rounded-full transition-all duration-300 ease-out ${
                  isAllDone ? 'bg-emerald-600' : 'bg-stone-900'
                }`}
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              {hasSteps ? 'Lista kroków' : 'Kroki (opcjonalne)'}
            </h3>
            {!isAddingStep && totalCount < MAX_STEPS && (
              <button
                onClick={() => setIsAddingStep(true)}
                className="inline-flex items-center gap-1 text-xs font-medium text-stone-700 hover:text-stone-900 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Dodaj krok</span>
              </button>
            )}
          </div>

          <div className="space-y-2">
            {goal.steps.map((step, index) => {
              const isEditingThis = editing?.id === step.id;
              return (
                <div
                  key={step.id}
                  onClick={() => !isEditingThis && handleToggleStep(step.id)}
                  className={`group flex items-start gap-3 p-3.5 rounded-xl border transition-all select-none ${
                    isEditingThis ? '' : 'cursor-pointer'
                  } ${
                    step.completed
                      ? 'bg-stone-50 border-stone-200 text-stone-400'
                      : 'bg-white border-stone-200 hover:border-stone-300 text-stone-900 shadow-2xs'
                  }`}
                >
                  <button
                    type="button"
                    aria-pressed={step.completed}
                    aria-label={`${step.completed ? 'Cofnij wykonanie' : 'Oznacz jako wykonany'}: ${step.text}`}
                    className={`mt-0.5 shrink-0 transition-colors ${
                      step.completed ? 'text-emerald-600' : 'text-stone-300 group-hover:text-stone-400'
                    }`}
                  >
                    {step.completed ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>

                  {isEditingThis ? (
                    <input
                      type="text"
                      value={editing.text}
                      onChange={(e) => setEdit({ id: step.id, text: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          finishEdit(true);
                        } else if (e.key === 'Escape') {
                          finishEdit(false);
                        }
                      }}
                      onBlur={() => finishEdit(true)}
                      aria-label={`Edytuj tekst kroku ${index + 1}`}
                      className="flex-1 min-w-0 px-2 py-0.5 -my-0.5 text-sm rounded-md border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900 text-stone-900 select-text"
                      autoFocus
                    />
                  ) : (
                    <span
                      className={`text-sm font-medium flex-1 leading-relaxed break-words min-w-0 ${
                        step.completed ? 'line-through text-stone-400' : 'text-stone-800'
                      }`}
                    >
                      <span className="text-stone-400 font-mono text-xs mr-2">{index + 1}.</span>
                      {step.text}
                    </span>
                  )}

                  {!isEditingThis && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEdit({ id: step.id, text: step.text });
                      }}
                      className={`${STEP_ACTION_CLASS} hover:text-stone-900`}
                      title="Edytuj ten krok"
                      aria-label={`Edytuj krok: ${step.text}`}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteStep(step.id);
                    }}
                    className={`${STEP_ACTION_CLASS} hover:text-rose-600`}
                    title="Usuń ten krok"
                    aria-label={`Usuń krok: ${step.text}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>

          {isAddingStep && (
            <form onSubmit={handleAddStepSubmit} className="flex gap-2 pt-1">
              <input
                type="text"
                value={newStepText}
                onChange={(e) => setNewStepText(e.target.value)}
                placeholder="Wpisz kolejny mały krok..."
                className="flex-1 min-w-0 px-3.5 py-2 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900"
                autoFocus
              />
              <button
                type="submit"
                className="px-3.5 py-2 bg-stone-900 text-white rounded-xl text-xs font-medium hover:bg-stone-800 transition-colors cursor-pointer"
              >
                Dodaj
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAddingStep(false);
                  setNewStepText('');
                }}
                className="px-3 py-2 bg-stone-100 text-stone-600 rounded-xl text-xs font-medium hover:bg-stone-200 transition-colors cursor-pointer"
              >
                Anuluj
              </button>
            </form>
          )}
        </div>

        <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => onCompleteGoal(goal)}
            className={`flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-medium transition-colors cursor-pointer text-sm shadow-sm ${
              isAllDone
                ? 'bg-emerald-700 text-white hover:bg-emerald-800'
                : 'bg-stone-900 text-white hover:bg-stone-800'
            }`}
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Zrobione (Zamknij dzień)</span>
          </button>

          <button
            onClick={onResetGoal}
            className="px-4 py-3 rounded-xl border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-50 text-xs font-medium transition-colors cursor-pointer text-center"
          >
            Nowy cel
          </button>
        </div>
      </div>
    </div>
  );
};
