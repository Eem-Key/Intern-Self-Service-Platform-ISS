import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('5000'),
});

const env = envSchema.parse((globalThis as any).process?.env ?? {});
const PORT = parseInt(env.PORT, 10);

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/api/connection', (req, res) => {
  res.json({ status: 'healthy', message: 'Backend is connected!' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export {};