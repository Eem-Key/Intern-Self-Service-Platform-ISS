import { createPortal } from 'react-dom';

type ConfirmationModalProps = {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmText = 'Yes, Submit',
  cancelText = 'Cancel',
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/55 px-4 backdrop-blur-sm lg:left-[270px]">
      <div className="w-full max-w-[430px] overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="bg-[#003D8F] px-6 py-4">
          <h2 className="border-l-4 border-[#FFBF10] pl-3 text-xl font-bold text-white">
            {title}
          </h2>
        </div>

        <div className="px-6 py-6">
          <p className="text-sm leading-relaxed text-black">
            {message}
          </p>

          <div className="mt-6 flex justify-center gap-5">
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="min-w-[120px] rounded-full bg-[#eeeeee] px-6 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {cancelText}
            </button>

            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className="min-w-[120px] rounded-full bg-[#FFBF10] px-6 py-2 text-sm font-semibold text-black transition hover:bg-[#e8a900] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? 'Submitting...' : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default ConfirmationModal;