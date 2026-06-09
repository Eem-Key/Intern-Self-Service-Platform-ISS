import { AlertTriangle, CheckCircle } from 'lucide-react';

type PasswordStatusModalVariant = 'confirm' | 'success' | 'failed' | 'error';

type PasswordStatusModalProps = {
    variant: PasswordStatusModalVariant;
    title: string;
    message: string;
    onClose?: () => void;
    onConfirm?: () => void;
    isLoading?: boolean;
};

function PasswordStatusModal({
    variant,
    title,
    message,
    onClose,
    onConfirm,
    isLoading = false,
}: PasswordStatusModalProps) {
    const isConfirm = variant === 'confirm';
    const isSuccess = variant === 'success';

    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/55 px-4 backdrop-blur-sm lg:left-[270px]">
        <div className="w-full max-w-[430px] overflow-hidden rounded-xl bg-white shadow-xl">
            <div className="flex items-center gap-3 bg-[#003D8F] px-6 py-4 text-white">
            {isSuccess ? (
                <CheckCircle size={20} className="text-[#FFBF10]" />
            ) : (
                <AlertTriangle size={20} className="text-[#FFBF10]" />
            )}

            <h2 className="text-xl font-bold">{title}</h2>
            </div>

            <div className="px-6 py-6">
            <p className="text-sm leading-relaxed text-black">{message}</p>

            <div className="mt-6 flex justify-end gap-4">
                {isConfirm && (
                <button
                    type="button"
                    onClick={onClose}
                    disabled={isLoading}
                    className="min-w-[120px] rounded-full bg-[#eeeeee] px-5 py-2 text-sm font-semibold text-gray-700 disabled:opacity-60"
                >
                    Cancel
                </button>
                )}

                <button
                type="button"
                onClick={isConfirm ? onConfirm : onClose}
                disabled={isLoading}
                className="min-w-[120px] rounded-full bg-[#FFBF10] px-5 py-2 text-sm font-semibold text-black disabled:opacity-60"
                >
                {isLoading ? 'Updating...' : isConfirm ? 'Confirm Change' : 'Got it'}
                </button>
            </div>
            </div>
        </div>
        </div>
    );
}

export default PasswordStatusModal;