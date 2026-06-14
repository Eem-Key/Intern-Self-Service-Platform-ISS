import { ChevronDown } from 'lucide-react';
import { useRef, useState } from 'react';

import { useMutation } from '@tanstack/react-query';
import type { LeaveReason } from '../../../../../shared/types/enums.types';
import type {
    LeaveForm,
    LeaveFormErrors,
} from '../../../../../shared/types/leave.types';
import {
    checkLeaveRequestDates,
    insertLeaveRequest
} from '../../../api/leave.api';
import StatusMessage from '../../../components/feedback/StatusMessage';
import RequiredMark from '../../../components/ui/RequiredMark';
import { validateLeaveForm } from '../../../utils/validateLeave.ts';

const leaveTypeOptions: { label: string; value: LeaveReason }[] = [
    {
        label: 'School Activity / Academic Leave',
        value: 'academic',
    },
    {
        label: 'Sick Leave / Medical Leave',
        value: 'sick_medical',
    },
];

function LeaveFormCard() {
    const startDateRef = useRef<HTMLInputElement | null>(null);
    const endDateRef = useRef<HTMLInputElement | null>(null);

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const [formValues, setFormValues] = useState<LeaveForm>({
        reason_category: '',
        start_date: '',
        end_date: '',
        description: '',
    });

    const [errors, setErrors] = useState<LeaveFormErrors>({});

    const [statusMessage, setStatusMessage] = useState<{
        variant: 'success' | 'error';
        title: string;
        message: string;
    } | null>(null);

    const selectedLeaveLabel =
        leaveTypeOptions.find((option) => option.value === formValues.reason_category)
        ?.label || 'What type of leave are you filing?';

    const showStatusMessage = (
        variant: 'success' | 'error',
        title: string,
        message: string
    ) => {
        setStatusMessage({ variant, title, message });

        window.setTimeout(() => {
        setStatusMessage(null);
        }, 5000);
    };

    const handleChange = (field: keyof LeaveForm, value: string) => {
        setFormValues((prev) => ({
            ...prev,
            [field]: value,
        }));

        setErrors((prev) => ({
            ...prev,
            [field]: undefined,
        }));
    };

    const openDatePicker = (ref: React.RefObject<HTMLInputElement | null>) => {
        if (ref.current?.showPicker) {
        ref.current.showPicker();
        return;
        }

        ref.current?.focus();
    };

    const handleCancel = () => {
        setFormValues({
        reason_category: '',
        start_date: '',
        end_date: '',
        description: '',
        });

        setErrors({});
        setIsDropdownOpen(false);
    };

    const submitMutation = useMutation({
        mutationFn: insertLeaveRequest,
        onSuccess: () => {
            showStatusMessage(
                'success',
                'Leave Filed!',
                'Your request is now waiting for supervisor approval.'
            );
            handleCancel();
        },
        onError: (error: Error) => {
            showStatusMessage('error', 'Submission Failed', error.message);
        }
    });

    const handleSubmitClick = async (event: React.FormEvent) => {
        event.preventDefault();

        const validationErrors = validateLeaveForm(formValues);

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            showStatusMessage(
                'error',
                'Submission Failed',
                'You couldn’t file your leave. Please check your entries and try again.'
            );
            return;
        }
        try {
            const hasOverlap = await checkLeaveRequestDates(formValues.start_date, formValues.end_date);
            
            if (hasOverlap) {
                setErrors({ 
                    end_date: 'You already have a leave request during this period.' 
                });
                showStatusMessage('error', 'Overlap Detected', 'Please choose different dates.');
                return;
            }

            submitMutation.mutate(formValues);
        } catch (err) {
            showStatusMessage('error', 'Error', 'Could not verify your dates.');
        }
    };


    return (
        <>
        {statusMessage && (
            <StatusMessage
            variant={statusMessage.variant}
            title={statusMessage.title}
            message={statusMessage.message}
            isFixed
            onClose={() => setStatusMessage(null)}
            />
        )}

        <section className="w-full max-w-[680px] rounded-xl bg-white px-4 py-6 shadow-md sm:px-8 sm:py-7">
            <h2 className="border-l-4 border-[#FFBF10] pl-2 text-xl font-bold sm:text-2xl">
            Leave Form Details
            </h2>

            <form onSubmit={handleSubmitClick} className="mt-5 space-y-4">
            <div>
                <label className="text-xs font-semibold text-gray-700 sm:text-sm">Type of Leave <RequiredMark /> </label>

                <div className="relative mt-1.5">
                <button
                    type="button"
                    onClick={() => setIsDropdownOpen((prev) => !prev)}
                    className={`flex h-11 w-full items-center justify-between rounded-lg bg-[#eeeeee] px-4 text-left text-sm outline-none transition-colors focus:bg-gray-200 ${
                    formValues.reason_category ? 'text-black font-medium' : 'text-gray-400'
                    }`}
                >
                    
                    <span className="truncate pr-2">{selectedLeaveLabel}</span>
                    <ChevronDown size={18} className="shrink-0 text-gray-500" />
                </button>

                {isDropdownOpen && (
                    <div className="absolute left-0 top-full z-30 mt-1 w-full overflow-hidden rounded-lg bg-white shadow-xl border border-gray-100">
                    {leaveTypeOptions.map((option) => (
                        <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                            handleChange('reason_category', option.value);
                            setIsDropdownOpen(false);
                        }}
                        className="w-full px-4 py-3 text-left text-sm hover:bg-[#eeeeee] transition-colors font-medium text-gray-800"
                        >
                        {option.label}
                        </button>
                    ))}
                    </div>
                )}
                </div>

                {errors.reason_category && (
                <p className="mt-1 text-xs text-red-600 font-medium">{errors.reason_category}</p>
                )}
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-3">
                <div className="flex-1">
                <label className="text-xs font-semibold text-gray-700 sm:text-sm">Start Date <RequiredMark /> </label>
                <input
                    ref={startDateRef}
                    type="date"
                    value={formValues.start_date}
                    onClick={() => openDatePicker(startDateRef)}
                    onChange={(event) =>
                    handleChange('start_date', event.target.value)
                    }
                    className="mt-1.5 h-11 w-full rounded-lg bg-[#eeeeee] px-4 text-sm outline-none transition-all focus:bg-gray-200"
                />
                {errors.start_date && (
                    <p className="mt-1 text-xs text-red-600 font-medium">{errors.start_date}</p>
                )}
                </div>

                <span className="hidden pt-10 text-lg font-bold text-gray-400 sm:block shrink-0">
                &ndash;
                </span>

                <div className="flex-1">
                <label className="text-xs font-semibold text-gray-700 sm:text-sm">End Date <RequiredMark /> </label>
                <input
                    ref={endDateRef}
                    type="date"
                    value={formValues.end_date}
                    onClick={() => openDatePicker(endDateRef)}
                    onChange={(event) =>
                    handleChange('end_date', event.target.value)
                    }
                    className="mt-1.5 h-11 w-full rounded-lg bg-[#eeeeee] px-4 text-sm outline-none transition-all focus:bg-gray-200"
                />
                {errors.end_date && (
                    <p className="mt-1 text-xs text-red-600 font-medium">{errors.end_date}</p>
                )}
                </div>
            </div>

            <div>
                <label className="text-xs font-semibold text-gray-700 sm:text-sm">Description <RequiredMark /> </label>
                <textarea
                value={formValues.description}
                onChange={(event) =>
                    handleChange('description', event.target.value)
                }
                placeholder="State your reason here..."
                className="mt-1.5 min-h-[120px] sm:min-h-[150px] w-full resize-y rounded-lg bg-[#eeeeee] p-4 text-sm outline-none placeholder:text-gray-400 transition-all focus:bg-gray-200"
                />
                {errors.description && (
                <p className="mt-1 text-xs text-red-600 font-medium">{errors.description}</p>
                )}
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-3">
                <button
                type="button"
                onClick={handleCancel}
                className="h-11 w-full sm:w-auto sm:min-w-[110px] rounded-full bg-[#eeeeee] px-6 text-sm font-semibold text-black hover:bg-gray-200 border border-gray-300 transition-colors"
                >
                Cancel
                </button>

                <button
                disabled={submitMutation.isPending}
                type="submit"
                className="h-11 w-full sm:w-auto sm:min-w-[110px] rounded-full bg-[#FFBF10] px-6 text-sm font-semibold text-black hover:bg-[#e8a900] transition-colors"
                >
                {submitMutation.isPending ? 'Submitting...' : 'Submit'}
                </button>
            </div>
            </form>
        </section>
        </>
    );
}

export default LeaveFormCard;