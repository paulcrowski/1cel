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

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Parsuje YYYY-MM-DD jako datę lokalną (bez przesunięcia o strefę czasową); inaczej null. */
function parseIsoDate(dateStr: string): Date | null {
  const match = ISO_DATE.exec(dateStr);
  if (!match) return null;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const date = new Date(year, month - 1, day);
  const valid =
    date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  return valid ? date : null;
}

/** Np. "10 lis 2026"; przy niepoprawnej dacie zwraca oryginalny tekst. */
export function formatShortDate(dateStr: string): string {
  const date = parseIsoDate(dateStr) ?? new Date(dateStr);
  return Number.isNaN(date.getTime()) ? dateStr : SHORT_DATE_FORMAT.format(date);
}

/** Czy to poprawna data YYYY-MM-DD wcześniejsza niż dziś (np. cel zostawiony z poprzedniego dnia). */
export function isBeforeToday(dateStr: string): boolean {
  return parseIsoDate(dateStr) !== null && dateStr < getTodayIso();
}
