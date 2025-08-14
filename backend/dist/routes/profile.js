"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.profileRouter = void 0;
const express_1 = require("express");
const repoProvider_1 = require("../services/repoProvider");
exports.profileRouter = (0, express_1.Router)();
exports.profileRouter.get('/', async (req, res) => {
    try {
        const userId = String(req.query.user_id);
        if (!userId)
            return res.status(400).json({ error: 'user_id_required' });
        const user = await repoProvider_1.repo.getUserById(userId);
        if (!user)
            return res.status(404).json({ error: 'not_found' });
        const leaderboard = await repoProvider_1.repo.getLeaderboard(10);
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
    }
    catch (e) {
        res.status(500).json({ error: 'internal_error', details: e?.message });
    }
});
