import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { GoalForm } from './components/GoalForm';
import { GoalCard } from './components/GoalCard';
import { HistoryList } from './components/HistoryList';
import { DailyGoal } from './types';
import {
  getCurrentGoal,
  saveCurrentGoal,
  getGoalHistory,
  archiveCurrentGoal,
  deleteHistoryItem,
} from './storage/goalStorage';
import { CheckCircle, Sparkles } from 'lucide-react';

export default function App() {
  const [currentGoal, setCurrentGoal] = useState<DailyGoal | null>(null);
  const [history, setHistory] = useState<DailyGoal[]>([]);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [justCompleted, setJustCompleted] = useState<boolean>(false);

  useEffect(() => {
    // Odczytaj zapisany stan z localStorage przy załadowaniu
    const savedGoal = getCurrentGoal();
    const savedHistory = getGoalHistory();

    setCurrentGoal(savedGoal);
    setHistory(savedHistory);
  }, []);

  const handleSaveGoal = (goal: DailyGoal) => {
    setCurrentGoal(goal);
    saveCurrentGoal(goal);
    setIsEditing(false);
    setJustCompleted(false);
  };

  const handleUpdateGoal = (updated: DailyGoal) => {
    setCurrentGoal(updated);
    saveCurrentGoal(updated);
  };

  const handleCompleteGoal = (goalToArchive: DailyGoal) => {
    const updatedHistory = archiveCurrentGoal(goalToArchive);
    setHistory(updatedHistory);
    setCurrentGoal(null);
    setIsEditing(false);
    setJustCompleted(true);
  };

  const handleEditGoal = () => {
    setIsEditing(true);
  };

  const handleResetGoal = () => {
    setCurrentGoal(null);
    saveCurrentGoal(null);
    setIsEditing(false);
    setJustCompleted(false);
  };

  const handleDeleteHistory = (id: string) => {
    const updated = deleteHistoryItem(id);
    setHistory(updated);
  };

  return (
    <div className="min-h-screen bg-stone-100/60 text-stone-900 font-sans flex flex-col selection:bg-stone-800 selection:text-amber-200">
      <Header />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {justCompleted && (
          <div className="w-full max-w-xl mx-auto mb-8 p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2 animate-in fade-in duration-300">
            <div className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-emerald-950">
              Dzień zamknięty z sukcesem!
            </h2>
            <p className="text-xs text-emerald-800 max-w-sm mx-auto">
              Twój cel został zapisany w historii. Świetna robota — odpocznij lub wyznacz cel na kolejny dzień.
            </p>
            <button
              onClick={() => setJustCompleted(false)}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Wyznacz nowy cel</span>
            </button>
          </div>
        )}

        {/* Sekcja aktywnego celu / formularza */}
        {!currentGoal || isEditing ? (
          <GoalForm
            onSaveGoal={handleSaveGoal}
            initialGoal={currentGoal}
          />
        ) : (
          <GoalCard
            goal={currentGoal}
            onUpdateGoal={handleUpdateGoal}
            onCompleteGoal={handleCompleteGoal}
            onEditGoal={handleEditGoal}
            onResetGoal={handleResetGoal}
          />
        )}

        {/* Sekcja historii poprzednich dni */}
        <HistoryList
          history={history}
          onDeleteHistoryItem={handleDeleteHistory}
        />
      </main>

      <footer className="w-full py-6 text-center border-t border-stone-200/60 text-stone-400 text-xs mt-auto">
        <p>Jeden cel dziennie — Prosta i spokojna produktywność w krainie prostoty.</p>
      </footer>
    </div>
  );
}

