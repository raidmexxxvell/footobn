"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toUTCDateString = toUTCDateString;
exports.isSameUTCDate = isSameUTCDate;
exports.isYesterdayUTC = isYesterdayUTC;
exports.nextUTC00 = nextUTC00;
function toUTCDateString(d) {
    return d.toISOString().slice(0, 10); // YYYY-MM-DD
}
function isSameUTCDate(stored, yyyyMmDd) {
    return stored === yyyyMmDd;
}
function isYesterdayUTC(stored, todayYmd) {
    const s = new Date(stored + 'T00:00:00.000Z').getTime();
    const t = new Date(todayYmd + 'T00:00:00.000Z').getTime();
    const diffDays = Math.round((t - s) / 86400000);
    return diffDays === 1;
}
function nextUTC00(now) {
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0));
}
