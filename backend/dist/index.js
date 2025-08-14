"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const checkin_1 = require("./routes/checkin");
const achievements_1 = require("./routes/achievements");
const profile_1 = require("./routes/profile");
const telegramBot_1 = __importDefault(require("./telegramBot"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(telegramBot_1.default);
app.use('/checkin', checkin_1.checkinRouter);
app.use('/achievements', achievements_1.achievementsRouter);
app.use('/profile', profile_1.profileRouter);
app.get('/health', (_req, res) => {
    res.status(200).send('OK');
});
app.listen(PORT, () => {
    console.log(`✅ Backend запущен на http://localhost:${PORT}`);
});
