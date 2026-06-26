import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import 'dotenv/config';
import { z } from 'zod';
import loginRoutes from './routes/login.routes.js';
import internDashboardRoutes from './routes/intern/intern.dashboard.routes.js';
import internProfileRoutes from './routes/intern/intern.profile.routes.js';
import internLeaveRoutes from './routes/intern/intern.leave.routes.js';
import internLogsRoutes from './routes/intern/intern.logs.routes.js';
import adminDashboardRoutes from './routes/admin/admin.dashboard.routes.js';
import adminApprovalsRoutes from './routes/admin/admin.approvals.routes.js';
import adminActivityRoutes from './routes/admin/admin.activity.routes.js';
import adminInternsRoutes from './routes/admin/admin.interns.routes.js';

const envSchema = z.object({
  PORT: z.string().default('5000'),
});

const env = envSchema.parse(process.env);
const PORT = parseInt(env.PORT, 10);

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api/auth', loginRoutes);

app.use('/api/intern/dashboard', internDashboardRoutes);
app.use('/api/intern/profile', internProfileRoutes);
app.use('/api/intern/leave', internLeaveRoutes);
app.use('/api/intern/logs', internLogsRoutes);

app.use('/api/admin/dashboard', adminDashboardRoutes);
app.use('/api/admin/approvals', adminApprovalsRoutes);
app.use('/api/admin/activity', adminActivityRoutes);
app.use('/api/admin/interns', adminInternsRoutes);

app.get('/api/connection', (req, res) => {
  res.json({ status: 'healthy', message: 'Backend is connected!' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});