import { supabase } from '../../../config/supabase';
import { useState, useEffect } from 'react';
import React from 'react';
import { Eye, EyeOff, CheckCircle } from 'lucide-react';

import PasswordStrength from '../../../components/ui/passwordStrength';
import ChangePassButton from '../../../components/ui/changePassButton';

import { setupFirstPasswordAPI } from '../../../api/auth.api';

type SetupPasswordValues = {
    new_password: string;
    confirm_new_password: string;
};

type SetupPasswordErrors = {
    new_password?: string;
    confirm_new_password?: string;
};

type ChangePasswordModalProps = {
    onSuccess: () => void;
    id: string;
    email: string;
};

type ModalState =
    | null
    | {
          variant: 'success' | 'error';
          title: string;
          message: string;
      };

function ChangePasswordModal(_props: ChangePasswordModalProps) {
    const [formValues, setFormValues] = useState<SetupPasswordValues>({
        new_password: '',
        confirm_new_password: '',
    });

    const [showPassword, setShowPassword] = useState({
        new_password: false,
        confirm_new_password: false,
    });

    const [errors, setErrors] = useState<SetupPasswordErrors>({});
    const [serverError, setServerError] = useState('');
    const [isNewPasswordFocused, setIsNewPasswordFocused] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isAuth, setIsAuth] = useState(false);

    const [showSetupModal, setShowSetupModal] = useState(true);
    const [modalState, setModalState] = useState<ModalState>(null);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setIsAuth(!!session);
        });
    }, []);

    if (!isAuth) return null;

    const clearStoredAuth = () => {
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('refreshToken');
        sessionStorage.removeItem('authUser');

        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('authUser');
    };

    const togglePasswordVisibility = (field: keyof SetupPasswordValues) => {
        if (!formValues[field]) return;

        setShowPassword((prev) => ({
            ...prev,
            [field]: !prev[field],
        }));
    };

    const handleChange = (field: keyof SetupPasswordValues, value: string) => {
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

    const validateSetupPassword = () => {
        const newErrors: SetupPasswordErrors = {};

        if (!formValues.new_password.trim()) {
            newErrors.new_password = 'New password is required.';
        } else if (formValues.new_password.length < 8) {
            newErrors.new_password = 'Password must be at least 8 characters.';
        } else if (!/[A-Z]/.test(formValues.new_password)) {
            newErrors.new_password =
                'Password must contain at least one uppercase letter.';
        } else if (!/[a-z]/.test(formValues.new_password)) {
            newErrors.new_password =
                'Password must contain at least one lowercase letter.';
        } else if (!/\d/.test(formValues.new_password)) {
            newErrors.new_password =
                'Password must contain at least one number.';
        }

        if (!formValues.confirm_new_password.trim()) {
            newErrors.confirm_new_password = 'Please confirm your new password.';
        } else if (formValues.new_password !== formValues.confirm_new_password) {
            newErrors.confirm_new_password = 'Passwords do not match.';
        }

        return newErrors;
    };

    const resetForm = () => {
        setFormValues({
            new_password: '',
            confirm_new_password: '',
        });

        setShowPassword({
            new_password: false,
            confirm_new_password: false,
        });

        setErrors({});
        setServerError('');
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setServerError('');

        const validationErrors = validateSetupPassword();

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setErrors({});
        setIsSubmitting(true);

        try {
            const { error: updateError } = await setupFirstPasswordAPI(
                formValues.new_password,
                formValues.confirm_new_password
            );

            if (updateError) {
                setServerError(updateError);
                return;
            }

            resetForm();

            // Close set up password modal first.
            setShowSetupModal(false);

            // Then show success modal.
            setModalState({
                variant: 'success',
                title: 'Password Set Up Successfully!',
                message:
                    'Your password has been created successfully. Please log in again using your new password.',
            });
        } catch {
            setServerError(
                'An unexpected error occurred while setting up your password. Please check your internet connection or try again later.'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCloseStatusModal = async () => {
        if (modalState?.variant === 'success') {
            await supabase.auth.signOut();

            clearStoredAuth();

            setModalState(null);

            window.location.href = '/login';
            return;
        }

        setModalState(null);
        setShowSetupModal(true);
    };

    return (
        <>
            {showSetupModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4">
                    <div className="w-full max-w-[530px] overflow-hidden rounded-2xl bg-white shadow-xl">
                        <div className="bg-gradient-to-r from-[#005de8] to-[#003d8f] px-10 py-7">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-[3px] rounded-full bg-[#ffbd13]" />

                                <h2 className="text-3xl font-bold text-white">
                                    Set Up Password
                                </h2>
                            </div>
                        </div>

                        <div className="px-10 py-6">
                            <p className="mb-5 text-sm leading-snug text-black">
                                Please create a secure personal password to finish
                                setting up your intern account.
                            </p>

                            {serverError && (
                                <div className="mb-4 rounded-md bg-red-100 px-4 py-2 text-sm text-red-600">
                                    {serverError}
                                </div>
                            )}

                            <form
                                onSubmit={handleSubmit}
                                className="space-y-3 text-left"
                            >
                                <div className="relative">
                                    <PasswordField
                                        id="new_password"
                                        label="New Password"
                                        value={formValues.new_password}
                                        error={errors.new_password}
                                        showPassword={showPassword.new_password}
                                        onToggle={() =>
                                            togglePasswordVisibility(
                                                'new_password'
                                            )
                                        }
                                        onChange={(value) =>
                                            handleChange('new_password', value)
                                        }
                                        onFocus={() =>
                                            setIsNewPasswordFocused(true)
                                        }
                                        onBlur={() =>
                                            setIsNewPasswordFocused(false)
                                        }
                                        onKeyDown={(event) => {
                                            if (event.key === 'Enter') {
                                                setIsNewPasswordFocused(false);
                                            }
                                        }}
                                    />

                                    {formValues.new_password &&
                                        isNewPasswordFocused && (
                                            <div className="absolute left-0 right-0 top-full z-30 mt-1 rounded-md bg-white shadow-lg">
                                                <PasswordStrength
                                                    password={
                                                        formValues.new_password
                                                    }
                                                />
                                            </div>
                                        )}
                                </div>

                                <PasswordField
                                    id="confirm_new_password"
                                    label="Confirm New Password"
                                    value={formValues.confirm_new_password}
                                    error={errors.confirm_new_password}
                                    showPassword={
                                        showPassword.confirm_new_password
                                    }
                                    onToggle={() =>
                                        togglePasswordVisibility(
                                            'confirm_new_password'
                                        )
                                    }
                                    onChange={(value) =>
                                        handleChange(
                                            'confirm_new_password',
                                            value
                                        )
                                    }
                                />

                                <ChangePassButton
                                    type="submit"
                                    className="mt-6"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Saving...' : 'Set Password'}
                                </ChangePassButton>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {modalState && (
                <SetupPasswordStatusModal
                    title={modalState.title}
                    message={modalState.message}
                    onClose={handleCloseStatusModal}
                />
            )}
        </>
    );
}

type PasswordFieldProps = {
    id: keyof SetupPasswordValues;
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
    return (
        <div>
            <label
                htmlFor={id}
                className="mb-1 block text-sm font-medium text-black"
            >
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
                    className={`h-11 w-full rounded-md bg-[#eeeeee] px-3 pr-10 text-sm outline-none ${
                        error ? 'ring-1 ring-red-500' : ''
                    }`}
                />

                <button
                    type="button"
                    onClick={onToggle}
                    disabled={!value}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-black disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                    {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
            </div>

            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
    );
}

function SetupPasswordStatusModal({
    title,
    message,
    onClose,
}: {
    title: string;
    message: string;
    onClose: () => void;
}) {
    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/45 px-4">
            <div className="w-full max-w-[530px] overflow-hidden rounded-2xl bg-white shadow-xl">
                <div className="bg-gradient-to-r from-[#005de8] to-[#003d8f] px-6 py-5">
                    <div className="flex items-center gap-3">
                        <CheckCircle size={24} className="text-[#FFBF10]" />

                        <h2 className="text-xl font-bold text-white sm:text-2xl">
                            {title}
                        </h2>
                    </div>
                </div>

                <div className="px-6 py-7">
                    <p className="text-sm leading-relaxed text-black">
                        {message}
                    </p>

                    <div className="mt-7 flex justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-full bg-[#FFBF10] px-8 py-2 text-sm font-bold text-black transition hover:bg-[#e5aa0e]"
                        >
                            Got it
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ChangePasswordModal;