import { Router } from 'express';
import { repo as mainRepo } from '../services/repoProvider';

export const achievementsRouter = Router();

achievementsRouter.get('/', async (req, res) => {
  try {
    const userId = String(req.query.user_id);
    if (!userId) return res.status(400).json({ error: 'user_id_required' });

    const all = await mainRepo.getUserAchievements(userId);
    res.json(all);
  } catch (err: any) {
    res.status(500).json({ error: 'internal_error', details: err?.message });
  }
});
