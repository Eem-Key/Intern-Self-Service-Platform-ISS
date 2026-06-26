import { supabase } from '../../../config/supabase';
import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

import FormInput from '../../../components/ui/formInput';
import PrimaryButton from '../../../components/ui/primaryButton';
import ChangePasswordModal from './ChangePassword';

import { loginUserAPI } from '../../../api/login.api';
import { fetchUserProfileAPI } from '../../../api/profile.api';
import validateForm from '../../../utils/ValidateForm';

import type {
    LoginFormValues,
    LoginErrors,
} from '../../../../../shared/types/login.types';
import type { UserProfile } from '../../../../../shared/types/profile.types';
import type { UserRole } from '../../../../../shared/types/enums.types';

function LoginForm() {
    const navigate = useNavigate();

    const [formValues, setFormValues] = useState<LoginFormValues>({
        email: '',
        password: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<LoginErrors>({});
    const [serverError, setServerError] = useState('');

    const [setupPasswordUser, setSetupPasswordUser] =
        useState<UserProfile | null>(null);
    const [showChangePassword, setShowChangePassword] = useState(false);

    const getDashboardRoute = (role?: UserRole) => {
        const normalizedRole = role?.toLowerCase();

        if (normalizedRole === 'admin') {
            return '/admin/dashboard';
        }

        return '/intern/dashboard';
    };

    const saveAuthSession = ({
        accessToken,
        refreshToken,
        user,
    }: {
        accessToken: string;
        refreshToken?: string;
        user: UserProfile;
    }) => {
        sessionStorage.setItem('accessToken', accessToken);
        sessionStorage.setItem('authUser', JSON.stringify(user));

        if (refreshToken) {
            sessionStorage.setItem('refreshToken', refreshToken);
        }

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('authUser', JSON.stringify(user));

        if (refreshToken) {
            localStorage.setItem('refreshToken', refreshToken);
        }
    };

    const clearStoredAuth = () => {
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('refreshToken');
        sessionStorage.removeItem('authUser');

        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('authUser');
    };

    useEffect(() => {
        let isMounted = true;

        const checkInviteSession = async () => {
            const {
                data: { session },
            } = await supabase.auth.getSession();

            if (!session?.user?.id){
                console.log("No active session found on load.");
                return;
            }

            try {
                console.log(session.user.id)
                const userProfile = await fetchUserProfileAPI(session.user.id);

                console.log(userProfile)
                saveAuthSession({
                    accessToken: session.access_token,
                    refreshToken: session.refresh_token,
                    user: userProfile,
                });

                const role = userProfile.role?.toLowerCase();
                const isIntern = role === 'intern';

                if (isIntern && userProfile.requires_password_change) {
                    if (isMounted) {
                        setSetupPasswordUser(userProfile);
                        setShowChangePassword(true);
                    }

                    return;
                }

                if (isMounted) {
                    navigate(getDashboardRoute(role), { replace: true });
                }
            } catch (error) {
                console.error('Error checking invite session:', error);

                clearStoredAuth();
                await supabase.auth.signOut();
                navigate('/login', { replace: true });
            }
        };

        checkInviteSession();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
                if (session?.user?.id) {
                    checkInviteSession();
                }
            }
        });

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, [navigate]);

    const clearError = (field: keyof LoginFormValues) => {
        setErrors((prev) => ({
            ...prev,
            [field]: undefined,
        }));
    };

    const loginMutation = useMutation({
        mutationFn: loginUserAPI,

        onSuccess: (response) => {
            const { accessToken, refreshToken, user } = response.data;

            console.log(accessToken)
            console.log(refreshToken)
            console.log(user)

            saveAuthSession({
                accessToken,
                refreshToken,
                user,
            });

            const role = user.role?.toLowerCase();
            const isIntern = role === 'intern';

            if (isIntern && user.requires_password_change) {
                setSetupPasswordUser(user);
                setShowChangePassword(true);
                return;
            }

            navigate(getDashboardRoute(role), { replace: true });
        },

        onError: (error) => {
            setServerError(
                error.message || 'Incorrect email address or password.'
            );
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

    const handlePasswordUpdated = async () => {
        if (!setupPasswordUser) return;

        const {
            data: { session },
        } = await supabase.auth.getSession();

        if (session?.access_token) {
            const updatedUser = {
                ...setupPasswordUser,
                requires_password_change: false,
            };

            saveAuthSession({
                accessToken: session.access_token,
                refreshToken: session.refresh_token,
                user: updatedUser,
            });
        }

        const dashboardRoute = getDashboardRoute(setupPasswordUser.role);

        setShowChangePassword(false);
        setSetupPasswordUser(null);

        navigate(dashboardRoute, { replace: true });
    };

return (
    <>
        {showChangePassword && setupPasswordUser?.email && (
            <ChangePasswordModal
                onSuccess={handlePasswordUpdated}
                id={setupPasswordUser.id}
                email={setupPasswordUser.email}
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

            <PasswordField
                id="password"
                label="Password"
                value={formValues.password}
                error={errors.password}
                showPassword={showPassword}
                onToggle={() => {
                    if (!formValues.password) return;
                    setShowPassword((prev) => !prev);
                }}
                onChange={(value) => handleChange('password', value)}
            />

            <PrimaryButton type="submit" isLoading={loginMutation.isPending}>
                Log In
            </PrimaryButton>
        </form>
    </>
);
}

type PasswordFieldProps = {
    id: string;
    label: string;
    value: string;
    error?: string;
    showPassword: boolean;
    onToggle: () => void;
    onChange: (value: string) => void;
};

function PasswordField({
    id,
    label,
    value,
    error,
    showPassword,
    onToggle,
    onChange,
}: PasswordFieldProps) {
    const canToggle = value.length > 0;

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
                    className={`h-11 w-full rounded-md bg-[#eeeeee] px-3 pr-10 text-sm outline-none ${
                        error ? 'ring-1 ring-red-500' : ''
                    }`}
                />

                <button
                    type="button"
                    onClick={onToggle}
                    disabled={!canToggle}
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

export default LoginForm;