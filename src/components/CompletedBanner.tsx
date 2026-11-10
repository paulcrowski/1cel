import React from 'react';
import { CheckCircle, Sparkles } from 'lucide-react';
import { GoalProgress } from '../utils/goalProgress';

interface CompletedBannerProps {
  progress: GoalProgress;
  onDismiss: () => void;
}

export const CompletedBanner: React.FC<CompletedBannerProps> = ({ progress, onDismiss }) => {
  const success = progress.isAllDone || !progress.hasSteps;
  return (
  <div className="w-full max-w-xl mx-auto mb-8 p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
    <div className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto shadow-sm">
      <CheckCircle className="w-6 h-6" />
    </div>
    <h2 className="text-lg font-bold text-emerald-950">
      {success ? 'Dzień zamknięty z sukcesem!' : 'Dzień zamknięty'}
    </h2>
    <p className="text-xs text-emerald-800 max-w-sm mx-auto">
      {success
        ? 'Twój cel został zapisany w historii. Świetna robota — odpocznij lub wyznacz cel na kolejny dzień.'
        : `Cel zapisany w historii z ukończonymi krokami: ${progress.completed} z ${progress.total}. Jutro możesz wyznaczyć go na nowo.`}
    </p>
    <button
      onClick={onDismiss}
      className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
    >
      <Sparkles className="w-3.5 h-3.5" />
      <span>Wyznacz nowy cel</span>
    </button>
  </div>
  );
};
