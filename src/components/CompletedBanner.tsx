import React from 'react';
import { Sparkles } from 'lucide-react';
import { GoalProgress } from '../utils/goalProgress';

interface CompletedBannerProps {
  progress: GoalProgress;
  onDismiss: () => void;
}

export const CompletedBanner: React.FC<CompletedBannerProps> = ({ progress, onDismiss }) => {
  const success = progress.isAllDone || !progress.hasSteps;
  return (
    <div className="w-full mb-8 p-6 sm:p-8 bg-accent-soft rounded-[28px]">
      <h2 className="font-display text-2xl sm:text-3xl font-bold leading-tight tracking-tight">
        {success ? 'Dzień zamknięty z sukcesem!' : 'Dzień zamknięty'}
      </h2>
      <p className="mt-2 text-muted max-w-sm">
        {success
          ? 'Twój cel został zapisany w historii. Świetna robota — odpocznij lub wyznacz cel na kolejny dzień.'
          : `Cel zapisany w historii z ukończonymi krokami: ${progress.completed} z ${progress.total}. Jutro możesz wyznaczyć go na nowo.`}
      </p>
      <button
        onClick={onDismiss}
        className="mt-5 inline-flex items-center gap-2 px-5 py-3 bg-accent text-on-accent text-sm font-semibold rounded-xl cursor-pointer"
      >
        <Sparkles className="w-4 h-4" />
        <span>Wyznacz nowy cel</span>
      </button>
    </div>
  );
};
