import { useState } from 'react';
import React from 'react';

import PasswordStrength from '../../../components/ui/passwordStrength';

import validateChangePassword from '../../../utils/validateChangePassword';
import type { 
    ChangePasswordValues,
    ChangePasswordErrors,
} from '../../../../../shared/types/login.types';

import { updatePasswordAPI } from '../../../api/auth.api';
import ChangePassButton from '../../../components/ui/changePassButton';
import { Eye, EyeOff } from 'lucide-react';

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

    const [showPassword, setShowPassword] = useState({
        current_password: false,
        new_password: false,
        confirm_new_password: false,
    });


    const togglePasswordVisibility = (field: keyof ChangePasswordValues) => {
        if (!formValues[field]) return;

        setShowPassword((prev) => ({
            ...prev,
            [field]: !prev[field],
        }));
    };
    const [errors, setErrors] = useState<ChangePasswordErrors>({});
    const [serverError, setServerError] = useState('');
    const [isNewPasswordFocused, setIsNewPasswordFocused] = useState(false);

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
                <PasswordField
                    id="current_password"
                    label="Current Password"
                    value={formValues.current_password}
                    error={errors.current_password}
                    showPassword={showPassword.current_password}
                    onToggle={() => togglePasswordVisibility('current_password')}
                    onChange={(value) => handleChange('current_password', value)}
                />

                <div className="relative">
                    <PasswordField
                        id="new_password"
                        label="New Password"
                        value={formValues.new_password}
                        error={errors.new_password}
                        showPassword={showPassword.new_password}
                        onToggle={() => togglePasswordVisibility('new_password')}
                        onChange={(value) => handleChange('new_password', value)}
                        onFocus={() => setIsNewPasswordFocused(true)}
                        onBlur={() => setIsNewPasswordFocused(false)}
                        onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                            setIsNewPasswordFocused(false);
                        }
                        }}
                    />

                    {formValues.new_password && isNewPasswordFocused && (
                        <div className="absolute left-0 right-0 top-full z-30 mt-1 rounded-md bg-white shadow-lg">
                        <PasswordStrength password={formValues.new_password} />
                        </div>
                    )}
                </div>

                <PasswordField
                    id="confirm_new_password"
                    label="Confirm New Password"
                    value={formValues.confirm_new_password}
                    error={errors.confirm_new_password}
                    showPassword={showPassword.confirm_new_password}
                    onToggle={() => togglePasswordVisibility('confirm_new_password')}
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

type PasswordFieldProps = {
    id: keyof ChangePasswordValues;
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
        <label htmlFor={id} className="mb-1 block text-sm font-medium text-black">
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

export default ChangePasswordModal;