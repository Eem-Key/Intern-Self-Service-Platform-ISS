type PasswordStrengthProps = {
    password: string;
};

type StrengthLevel = {
    label: 'Weak' | 'Fair' | 'Good' | 'Strong';
    filledBars: number;
    color: string;
    textColor: string;
};

function getPasswordStrength(password: string): StrengthLevel {
    const hasMinLength = password.length >= 8;
    const hasUpperLower = /[a-z]/.test(password) && /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);

    const score = [hasMinLength, hasUpperLower, hasNumber].filter(Boolean).length;

    if (score <= 1) {
        return {
        label: 'Weak',
        filledBars: 1,
        color: 'bg-red-500',
        textColor: 'text-red-600',
        };
    }

    if (score === 2) {
        return {
        label: 'Fair',
        filledBars: 2,
        color: 'bg-yellow-400',
        textColor: 'text-yellow-600',
        };
    }

    if (password.length >= 12) {
        return {
        label: 'Strong',
        filledBars: 4,
        color: 'bg-green-500',
        textColor: 'text-green-600',
        };
    }

    return {
        label: 'Good',
        filledBars: 3,
        color: 'bg-green-500',
        textColor: 'text-green-600',
    };
}

function PasswordStrength({ password }: PasswordStrengthProps) {
    if (!password) return null;

    const hasMinLength = password.length >= 8;
    const hasUpperLower = /[a-z]/.test(password) && /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);

    const strength = getPasswordStrength(password);

    return (
        <div className="mt-3 rounded-md bg-[#eeeeee] px-4 py-3">
        <div className="grid grid-cols-4 gap-1">
            {Array.from({ length: 4 }).map((_, index) => {
            const isFilled = index < strength.filledBars;

            return (
            <div
                key={index}
                className={`h-1.5 rounded-full ${
                    isFilled
                    ? strength.color
                    : `border ${strength.textColor} bg-transparent`
                }`}
                />
            );
            })}
        </div>

        <p className={`mt-1 text-xs ${strength.textColor}`}>
            {strength.label}
        </p>

        <ul className="mt-1 space-y-0.5 text-xs">
            <li className={hasMinLength ? 'text-green-600' : 'text-red-600'}>
            • <span className="text-black">Minimum of 8 characters length</span>
            </li>

            <li className={hasUpperLower ? 'text-green-600' : 'text-red-600'}>
            • <span className="text-black">Mix of uppercase & lowercase</span>
            </li>

            <li className={hasNumber ? 'text-green-600' : 'text-red-600'}>
            • <span className="text-black">At least one number (0-9)</span>
            </li>
        </ul>
        </div>
    );
}

export default PasswordStrength;