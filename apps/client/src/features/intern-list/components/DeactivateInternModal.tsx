import { X } from 'lucide-react';
import { useState } from 'react';

type DeactivateInternModalProps = {
    internName: string;
    department?: string | null;
    isSubmitting?: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void;
};

const reasons = [
    'Completed Internship',
    'Voluntary Resignation',
    'Disciplinary Action',
    'Administrative Error',
    'Other',
];

function DeactivateInternModal({
    internName,
    department,
    isSubmitting = false,
    onClose,
    onConfirm,
}: DeactivateInternModalProps) {
    const [selectedReason, setSelectedReason] = useState('');
    const [otherReason, setOtherReason] = useState('');

    const isOther = selectedReason === 'Other';
    const finalReason = isOther ? otherReason.trim() : selectedReason;

    const handleConfirm = () => {
        if (!finalReason) return;
        onConfirm(finalReason);
    };

    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm xl:left-[270px]">
            <button
                type="button"
                aria-label="Close deactivate modal"
                className="fixed inset-0"
                onClick={onClose}
            />

            <div className="relative flex max-h-[calc(100dvh-1.5rem)] w-full max-w-[560px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
                <div className="flex shrink-0 items-center justify-between bg-gradient-to-r from-[#005de8] to-[#003d8f] px-5 py-4 text-white">
                    <h2 className="border-l-4 border-[#FFBF10] pl-2 text-lg font-bold sm:text-xl">
                        Deactivate Intern Account
                    </h2>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full p-1 transition hover:bg-white/10"
                    >
                        <X size={22} />
                    </button>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
                    <p className="text-sm text-black">
                        You are about to deactivate the account for{' '}
                        <span className="font-bold">{internName}</span>
                        {department ? (
                            <>
                                {' '}
                                from the <span className="font-bold">{department}</span>{' '}
                                department.
                            </>
                        ) : (
                            '.'
                        )}
                    </p>

                    <div className="mt-5">
                        <p className="text-sm font-bold text-black">
                            Reason for Deactivation{' '}
                            <span className="text-[#E60000]">(Required)</span>
                        </p>

                        <div className="mt-3 space-y-2">
                            {reasons.map((reason) => (
                                <label
                                    key={reason}
                                    className="flex cursor-pointer items-start gap-2 text-sm text-black"
                                >
                                    <input
                                        type="radio"
                                        name="deactivate_reason"
                                        value={reason}
                                        checked={selectedReason === reason}
                                        onChange={() => setSelectedReason(reason)}
                                        className="mt-1"
                                    />
                                    <span>{reason}</span>
                                </label>
                            ))}
                        </div>

                        {isOther && (
                            <textarea
                                value={otherReason}
                                onChange={(event) =>
                                    setOtherReason(event.target.value)
                                }
                                placeholder="Please specify the reason..."
                                className="mt-3 h-20 w-full resize-none rounded-lg bg-[#eeeeee] px-3 py-2 text-sm outline-none"
                            />
                        )}
                    </div>
                </div>

                <div className="flex shrink-0 justify-end gap-3 border-t border-gray-100 px-5 py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="rounded-full bg-[#eeeeee] px-7 py-2 text-sm font-bold text-gray-500 shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={handleConfirm}
                        disabled={!finalReason || isSubmitting}
                        className="rounded-full bg-[#E60000] px-7 py-2 text-sm font-bold text-white shadow-md transition hover:bg-[#c90000] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isSubmitting ? 'Deactivating...' : 'Deactivate'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default DeactivateInternModal;