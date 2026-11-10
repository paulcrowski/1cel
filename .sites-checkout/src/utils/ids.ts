export function createId(prefix: string, suffix?: string | number): string {
  const base = `${prefix}-${Date.now()}`;
  return suffix === undefined ? base : `${base}-${suffix}`;
}
