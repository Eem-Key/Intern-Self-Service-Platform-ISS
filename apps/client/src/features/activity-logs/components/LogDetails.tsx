import { useEffect, useState } from 'react';
import { Clock, X } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../config/supabase';
import StatusBadge from './StatusBadge';
import StatusMessage from '../../../components/feedback/StatusMessage';
import RequiredMark from '../../../components/ui/RequiredMark';
import { useFetchCompleteRecordDetails } from '../../../api/record.api';
import { updateEODReportAPI } from '../../../api/eodReport.api';
import { validateEodReport } from '../../../utils/validateEodReport';
import type { ReportStatus } from '../../../../../shared/types/enums.types';
import type { RecordLog } from '../../../../../shared/types/record.types';
import type {
    EODReportForm,
    EODReportFormErrors,
} from '../../../../../shared/types/eodReport.types';
import ProfileUpdate from './ProfileUpdate';
import { fetchFullNameAPI } from '../../../api/profile.api';

type LogDetailsModalProps = {
    record: RecordLog;
    onClose: () => void;
};

function formatLogType(type: RecordLog['log_category']) {
    switch (type) {
        case 'attendance':
        return 'Attendance';
        case 'eod_report':
        return 'End of Day Report';
        case 'leave_request':
        return 'Leave Request';
        case 'profile_update':
        return 'Profile Update';
        default:
        return type;
    }
}

function formatLeaveReason(value?: string | null) {
    switch (value) {
        case 'sick_medical':
        return 'Sick / Medical';
        case 'academic':
        return 'School Activity / Academic Leave';
        default:
        return value ? formatLabel(value) : '--';
    }
}

function formatProfileUpdate(value?: string | null) {
    switch (value) {
        case 'information_update':
        return 'Information Update';
        case 'avatar_update':
        return 'Avatar Update';
        case 'password_update':
        return 'Password Update';
        default:
        return value ? formatLabel(value) : '--';
    }
}

function formatDate(value?: string | null) {
    if (!value) return '--';

    return new Date(value).toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
    });
}

function formatTime(value?: string | null) {
    if (!value) return '--';

    return new Date(value).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
    });
}

function formatSubmittedAt(value: string) {
    const date = new Date(value);

    const datePart = date.toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
    });

    const timePart = date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
    });

    return `${datePart} at ${timePart}`;
}

function formatLabel(key: string) {
    return key
        .replaceAll('_', ' ')
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

const profileFieldOrder = [
    'first_name',
    'middle_name',
    'last_name',
    'suffix',
    'email',
    'birth_date',
    'gender',
    'contact_number',
    'address',
    'position',
    'department',
    'office',
];

const internInfoFieldOrder = [
    'program',
    'university',
    'year_level',
    'start_date',
    'required_hours',
];

function formatRequestedData(data?: Record<string, unknown>) {
    if (!data || Object.keys(data).length === 0) {
        return 'No requested changes provided.';
    }

    const lines: string[] = [];

    profileFieldOrder.forEach((key) => {
        if (key in data) {
            lines.push(`${formatLabel(key)}: ${String(data[key])}`);
        }
    });

    if (
        data.intern_info &&
        typeof data.intern_info === 'object' &&
        !Array.isArray(data.intern_info)
    ) {
        const internInfo = data.intern_info as Record<string, unknown>;

        internInfoFieldOrder.forEach((key) => {
            if (key in internInfo) {
                lines.push(
                    `Internship Info - ${formatLabel(key)}: ${String(internInfo[key])}`
                );
            }
        });
    }

    return lines.join('\n');
}

function LogDetailsModal({ record, onClose }: LogDetailsModalProps) {
    const queryClient = useQueryClient();
    const isDraftEOD = record.log_category === 'eod_report' && record.status === 'draft';
    const isDeniedEOD = record.log_category === 'eod_report' && record.status === 'denied';
    const [isEditingDeniedEOD, setIsEditingDeniedEOD] = useState(false);

    const { data: details, isLoading } = useFetchCompleteRecordDetails(
        record.id, 
        record.log_category, 
        record.status as ReportStatus
    );
    record.details = details

    const { data: latestRecord } = useQuery({
    queryKey: ['latest-record-feedback', record.id],
    queryFn: async () => {
        const { data, error } = await supabase
        .from('records')
        .select('admin_feedback, status, admin_id')
        .eq('id', record.id)
        .maybeSingle();

        if (error) {
        console.error('Error fetching latest feedback:', error);
        return null;
        }

        return data;
    },
    enabled: !!record.id,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    });

    const adminFeedback =
    latestRecord?.admin_feedback ||
    details?.admin_feedback ||
    record.admin_feedback ||
    null;

    const feedbackAdminId =
    latestRecord?.admin_id ||
    record.admin_id ||
    null;

    const requestedData = details?.requested_data as
    | Record<string, unknown>
    | undefined;

    const avatarPath =
        details?.update_type === 'avatar_update'
            ? String(requestedData?.avatar_url || '')
            : '';

    const { data: avatarPreviewUrl = '', isLoading: isAvatarPreviewLoading } =
        useQuery({
            queryKey: ['log-avatar-preview', avatarPath],
            queryFn: async () => {
                if (!avatarPath) return '';

                const { data, error } = await supabase.storage
                    .from('avatars')
                    .createSignedUrl(avatarPath, 3600);

                if (error) {
                    console.log('Avatar preview error:', error.message);
                    return '';
                }

                return data.signedUrl;
            },
            enabled: !!avatarPath,
        });

    const [statusMessage, setStatusMessage] = useState<{
        variant: 'success' | 'error';
        title: string;
        message: string;
    } | null>(null);

    const [eodFormValues, setEodFormValues] = useState<EODReportForm>({
        date_written: details?.date_written || '',
        hours_spent: Number(details?.hours_spent || 0),
        project_name: details?.project_name || '',
        task_accomplished: details?.task_accomplished || '',
    });

    useEffect(() => {
        if (!details) return;

        setEodFormValues({
            date_written: details.date_written || '',
            hours_spent: Number(details.hours_spent || 0),
            project_name: details.project_name || '',
            task_accomplished: details.task_accomplished || '',
        });
    }, [details]);

    const [eodErrors, setEodErrors] = useState<EODReportFormErrors>({});

    const showStatusMessage = (
        variant: 'success' | 'error',
        title: string,
        message: string
    ) => {
        setStatusMessage({ variant, title, message });

        setTimeout(() => {
        setStatusMessage(null);
        }, 5000);
    };

    const handleEODChange = (field: keyof EODReportForm, value: string) => {
        setEodFormValues((prev) => ({
        ...prev,
        [field]: value,
        }));

        setEodErrors((prev) => ({
        ...prev,
        [field]: undefined,
        }));
    };

    const saveEODDraftMutation = useMutation({
        mutationFn: (payload: EODReportForm) =>
        updateEODReportAPI(record.id, payload, 'draft'),

        onSuccess: () => {
        showStatusMessage(
            'success',
            'Draft Saved',
            'Your EOD draft was updated successfully.'
        );

        queryClient.invalidateQueries({ queryKey: ['log-details'] });
        queryClient.invalidateQueries({
            queryKey: ['eod-report', eodFormValues.date_written],
        });
        },

        onError: () => {
        showStatusMessage(
            'error',
            'Save Failed',
            'Failed to update your EOD draft.'
        );
        },
    });

    const submitEODDraftMutation = useMutation({
        mutationFn: (payload: EODReportForm) =>
        updateEODReportAPI(record.id, payload, 'pending'),

        onSuccess: () => {
        showStatusMessage(
            'success',
            'Report Submitted',
            'Your EOD report has been sent for review.'
        );

        queryClient.invalidateQueries({ queryKey: ['activity-logs'] });
        queryClient.invalidateQueries({ queryKey: ['records'] });
        queryClient.invalidateQueries({
            queryKey: ['eod-report', eodFormValues.date_written],
        });

        onClose();
        },

        onError: () => {
        showStatusMessage(
            'error',
            'Submission Failed',
            'We could not save your report. Please check your entries and try again.'
        );
        },
    });

    const handleSaveEODDraft = () => {
        const validationErrors = validateEodReport(eodFormValues, 'save');

        if (Object.keys(validationErrors).length > 0) {
        setEodErrors(validationErrors);
        return;
        }

        saveEODDraftMutation.mutate(eodFormValues);
    };

    const handleSubmitEODDraft = () => {
        const validationErrors = validateEodReport(eodFormValues, 'submit');

        if (Object.keys(validationErrors).length > 0) {
        setEodErrors(validationErrors);
        return;
        }

        submitEODDraftMutation.mutate(eodFormValues);
    };

    const handleResubmitDeniedEOD = () => {
        const validationErrors = validateEodReport(eodFormValues, 'resubmit');

        if (Object.keys(validationErrors).length > 0) {
            setEodErrors(validationErrors);
            return;
        }

        submitEODDraftMutation.mutate(eodFormValues);
    };

    {/*if (isLoading) return <div className="fixed inset-0 z-[99999] flex items-center justify-center">Loading...</div>;*/}

    if (isLoading) {
        return (
            <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/20 backdrop-blur-sm lg:left-[270px]">
                <div className="flex flex-col items-center gap-3 rounded-xl bg-white px-8 py-6 shadow-xl">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#EAF0FA] border-t-[#0058DD]" />
                    <p className="text-sm font-semibold text-[#002D6F]">
                        Loading...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/55 px-4 backdrop-blur-sm lg:left-[270px]">
        {statusMessage && (
            <StatusMessage
            variant={statusMessage.variant}
            title={statusMessage.title}
            message={statusMessage.message}
            isFixed
            onClose={() => setStatusMessage(null)}
            />
        )}

        <div className="w-full max-w-[620px] overflow-hidden rounded-xl bg-white shadow-xl">
            <div className="flex items-start justify-between bg-gradient-to-r from-[#005de8] to-[#003d8f] px-6 py-4 text-white">
            <div>
                <div className="flex flex-wrap items-center gap-3">
                <h2 className="border-l-4 border-[#FFBF10] pl-2 text-xl font-bold sm:text-2xl">
                    {formatLogType(record.log_category)}
                </h2>

                {record.log_category !== 'attendance' && (
                    <StatusBadge status={record.status ? record.status : ''} />
                )}
                </div>

                <p className="mt-1 text-xs text-white/80">
                Submitted on {formatSubmittedAt(record.display_date)}
                </p>
            </div>

            <button
                type="button"
                onClick={onClose}
                className="rounded-full p-1 transition hover:bg-white/10"
            >
                <X size={22} />
            </button>
            </div>

            <div className="max-h-[75vh] space-y-5 overflow-y-auto px-6 py-5">
            {record.log_category === 'attendance' && (
                <>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <DetailItem
                        label="Date"
                        value={formatDate(details?.work_date || record?.date_created)}
                    />

                    <DetailItem
                        label="Hours Spent"
                        value={
                        details?.hours_logged !== null &&
                        details?.hours_logged !== undefined
                            ? `${details.hours_logged} Hrs`
                            : '--'
                        }
                    />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <DetailBox
                        label="Time In"
                        value={formatTime(details?.clock_in || details?.time_in)}
                    />

                    <DetailBox
                        label="Time Out"
                        value={formatTime(details?.clock_out || details?.time_out)}
                    />
                    </div>
                </>
            )}

            {record.log_category === 'eod_report' && (isDraftEOD || isEditingDeniedEOD) &&  (
                <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    
                    <div>
                    <label className="text-sm font-medium">Date</label>
                    <input
                        type="date"
                        value={eodFormValues.date_written}
                        disabled
                        className="mt-1 h-10 w-full rounded bg-[#eeeeee] px-4 text-sm outline-none disabled:cursor-not-allowed disabled:text-gray-600"
                    />
                    {eodErrors.date_written && (
                        <p className="mt-1 text-xs text-red-600">
                        {eodErrors.date_written}
                        </p>
                    )}
                    </div>
                    <div>
                    <label className="text-sm font-medium">Hour Spent</label>
                    <div className="relative mt-1">
                        <input
                        type="text"
                        value={`${eodFormValues.hours_spent} Hrs`}
                        disabled
                        className="h-10 w-full rounded bg-[#eeeeee] px-4 text-sm outline-none disabled:cursor-not-allowed disabled:text-gray-600"
                        />
                        <Clock
                        size={17}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                        />
                    </div>
                    </div>
                </div>

                <div>
                    <label className="inline-flex items-center gap-1 text-sm font-medium">
                    Project Name
                    <RequiredMark />
                    </label>

                    <input
                    type="text"
                    value={eodFormValues.project_name}
                    onChange={(event) =>
                        handleEODChange('project_name', event.target.value)
                    }
                    className="mt-1 h-10 w-full rounded bg-[#eeeeee] px-4 text-sm outline-none"
                    />

                    {eodErrors.project_name && (
                    <p className="mt-1 text-xs text-red-600">
                        {eodErrors.project_name}
                    </p>
                    )}
                </div>

                <div>
                    <label className="inline-flex items-center gap-1 text-sm font-medium">
                    Task Accomplished
                    <RequiredMark />
                    </label>

                    <textarea
                    value={eodFormValues.task_accomplished}
                    onChange={(event) =>
                        handleEODChange('task_accomplished', event.target.value)
                    }
                    className="mt-1 h-[180px] w-full resize-none rounded bg-[#eeeeee] p-3 text-sm outline-none"
                    />

                    {eodErrors.task_accomplished && (
                    <p className="mt-1 text-xs text-red-600">
                        {eodErrors.task_accomplished}
                    </p>
                    )}
                </div>

                <div className="flex flex-col-reverse justify-end gap-3 pt-2 sm:flex-row">
                    {isDraftEOD && (
                        <button
                            type="button"
                            onClick={handleSaveEODDraft}
                            disabled={
                                saveEODDraftMutation.isPending ||
                                submitEODDraftMutation.isPending
                            }
                            className="rounded-full border border-gray-300 bg-white px-7 py-2 text-sm font-bold text-black disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {saveEODDraftMutation.isPending ? 'Saving...' : 'Save'}
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={isEditingDeniedEOD ? handleResubmitDeniedEOD : handleSubmitEODDraft}
                        disabled={
                            saveEODDraftMutation.isPending ||
                            submitEODDraftMutation.isPending
                        }
                        className="rounded-full bg-[#FFBF10] px-7 py-2 text-sm font-bold text-black disabled:cursor-not-allowed disabled:bg-[#eeeeee] disabled:text-gray-500 disabled:opacity-70"
                    >
                        {submitEODDraftMutation.isPending
                            ? isEditingDeniedEOD
                                ? 'Resubmitting...'
                                : 'Submitting...'
                            : isEditingDeniedEOD
                                ? 'Resubmit'
                                : 'Submit'}
                    </button>
                </div>
                </>
            )}

            {record.log_category === 'eod_report' && !isDraftEOD && !isEditingDeniedEOD && (
                <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <DetailItem label="Date" value={formatDate(details?.date_written)} />
                    <DetailItem
                    label="Hour Spent"
                    value={
                        details?.hours_spent !== null &&
                        details?.hours_spent !== undefined
                        ? `${details.hours_spent} Hrs`
                        : '--'
                    }
                    />
                    <DetailItem
                    label="Project"
                    value={details?.project_name || '--'}
                    />
                </div>

                <DetailBox
                    label="Task Accomplished"
                    value={
                    details?.task_accomplished ||
                    'No task accomplished provided.'
                    }
                />

                {record.status !== 'pending' && (
                <AdminFeedback value={adminFeedback} admin_id={feedbackAdminId} />
                )}

                {isDeniedEOD && (
                    <div className="flex justify-end pt-2">
                        <button
                            type="button"
                            onClick={() => setIsEditingDeniedEOD(true)}
                            className="rounded-full bg-[#FFBF10] px-7 py-2 text-sm font-bold text-black transition hover:bg-[#e5aa0e]"
                        >
                            Edit
                        </button>
                    </div>
                )}
                </>
            )}

            {record.log_category === 'leave_request' && (
                <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <DetailItem
                    label="Date of Leave"
                    value={`${formatDate(details?.start_date)} - ${formatDate(
                        details?.end_date
                    )}`}
                    />

                    <DetailItem
                    label="Reason"
                    value={formatLeaveReason(details?.reason_category)}
                    />
                </div>

                <DetailBox
                    label="Description"
                    value={details?.description || 'No description provided.'}
                />

                {record.status !== 'pending' && (
                <AdminFeedback value={adminFeedback} admin_id={feedbackAdminId} />
                )}
                </>
            )}

            {record.log_category === 'profile_update' && record.status === 'pending' && (
            <ProfileUpdate
                record={record}
                onClose={onClose}
                onNotify={showStatusMessage}
            />
            )}

            {record.log_category === 'profile_update' && record.status !== 'pending' && (
                <>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <DetailItem
                            label="Update Type"
                            value={formatProfileUpdate(details?.update_type || record.activity_description)}
                        />

                        <DetailItem
                            label="Date Requested"
                            value={formatDate(record.created_at)}
                        />
                    </div>

                    {details?.update_type === 'avatar_update' ? (
                        <AvatarRequestedChange
                            imageUrl={avatarPreviewUrl}
                            isLoading={isAvatarPreviewLoading}
                        />
                    ) : (
                        <DetailBox
                            label="Requested Changes"
                            value={formatRequestedData(details?.requested_data)}
                        />
                    )}

                </>
            )}
            </div>
        </div>
        </div>
    );
}

function DetailItem({ label, value }: { label: string; value: string }) {
    return (
        <div>
        <p className="text-xs font-medium text-gray-600">{label}</p>
        <p className="mt-1 text-sm font-bold text-black">{value}</p>
        </div>
    );
}

function DetailBox({ label, value }: { label: string; value: string }) {
    return (
        <div>
        <p className="mb-2 text-sm font-bold text-black">{label}</p>
        <div className="min-h-[50px] whitespace-pre-wrap rounded bg-[#eeeeee] p-4 text-sm leading-relaxed text-gray-800">
            {value}
        </div>
        </div>
    );
}

function AvatarRequestedChange({
    imageUrl,
    isLoading,
}: {
    imageUrl: string;
    isLoading: boolean;
}) {
    return (
        <div>
            <p className="mb-2 text-sm font-bold text-black">
                Requested Profile Picture
            </p>

            <div className="flex min-h-[180px] items-center justify-center rounded p-5">
                {isLoading ? (
                    <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#EAF0FA] border-t-[#0058DD]" />
                ) : imageUrl ? (
                    <img
                        src={imageUrl}
                        alt="Requested profile picture"
                        className="h-36 w-36 rounded-full border-4 border-[#FFBF10] object-cover shadow-md"
                    />
                ) : (
                    <p className="text-sm text-gray-500">
                        No profile picture preview available.
                    </p>
                )}
            </div>
        </div>
    );
}

function AdminFeedback({
    value,
    admin_id,
}: {
    value?: string | null;
    admin_id?: string | null;
}) {
    const hasFeedback = Boolean(value?.trim());

    const { data: adminName, isLoading } = useQuery({
        queryKey: ['log-feedback-admin-name', admin_id],
        queryFn: async () => {
            if (!admin_id) return null;
            return fetchFullNameAPI(admin_id);
        },
        enabled: !!admin_id,
        retry: false,
    });

    return (
        <div>
            <h3 className="border-l-4 border-[#FFBF10] pl-2 text-xl font-bold text-[#002D6F]">
                Admin Feedback
            </h3>

            <div className="mt-3 min-h-[80px] rounded border border-dashed border-gray-300 bg-[#eeeeee] p-4 text-sm leading-relaxed text-gray-700">
                {hasFeedback ? value : 'No further feedback...'}
            </div>

            {admin_id && (
                <p className="mt-2 text-right text-xs font-medium text-gray-500">
                    By:{' '}
                    <span className="font-bold text-black">
                        {isLoading ? 'Loading...' : adminName || 'Unknown admin'}
                    </span>
                </p>
            )}
        </div>
    );
}
export default LogDetailsModal;