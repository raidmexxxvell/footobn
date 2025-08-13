import { Pool } from 'pg';
import { IDataRepo, AchievementRecord, UserRecord } from './repo';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.PGSSLMODE === 'require' ? { rejectUnauthorized: false } : undefined
});

function mapUser(row: any): UserRecord {
  return {
    user_id: row.user_id,
    display_name: row.display_name ?? '',
    tg_username: row.tg_username ?? '',
    credits: Number(row.credits) || 0,
    xp: Number(row.xp) || 0,
    level: Number(row.level) || 1,
    consecutive_days: Number(row.consecutive_days) || 0,
    last_checkin_date: row.last_checkin_date ? row.last_checkin_date.toISOString().slice(0,10) : undefined,
    badge_tier: row.badge_tier ?? 'none',
    badge_unlocked_at: row.badge_unlocked_at ? row.badge_unlocked_at.toISOString() : undefined,
    created_at: row.created_at?.toISOString(),
    updated_at: row.updated_at?.toISOString()
  };
}

export const pgRepo: IDataRepo = {
  async getUserById(userId) {
    const { rows } = await pool.query('SELECT * FROM users WHERE user_id=$1', [userId]);
    if (!rows.length) return null;
    return mapUser(rows[0]);
  },

  async upsertUser(u) {
    await pool.query(`
      INSERT INTO users (user_id, display_name, tg_username, credits, xp, level, consecutive_days, last_checkin_date, badge_tier, badge_unlocked_at, created_at, updated_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,CASE WHEN $8<>'' THEN $8::date ELSE NULL END,$9,CASE WHEN $10<>'' THEN $10::timestamptz ELSE NULL END,$11,$12)
      ON CONFLICT (user_id) DO UPDATE SET
        display_name=EXCLUDED.display_name,
        tg_username=EXCLUDED.tg_username,
        credits=EXCLUDED.credits,
        xp=EXCLUDED.xp,
        level=EXCLUDED.level,
        consecutive_days=EXCLUDED.consecutive_days,
        last_checkin_date=EXCLUDED.last_checkin_date,
        badge_tier=EXCLUDED.badge_tier,
        badge_unlocked_at=EXCLUDED.badge_unlocked_at,
        updated_at=EXCLUDED.updated_at
    `, [
      u.user_id, u.display_name || '', u.tg_username || '', u.credits, u.xp, u.level,
      u.consecutive_days, u.last_checkin_date || '', u.badge_tier || 'none', u.badge_unlocked_at || '',
      u.created_at, u.updated_at
    ]);
  },

  async updateUserRowSafely({ user_id, expectedNotCheckedToday, update }) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const { rows } = await client.query('SELECT * FROM users WHERE user_id=$1 FOR UPDATE', [user_id]);
      if (!rows.length) throw new Error(`User ${user_id} not found`);

      const row = rows[0];
      const last = row.last_checkin_date ? row.last_checkin_date.toISOString().slice(0,10) : null;
      if (last === expectedNotCheckedToday) {
        const err: any = new Error('Already checked in today'); err.code = 'ALREADY_CHECKED_TODAY'; throw err;
      }

      await client.query(`
        UPDATE users SET
          display_name=$2,
          tg_username=$3,
          credits=$4,
          xp=$5,
          level=$6,
          consecutive_days=$7,
          last_checkin_date=CASE WHEN $8<>'' THEN $8::date ELSE NULL END,
          badge_tier=$9,
          badge_unlocked_at=CASE WHEN $10<>'' THEN $10::timestamptz ELSE NULL END,
          updated_at=$11
        WHERE user_id=$1
      `, [
        update.user_id, update.display_name || '', update.tg_username || '',
        update.credits, update.xp, update.level, update.consecutive_days,
        update.last_checkin_date || '', update.badge_tier || 'none', update.badge_unlocked_at || '',
        update.updated_at
      ]);
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  },

  async getLeaderboard(limit) {
    const { rows } = await pool.query(
      'SELECT display_name, xp, level FROM users ORDER BY level DESC, xp DESC LIMIT $1', [limit]
    );
    return rows.map(r => ({ display_name: r.display_name, xp: Number(r.xp)||0, level: Number(r.level)||1 }));
  },

  async supersedeLowerTierAchievements(userId, newTier) {
    const tiers: Record<string, number> = { bronze: 1, silver: 2, gold: 3 };
    const newRank = tiers[newTier];
    await pool.query(
      'UPDATE achievements SET superseded=TRUE WHERE user_id=$1 AND (CASE tier WHEN \'bronze\' THEN 1 WHEN \'silver\' THEN 2 WHEN \'gold\' THEN 3 END) < $2 AND superseded=FALSE',
      [userId, newRank]
    );
  },

  async upsertAchievement(a: AchievementRecord) {
    await pool.query(`
      INSERT INTO achievements (user_id, tier, title, description, unlocked_at, superseded)
      VALUES ($1,$2,$3,$4,$5,$6)
      ON CONFLICT (user_id, tier) DO UPDATE SET
        title=EXCLUDED.title,
        description=EXCLUDED.description,
        unlocked_at=EXCLUDED.unlocked_at,
        superseded=EXCLUDED.superseded
    `, [a.user_id, a.tier, a.title, a.description, a.unlocked_at, a.superseded]);
  },

  async getUserAchievements(userId) {
    const { rows } = await pool.query(
      'SELECT user_id, tier, title, description, unlocked_at, superseded FROM achievements WHERE user_id=$1',
      [userId]
    );
    return rows.map(r => ({
      user_id: r.user_id,
      tier: r.tier,
      title: r.title,
      description: r.description,
      unlocked_at: r.unlocked_at.toISOString(),
      superseded: !!r.superseded
    }));
  }
};
