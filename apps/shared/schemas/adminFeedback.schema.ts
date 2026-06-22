import { z } from 'zod';

export const adminFeedbackSchema = z
    .string()
    .max(500, 'Feedback must not exceed 500 characters')
    .optional()
    .or(z.literal(''));

export const approvalFeedbackSchema = z.object({
    admin_feedback: adminFeedbackSchema,
});