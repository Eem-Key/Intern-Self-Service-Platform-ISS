import { useState } from 'react';
import React from 'react';

import FormInput from '../../../components/ui/formInput';
import PasswordStrength from '../../../components/ui/passwordStrength';

import validateChangePassword from '../../../utils/validateChangePassword';
import type { 
    ChangePasswordValues,
    ChangePasswordErrors,
} from '../../../../../shared/types/login.types';

import { updatePasswordAPI } from '../../../api/auth.api';
import ChangePassButton from '../../../components/ui/changePassButton';

type ChangePasswordModalProps = {
    onSuccess: () => void;
    id: string;
    email: string;
};

function ChangePasswordModal({ onSuccess, id , email}: ChangePasswordModalProps) {
    const [formValues, setFormValues] = useState<ChangePasswordValues>({
        current_password: '',
        new_password: '',
        confirm_new_password: '',
    });

    const [errors, setErrors] = useState<ChangePasswordErrors>({});
    const [serverError, setServerError] = useState('');

    const handleChange = (
        field: keyof ChangePasswordValues,
        value: string
    ) => {
        setFormValues((prev) => ({
        ...prev,
        [field]: value,
        }));

        setErrors((prev) => ({
        ...prev,
        [field]: undefined,
        }));

        setServerError('');
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setServerError('');

        const validationErrors = validateChangePassword(formValues);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        setErrors({});

        try {
            const { error: updateError } = await updatePasswordAPI(formValues, id);

            if (updateError) {
                const errorMessage = typeof updateError === 'object' && updateError !== null && 'message' in updateError
                    ? (updateError as any).message
                    : String(updateError);

                setServerError(errorMessage);
                return;
            }

            onSuccess();
        } catch (err) {
            setServerError("An unexpected error occurred.");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4">
        <div className="w-full max-w-[530px] overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="bg-gradient-to-r from-[#005de8] to-[#003d8f] px-10 py-7">
            <div className="flex items-center gap-3">
                <div className="h-10 w-[3px] rounded-full bg-[#ffbd13]" />

                <h2 className="text-3xl font-bold text-white">
                Change Password
                </h2>
            </div>
            </div>

            <div className="px-10 py-6">
            <p className="mb-5 text-sm leading-snug text-black">
                To ensure the integrity of our records, all new interns are required
                to establish a secure personal password upon their first login.
            </p>

            {serverError && (
                <div className="mb-4 rounded-md bg-red-100 px-4 py-2 text-sm text-red-600">
                {serverError}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 text-left">
                <FormInput
                id="current_password"
                label="Current Password"
                type="password"
                value={formValues.current_password}
                error={errors.current_password}
                onChange={(value) => handleChange('current_password', value)}
                />

                <div>
                <FormInput
                    id="new_password"
                    label="New Password"
                    type="password"
                    value={formValues.new_password}
                    error={errors.new_password}
                    onChange={(value) => handleChange('new_password', value)}
                />

                <PasswordStrength password={formValues.new_password} />
                </div>

                <FormInput
                id="confirm_new_password"
                label="Confirm New Password"
                type="password"
                value={formValues.confirm_new_password}
                error={errors.confirm_new_password}
                onChange={(value) => handleChange('confirm_new_password', value)}
                />

                <ChangePassButton type="submit" className="mt-6">
                Update Password
                </ChangePassButton>
            </form>
            </div>
        </div>
        </div>
    );
}

export default ChangePasswordModal;