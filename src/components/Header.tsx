import React from 'react';
import { Target } from 'lucide-react';
import { formatLongDate } from '../utils/date';

export const Header: React.FC = () => {
  const todayLabel = formatLongDate(new Date());

  return (
    <header className="w-full pt-6 pb-2 px-5">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-accent shrink-0" aria-hidden="true" />
          <h1 className="font-display text-lg font-bold tracking-tight">Jeden cel dziennie</h1>
        </div>
        <p className="text-sm text-muted pl-7">{todayLabel}</p>
      </div>
    </header>
  );
};
