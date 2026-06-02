import { z } from 'zod';

export const changePasswordSchema = z
    .object({
    currentPassword: z.string().trim().min(1, 'This field is required'),

    newPassword: z
        .string()
        .trim()
        .min(1, 'This field is required')
        .min(8, 'Password must be at least 8 characters')
        .regex(/[a-z]/, 'Password must include a lowercase letter')
        .regex(/[A-Z]/, 'Password must include an uppercase letter')
        .regex(/\d/, 'Password must include at least one number'),

        confirmNewPassword: z.string().trim().min(1, 'This field is required'),
    })
    .refine((data) => data.newPassword === data.confirmNewPassword, {
        message: 'Passwords do not match',
        path: ['confirmNewPassword'],
    })
    .refine((data) => data.currentPassword !== data.newPassword, {
        message: 'New password must be different from current password',
        path: ['newPassword'],
    });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;