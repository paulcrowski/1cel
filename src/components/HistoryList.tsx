import React, { useState } from 'react';
import { History, Calendar, ChevronDown, ChevronUp, CheckCircle2, Trash2 } from 'lucide-react';
import { DailyGoal } from '../types';

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

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('pl-PL', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(date);
    } catch {
      return dateStr;
    }
  };

  if (history.length === 0) {
    return (
      <div className="w-full max-w-xl mx-auto mt-10 p-6 rounded-2xl bg-stone-50 border border-stone-200/70 text-center">
        <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-stone-200/60 flex items-center justify-center text-stone-500">
          <History className="w-5 h-5" />
        </div>
        <h3 className="text-sm font-semibold text-stone-800">Brak historii poprzednich dni</h3>
        <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
          Gdy zakończysz i oznaczysz swój pierwszy cel dnia przyciskiem „Zrobione”, pojawi się on tutaj.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto mt-10 space-y-4">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-stone-500" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-stone-700">
            Historia poprzednich dni ({history.length})
          </h3>
        </div>
      </div>

      <div className="space-y-3">
        {history.map((item) => {
          const completedSteps = item.steps.filter(s => s.completed).length;
          const totalSteps = item.steps.length;
          const percent = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
          const isExpanded = !!expandedIds[item.id];

          return (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-stone-200 shadow-2xs overflow-hidden transition-all"
            >
              <div
                onClick={() => toggleExpand(item.id)}
                className="p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-stone-50/80 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md">
                      <Calendar className="w-3 h-3 text-stone-400" />
                      {formatDate(item.date)}
                    </span>
                    <span className="text-[11px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                      {percent}% wykonane
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-stone-900 truncate">
                    {item.title}
                  </h4>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteHistoryItem(item.id);
                    }}
                    title="Usuń wpis z historii"
                    className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="p-1.5 text-stone-400">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="px-4 pb-4 pt-1 bg-stone-50/50 border-t border-stone-100 text-xs space-y-2">
                  <div className="text-stone-500 font-semibold uppercase tracking-wider text-[10px] mb-1">
                    Zrealizowane kroki ({completedSteps}/{totalSteps})
                  </div>
                  <div className="space-y-1.5">
                    {item.steps.map((step, idx) => (
                      <div key={step.id} className="flex items-center gap-2 text-stone-700">
                        <CheckCircle2
                          className={`w-3.5 h-3.5 shrink-0 ${
                            step.completed ? 'text-emerald-600' : 'text-stone-300'
                          }`}
                        />
                        <span className={step.completed ? 'text-stone-700' : 'line-through text-stone-400'}>
                          <span className="font-mono text-stone-400 mr-1.5">{idx + 1}.</span>
                          {step.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
