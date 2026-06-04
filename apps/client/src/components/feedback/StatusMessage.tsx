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
      className={`w-full max-w-[580px] overflow-hidden rounded-xl text-white shadow-lg ${className}`}
    >
      <div className={`${headerColor} px-6 py-3`}>
        <h3 className="text-lg font-bold sm:text-xl">{title}</h3>
      </div>

      <div className={`${bodyColor} px-6 py-4`}>
        <p className="text-sm font-medium leading-snug sm:text-base">
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
        className="fixed right-0 top-[50px] z-[99999] w-[90%] max-w-[450px] text-left"
        aria-label="Dismiss message"
      >
        {messageContent}
      </button>,
      document.body
    );
  }

  return messageContent;
}

export default StatusMessage;