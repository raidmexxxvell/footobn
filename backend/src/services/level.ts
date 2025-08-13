export function computeLevelFromXP(xp: number): number {
  const lvl = Math.floor(xp / 100) + 1;
  return Math.min(100, Math.max(1, lvl));
}