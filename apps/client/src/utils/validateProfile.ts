import { profileUpdateRequestSchema } from '../../../shared/schemas/profile.schema';
import type { ProfileUpdateRequestForm } from '../../../shared/types/profile.types';

export const validateProfileUpdateRequest = (data: ProfileUpdateRequestForm) => {
    const result = profileUpdateRequestSchema.safeParse(data);
    
    if (result.success) {
        return {};
    }

    const formattedErrors = result.error.issues.reduce((acc, issue) => {
        const path = issue.path.join('.');
        acc[path] = issue.message;
        return acc;
    }, {} as Record<string, string>);

    return formattedErrors;
};