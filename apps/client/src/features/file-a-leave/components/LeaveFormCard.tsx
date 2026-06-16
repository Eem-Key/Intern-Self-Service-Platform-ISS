import { ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { LeaveReason } from '../../../../../shared/types/enums.types';
import type {
    LeaveRequestForm,
    LeaveRequestFormErrors,
} from '../../../../../shared/types/leave.types';
import {
  checkLeaveRequestDates,
  fetchAllLeaveRequestDatesOfIntern,
  insertLeaveRequest,
} from '../../../api/leave.api';
import StatusMessage from '../../../components/feedback/StatusMessage';
import RequiredMark from '../../../components/ui/RequiredMark';
import { validateLeaveForm } from '../../../utils/validateLeave.ts';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

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
    const queryClient = useQueryClient();
    const [activeDatePicker, setActiveDatePicker] = useState<
    'start_date' | 'end_date' | null
    >(null);
    const datePickerRef = useRef<HTMLDivElement | null>(null);

    const { data: unavailableLeaveDates = [] } = useQuery({
    queryKey: ['intern-leave-dates'],
    queryFn: fetchAllLeaveRequestDatesOfIntern,
    });
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const [formValues, setFormValues] = useState<LeaveRequestForm>({
        reason_category: '',
        start_date: '',
        end_date: '',
        description: '',
    });

    const [errors, setErrors] = useState<LeaveRequestFormErrors>({});

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

    const isDateOverlappingExistingLeave = (date: string) => {
        if (!date) return false;

        return unavailableLeaveDates.some((leave) => {
            return date >= leave.start_date && date <= leave.end_date;
        });
        };

        const isDateRangeOverlappingExistingLeave = (
        startDate: string,
        endDate: string
        ) => {
        if (!startDate || !endDate) return false;

        return unavailableLeaveDates.some((leave) => {
            return startDate <= leave.end_date && endDate >= leave.start_date;
        });
    };

    useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (
        activeDatePicker &&
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target as Node)
        ) {
        setActiveDatePicker(null);
        }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
    }, [activeDatePicker]);

    const handleChange = (field: keyof LeaveRequestForm, value: string) => {
        if (
            (field === 'start_date' || field === 'end_date') &&
            isDateOverlappingExistingLeave(value)
        ) {
            setErrors((prev) => ({
            ...prev,
            [field]: 'This date is already covered by an existing leave request.',
            }));

            showStatusMessage(
            'error',
            'Date Unavailable',
            'You already have a leave request during this date.'
            );

            return;
        }

        setFormValues((prev) => ({
            ...prev,
            [field]: value,
        }));

        setErrors((prev) => ({
            ...prev,
            [field]: undefined,
        }));
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
            queryClient.invalidateQueries({ queryKey: ['intern-leave-dates'] });

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

            if (!formValues.reason_category) {
            validationErrors.reason_category = 'Type of leave is required.';
            }

            if (!formValues.start_date) {
            validationErrors.start_date = 'Start date is required.';
            }

            if (!formValues.end_date) {
            validationErrors.end_date = 'End date is required.';
            }

            if (!formValues.description.trim()) {
            validationErrors.description = 'Description is required.';
            }

            if (Object.keys(validationErrors).length > 0) {
                setErrors(validationErrors);

                showStatusMessage(
                    'error',
                    'Submission Failed',
                    'You couldn’t file your leave. Please check your entries and try again.'
                );

                return;
                }

                if (
                isDateRangeOverlappingExistingLeave(
                    formValues.start_date,
                    formValues.end_date
                )
                ) {
                setErrors({
                    start_date: 'This date range overlaps with an existing leave request.',
                    end_date: 'This date range overlaps with an existing leave request.',
                });

                showStatusMessage(
                    'error',
                    'Overlap Detected',
                    'Please choose different dates.'
                );

            return;
        }
        try {
            const hasOverlap = await checkLeaveRequestDates(formValues.start_date, formValues.end_date);
            
            if (hasOverlap) {
                setErrors({ 
                    start_date: 'You already have a leave request during this period.',
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

    const disabledLeaveDateRanges = unavailableLeaveDates.map((leave) => ({
    from: new Date(`${leave.start_date}T00:00:00`),
    to: new Date(`${leave.end_date}T00:00:00`),
    }));

    const formatDateKey = (date: Date) => {
    return date.toLocaleDateString('en-CA');
    };

    const isDisabledLeaveDate = (date: Date) => {
    const dateKey = formatDateKey(date);

    return unavailableLeaveDates.some((leave) => {
        return dateKey >= leave.start_date && dateKey <= leave.end_date;
    });
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

            <div  ref={datePickerRef} className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-3">
                <div className="relative flex-1">
                    <label className="text-xs font-semibold text-gray-700 sm:text-sm">
                        Start Date <RequiredMark />
                    </label>

                    <button
                        type="button"
                        onClick={() =>
                        setActiveDatePicker((prev) =>
                            prev === 'start_date' ? null : 'start_date'
                        )
                        }
                        className="mt-1.5 flex h-11 w-full items-center justify-between rounded-lg bg-[#eeeeee] px-4 text-left text-sm outline-none transition-all focus:bg-gray-200"
                    >
                        <span className={formValues.start_date ? 'text-black' : 'text-gray-400'}>
                        {formValues.start_date || 'Select start date'}
                        </span>
                    </button>

                    {activeDatePicker === 'start_date' && (
                        <div className="absolute left-0 top-full z-40 mt-2 rounded-lg bg-white p-3 shadow-xl">
                        <DayPicker
                            mode="single"
                            selected={
                                formValues.start_date
                                ? new Date(`${formValues.start_date}T00:00:00`)
                                : undefined
                            }
                            disabled={isDisabledLeaveDate}
                            modifiersClassNames={{
                                disabled:
                                'opacity-30 text-gray-400 line-through cursor-not-allowed bg-gray-100',
                                selected:
                                'bg-[#FFBF10] text-black font-bold rounded-full',
                                today:
                                'font-bold text-[#002D6F]',
                            }}
                            onSelect={(date) => {
                                if (!date) return;

                                if (isDisabledLeaveDate(date)) {
                                setErrors((prev) => ({
                                    ...prev,
                                    start_date: 'This date is already covered by an existing leave request.',
                                }));

                                showStatusMessage(
                                    'error',
                                    'Date Unavailable',
                                    'You already have a leave request during this date.'
                                );

                                return;
                                }

                                const selectedDate = formatDateKey(date);
                                handleChange('start_date', selectedDate);
                                setActiveDatePicker(null);
                            }}
                            />
                        </div>
                    )}

                    {errors.start_date && (
                        <p className="mt-1 text-xs font-medium text-red-600">
                        {errors.start_date}
                        </p>
                    )}
                </div>

                <span className="hidden pt-10 text-lg font-bold text-gray-400 sm:block shrink-0">
                &ndash;
                </span>

                <div className="relative flex-1">
                    <label className="text-xs font-semibold text-gray-700 sm:text-sm">
                        End Date <RequiredMark />
                    </label>

                    <button
                        type="button"
                        onClick={() =>
                        setActiveDatePicker((prev) =>
                            prev === 'end_date' ? null : 'end_date'
                        )
                        }
                        className="mt-1.5 flex h-11 w-full items-center justify-between rounded-lg bg-[#eeeeee] px-4 text-left text-sm outline-none transition-all focus:bg-gray-200"
                    >
                        <span className={formValues.end_date ? 'text-black' : 'text-gray-400'}>
                        {formValues.end_date || 'Select end date'}
                        </span>
                    </button>

                    {activeDatePicker === 'end_date' && (
                        <div className="absolute left-0 top-full z-40 mt-2 rounded-lg bg-white p-3 shadow-xl">
                        <DayPicker
                        mode="single"
                        selected={
                            formValues.end_date
                            ? new Date(`${formValues.end_date}T00:00:00`)
                            : undefined
                        }
                        disabled={isDisabledLeaveDate}
                        modifiersClassNames={{
                            disabled:
                            'opacity-30 text-gray-400 line-through cursor-not-allowed bg-gray-100',
                            selected:
                            'bg-[#FFBF10] text-black font-bold rounded-full',
                            today:
                            'font-bold text-[#002D6F]',
                        }}
                        onSelect={(date) => {
                            if (!date) return;

                            if (isDisabledLeaveDate(date)) {
                            setErrors((prev) => ({
                                ...prev,
                                end_date: 'This date is already covered by an existing leave request.',
                            }));

                            showStatusMessage(
                                'error',
                                'Date Unavailable',
                                'You already have a leave request during this date.'
                            );

                            return;
                            }

                            const selectedDate = formatDateKey(date);
                            handleChange('end_date', selectedDate);
                            setActiveDatePicker(null);
                        }}
                        />
                        </div>
                    )}

                    {errors.end_date && (
                        <p className="mt-1 text-xs font-medium text-red-600">
                        {errors.end_date}
                        </p>
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