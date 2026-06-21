import { X } from 'lucide-react';
import { useState } from 'react';
import type { ApprovalRecord } from '../../../../../shared/types/approvals.types';
import type { ReportStatus } from '../../../../../shared/types/enums.types';
import StatusBadge from './StatusBadge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../config/supabase';
import profilepic from '../../../assets/images/default_pic.png';

type RecordDetailsProps = {
    record: ApprovalRecord;
    onClose: () => void;
    onReview?: (status: ReportStatus, feedback: string) => void | Promise<void>;
};

function RecordDetails({ record, onClose, onReview }: RecordDetailsProps) {
    const [feedback, setFeedback] = useState(record.admin_feedback || '');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleReview = async (status: ReportStatus) => {
        if (!onReview) return;

    try {
        setIsSubmitting(true);
        await onReview(status, feedback);
        } finally {
        setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm sm:p-4 lg:left-[270px]">
        <button
            type="button"
            aria-label="Close modal overlay"
            className="fixed inset-0"
            onClick={onClose}
        />

        <div className="relative flex max-h-[calc(100dvh-1.5rem)] w-full max-w-[560px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:max-h-[calc(100dvh-2rem)] md:max-w-[620px]">
            <div className="flex shrink-0 items-center justify-between  bg-gradient-to-r from-[#005de8] to-[#003d8f] px-4 py-3 text-white sm:px-5 sm:py-4">
            <h2 className="min-w-0 truncate pr-3 text-base font-bold sm:text-lg md:text-xl">
                {getTitle(record.type)}
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
            <div className="bg-[#EAF0FA] px-4 py-3 sm:px-5 sm:py-4">
                <h3 className="border-l-4 border-[#FFBF10] pl-3 text-lg font-bold text-black sm:text-xl">
                {record.name}
                </h3>

                <p className="pl-3 text-xs text-gray-700 sm:text-sm">
                {formatDate(record.created_at)}
                </p>
            </div>

            <div className="space-y-4 px-4 py-4 sm:px-5 sm:py-5">
                {record.type === 'eod_report' && (
                <>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <DetailItem
                        label="Time Submitted"
                        value={record.details?.time_submitted || '--'}
                    />
                    <DetailItem
                        label="Hours Rendered"
                        value={String(record.details?.hours_spent || '--')}
                    />
                    <StatusDetailItem label="Status" status={record.status} />
                    <DetailItem
                        label="Project Name"
                        value={record.details?.project_name || '--'}
                    />
                    <DetailItem
                        label="Intern Role"
                        value={record.details?.intern_role || record.position || '--'}
                    />
                    </div>

                    <DetailBox
                    label="Task Accomplished"
                    value={
                        record.details?.task_accomplished ||
                        'No task accomplished provided.'
                    }
                    />

                    <FeedbackBox value={feedback} onChange={setFeedback} />
                </>
                )}

                {record.type === 'leave_request' && (
                <>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

                    <DetailBox
                    label="Description"
                    value={record.details?.description || 'No description provided.'}
                    />

                    <FeedbackBox value={feedback} onChange={setFeedback} />
                </>
            )}

            {record.type === 'profile_update' && (
                <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <DetailItem
                    label="Time Submitted"
                    value={record.details?.time_submitted || '--'}
                    />
                    <StatusDetailItem label="Status" status={record.status} />
                </div>

                <DetailBox
                    label="Description"
                    value={record.description || 'No description provided.'}
                />

                {record.details?.update_type === 'avatar_update' && (
                    <div className="grid grid-cols-1 gap-5 pt-2 sm:grid-cols-2">
                        <ProfilePhotoBox
                        label="Old Profile Photo"
                        imageUrl={record.details.old_avatar_url}
                        useDefault
                        />

                        <ProfilePhotoBox
                        label="New Profile Photo"
                        imageUrl={record.details.new_avatar_url}
                        />
                    </div>
                    )}
                </>
                )}
            </div>
            </div>

        {record.status === 'pending' && (
            <div className="shrink-0 border-t border-gray-100 bg-white px-4 py-3 sm:px-5">
                <div className="grid grid-cols-2 gap-3 sm:flex sm:justify-end">
                <button
                    type="button"
                    onClick={() => handleReview('approved')}
                    disabled={isSubmitting}
                    className="h-10 w-full rounded-full bg-green-600 px-4 text-sm font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto sm:min-w-[110px] sm:px-5"
                >
                    Approve
                </button>

                <button
                    type="button"
                    onClick={() => handleReview('denied')}
                    disabled={isSubmitting}
                    className="h-10 w-full rounded-full bg-red-600 px-4 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto sm:min-w-[110px] sm:px-5"
                >
                    Decline
                </button>

                
                </div>
            </div>
            )}
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
        <p className="text-xs font-medium text-gray-500">{label}</p>

        <div className="mt-1">
            <StatusBadge status={status} />
        </div>
        </div>
    );
}

function DetailItem({ label, value }: { label: string; value: string }) {
    return (
        <div className="min-w-0">
        <p className="text-xs font-medium text-gray-500">{label}</p>
        <p className="mt-1 break-words text-sm font-bold text-black">{value}</p>
        </div>
    );
}

function DetailBox({ label, value }: { label: string; value: string }) {
    return (
        <div>
        <p className="mb-2 text-sm font-bold text-black">{label}</p>

        <div className="max-h-[180px] min-h-[50px] overflow-y-auto rounded-lg bg-[#f5f5f5] p-4 text-sm leading-relaxed text-gray-700 sm:max-h-[220px]">
            {value}
        </div>
        </div>
    );
}

function FeedbackBox({
    value,
    onChange,
}: {
    value: string;
    onChange: (value: string) => void;
}) {
    return (
        <div>
        <h3 className="border-l-4 border-[#FFBF10] pl-3 text-lg font-bold text-[#002D6F] sm:text-xl">
            Your Feedback
        </h3>

        <textarea
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="Enter your feedback here..."
            className="mt-3 min-h-[100px] w-full resize-none rounded-lg border border-dashed border-gray-300 bg-white p-4 text-sm leading-relaxed text-gray-700 outline-none transition focus:border-[#0058DD] focus:ring-2 focus:ring-[#0058DD]/20 sm:min-h-[110px]"
        />
        </div>
    );
}

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
        queryKey: ['approval-avatar-url', imageUrl],
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

function getTitle(type: ApprovalRecord['type']) {
    switch (type) {
        case 'eod_report':
        return 'End of Day Report';
        case 'leave_request':
        return 'Leave Request';
        case 'profile_update':
        return 'Profile Change';
        default:
        return 'Request Details';
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
        return 'Sick / Medical';
        case 'academic':
        return 'Academic';
        default:
        return value || '--';
    }
}

export default RecordDetails;