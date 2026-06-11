import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import FormInput from '../../../components/ui/formInput';
import PrimaryButton from '../../../components/ui/primaryButton';
import FirstLoginPrompt from './FirstLogin';
import ChangePasswordModal from './ChangePassword';
import { loginUserAPI } from '../../../api/auth.api';
import validateForm from '../../../utils/ValidateForm';
import type { 
    LoginFormValues, 
    LoginErrors,
    LoginResponse 
} from '../../../../../shared/types/login.types';

function LoginForm() {
    const navigate = useNavigate();

    const [formValues, setFormValues] = useState<LoginFormValues>({
        email: '',
        password: '',
    });

    const [errors, setErrors] = useState<LoginErrors>({});
    const [serverError, setServerError] = useState('');
    const [firstLoginData, setFirstLoginData] = useState<LoginResponse | null>(null);
    const [showChangePassword, setShowChangePassword] = useState(false);

    const getDashboardRoute = (role?: string) => {
        const normalizedRole = role?.toLowerCase();

        if (normalizedRole === 'admin' || normalizedRole === 'supervisor') {
        return '/admin/dashboard';
        }

        return '/intern/dashboard';
    };

    const clearError = (field: keyof LoginFormValues) => {
        setErrors((prev) => ({
        ...prev,
        [field]: undefined,
        }));
    };

    const loginMutation = useMutation({
    mutationFn: loginUserAPI,

        onSuccess: (response) => {
            const { accessToken, refreshToken, user } =
                response.data;

            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('authUser', JSON.stringify(user));

            if (refreshToken) {
                localStorage.setItem('refreshToken', refreshToken);
            }

            const role = user.role?.toLowerCase();
            const isIntern = role === 'intern';

            if (isIntern && user.requires_password_change) {
                setFirstLoginData(response);
                return;
            }

            navigate(getDashboardRoute(role));
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
        setShowChangePassword(true);
    };

    const handleChangeLater = () => {
        if (!firstLoginData) return;

        const dashboardRoute = getDashboardRoute(firstLoginData.data.user.role);

        setFirstLoginData(null);
        setShowChangePassword(false);
        navigate(dashboardRoute);
    };

    const handlePasswordUpdated = () => {
        if (!firstLoginData) return;

        const dashboardRoute = getDashboardRoute(firstLoginData.data.user.role);

        setShowChangePassword(false);
        setFirstLoginData(null);
        navigate(dashboardRoute);
    };

    return (
        <>
        {firstLoginData && !showChangePassword && (
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
            type="email"
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