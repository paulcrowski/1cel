import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Check, Trash2 } from 'lucide-react';
import { DailyGoal } from '../types';
import { formatShortDate, getTodayIso } from '../utils/date';
import { getStreak } from '../utils/streak';
import { getGoalProgress } from '../utils/goalProgress';

interface HistoryListProps {
  history: DailyGoal[];
  onDeleteHistoryItem: (id: string) => void;
}

export const HistoryList: React.FC<HistoryListProps> = ({ history, onDeleteHistoryItem }) => {
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  if (history.length === 0) {
    return (
      <div className="w-full mt-14">
        <h3 className="font-display text-lg font-bold">Brak historii poprzednich dni</h3>
        <p className="text-muted mt-1 max-w-sm">
          Gdy zakończysz i oznaczysz swój pierwszy cel dnia przyciskiem „Zrobione”, pojawi się on tutaj.
        </p>
      </div>
    );
  }

  const streak = getStreak(
    history.map((item) => item.date),
    getTodayIso(),
  );

  return (
    <div className="w-full mt-14">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h3 className="font-display text-lg font-bold">
          Historia poprzednich dni ({history.length})
        </h3>
        {streak >= 2 && (
          <span className="text-sm font-semibold text-accent whitespace-nowrap">
            Seria: {streak} dni z rzędu
          </span>
        )}
      </div>

      <ul className="mt-3 divide-y divide-line border-y border-line">
        {history.map((item) => {
          const { completed: completedSteps, total: totalSteps, percent, hasSteps } = getGoalProgress(item);
          const isExpanded = !!expandedIds[item.id];

          return (
            <li key={item.id}>
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => toggleExpand(item.id)}
                  aria-expanded={isExpanded}
                  className="flex-1 min-w-0 py-4 flex items-center gap-3 text-left cursor-pointer"
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold truncate">{item.title}</h4>
                    <div className="mt-0.5 flex items-center gap-3 text-sm">
                      <span className="text-muted">{formatShortDate(item.date)}</span>
                      <span className="text-accent font-semibold">
                        {hasSteps ? `${percent}% wykonane` : 'Cel zamknięty'}
                      </span>
                    </div>
                  </div>

                  <div className="text-faint">
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onDeleteHistoryItem(item.id)}
                  title="Usuń wpis z historii"
                  aria-label={`Usuń wpis z historii: ${item.title}`}
                  className="p-2.5 text-faint hover:text-danger rounded-xl transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {isExpanded && !hasSteps && (
                <div className="pb-4 text-sm text-muted">Ten cel nie miał kroków.</div>
              )}

              {isExpanded && hasSteps && (
                <div className="pb-4 text-sm space-y-2">
                  <div className="text-muted font-medium">
                    Zrealizowane kroki ({completedSteps}/{totalSteps})
                  </div>
                  <ul className="space-y-1.5">
                    {item.steps.map((step) => (
                      <li key={step.id} className="flex items-center gap-2.5">
                        <span
                          className={`shrink-0 w-4 h-4 rounded-full flex items-center justify-center ${
                            step.completed ? 'bg-accent text-on-accent' : 'border border-faint'
                          }`}
                        >
                          {step.completed && <Check className="w-3 h-3 stroke-[3]" />}
                        </span>
                        <span className={step.completed ? 'text-ink' : 'line-through text-muted'}>
                          {step.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};
