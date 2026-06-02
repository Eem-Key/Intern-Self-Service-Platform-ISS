import { loginSchema } from '../../../../shared/schemas/login.schema';
import type { LoginFormValues } from '../../../../shared/types/login.types';

type LoginErrors = Partial<Record<keyof LoginFormValues, string>>;

const validateForm = (formData: LoginFormValues): LoginErrors => {
    const result = loginSchema.safeParse(formData);

    if (result.success) {
        return {};
    }

    const errors: LoginErrors = {};

    result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof LoginFormValues;

        if (field) {
        errors[field] = issue.message;
        }
    });

    return errors;
};

export default validateForm;