export function toUTCDateString(d: Date): string {
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

export function isSameUTCDate(stored: string, yyyyMmDd: string): boolean {
  return stored === yyyyMmDd;
}

export function isYesterdayUTC(stored: string, todayYmd: string): boolean {
  const s = new Date(stored + 'T00:00:00.000Z').getTime();
  const t = new Date(todayYmd + 'T00:00:00.000Z').getTime();
  const diffDays = Math.round((t - s) / 86_400_000);
  return diffDays === 1;
}

export function nextUTC00(now: Date): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0));
}