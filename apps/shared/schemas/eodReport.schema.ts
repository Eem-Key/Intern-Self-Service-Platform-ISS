import { z } from 'zod';

export const eodReportSchema = z.object({
    date_written: z.string().optional(),

    hours_spent: z.union([z.number(), z.string(), z.nan()]).optional(),

    project_name: z.string().min(1, 'Project name is required.'),

    task_accomplished: z.string().min(1, 'Task accomplished is required.'),
});