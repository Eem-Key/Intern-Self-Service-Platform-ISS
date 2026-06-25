import { z } from 'zod';

import { supabase } from '../config/supabase';

export const internEmailSchema = z.object({
    email: z
        .string()
        .trim()
        .min(1, 'Email address is required.')
        .email('Please enter a valid email address.'),
});

export async function validateInternEmailBeforeCreate(email: string): Promise<{
    isValid: boolean;
    message?: string;
}> {
    const parsed = internEmailSchema.safeParse({ email });

    if (!parsed.success) {
        return {
            isValid: false,
            message:
                parsed.error.flatten().fieldErrors.email?.[0] ||
                'Please enter a valid email address.',
        };
    }

    const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', parsed.data.email)
        .maybeSingle();

    if (error) {
        return {
            isValid: false,
            message:
                'We could not create the intern profile at this time. Please review the information and try again.',
        };
    }

    if (data) {
        return {
            isValid: false,
            message: 'Email address already exists in the system.',
        };
    }

    return {
        isValid: true,
    };
}