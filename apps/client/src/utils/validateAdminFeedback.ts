import { approvalFeedbackSchema } from '../../../shared/schemas/adminFeedback.schema';

export const validateAdminFeedback = (adminFeedback: string) => {
    const result = approvalFeedbackSchema.safeParse({
        admin_feedback: adminFeedback,
    });

    if (result.success) {
        return '';
    }

    return result.error.issues[0]?.message ?? 'Invalid admin feedback';
};