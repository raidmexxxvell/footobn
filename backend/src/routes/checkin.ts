import { Router } from 'express';
import { performDailyCheckin } from '../services/checkin';
import { toUTCDateString, nextUTC00, isSameUTCDate } from '../utils/date';
import { repo as mainRepo } from '../services/repoProvider';

export const checkinRouter = Router();

// Получить состояние чекина
checkinRouter.get('/state', async (req, res) => {
  try {
    const userId = String(req.query.user_id);
    if (!userId) return res.status(400).json({ error: 'user_id_required' });

    const user = await mainRepo.getUserById(userId);
    const now = new Date();
    const today = toUTCDateString(now);
    const already = user?.last_checkin_date && isSameUTCDate(user.last_checkin_date, today);
    const consecutiveDays = user?.consecutive_days || 0;
    const cycleDay = consecutiveDays ? ((consecutiveDays - 1) % 7) + 1 : 1;

    res.json({
      today,
      alreadyCheckedIn: Boolean(already),
      consecutiveDays,
      cycleDay,
      badgeTier: user?.badge_tier || 'none',
      nextEligibleAt: nextUTC00(now).toISOString(),
      totals: { xp: user?.xp ?? 0, credits: user?.credits ?? 0, level: user?.level ?? 1 }
    });
  } catch (err: any) {
    res.status(500).json({ error: 'internal_error', details: err?.message });
  }
});

// Совершить чекин
checkinRouter.post('/', async (req, res) => {
  try {
    const userId = String(req.body.user_id);
    if (!userId) return res.status(400).json({ error: 'user_id_required' });

    const result = await performDailyCheckin(userId);
    res.json(result);
  } catch (err: any) {
    if (err?.code === 'ALREADY_CHECKED_TODAY') {
      return res.status(409).json({ error: 'already_checked_in' });
    }
    res.status(500).json({ error: 'internal_error', details: err?.message });
  }
});
