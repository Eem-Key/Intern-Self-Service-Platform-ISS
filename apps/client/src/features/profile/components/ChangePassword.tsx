import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

import type { ChangePasswordFormValues } from '../../../../../shared/schemas/changePassword.schema';
import type { Profile } from '../../../../../shared/types/profile.types';
import ChangePassButton from '../../../components/ui/changePassButton';
import PasswordStrength from '../../../components/ui/passwordStrength';
import type { ChangePasswordErrors } from '../../../utils/validateChangePassword';
import validateChangePassword from '../../../utils/validateChangePassword';

import { updatePasswordAPI } from '../../../api/auth.api';
import { supabase } from '../../../config/supabase';
import PasswordStatusModal from './PasswordStatusModal';

type ProfileChangePasswordCardProps = {
    profile: Profile;
};

type ModalState =
    | null
    | {
        variant: 'confirm' | 'success' | 'failed' | 'error';
        title: string;
        message: string;
        };

function ProfileChangePasswordCard({ profile }: ProfileChangePasswordCardProps) {
    const [formValues, setFormValues] = useState<ChangePasswordFormValues>({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
    });

    const [isNewPasswordFocused, setIsNewPasswordFocused] = useState(false);
    const [errors, setErrors] = useState<ChangePasswordErrors>({});
    const [isLoading, setIsLoading] = useState(false);
    const [modalState, setModalState] = useState<ModalState>(null);

    const [showPassword, setShowPassword] = useState({
        currentPassword: false,
        newPassword: false,
        confirmNewPassword: false,
    });

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
    };

    const togglePasswordVisibility = (field: keyof ChangePasswordFormValues) => {
        if (!formValues[field]) return;

        setShowPassword((prev) => ({
        ...prev,
        [field]: !prev[field],
        }));
    };

    const resetForm = () => {
        setFormValues({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
        });

        setShowPassword({
        currentPassword: false,
        newPassword: false,
        confirmNewPassword: false,
        });

        setErrors({});
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const validationErrors = validateChangePassword(formValues);

        if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
        }

        setErrors({});

        setModalState({
        variant: 'confirm',
        title: 'Change Password?',
        message:
            'Are you sure you want to update your password? You will be required to use your new credentials for all future logins to the ISS Platform.',
        });
    };

    const handleConfirmChange = async () => {
        setIsLoading(true);

        try {
        const { error: authError } = await supabase.auth.signInWithPassword({
            email: profile.email,
            password: formValues.currentPassword,
        });

        if (authError) {
            setModalState({
            variant: 'failed',
            title: 'Password Update Failed',
            message:
                'The current password you entered is incorrect. Please check your credentials carefully and try again to ensure your account security.',
            });
            return;
        }

        const { error: updateError } = await updatePasswordAPI(
            formValues,
            profile.id
        );

        if (updateError) {
            setModalState({
            variant: 'error',
            title: 'Password Update Error',
            message:
                'An unexpected error occurred while updating your password. Please check your internet connection or try again later. If the problem persists, contact your system administrator.',
            });
            return;
        }

        resetForm();

        setModalState({
            variant: 'success',
            title: 'Password Updated!',
            message:
            'Your account security has been updated. To ensure your new credentials are active, you will be signed out. Please log in again using your new password.',
        });
        } catch {
        setModalState({
            variant: 'error',
            title: 'Password Update Error',
            message:
            'An unexpected error occurred while updating your password. Please check your internet connection or try again later. If the problem persists, contact your system administrator.',
        });
        } finally {
        setIsLoading(false);
        }
    };

    const handleCloseModal = async () => {
        if (modalState?.variant === 'success') {
        await supabase.auth.signOut();

        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('authUser');

        window.location.href = '/login';
        return;
        }

        setModalState(null);
    };

    return (
        <>
        <section className="flex flex-1 flex-col rounded-xl bg-white px-6 py-5 shadow-md">
            <div className="mb-4">
            <h2 className="border-l-4 border-[#FFBF10] pl-2 text-2xl font-bold">
                Change Password
            </h2>

            <p className="mt-2 text-xs leading-snug text-black">
                Update your account security by establishing a new, secure personal
                password for your account access.
            </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-1 flex-col">
            <div className="space-y-3 overflow-visible">
                <PasswordField
                id="currentPassword"
                label="Current Password"
                value={formValues.currentPassword}
                error={errors.currentPassword}
                showPassword={showPassword.currentPassword}
                onToggle={() => togglePasswordVisibility('currentPassword')}
                onChange={(value) => handleChange('currentPassword', value)}
                />

                <div className="relative">
                <PasswordField
                    id="newPassword"
                    label="New Password"
                    value={formValues.newPassword}
                    error={errors.newPassword}
                    showPassword={showPassword.newPassword}
                    onToggle={() => togglePasswordVisibility('newPassword')}
                    onChange={(value) => handleChange('newPassword', value)}
                    onFocus={() => setIsNewPasswordFocused(true)}
                    onBlur={() => setIsNewPasswordFocused(false)}
                    onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                        setIsNewPasswordFocused(false);
                    }
                    }}
                />

                {formValues.newPassword && isNewPasswordFocused && (
                    <div className="absolute left-0 right-0 top-full z-30 mt-1 rounded-md bg-white shadow-lg">
                    <PasswordStrength password={formValues.newPassword} />
                    </div>
                )}
                </div>

                <PasswordField
                id="confirmNewPassword"
                label="Confirm New Password"
                value={formValues.confirmNewPassword}
                error={errors.confirmNewPassword}
                showPassword={showPassword.confirmNewPassword}
                onToggle={() => togglePasswordVisibility('confirmNewPassword')}
                onChange={(value) => handleChange('confirmNewPassword', value)}
                />
            </div>

            <div className="mt-auto pt-5">
                <ChangePassButton
                type="submit"
                isLoading={isLoading}
                disabled={isLoading}
                className="mx-auto block max-w-[220px] rounded-full"
                >
                Save Changes
                </ChangePassButton>
            </div>
            </form>
        </section>

        {modalState && (
            <PasswordStatusModal
            variant={modalState.variant}
            title={modalState.title}
            message={modalState.message}
            isLoading={isLoading}
            onClose={handleCloseModal}
            onConfirm={handleConfirmChange}
            />
        )}
        </>
    );
}

type PasswordFieldProps = {
    id: keyof ChangePasswordFormValues;
    label: string;
    value: string;
    error?: string;
    showPassword: boolean;
    onToggle: () => void;
    onChange: (value: string) => void;
    onFocus?: () => void;
    onBlur?: () => void;
    onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
};

function PasswordField({
    id,
    label,
    value,
    error,
    showPassword,
    onToggle,
    onChange,
    onFocus,
    onBlur,
    onKeyDown,
}: PasswordFieldProps) {
    const canToggle = value.length > 0;

    return (
        <div>
        <label htmlFor={id} className="text-xs font-medium">
            {label}
        </label>

        <div className="relative">
            <input
                id={id}
                type={showPassword ? 'text' : 'password'}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                onFocus={onFocus}
                onBlur={onBlur}
                onKeyDown={onKeyDown}
                className="h-9 w-full rounded bg-[#eeeeee] px-3 pr-10 text-sm outline-none"
            />

            <button
            type="button"
            onClick={onToggle}
            disabled={!canToggle}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-black disabled:cursor-not-allowed disabled:opacity-40"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
            {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
        </div>

        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
    );
}

export default ProfileChangePasswordCard;