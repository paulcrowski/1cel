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
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 pl-5 pr-2 py-2 rounded-2xl bg-ink text-paper text-sm shadow-lg"
    >
      <span>{notice.message}</span>
      <button
        type="button"
        onClick={onUndo}
        className="px-3 py-2 rounded-xl text-sm font-bold underline underline-offset-4 cursor-pointer focus-visible:outline-paper"
      >
        Cofnij
      </button>
    </div>
  );
};
