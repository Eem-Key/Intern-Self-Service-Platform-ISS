import { z } from 'zod';

const today = new Date().toISOString().split('T')[0];
const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

export const eodReportSchema = z.object({
  dateWritten: z.string().refine((date) => date === today || date === yesterday, {
    message: 'Only today or yesterday can be selected.',
  }),
  hoursSpent: z.number().optional(),
  projectName: z.string().min(1, 'Project name is required.'),
  taskAccomplished: z.string().min(1, 'Task accomplished is required.'),
});

export type EODReportFormValues = z.infer<typeof eodReportSchema>;