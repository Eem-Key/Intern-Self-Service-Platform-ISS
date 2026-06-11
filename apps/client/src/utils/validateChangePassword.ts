import { changePasswordSchema } from '../../../shared/schemas/changePassword.schema';
import type { ChangePasswordValues, ChangePasswordErrors } from '../../../shared/types/login.types';

const validateChangePassword = (
    formData: ChangePasswordValues
): ChangePasswordErrors => {
    const result = changePasswordSchema.safeParse(formData);

    if (result.success) {
        return {};
    }

    const errors: ChangePasswordErrors = {};

    result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof ChangePasswordValues;

        if (field) {
        errors[field] = issue.message;
        }
    });

    return errors;
};

export default validateChangePassword;