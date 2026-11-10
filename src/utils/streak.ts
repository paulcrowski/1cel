const DAY_MS = 24 * 60 * 60 * 1000;

function previousDay(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day) - DAY_MS).toISOString().slice(0, 10);
}

/**
 * Liczba kolejnych dni (YYYY-MM-DD) z zamkniętym celem, liczona wstecz od dziś.
 * Gdy dziś nie ma jeszcze wpisu, seria liczy się od wczoraj — nie przepada w trakcie dnia.
 */
export function getStreak(dates: string[], today: string): number {
  const days = new Set(dates);
  let cursor = days.has(today) ? today : previousDay(today);
  let streak = 0;
  while (days.has(cursor)) {
    streak += 1;
    cursor = previousDay(cursor);
  }
  return streak;
}
