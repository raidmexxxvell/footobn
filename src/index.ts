import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

import { checkinRouter } from './routes/checkin';
import { achievementsRouter } from './routes/achievements';
import { profileRouter } from './routes/profile';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/checkin', checkinRouter);
app.use('/achievements', achievementsRouter);
app.use('/profile', profileRouter);

app.get('/health', (_req, res) => {
  res.status(200).send('OK');
});

app.listen(PORT, () => {
  console.log(`✅ Backend запущен на http://localhost:${PORT}`);
});