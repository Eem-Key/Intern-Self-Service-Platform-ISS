import { z } from 'zod';

export const changePasswordSchema = z
    .object({
    current_password: z.string().trim().min(1, 'This field is required'),

    new_password: z
        .string()
        .trim()
        .min(1, 'This field is required')
        .min(8, 'Password must be at least 8 characters')
        .regex(/[a-z]/, 'Password must include a lowercase letter')
        .regex(/[A-Z]/, 'Password must include an uppercase letter')
        .regex(/\d/, 'Password must include at least one number'),

        confirm_new_password: z.string().trim().min(1, 'This field is required'),
    })
    .refine((data) => data.new_password === data.confirm_new_password, {
        message: 'Passwords do not match',
        path: ['confirm_new_password'],
    })
    .refine((data) => data.current_password !== data.new_password, {
        message: 'New password must be different from current password',
        path: ['new_password'],
    });