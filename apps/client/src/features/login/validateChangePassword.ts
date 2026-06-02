import { changePasswordSchema } from '../../../../shared/schemas/changePassword.schema';
import type { ChangePasswordFormValues } from '../../../../shared/schemas/changePassword.schema';

export type ChangePasswordErrors = Partial<
    Record<keyof ChangePasswordFormValues, string>
>;

const validateChangePassword = (
    formData: ChangePasswordFormValues
): ChangePasswordErrors => {
    const result = changePasswordSchema.safeParse(formData);

    if (result.success) {
        return {};
    }

    const errors: ChangePasswordErrors = {};

    result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof ChangePasswordFormValues;

        if (field) {
        errors[field] = issue.message;
        }
    });

    return errors;
};

export default validateChangePassword;