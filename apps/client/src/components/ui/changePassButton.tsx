type PrimaryButtonProps = {
    children: React.ReactNode;
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
    isLoading?: boolean;
    onClick?: () => void;
    className?: string;
};

function ChangePassButton({
    children,
    type = 'button',
    disabled = false,
    isLoading = false,
    onClick,
    className = '',
}: PrimaryButtonProps) {
    return (
        <button
        type={type}
        disabled={disabled || isLoading}
        onClick={onClick}
        className={`h-11 w-full rounded-md bg-[#ffbd13] text-sm font-medium text-black transition hover:bg-[#e8a900] disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
        >
        {isLoading ? 'Updating...' : children}
        </button>
    );
}

export default ChangePassButton;