"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.achievementsRouter = void 0;
const express_1 = require("express");
const repoProvider_1 = require("../services/repoProvider");
exports.achievementsRouter = (0, express_1.Router)();
exports.achievementsRouter.get('/', async (req, res) => {
    try {
        const userId = String(req.query.user_id);
        if (!userId)
            return res.status(400).json({ error: 'user_id_required' });
        const all = await repoProvider_1.repo.getUserAchievements(userId);
        res.json(all);
    }
    catch (err) {
        res.status(500).json({ error: 'internal_error', details: err?.message });
    }
});
