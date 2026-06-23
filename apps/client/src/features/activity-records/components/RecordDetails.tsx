import { useQuery } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { fetchFullNameAPI } from '../../../api/profile.api';
import type { ApprovalRecord } from '../../../../../shared/types/approvals.types';
import profilepic from '../../../assets/images/default_pic.png';
import { supabase } from '../../../config/supabase';
import StatusBadge from './StatusBadge';

type RecordDetailsProps = {
    record: ApprovalRecord;
    onClose: () => void;
};

function getTitle(type: ApprovalRecord['log_category']) {
    switch (type) {
        case 'eod_report':
        return 'End of Day Report';
        case 'leave_request':
        return 'Leave Request';
        case 'profile_update':
        return 'Profile Change';
        default:
        return 'Activity Record';
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

function formatLeaveReason(value?: string | null) {
    switch (value) {
        case 'sick_medical':
        return 'Sick Leave/Medical Leave';
        case 'academic':
        return 'Academic Leave';
        default:
        return value || '--';
    }
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

    return lines.length > 0
        ? lines.join('\n')
        : 'No requested changes provided.';
}

function RecordDetails({ record, onClose }: RecordDetailsProps) {
    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm sm:p-4 lg:left-[270px]">
        <button
            type="button"
            aria-label="Close modal overlay"
            className="fixed inset-0"
            onClick={onClose}
        />

        <div className="relative flex max-h-[calc(100dvh-1.5rem)] w-full max-w-[620px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:max-h-[calc(100dvh-2rem)] md:max-w-[680px]">
            <div className="flex shrink-0 items-center justify-between bg-gradient-to-r from-[#005de8] to-[#003d8f] px-4 py-4 text-white sm:px-5">
            <h2 className="min-w-0 truncate pr-3 text-xl font-bold sm:text-2xl">
                {getTitle(record.log_category)}
            </h2>

            <button
                type="button"
                onClick={onClose}
                className="shrink-0 rounded-full p-1 transition hover:bg-white/10"
                aria-label="Close details"
            >
                <X size={22} />
            </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="bg-[#EAF0FA] px-4 py-3 sm:px-5">
                <div className="flex items-start justify-between gap-4">
                <div>
                    <h3 className="border-l-4 border-[#FFBF10] pl-3 text-xl font-bold text-black sm:text-2xl">
                    {record.name}
                    </h3>

                    <p className="pl-3 text-xs text-gray-700 sm:text-sm">
                    {formatDate(record.created_at)}
                    </p>
                </div>
                </div>
            </div>

            <div className="space-y-5 px-4 py-4 sm:px-5 sm:py-5">
                {record.log_category === 'eod_report' && (
                <>
                    <div className="grid grid-cols-3 gap-3 sm:gap-4">
                    <DetailItem
                        label="Time Submitted"
                        value={record.details?.time_submitted || '--'}
                    />

                    <DetailItem
                        label="Hours Rendered"
                        value={
                        record.details?.hours_spent !== null &&
                        record.details?.hours_spent !== undefined
                            ? `${record.details.hours_spent} Hrs`
                            : '--'
                        }
                    />

                    <StatusDetailItem label="Status" status={record.status} />

                    <DetailItem
                        label="Project"
                        value={record.details?.project_name || '--'}
                    />

                    <DetailItem
                        label="Intern Role"
                        value={record.details?.intern_role || record.position || '--'}
                    />
                    </div>

                    <DetailCard
                    label="Task Accomplished"
                    value={
                        record.details?.task_accomplished ||
                        'No task accomplished provided.'
                    }
                    />

                    <AdminFeedback value={record.admin_feedback} admin_id={record.admin_id} />
                </>
                )}

                {record.log_category === 'leave_request' && (
                <>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <DetailItem
                        label="Time Submitted"
                        value={record.details?.time_submitted || '--'}
                    />

                    <StatusDetailItem label="Status" status={record.status} />

                    <DetailItem
                        label="Reason"
                        value={formatLeaveReason(record.details?.reason_category)}
                    />

                    <DetailItem
                        label="Leave Date"
                        value={`${formatDate(record.details?.start_date)} - ${formatDate(
                        record.details?.end_date
                        )}`}
                    />
                    </div>

                    <DetailCard
                    label="Description"
                    value={record.details?.description || 'No description provided.'}
                    />

                    <AdminFeedback value={record.admin_feedback} admin_id={record.admin_id} />
                </>
                )}

                {record.log_category === 'profile_update' && (
                <>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <DetailItem
                        label="Time Submitted"
                        value={record.details?.time_submitted || '--'}
                    />

                    <StatusDetailItem label="Status" status={record.status} />
                    </div>

                    {record.details?.update_type === 'information_update' && (
                    <DetailCard
                        label="Description"
                        value={`${record.name} made changes to their personal information.\n\n${formatRequestedData(
                        record.details?.requested_data as
                            | Record<string, unknown>
                            | undefined
                        )}`}
                    />
                    )}

                    {record.details?.update_type === 'avatar_update' && (
                    <div className="grid grid-cols-2 gap-3 pt-2 sm:gap-5">
                        <ProfilePhotoBox
                        label="Old Profile Photo"
                        imageUrl={
                            typeof record.details?.requested_data?.old_avatar_url ===
                            'string' &&
                            record.details.requested_data.old_avatar_url.length > 0
                            ? record.details.requested_data.old_avatar_url
                            : null
                        }
                        useDefault
                        />

                        <ProfilePhotoBox
                        label="New Profile Photo"
                        imageUrl={
                            typeof record.details?.requested_data?.avatar_url ===
                            'string' &&
                            record.details.requested_data.avatar_url.length > 0
                            ? record.details.requested_data.avatar_url
                            : null
                        }
                        />
                    </div>
                    )}
                </>
                )}
            </div>
            </div>
        </div>
        </div>
    );
}

function StatusDetailItem({
    label,
    status,
}: {
    label: string;
    status?: string | null;
}) {
    return (
        <div className="min-w-0">
            <p className="text-[11px] text-black sm:text-sm">{label}</p>

            <div className="mt-1">
                <StatusBadge status={status} />
            </div>
        </div>
    );
}

function DetailItem({ label, value }: { label: string; value: string }) {
    return (
        <div className="min-w-0">
            <p className="text-[11px] text-black sm:text-sm">{label}</p>

            <p className="mt-1 whitespace-pre-line break-words text-xs font-bold text-black sm:text-sm">
                {value}
            </p>
        </div>
    );
}

function DetailCard({ label, value }: { label: string; value: string }) {
    return (
            <div>
            <p className="mb-2 text-sm font-bold text-black">{label}</p>

            <div className="max-h-[180px] min-h-[50px] overflow-y-auto whitespace-pre-wrap rounded-lg bg-[#f5f5f5] p-4 text-sm leading-relaxed text-gray-700 sm:max-h-[220px]">
                {value}
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
    const { data: adminName, isLoading } = useQuery({
        queryKey: ['feedback-admin-name', admin_id],
        queryFn: async () => {
            if (!admin_id) return null;

            try {
                return await fetchFullNameAPI(admin_id);
            } catch (error) {
                console.error('Error fetching feedback admin name:', error);
                return null;
            }
        },
        enabled: !!admin_id,
    });

    return (
        <div>
            <h3 className="border-l-4 border-[#FFBF10] pl-3 text-xl font-bold text-[#002D6F] sm:text-2xl">
                Your Feedback
            </h3>

            <div className="mt-3 min-h-[100px] whitespace-pre-wrap rounded-lg border border-dashed border-gray-300 bg-white p-4 text-sm leading-relaxed text-gray-500 shadow-sm">
                {value || 'No feedback provided.'}
            </div>

            <p className="mt-2 text-right text-xs font-medium text-gray-500">
                By:{' '}
                <span className="font-bold text-black">
                    {!admin_id
                        ? 'No reviewing admin recorded'
                        : isLoading
                        ? 'Loading...'
                        : adminName || 'Unknown admin'}
                </span>
            </p>
        </div>
    );
}

{/*Ver 2*/}
{/*function AdminFeedback({
    value,
    admin_id,
}: {
    value?: string | null;
    admin_id?: string | null;
}) {
    const hasFeedback = Boolean(value?.trim());

    const { data: adminName, isLoading } = useQuery({
        queryKey: ['feedback-admin-name', admin_id],
        queryFn: async () => {
            if (!admin_id) return null;

            try {
                return await fetchFullNameAPI(admin_id);
            } catch (error) {
                console.error('Error fetching feedback admin name:', error);
                return null;
            }
        },
        enabled: hasFeedback && !!admin_id,
    });

    return (
        <div>
            <h3 className="border-l-4 border-[#FFBF10] pl-3 text-xl font-bold text-[#002D6F] sm:text-2xl">
                Your Feedback
            </h3>

            <div className="mt-3 min-h-[100px] whitespace-pre-wrap rounded-lg border border-dashed border-gray-300 bg-white p-4 text-sm leading-relaxed text-gray-500 shadow-sm">
                {hasFeedback ? value : 'No feedback provided.'}
            </div>

            {hasFeedback && admin_id && (
                <p className="mt-2 text-right text-xs font-medium text-gray-500">
                    By:{' '}
                    <span className="font-bold text-black">
                        {isLoading ? 'Loading...' : adminName || 'Unknown admin'}
                    </span>
                </p>
            )}
        </div>
    );
}*/}

function ProfilePhotoBox({
    label,
    imageUrl,
    useDefault = false,
}: {
    label: string;
    imageUrl?: string | null;
    useDefault?: boolean;
}) {
    const { data: signedUrl } = useQuery({
        queryKey: ['activity-record-avatar-url', imageUrl],
        queryFn: async () => {
        if (!imageUrl) return null;

        const { data, error } = await supabase.storage
            .from('avatars')
            .createSignedUrl(imageUrl, 3600);

        if (error) {
            console.error('Error creating signed avatar URL:', error);
            return null;
        }

        return data?.signedUrl || null;
        },
        enabled: !!imageUrl,
        refetchInterval: 1000 * 60 * 50,
    });

    const displayedImage = signedUrl || (useDefault ? profilepic : null);

    return (
        <div className="text-center">
        <p className="mb-2 text-sm font-bold text-black">{label}</p>

        <div className="mx-auto flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-[#d9d9d9] sm:h-32 sm:w-32 md:h-36 md:w-36">
            {displayedImage ? (
            <img
                src={displayedImage}
                alt={label}
                className="h-full w-full object-cover"
            />
            ) : (
            <span className="text-xs text-gray-500">No image</span>
            )}
        </div>
        </div>
    );
}

export default RecordDetails;