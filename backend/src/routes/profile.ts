import { Router } from 'express';
import { repo as mainRepo } from '../services/repoProvider';

export const profileRouter = Router();

profileRouter.get('/', async (req, res) => {
  try {
    const userId = String(req.query.user_id);
    if (!userId) return res.status(400).json({ error: 'user_id_required' });

    const user = await mainRepo.getUserById(userId);
    if (!user) return res.status(404).json({ error: 'not_found' });

    const leaderboard = await mainRepo.getLeaderboard(10);

    res.json({
      profile: {
        display_name: user.display_name,
        tg_username: user.tg_username,
        credits: user.credits,
        xp: user.xp,
        level: user.level
      },
      leaderboard
    });
  } catch (e: any) {
    res.status(500).json({ error: 'internal_error', details: e?.message });
  }
});
