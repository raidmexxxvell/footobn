import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import express from 'express';
import { performDailyCheckin } from './services/checkin';
dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
	throw new Error('TELEGRAM_BOT_TOKEN не найден в .env');
}

const app = express();
app.use(express.json());

const bot = new TelegramBot(token);

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
		const result = await performDailyCheckin(String(chatId));
		bot.sendMessage(chatId, `✅ Чек‑ин выполнен! День: ${result.cycleDay}, XP: ${result.rewards.xp}, кредиты: ${result.rewards.credits}`);
	} catch (err) {
		console.error(err);
		bot.sendMessage(chatId, '❌ Произошла ошибка при чек‑ине.');
	}
});

// Обработка команды /start
bot.onText(/\/start/, (msg) => {
	bot.sendMessage(msg.chat.id, 'Привет! Напиши /checkin, чтобы получить награды.');
});

// Экспортируем app для использования в основном сервере
export default app;
