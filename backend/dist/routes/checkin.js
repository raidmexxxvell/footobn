"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkinRouter = void 0;
const express_1 = require("express");
const checkin_1 = require("../services/checkin");
const date_1 = require("../utils/date");
const repoProvider_1 = require("../services/repoProvider");
exports.checkinRouter = (0, express_1.Router)();
// Получить состояние чекина
exports.checkinRouter.get('/state', async (req, res) => {
    try {
        const userId = String(req.query.user_id);
        if (!userId)
            return res.status(400).json({ error: 'user_id_required' });
        const user = await repoProvider_1.repo.getUserById(userId);
        const now = new Date();
        const today = (0, date_1.toUTCDateString)(now);
        const already = user?.last_checkin_date && (0, date_1.isSameUTCDate)(user.last_checkin_date, today);
        const consecutiveDays = user?.consecutive_days || 0;
        const cycleDay = consecutiveDays ? ((consecutiveDays - 1) % 7) + 1 : 1;
        res.json({
            today,
            alreadyCheckedIn: Boolean(already),
            consecutiveDays,
            cycleDay,
            badgeTier: user?.badge_tier || 'none',
            nextEligibleAt: (0, date_1.nextUTC00)(now).toISOString(),
            totals: { xp: user?.xp ?? 0, credits: user?.credits ?? 0, level: user?.level ?? 1 }
        });
    }
    catch (err) {
        res.status(500).json({ error: 'internal_error', details: err?.message });
    }
});
// Совершить чекин
exports.checkinRouter.post('/', async (req, res) => {
    try {
        const userId = String(req.body.user_id);
        if (!userId)
            return res.status(400).json({ error: 'user_id_required' });
        const result = await (0, checkin_1.performDailyCheckin)(userId);
        res.json(result);
    }
    catch (err) {
        if (err?.code === 'ALREADY_CHECKED_TODAY') {
            return res.status(409).json({ error: 'already_checked_in' });
        }
        res.status(500).json({ error: 'internal_error', details: err?.message });
    }
});
