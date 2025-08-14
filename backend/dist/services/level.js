"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeLevelFromXP = computeLevelFromXP;
function computeLevelFromXP(xp) {
    const lvl = Math.floor(xp / 100) + 1;
    return Math.min(100, Math.max(1, lvl));
}
