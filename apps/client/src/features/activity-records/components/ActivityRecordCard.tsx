import { useQuery } from '@tanstack/react-query';

import StatusBadge from '../components/StatusBadge';
import profilepic from '../../../assets/images/default_pic.png';
import { supabase } from '../../../config/supabase';
import type { ApprovalRecord } from '../../../../../shared/types/approvals.types';
import type { ReportStatus } from '../../../../../shared/types/enums.types';

type ReviewedStatus = Extract<ReportStatus, 'approved' | 'denied'>;

export type AdminActivityRecordItem = ApprovalRecord & {
    status: ReviewedStatus;
    avatar_url?: string | null;
};

type ActivityRecordCardProps = {
    record: AdminActivityRecordItem;
    onView: () => void;
};

function formatRecordType(type: AdminActivityRecordItem['log_category']) {
    switch (type) {
        case 'eod_report':
            return 'EoD Report';
        case 'leave_request':
            return 'Leave Request';
        case 'profile_update':
            return 'Profile Change';
        default:
            return type;
    }
}

function formatSubmissionDate(value?: string | null) {
    if (!value) return '--';

    const date = new Date(value);

    const timePart = date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    });

    const datePart = date.toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
    });

    return `${datePart}\n${timePart}`;
}

function ActivityRecordCard({ record, onView }: ActivityRecordCardProps) {
    const avatarPath = record.avatar_url || null;
    const hasAvatarPath = Boolean(avatarPath);

    const { data: signedAvatarUrl, isLoading: isAvatarLoading } = useQuery({
        queryKey: ['activity-record-avatar-signed-url', record.intern_id, avatarPath],
        queryFn: async () => {
            if (!avatarPath) return null;

            const { data, error } = await supabase.storage
                .from('avatars')
                .createSignedUrl(avatarPath, 3600);

            if (error) {
                console.error('Error creating activity record avatar signed URL:', error);
                return null;
            }

            return data?.signedUrl || null;
        },
        enabled: hasAvatarPath,
        refetchOnMount: 'always',
        refetchOnWindowFocus: true,
        refetchInterval: 1000 * 60 * 50,
    });

    const avatarImage = signedAvatarUrl || (!hasAvatarPath ? profilepic : null);

    return (
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm lg:grid lg:min-h-[86px] lg:grid-cols-[44px_1.5fr_0.9fr_1fr_1fr_0.7fr_0.45fr] lg:items-center lg:gap-4 lg:rounded-none lg:border-0 lg:border-b lg:border-gray-100 lg:px-6 lg:py-3 lg:shadow-none">
            {/* Mobile / Tablet + Desktop */}
            <div className="flex min-w-0 items-start gap-4 lg:contents">
                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-[#d9d9d9]">
                    {isAvatarLoading && hasAvatarPath ? (
                        <div className="h-full w-full animate-pulse bg-gray-300" />
                    ) : avatarImage ? (
                        <img
                            src={avatarImage}
                            alt={`${record.name} profile`}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="h-full w-full bg-[#d9d9d9]" />
                    )}
                </div>

                <div className="min-w-0 flex-1 lg:flex-none">
                    <div className="flex items-start justify-between gap-3 lg:block">
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-500 lg:hidden">
                                {formatRecordType(record.log_category)}
                            </p>

                            <h3 className="mt-1 break-words text-sm font-bold text-black sm:text-base lg:mt-0 lg:truncate">
                                {record.name}
                            </h3>
                        </div>

                        <div className="shrink-0 lg:hidden">
                            <StatusBadge status={record.status} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Desktop Department */}
            <div className="hidden lg:block">
                <p className="text-sm text-black">{record.department || '--'}</p>
            </div>

            {/* Desktop Type */}
            <div className="hidden lg:block">
                <p className="text-sm text-black">
                    {formatRecordType(record.log_category)}
                </p>
            </div>

            {/* Mobile Details */}
            <div className="mt-4 grid grid-cols-2 gap-3 lg:hidden">
                <MobileField label="Department" value={record.department || '--'} />
                <MobileField
                    label="Submission"
                    value={formatSubmissionDate(record.created_at)}
                />
            </div>

            {/* Desktop Submission */}
            <div className="hidden lg:block">
                <p className="whitespace-pre-line text-sm leading-tight text-black">
                    {formatSubmissionDate(record.created_at)}
                </p>
            </div>

            {/* Desktop Status */}
            <div className="hidden lg:block">
                <StatusBadge status={record.status} />
            </div>

            {/* Action */}
            <div className="mt-4 flex justify-end lg:mt-0 lg:justify-center">
                <button
                    type="button"
                    onClick={onView}
                    className="shrink-0 rounded-full px-2 py-1 text-xs font-bold text-[#002D6F] transition hover:bg-[#EAF0FA] hover:text-[#0058DD] sm:text-sm lg:rounded-none lg:px-0 lg:py-0"
                >
                    View
                </button>
            </div>
        </div>
    );
}

function MobileField({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="text-xs font-medium text-gray-500">{label}</p>
            <p className="mt-1 whitespace-pre-line text-xs font-semibold leading-tight text-gray-700">
                {value}
            </p>
        </div>
    );
}

export default ActivityRecordCard;