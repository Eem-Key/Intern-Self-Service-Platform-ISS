import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import FormInput from '../../components/ui/formInput';
import PrimaryButton from '../../components/ui/primaryButton';
import FirstLoginPrompt from './FirstLogin';
import ChangePasswordModal from './ChangePassword';
import { loginUserAPI } from '../../api/auth.api';
import validateForm from './ValidateForm';
import type { LoginFormValues, LoginResponse } from '../../../../shared/types/login.types';

type LoginErrors = Partial<Record<keyof LoginFormValues, string>>;

function LoginForm() {
    const navigate = useNavigate();

    const [formValues, setFormValues] = useState<LoginFormValues>({
        email: '',
        password: '',
    });

    const [errors, setErrors] = useState<LoginErrors>({});
    const [serverError, setServerError] = useState('');
    const [firstLoginData, setFirstLoginData] = useState<LoginResponse | null>(
        null
    );
    const [showChangePassword, setShowChangePassword] = useState(false);

    const clearError = (field: keyof LoginFormValues) => {
        setErrors((prev) => ({
        ...prev,
        [field]: undefined,
        }));
    };

    const loginMutation = useMutation({
        mutationFn: loginUserAPI,

        onSuccess: (response) => {
        const { accessToken, refreshToken, user, requiresPasswordChange } =
            response.data;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('authUser', JSON.stringify(user));

        if (refreshToken) {
            localStorage.setItem('refreshToken', refreshToken);
        }

        if (requiresPasswordChange) {
            setFirstLoginData(response);
            return;
        }

        navigate('/dashboard');
        },

        onError: (error) => {
        setServerError(error.message || 'Incorrect email address or password.');
        },
    });

    const handleChange = (field: keyof LoginFormValues, value: string) => {
        setFormValues((prev) => ({
        ...prev,
        [field]: value,
        }));

        clearError(field);
        setServerError('');
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const validationErrors = validateForm(formValues);

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setErrors({});
        loginMutation.mutate(formValues);
    };

    const handleChangePassword = () => {
        setFirstLoginData(null);
        setShowChangePassword(true);
    };

    const handleChangeLater = () => {
        setFirstLoginData(null);
        navigate('/dashboard');
    };

    const handlePasswordUpdated = () => {
        setShowChangePassword(false);
        navigate('/dashboard');
    };

    return (
        <>
        {firstLoginData && (
            <FirstLoginPrompt
            internName={firstLoginData.data.user.first_name || 'Intern'}
            onChangePassword={handleChangePassword}
            onChangeLater={handleChangeLater}
            />
        )}

        {showChangePassword && firstLoginData?.data.user.email && (
            <ChangePasswordModal 
                onSuccess={handlePasswordUpdated} 
                id={firstLoginData.data.user.id}
                email={firstLoginData.data.user.email} 
            />
        )}

        {serverError && (
            <div className="mb-4 flex items-center justify-between gap-3 rounded-md bg-red-200 px-4 py-3 text-sm text-red-600">
            <span>{serverError}</span>

            <button
                type="button"
                onClick={() => setServerError('')}
                className="font-bold text-red-600"
                aria-label="Dismiss error"
            >
                ×
            </button>
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <FormInput
            id="email"
            label="Email Address"
            type="text"
            value={formValues.email}
            error={errors.email}
            onChange={(value) => handleChange('email', value)}
            />

            <FormInput
            id="password"
            label="Password"
            type="password"
            value={formValues.password}
            error={errors.password}
            onChange={(value) => handleChange('password', value)}
            />

            <PrimaryButton type="submit" isLoading={loginMutation.isPending}>
            Log In
            </PrimaryButton>
        </form>
        </>
    );
}

export default LoginForm;