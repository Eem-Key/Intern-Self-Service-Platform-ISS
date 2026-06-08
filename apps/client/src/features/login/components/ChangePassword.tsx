import { useState } from 'react';
import React from 'react';

import FormInput from '../../../components/ui/formInput';
import PasswordStrength from '../../../components/ui/passwordStrength';

import validateChangePassword from '../../../utils/validateChangePassword';
import type { ChangePasswordErrors,} from '../../../utils/validateChangePassword';
import type { ChangePasswordFormValues,} from '../../../../../shared/schemas/changePassword.schema';

import { updatePasswordAPI } from '../../../api/auth.api';
import { supabase } from '../../../config/supabase';
import ChangePassButton from '../../../components/ui/changePassButton';

type ChangePasswordModalProps = {
    onSuccess: () => void;
    id: string;
    email: string;
};

function ChangePasswordModal({ onSuccess, id , email}: ChangePasswordModalProps) {
    const [formValues, setFormValues] = useState<ChangePasswordFormValues>({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
    });

    const [errors, setErrors] = useState<ChangePasswordErrors>({});
    const [serverError, setServerError] = useState('');

    const handleChange = (
        field: keyof ChangePasswordFormValues,
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
            const { error: authError } = await supabase.auth.signInWithPassword({
                email: email,
                password: formValues.currentPassword,
            });

            if (authError) {
                setServerError("Incorrect current password.");
                return;
            }
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
                id="currentPassword"
                label="Current Password"
                type="password"
                value={formValues.currentPassword}
                error={errors.currentPassword}
                onChange={(value) => handleChange('currentPassword', value)}
                />

                <div>
                <FormInput
                    id="newPassword"
                    label="New Password"
                    type="password"
                    value={formValues.newPassword}
                    error={errors.newPassword}
                    onChange={(value) => handleChange('newPassword', value)}
                />

                <PasswordStrength password={formValues.newPassword} />
                </div>

                <FormInput
                id="confirmNewPassword"
                label="Confirm New Password"
                type="password"
                value={formValues.confirmNewPassword}
                error={errors.confirmNewPassword}
                onChange={(value) => handleChange('confirmNewPassword', value)}
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