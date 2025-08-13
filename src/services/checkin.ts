import { repo } from './repoProvider';
import { computeLevelFromXP } from './level';
import { toUTCDateString, isSameUTCDate, isYesterdayUTC, nextUTC00 } from '../utils/date';

export type BadgeTier = 'none' | 'bronze' | 'silver' | 'gold';

export interface UserRecord {
  user_id: string;
  display_name: string;
  tg_username?: string;
  credits: number;
  xp: number;
  level: number;
  consecutive_days: number;
  last_checkin_date?: string;
  badge_tier?: BadgeTier;
  badge_unlocked_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CheckinResult {
  status: 'ok' | 'already_checked_in' | 'created_and_checked_in';
  cycleDay: number;
  consecutiveDays: number;
  rewards: { xp: number; credits: number };
  totals: { xp: number; credits: number; level: number };
  badgeUpdated?: { newTier: BadgeTier; replaced?: BadgeTier };
  today: string;
  nextEligibleAt: string;
}

const BASE_XP = 10;
const BASE_CREDITS = 50;

const BADGE_THRESHOLDS: Array<{ tier: BadgeTier; days: number }> = [
  { tier: 'gold', days: 120 },
  { tier: 'silver', days: 30 },
  { tier: 'bronze', days: 7 }
];

const BADGE_RANK: Record<BadgeTier, number> = {
  none: 0,
  bronze: 1,
  silver: 2,
  gold: 3
};

function resolveBadgeTier(consecutiveDays: number): BadgeTier {
  for (const { tier, days } of BADGE_THRESHOLDS) {
    if (consecutiveDays >= days) return tier;
  }
  return 'none';
}

function computeCycleDay(consecutiveDays: number): number {
  return ((Math.max(1, consecutiveDays) - 1) % 7) + 1;
}

export async function performDailyCheckin(userId: string, now = new Date()): Promise<CheckinResult> {
  const todayUTC = toUTCDateString(now);
  const nextEligibleAt = nextUTC00(now).toISOString();

  let user = await repo.getUserById(userId) as UserRecord | null;

  if (!user) {
    const createdAt = now.toISOString();
    user = {
      user_id: userId,
      display_name: '',
      tg_username: '',
      credits: 1000,
      xp: 0,
      level: 1,
      consecutive_days: 0,
      last_checkin_date: undefined,
      badge_tier: 'none',
      badge_unlocked_at: undefined,
      created_at: createdAt,
      updated_at: createdAt
    };
    await repo.upsertUser(user);
  }

  if (user.last_checkin_date && isSameUTCDate(user.last_checkin_date, todayUTC)) {
    return {
      status: 'already_checked_in',
      cycleDay: computeCycleDay(user.consecutive_days || 1),
      consecutiveDays: user.consecutive_days || 1,
      rewards: { xp: 0, credits: 0 },
      totals: { xp: user.xp, credits: user.credits, level: user.level },
      today: todayUTC,
      nextEligibleAt
    };
  }

  let newConsecutiveDays: number;
  if (user.last_checkin_date && isYesterdayUTC(user.last_checkin_date, todayUTC)) {
    newConsecutiveDays = (user.consecutive_days || 0) + 1;
  } else {
    newConsecutiveDays = 1;
  }

  const cycleDay = computeCycleDay(newConsecutiveDays);

  const xpGain = BASE_XP * cycleDay;
  const creditsGain = BASE_CREDITS * cycleDay;

  const newXP = user.xp + xpGain;
  const newCredits = user.credits + creditsGain;
  const newLevel = computeLevelFromXP(newXP);

  const prevTier: BadgeTier = user.badge_tier || 'none';
  const candidateTier: BadgeTier = resolveBadgeTier(newConsecutiveDays);

  let badgeUpdated: CheckinResult['badgeUpdated'] | undefined;

  const updatedUser = {
    ...user,
    credits: newCredits,
    xp: newXP,
    level: newLevel,
    consecutive_days: newConsecutiveDays,
    last_checkin_date: todayUTC,
    updated_at: now.toISOString()
  };

  if (BADGE_RANK[candidateTier] > BADGE_RANK[prevTier]) {
    await repo.supersedeLowerTierAchievements(user.user_id, candidateTier);
    await repo.upsertAchievement({
      user_id: user.user_id,
      tier: candidateTier,
      title: tierTitle(candidateTier),
      description: tierDescription(candidateTier),
      unlocked_at: now.toISOString(),
      superseded: false
    });

    (updatedUser as any).badge_tier = candidateTier;
    (updatedUser as any).badge_unlocked_at = now.toISOString();
    badgeUpdated = { newTier: candidateTier, replaced: prevTier !== 'none' ? prevTier : undefined };
  }

  await repo.updateUserRowSafely({
    user_id: user.user_id,
    expectedNotCheckedToday: todayUTC,
    update: updatedUser as any
  });

  const createdAndCheckedIn = user.created_at === user.updated_at;

  return {
    status: createdAndCheckedIn ? 'created_and_checked_in' : 'ok',
    cycleDay,
    consecutiveDays: newConsecutiveDays,
    rewards: { xp: xpGain, credits: creditsGain },
    totals: { xp: newXP, credits: newCredits, level: newLevel },
    badgeUpdated,
    today: todayUTC,
    nextEligibleAt
  };
}

function tierTitle(tier: BadgeTier): string {
  switch (tier) {
    case 'bronze': return 'Бронза';
    case 'silver': return 'Серебро';
    case 'gold': return 'Золото';
    default: return '';
  }
}

function tierDescription(tier: BadgeTier): string {
  switch (tier) {
    case 'bronze': return '7 дней подряд';
    case 'silver': return '30 дней подряд';
    case 'gold': return '120 дней подряд';
    default: return '';
  }
}
