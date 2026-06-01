type SecondaryButtonProps = {
  children: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  onClick?: () => void;
};

function SecondaryButton({
  children,
  type = 'button',
  disabled = false,
  onClick,
}: SecondaryButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className="h-11 w-full rounded-md bg-[#eeeeee] text-sm font-medium text-black transition hover:bg-[#dddddd] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {children}
    </button>
  );
}

export default SecondaryButton;