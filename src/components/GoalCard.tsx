import React, { useRef, useState } from 'react';
import { Plus, Check, Trophy, Edit3, Trash2, Pencil } from 'lucide-react';
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
  'p-2 text-faint rounded-lg transition-colors md:opacity-0 md:group-hover:opacity-100 focus-visible:opacity-100';

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
    <section className="w-full space-y-6">
      {isFromPastDay && (
        <div className="px-4 py-3 rounded-2xl bg-warn-soft text-warn-ink flex flex-wrap items-center justify-between gap-2 text-sm">
          <span>Ten cel jest z dnia {formatShortDate(goal.date)}.</span>
          <button
            type="button"
            onClick={() => onUpdateGoal({ ...goal, date: getTodayIso() })}
            className="px-3 py-1.5 rounded-lg bg-warn-ink text-warn-soft font-semibold text-sm cursor-pointer"
          >
            Przenieś na dziś
          </button>
        </div>
      )}

      {/* Płyta z celem dnia — jedyny mocny element ekranu. */}
      <div className="rounded-[28px] bg-accent text-on-accent p-6 sm:p-8">
        <div className="flex justify-end">
          <button
            onClick={onEditGoal}
            className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full bg-on-accent/15 hover:bg-on-accent/25 transition-colors cursor-pointer focus-visible:outline-on-accent"
            title="Edytuj cel i kroki"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edytuj cel</span>
          </button>
        </div>

        <h2 className="mt-4 font-display text-[2rem] sm:text-5xl font-bold leading-[1.05] tracking-tight break-words">
          {goal.title}
        </h2>

        {hasSteps && (
          <div className="mt-8">
            <div
              role="progressbar"
              aria-label="Postęp celu"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progressPercent}
              className="flex gap-1.5"
            >
              {goal.steps.map((step) => (
                <span
                  key={step.id}
                  className={`h-2 flex-1 rounded-full transition-colors duration-300 ${
                    step.completed ? 'bg-on-accent' : 'bg-on-accent/25'
                  }`}
                />
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between text-sm">
              {isAllDone ? (
                <span className="inline-flex items-center gap-1.5 font-semibold">
                  <Trophy className="w-4 h-4" />
                  Wszystkie kroki wykonane!
                </span>
              ) : (
                <span className="opacity-85">
                  Kroki: {completedCount} z {totalCount}
                </span>
              )}
              <span className="font-display font-bold text-lg">{progressPercent}%</span>
            </div>
          </div>
        )}
      </div>

      <div>
        {hasSteps && (
          <ul className="divide-y divide-line">
            {goal.steps.map((step, index) => {
              const isEditingThis = editing?.id === step.id;
              return (
                <li
                  key={step.id}
                  onClick={() => !isEditingThis && handleToggleStep(step.id)}
                  className={`group flex items-center gap-3 py-3.5 select-none ${
                    isEditingThis ? '' : 'cursor-pointer'
                  }`}
                >
                  <button
                    type="button"
                    aria-pressed={step.completed}
                    aria-label={`${step.completed ? 'Cofnij wykonanie' : 'Oznacz jako wykonany'}: ${step.text}`}
                    className={`shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-colors ${
                      step.completed
                        ? 'bg-accent border-accent text-on-accent'
                        : 'border-faint group-hover:border-accent'
                    }`}
                  >
                    {step.completed && <Check className="w-4 h-4 stroke-[3]" />}
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
                      className="flex-1 min-w-0 px-3 py-1.5 text-base rounded-lg border border-line select-text"
                      autoFocus
                    />
                  ) : (
                    <span
                      className={`text-[1.0625rem] flex-1 leading-snug break-words min-w-0 ${
                        step.completed ? 'line-through text-muted' : 'text-ink'
                      }`}
                    >
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
                      className={`${STEP_ACTION_CLASS} hover:text-ink`}
                      title="Edytuj ten krok"
                      aria-label={`Edytuj krok: ${step.text}`}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteStep(step.id);
                    }}
                    className={`${STEP_ACTION_CLASS} hover:text-danger`}
                    title="Usuń ten krok"
                    aria-label={`Usuń krok: ${step.text}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {isAddingStep ? (
          <form onSubmit={handleAddStepSubmit} className="flex gap-2 pt-3">
            <input
              type="text"
              value={newStepText}
              onChange={(e) => setNewStepText(e.target.value)}
              placeholder="Wpisz kolejny mały krok..."
              className="flex-1 min-w-0 px-4 py-3 text-base rounded-xl border border-line"
              autoFocus
            />
            <button
              type="submit"
              className="px-4 py-3 bg-accent text-on-accent rounded-xl text-sm font-semibold cursor-pointer"
            >
              Dodaj
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAddingStep(false);
                setNewStepText('');
              }}
              className="px-3 py-3 text-muted rounded-xl text-sm font-medium cursor-pointer"
            >
              Anuluj
            </button>
          </form>
        ) : (
          totalCount < MAX_STEPS && (
            <button
              onClick={() => setIsAddingStep(true)}
              className="mt-2 inline-flex items-center gap-2 py-2.5 text-accent font-semibold text-[0.9375rem] cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Dodaj krok</span>
            </button>
          )
        )}
        {!hasSteps && !isAddingStep && (
          <p className="text-sm text-muted">Kroki są opcjonalne — możesz zamknąć dzień także bez nich.</p>
        )}
      </div>

      <div className="space-y-2 pt-2">
        <button
          onClick={() => onCompleteGoal(goal)}
          className={`w-full inline-flex items-center justify-center gap-2 px-5 py-4 rounded-2xl font-semibold text-base transition-colors cursor-pointer ${
            isAllDone ? 'bg-accent text-on-accent' : 'bg-ink text-paper'
          }`}
        >
          <Check className="w-5 h-5 stroke-[3]" />
          <span>Zrobione (Zamknij dzień)</span>
        </button>

        <button
          onClick={onResetGoal}
          className="w-full py-3 text-sm font-medium text-muted hover:text-ink transition-colors cursor-pointer"
        >
          Nowy cel
        </button>
      </div>
    </section>
  );
};
