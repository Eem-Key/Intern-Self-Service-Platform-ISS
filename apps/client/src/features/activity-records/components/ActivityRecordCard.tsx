{/*import { useQuery } from '@tanstack/react-query';*/}

import StatusBadge from '../components/StatusBadge';
{/*import profilepic from '../../../assets/images/default_pic.png';*/}
{/*import { supabase } from '../../../config/supabase';*/}
import type { ApprovalRecord } from '../../../../../shared/types/approvals.types';
import type { ReportStatus } from '../../../../../shared/types/enums.types';

type ReviewedStatus = Extract<ReportStatus, 'approved' | 'denied'>;

export type AdminActivityRecordItem = ApprovalRecord & {
    status: ReviewedStatus;
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

    return `${timePart}\n${datePart}`;
}

function ActivityRecordCard({ record, onView }: ActivityRecordCardProps) {
    {/*remove comment after fetch api for avatar*/}
    {/*const hasAvatarPath = Boolean(record.avatar_url);

    const { data: signedAvatarUrl, isLoading: isAvatarLoading } = useQuery({
        queryKey: ['activity-record-avatar-signed-url', record.avatar_url],
        queryFn: async () => {
        if (!record.avatar_url) return null;

        const { data, error } = await supabase.storage
            .from('avatars')
            .createSignedUrl(record.avatar_url, 3600);

        if (error) {
            console.error('Error creating activity record avatar signed URL:', error);
            return null;
        }

        return data?.signedUrl || null;
        },
        enabled: !!record.avatar_url,
        refetchInterval: 1000 * 60 * 50,
    });

    const avatarImage = signedAvatarUrl || (!hasAvatarPath ? profilepic : null);*/}

    return (
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm lg:grid lg:min-h-[86px] lg:grid-cols-[44px_1.5fr_0.9fr_1fr_1fr_0.7fr_0.45fr] lg:items-center lg:gap-4 lg:rounded-none lg:border-0 lg:border-b lg:border-gray-100 lg:px-6 lg:py-3 lg:shadow-none">
        <div className="flex min-w-0 items-center gap-4 lg:contents">
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-[#d9d9d9]">
            {/*remove comment after fetch api for avatar*/}
            {/*{isAvatarLoading && hasAvatarPath ? (
                <div className="h-full w-full animate-pulse bg-gray-300" />
            ) : avatarImage ? (
                <img
                src={avatarImage}
                alt={`${record.name} profile`}
                className="h-full w-full object-cover"
                />
            ) : (
                <div className="h-full w-full bg-[#d9d9d9]" />
            )}*/}
            </div>

            <div className="min-w-0">
            <p className="text-xs font-medium text-gray-500 lg:hidden">Name</p>
            <h3 className="truncate text-sm font-bold text-black sm:text-base">
                {record.name}
            </h3>
            </div>
        </div>

        <div className="mt-3 lg:mt-0">
            <p className="text-xs font-medium text-gray-500 lg:hidden">
            Department
            </p>
            <p className="text-sm text-black">{record.department || '--'}</p>
        </div>

        <div className="mt-3 lg:mt-0">
            <p className="text-xs font-medium text-gray-500 lg:hidden">Type</p>
            <p className="text-sm text-black">
            {formatRecordType(record.log_category)}
            </p>
        </div>

        <div className="mt-3 lg:mt-0">
            <p className="text-xs font-medium text-gray-500 lg:hidden">
            Submission
            </p>
            <p className="whitespace-pre-line text-sm leading-tight text-black">
            {formatSubmissionDate(record.created_at)}
            </p>
        </div>

        <div className="mt-3 lg:mt-0">
            <p className="mb-1 text-xs font-medium text-gray-500 lg:hidden">
            Status
            </p>
            <StatusBadge status={record.status} />
        </div>

        <div className="mt-3 flex justify-end lg:mt-0 lg:justify-center">
            <button
            type="button"
            onClick={onView}
            className="text-sm font-bold text-[#002D6F] transition hover:text-[#0058DD]"
            >
            View
            </button>
        </div>
        </div>
    );
}

export default ActivityRecordCard;