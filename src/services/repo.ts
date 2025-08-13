export type BadgeTier = 'none' | 'bronze' | 'silver' | 'gold';

export interface UserRecord {
  user_id: string;
  display_name: string;
  tg_username?: string;
  credits: number;
  xp: number;
  level: number;
  consecutive_days: number;
  last_checkin_date?: string; // YYYY-MM-DD
  badge_tier?: BadgeTier;
  badge_unlocked_at?: string; // ISO
  created_at: string;
  updated_at: string;
}

export interface AchievementRecord {
  user_id: string;
  tier: 'bronze' | 'silver' | 'gold';
  title: string;
  description: string;
  unlocked_at: string; // ISO
  superseded: boolean;
}

export interface IUserRepo {
  getUserById(userId: string): Promise<UserRecord | null>;
  upsertUser(user: UserRecord): Promise<void>;
  updateUserRowSafely(args: {
    user_id: string;
    expectedNotCheckedToday: string; // YYYY-MM-DD
    update: UserRecord;
  }): Promise<void>;
  getLeaderboard(limit: number): Promise<Array<{ display_name: string; xp: number; level: number }>>;
}

export interface IAchievementRepo {
  supersedeLowerTierAchievements(userId: string, newTier: 'bronze'|'silver'|'gold'): Promise<void>;
  upsertAchievement(a: AchievementRecord): Promise<void>;
  getUserAchievements(userId: string): Promise<AchievementRecord[]>;
}

export interface IDataRepo extends IUserRepo, IAchievementRepo {}
