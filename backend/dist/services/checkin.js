"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.performDailyCheckin = performDailyCheckin;
const repoProvider_1 = require("./repoProvider");
const level_1 = require("./level");
const date_1 = require("../utils/date");
const BASE_XP = 10;
const BASE_CREDITS = 50;
const BADGE_THRESHOLDS = [
    { tier: 'gold', days: 120 },
    { tier: 'silver', days: 30 },
    { tier: 'bronze', days: 7 }
];
const BADGE_RANK = {
    none: 0,
    bronze: 1,
    silver: 2,
    gold: 3
};
function resolveBadgeTier(consecutiveDays) {
    for (const { tier, days } of BADGE_THRESHOLDS) {
        if (consecutiveDays >= days)
            return tier;
    }
    return 'none';
}
function computeCycleDay(consecutiveDays) {
    return ((Math.max(1, consecutiveDays) - 1) % 7) + 1;
}
async function performDailyCheckin(userId, now = new Date()) {
    const todayUTC = (0, date_1.toUTCDateString)(now);
    const nextEligibleAt = (0, date_1.nextUTC00)(now).toISOString();
    let user = await repoProvider_1.repo.getUserById(userId);
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
        await repoProvider_1.repo.upsertUser(user);
    }
    if (user.last_checkin_date && (0, date_1.isSameUTCDate)(user.last_checkin_date, todayUTC)) {
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
    let newConsecutiveDays;
    if (user.last_checkin_date && (0, date_1.isYesterdayUTC)(user.last_checkin_date, todayUTC)) {
        newConsecutiveDays = (user.consecutive_days || 0) + 1;
    }
    else {
        newConsecutiveDays = 1;
    }
    const cycleDay = computeCycleDay(newConsecutiveDays);
    const xpGain = BASE_XP * cycleDay;
    const creditsGain = BASE_CREDITS * cycleDay;
    const newXP = user.xp + xpGain;
    const newCredits = user.credits + creditsGain;
    const newLevel = (0, level_1.computeLevelFromXP)(newXP);
    const prevTier = user.badge_tier || 'none';
    const candidateTier = resolveBadgeTier(newConsecutiveDays);
    let badgeUpdated;
    const updatedUser = {
        ...user,
        credits: newCredits,
        xp: newXP,
        level: newLevel,
        consecutive_days: newConsecutiveDays,
        last_checkin_date: todayUTC,
        updated_at: now.toISOString()
    };
    // 🔹 Исправление: исключаем 'none' перед вызовом методов и присвоением
    if (candidateTier !== 'none' && BADGE_RANK[candidateTier] > BADGE_RANK[prevTier]) {
        await repoProvider_1.repo.supersedeLowerTierAchievements(user.user_id, candidateTier);
        await repoProvider_1.repo.upsertAchievement({
            user_id: user.user_id,
            tier: candidateTier,
            title: tierTitle(candidateTier),
            description: tierDescription(candidateTier),
            unlocked_at: now.toISOString(),
            superseded: false
        });
        updatedUser.badge_tier = candidateTier;
        updatedUser.badge_unlocked_at = now.toISOString();
        badgeUpdated = { newTier: candidateTier, replaced: prevTier !== 'none' ? prevTier : undefined };
    }
    await repoProvider_1.repo.updateUserRowSafely({
        user_id: user.user_id,
        expectedNotCheckedToday: todayUTC,
        update: updatedUser
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
function tierTitle(tier) {
    switch (tier) {
        case 'bronze': return 'Бронза';
        case 'silver': return 'Серебро';
        case 'gold': return 'Золото';
        default: return '';
    }
}
function tierDescription(tier) {
    switch (tier) {
        case 'bronze': return '7 дней подряд';
        case 'silver': return '30 дней подряд';
        case 'gold': return '120 дней подряд';
        default: return '';
    }
}
