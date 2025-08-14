"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_telegram_bot_api_1 = __importDefault(require("node-telegram-bot-api"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const checkin_1 = require("./services/checkin");
dotenv_1.default.config();
const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
    throw new Error('TELEGRAM_BOT_TOKEN не найден в .env');
}
const app = (0, express_1.default)();
app.use(express_1.default.json());
const bot = new node_telegram_bot_api_1.default(token);
// Устанавливаем webhook на Render
const WEBHOOK_URL = process.env.WEBHOOK_URL || '';
if (WEBHOOK_URL) {
    bot.setWebHook(`${WEBHOOK_URL}/bot`);
}
// Endpoint для Telegram webhook
app.post('/bot', (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
});
// Обработка команды /checkin
bot.onText(/\/checkin/, async (msg) => {
    const chatId = msg.chat.id;
    try {
        const result = await (0, checkin_1.performDailyCheckin)(String(chatId));
        bot.sendMessage(chatId, `✅ Чек‑ин выполнен! День: ${result.cycleDay}, XP: ${result.rewards.xp}, кредиты: ${result.rewards.credits}`);
    }
    catch (err) {
        console.error(err);
        bot.sendMessage(chatId, '❌ Произошла ошибка при чек‑ине.');
    }
});
// Обработка команды /start
bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, 'Привет! Напиши /checkin, чтобы получить награды.');
});
// Экспортируем app для использования в основном сервере
exports.default = app;
