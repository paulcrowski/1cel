import React, { useEffect } from 'react';
import { UndoNotice } from '../hooks/useDailyGoal';

const AUTO_DISMISS_MS = 8000;

interface UndoToastProps {
  notice: UndoNotice;
  onUndo: () => void;
  onDismiss: () => void;
}

export const UndoToast: React.FC<UndoToastProps> = ({ notice, onUndo, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(onDismiss, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [notice, onDismiss]);

  return (
    <div
      role="status"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3 pl-4 pr-2 py-2 rounded-xl bg-stone-900 text-white text-sm shadow-lg"
    >
      <span>{notice.message}</span>
      <button
        type="button"
        onClick={onUndo}
        className="px-3 py-1.5 rounded-lg text-xs font-semibold underline underline-offset-2 hover:bg-white/10 transition-colors cursor-pointer"
      >
        Cofnij
      </button>
    </div>
  );
};
