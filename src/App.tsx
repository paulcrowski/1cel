import { Header } from './components/Header';
import { CompletedBanner } from './components/CompletedBanner';
import { GoalForm } from './components/GoalForm';
import { GoalCard } from './components/GoalCard';
import { HistoryList } from './components/HistoryList';
import { UndoToast } from './components/UndoToast';
import { useDailyGoal } from './hooks/useDailyGoal';

export default function App() {
  const {
    currentGoal,
    history,
    isEditing,
    justCompleted,
    undoNotice,
    startEditing,
    cancelEditing,
    dismissCompleted,
    saveGoal,
    updateGoal,
    completeGoal,
    resetGoal,
    deleteFromHistory,
    undo,
    dismissUndo,
  } = useDailyGoal();

  return (
    <div className="min-h-screen bg-paper text-ink font-sans flex flex-col selection:bg-accent selection:text-on-accent">
      <Header />

      <main className="flex-1 w-full max-w-xl mx-auto px-5 pt-6 pb-28">
        {justCompleted && (
          <CompletedBanner progress={justCompleted} onDismiss={dismissCompleted} />
        )}

        {!currentGoal || isEditing ? (
          <GoalForm
            onSaveGoal={saveGoal}
            onCancel={cancelEditing}
            initialGoal={currentGoal}
          />
        ) : (
          <GoalCard
            goal={currentGoal}
            onUpdateGoal={updateGoal}
            onCompleteGoal={completeGoal}
            onEditGoal={startEditing}
            onResetGoal={resetGoal}
          />
        )}

        <HistoryList history={history} onDeleteHistoryItem={deleteFromHistory} />
      </main>

      {undoNotice && <UndoToast notice={undoNotice} onUndo={undo} onDismiss={dismissUndo} />}
    </div>
  );
}
