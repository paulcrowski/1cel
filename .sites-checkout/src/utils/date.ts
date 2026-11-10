const LONG_DATE_FORMAT = new Intl.DateTimeFormat('pl-PL', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const SHORT_DATE_FORMAT = new Intl.DateTimeFormat('pl-PL', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

/** Dzisiejsza data lokalna w formacie YYYY-MM-DD (zgodnie z polem `DailyGoal.date`). */
export function getTodayIso(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

/** Np. "Poniedziałek, 10 listopada 2026". */
export function formatLongDate(date: Date): string {
  const formatted = LONG_DATE_FORMAT.format(date);
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

/** Np. "10 lis 2026"; przy niepoprawnej dacie zwraca oryginalny tekst. */
export function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr);
  return Number.isNaN(date.getTime()) ? dateStr : SHORT_DATE_FORMAT.format(date);
}
