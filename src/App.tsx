import { Header } from './components/Header';
import { CompletedBanner } from './components/CompletedBanner';
import { GoalForm } from './components/GoalForm';
import { GoalCard } from './components/GoalCard';
import { HistoryList } from './components/HistoryList';
import { useDailyGoal } from './hooks/useDailyGoal';

export default function App() {
  const {
    currentGoal,
    history,
    isEditing,
    justCompleted,
    startEditing,
    cancelEditing,
    dismissCompleted,
    saveGoal,
    updateGoal,
    completeGoal,
    resetGoal,
    deleteFromHistory,
  } = useDailyGoal();

  return (
    <div className="min-h-screen bg-stone-100/60 text-stone-900 font-sans flex flex-col selection:bg-stone-800 selection:text-amber-200">
      <Header />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
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

      <footer className="w-full py-6 text-center border-t border-stone-200/60 text-stone-400 text-xs mt-auto">
        <p>Jeden cel dziennie — Prosta i spokojna produktywność w krainie prostoty.</p>
      </footer>
    </div>
  );
}
