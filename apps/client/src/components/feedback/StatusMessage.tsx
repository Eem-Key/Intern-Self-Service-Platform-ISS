import { createPortal } from 'react-dom';

type StatusMessageVariant = 'success' | 'error';

type StatusMessageProps = {
  variant: StatusMessageVariant;
  title: string;
  message: string;
  className?: string;
  isFixed?: boolean;
  onClose?: () => void;
};

function StatusMessage({
  variant,
  title,
  message,
  className = '',
  isFixed = false,
  onClose,
}: StatusMessageProps) {
  const isSuccess = variant === 'success';

  const headerColor = isSuccess ? 'bg-[#08B833]' : 'bg-[#E60000]';
  const bodyColor = isSuccess ? 'bg-[#158D34]/85' : 'bg-[#FF1F1F]/90';

  const messageContent = (
    <div
      className={`w-full overflow-hidden rounded-lg text-white shadow-lg sm:rounded-xl ${className}`}
    >
      <div className={`${headerColor} px-4 py-2.5 sm:px-6 sm:py-3`}>
        <h3 className="text-base font-bold leading-snug sm:text-lg md:text-xl">
          {title}
        </h3>
      </div>

      <div className={`${bodyColor} px-4 py-3 sm:px-6 sm:py-4`}>
        <p className="text-xs font-medium leading-snug sm:text-sm md:text-base">
          {message}
        </p>
      </div>
    </div>
  );

  if (isFixed) {
    return createPortal(
      <button
        type="button"
        onClick={onClose}
        className="
          fixed left-1/2 top-4 z-[99999] 
          w-[calc(100%-2rem)] max-w-[430px] 
          -translate-x-1/2 text-left
          sm:top-6 sm:w-[90%] sm:max-w-[500px]
          md:right-6 md:left-auto md:top-6 md:w-[420px] md:translate-x-0
          lg:right-8 lg:top-8 lg:w-[450px]
        "
        aria-label="Dismiss message"
      >
        {messageContent}
      </button>,
      document.body
    );
  }

  return (
    <div className="w-full">
      {messageContent}
    </div>
  );
}

export default StatusMessage;