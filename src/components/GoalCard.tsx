import React, { useState } from 'react';
import { CheckCircle2, Circle, Plus, Check, Play, Trophy, Edit3, Trash2 } from 'lucide-react';
import { DailyGoal, Step } from '../types';

interface GoalCardProps {
  goal: DailyGoal;
  onUpdateGoal: (updated: DailyGoal) => void;
  onCompleteGoal: (goal: DailyGoal) => void;
  onEditGoal: () => void;
  onResetGoal: () => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  onUpdateGoal,
  onCompleteGoal,
  onEditGoal,
  onResetGoal,
}) => {
  const [newStepText, setNewStepText] = useState('');
  const [isAddingStep, setIsAddingStep] = useState(false);

  const completedCount = goal.steps.filter((s) => s.completed).length;
  const totalCount = goal.steps.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

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

  const handleStartGoal = () => {
    onUpdateGoal({
      ...goal,
      status: 'active',
    });
  };

  const handleAddStepSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStepText.trim()) return;

    const newStep: Step = {
      id: `step-${Date.now()}`,
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
    if (goal.steps.length <= 1) return;
    const updatedSteps = goal.steps.filter((s) => s.id !== stepId);
    onUpdateGoal({
      ...goal,
      steps: updatedSteps,
    });
  };

  const isAllDone = completedCount === totalCount && totalCount > 0;

  return (
    <div className="w-full max-w-xl mx-auto bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
      {/* Dynamic Header Badge */}
      <div className="bg-stone-50 border-b border-stone-200/80 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {goal.status === 'draft' ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
              Planowanie
            </span>
          ) : isAllDone ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              <Trophy className="w-3.5 h-3.5" />
              Wszystkie kroki wykonane!
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-stone-900 text-stone-100">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              W trakcie realizacji
            </span>
          )}
        </div>

        <button
          onClick={onEditGoal}
          className="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-stone-900 px-2 py-1 rounded-md hover:bg-stone-200/60 transition-colors cursor-pointer"
          title="Edytuj cel i kroki"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Edytuj cel</span>
        </button>
      </div>

      <div className="p-6 sm:p-8 space-y-6">
        {/* Main Goal Title */}
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-400 block mb-1">
            Dzisiejszy cel
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-stone-900 leading-snug">
            {goal.title}
          </h2>
        </div>

        {/* Progress bar and percentage */}
        <div className="bg-stone-50 p-4 rounded-xl border border-stone-200/70 space-y-2">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="text-stone-600">Postęp realizacji</span>
            <span className="text-stone-900 font-bold font-mono text-sm">
              {progressPercent}%
            </span>
          </div>
          <div className="w-full bg-stone-200 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-2.5 rounded-full transition-all duration-300 ease-out ${
                progressPercent === 100 ? 'bg-emerald-600' : 'bg-stone-900'
              }`}
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <div className="flex justify-between items-center text-[11px] text-stone-400 pt-0.5">
            <span>
              Kroki: {completedCount} z {totalCount}
            </span>
            {isAllDone && (
              <span className="text-emerald-700 font-medium">
                Gotowe do zamknięcia dnia
              </span>
            )}
          </div>
        </div>

        {/* Steps List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Lista kroków
            </h3>
            {!isAddingStep && (
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
            {goal.steps.map((step, index) => (
              <div
                key={step.id}
                onClick={() => handleToggleStep(step.id)}
                className={`group flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
                  step.completed
                    ? 'bg-stone-50 border-stone-200 text-stone-400'
                    : 'bg-white border-stone-200 hover:border-stone-300 text-stone-900 shadow-2xs'
                }`}
              >
                <button
                  type="button"
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
                <span
                  className={`text-sm font-medium flex-1 leading-relaxed ${
                    step.completed ? 'line-through text-stone-400' : 'text-stone-800'
                  }`}
                >
                  <span className="text-stone-400 font-mono text-xs mr-2">{index + 1}.</span>
                  {step.text}
                </span>

                {goal.steps.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteStep(step.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-stone-400 hover:text-rose-600 rounded transition-all"
                    title="Usuń ten krok"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Add step inline form */}
          {isAddingStep && (
            <form onSubmit={handleAddStepSubmit} className="flex gap-2 pt-1">
              <input
                type="text"
                value={newStepText}
                onChange={(e) => setNewStepText(e.target.value)}
                placeholder="Wpisz kolejny mały krok..."
                className="flex-1 px-3.5 py-2 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900"
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

        {/* Action Buttons: Start / Zrobione */}
        <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row gap-3">
          {goal.status === 'draft' ? (
            <button
              onClick={handleStartGoal}
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-stone-900 text-white font-medium hover:bg-stone-800 transition-colors cursor-pointer text-sm shadow-sm"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start</span>
            </button>
          ) : (
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
          )}

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
