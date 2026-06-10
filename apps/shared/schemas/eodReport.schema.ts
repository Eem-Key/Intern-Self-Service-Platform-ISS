import { z } from 'zod';

const today = new Date().toISOString().split('T')[0];
const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

export const eodReportSchema = z.object({
  date_written: z.string().refine((date) => date === today || date === yesterday, {
    message: 'Only today or yesterday can be selected.',
  }).optional(),
  hours_spent: z.union([z.number(), z.string(), z.nan()]).optional(),
  project_name: z.string().min(1, 'Project name is required.'),
  task_accomplished: z.string().min(1, 'Task accomplished is required.'),
});