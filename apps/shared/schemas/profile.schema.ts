import { z } from 'zod';
import { emptyToNull } from '../utils/zod.utils';
import { 
    USER_GENDER_VALUES, 
    REPORT_STATUS_VALUES,
    PROFILE_UPDATE_TYPE_VALUES
} from '../types/enums.types';

export const internInfoSchema = z.object({
    university: z.string().min(1, "University is required"),
    year_level: z.number().int().min(1).max(8),
    program: z.string().min(1, "Program is required"),
    required_hours: z.number().min(0),
    start_date: z.string(),
});

export const profileUpdateRequestSchema = z.object({
    id: z.string().optional(),
    intern_id: z.string().optional(),
    submitted_at: z.string().optional(),
    status: z.enum(REPORT_STATUS_VALUES).default('pending'),
    admin_id: z.string().nullable().optional(),
    reviewed_at: z.string().nullable().optional(),
    admin_feedback: z.string().nullable().optional(),
    reason: z.string().min(5, "Reason must be at least 5 characters").nullable().optional(),
    
    update_type: z.enum(PROFILE_UPDATE_TYPE_VALUES),
    requested_data: z.any()
}).superRefine((data, ctx) => {
    if (data.update_type === 'avatar_update') {
        const result = z.object({ avatar_url: z.string().min(1, "Path is required"), }).safeParse(data.requested_data);
        if (!result.success) {
            result.error.issues.forEach((issue) => {
                ctx.addIssue({ ...issue, path: ['requested_data', ...issue.path] });
            });
        }
    } else if (data.update_type === 'information_update') {
        const result = z.object({
            first_name: z.string(),
            middle_name: z.string().optional(),
            last_name: z.string(),
            suffix: z.string().optional(),
            birth_date: z.string(),
            gender: emptyToNull.pipe(z.enum(USER_GENDER_VALUES)),
            contact_number: z
                .string()
                .transform((val) => val.replace(/[\s\-\(\)\+]/g, ''))
                .refine((val) => /^\d+$/.test(val), {
                    message: "Contact number must contain only digits.",
                })
                .refine((val) => val.length >= 10 && val.length <= 12, {
                    message: "Contact number must be between 10 and 13 digits.",
                }),
            address: z.string(),
            intern_info: internInfoSchema
        }).safeParse(data.requested_data);
        
        if (!result.success) {
            result.error.issues.forEach((issue) => {
                ctx.addIssue({ ...issue, path: ['requested_data', ...issue.path] });
            });
        }
    }
});