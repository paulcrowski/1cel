import React from 'react';
import { Target } from 'lucide-react';
import { formatLongDate } from '../utils/date';

export const Header: React.FC = () => {
  const todayLabel = formatLongDate(new Date());

  return (
    <header className="w-full py-4 px-4 sm:px-6 border-b border-stone-200/80 bg-stone-50/50">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 rounded-lg bg-stone-900 text-white shrink-0">
            <Target className="w-5 h-5" />
          </div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-stone-900 truncate">
            Jeden cel dziennie
          </h1>
        </div>
        <span className="text-xs sm:text-sm text-stone-500 text-right">{todayLabel}</span>
      </div>
    </header>
  );
};
