import React from 'react';
import { Target, Calendar } from 'lucide-react';

export const Header: React.FC = () => {
  const todayFormatted = new Intl.DateTimeFormat('pl-PL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  // Capitalize first letter of weekday
  const capitalizedDate = todayFormatted.charAt(0).toUpperCase() + todayFormatted.slice(1);

  return (
    <header className="w-full pt-8 pb-6 px-4 sm:px-6 text-center border-b border-stone-200/80 bg-stone-50/50">
      <div className="max-w-2xl mx-auto flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-100 text-stone-600 text-xs sm:text-sm font-medium mb-3 border border-stone-200">
          <Calendar className="w-3.5 h-3.5 text-stone-500" />
          <span>{capitalizedDate}</span>
        </div>

        <div className="flex items-center gap-2 mb-1">
          <div className="p-2 rounded-xl bg-stone-900 text-amber-300 shadow-sm">
            <Target className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 font-sans">
            Jeden cel dziennie
          </h1>
        </div>

        <p className="text-xs sm:text-sm text-stone-500 max-w-sm mt-1">
          Skup się na jednej najważniejszej rzeczy. Rozbij ją na kroki i uczyń dzień owocnym.
        </p>
      </div>
    </header>
  );
};
