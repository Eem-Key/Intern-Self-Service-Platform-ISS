import { useQuery } from '@tanstack/react-query';
import { X } from 'lucide-react';

import { fetchFullNameAPI } from '../../../api/profile.api';
import StatusBadge from '../../activity-logs/components/StatusBadge';

import type { EODReportAdminReviewed } from '../../../../../shared/types/eodReport.types';
import type { ReportStatus } from '../../../../../shared/types/enums.types';

type EODReportWithStatus = EODReportAdminReviewed & {
    status?: ReportStatus | null;
};

type EODDetailsProps = {
    report: EODReportWithStatus;
    onClose: () => void;
};

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

function formatSubmittedAt(value?: string | null) {
    if (!value) return '--';

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

function EODDetails({ report, onClose }: EODDetailsProps) {
    const status = report.status || 'pending';

    const { data: adminName, isLoading: isAdminNameLoading } = useQuery({
        queryKey: ['eod-details-admin-name', report.admin_id],
        queryFn: async () => {
            if (!report.admin_id) return null;
            return fetchFullNameAPI(report.admin_id);
        },
        enabled: !!report.admin_id,
        retry: false,
    });

    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/55 px-3 backdrop-blur-sm sm:px-4 xl:left-[270px]">
            <button
                type="button"
                aria-label="Close modal overlay"
                className="fixed inset-0"
                onClick={onClose}
            />

            <div className="relative flex h-[85dvh] max-h-[560px] w-full max-w-[620px] flex-col overflow-hidden rounded-xl bg-white shadow-xl">
                <div className="flex items-start justify-between bg-gradient-to-r from-[#005de8] to-[#003d8f] px-5 py-4 text-white sm:px-6">
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-3">
                            <h2 className="border-l-4 border-[#FFBF10] pl-2 text-xl font-bold sm:text-2xl">
                                End of Day Report
                            </h2>

                            <StatusBadge status={status} />
                        </div>

                        <p className="mt-1 text-xs text-white/80">
                            Submitted on {formatSubmittedAt(report.date_written)}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="shrink-0 rounded-full p-1 transition hover:bg-white/10"
                        aria-label="Close EOD details"
                    >
                        <X size={22} />
                    </button>
                </div>

                <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
                        <DetailItem
                            label="Date"
                            value={formatDate(report.date_written)}
                        />

                        <DetailItem
                            label="Hours Spent"
                            value={
                                report.hours_spent !== null &&
                                report.hours_spent !== undefined
                                    ? `${report.hours_spent} Hrs`
                                    : '--'
                            }
                        />

                        <DetailItem
                            label="Project"
                            value={report.project_name || '--'}
                        />
                    </div>

                    <DetailBox
                        label="Task Accomplished"
                        value={
                            report.task_accomplished ||
                            'No task accomplished provided.'
                        }
                    />

                    
                        <AdminFeedback
                            value={report.admin_feedback}
                            adminName={
                                isAdminNameLoading
                                    ? 'Loading...'
                                    : adminName || 'Unknown admin'
                            }
                            reviewedAt={report.reviewed_at}
                            hasAdmin={Boolean(report.admin_id)}
                            status={status}
                        />
                </div>
            </div>
        </div>
    );
}

function DetailItem({ label, value }: { label: string; value: string }) {
    return (
        <div className="min-w-0">
            <p className="text-[11px] font-medium text-gray-600 sm:text-xs">
                {label}
            </p>

            <p className="mt-1 break-words text-xs font-bold text-black sm:text-sm">
                {value}
            </p>
        </div>
    );
}

function DetailBox({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="mb-2 text-sm font-bold text-black">{label}</p>

            <div className="min-h-[120px] whitespace-pre-wrap rounded bg-[#eeeeee] p-4 text-sm leading-relaxed text-gray-800">
                {value}
            </div>
        </div>
    );
}

function AdminFeedback({
    value,
    adminName,
    reviewedAt,
    hasAdmin,
    status,
}: {
    value?: string | null;
    adminName: string;
    reviewedAt?: string | null;
    hasAdmin: boolean;
    status?: string | null;
}) {
    const normalizedStatus = status?.toLowerCase();
    const isPending = normalizedStatus === 'pending';
    const isApproved = normalizedStatus === 'approved';
    const hasFeedback = Boolean(value?.trim());

    const placeholderText = isApproved
        ? 'No feedback provided.'
        : 'No feedback provided yet...';

    return (
        <div>
            <h3 className="border-l-4 border-[#FFBF10] pl-2 text-xl font-bold text-[#002D6F] sm:text-2xl">
                {isPending ? 'Your Feedback' : 'Admin Feedback'}
            </h3>

            <div className="mt-3 min-h-[140px] rounded-xl border border-dashed border-gray-300 bg-white p-4 text-sm leading-relaxed text-gray-500 shadow-sm">
                {hasFeedback ? value : placeholderText}
            </div>

            {!isPending && hasAdmin && (
                <div className="mt-2 flex flex-col gap-1 text-xs font-medium text-gray-500 sm:flex-row sm:items-center sm:justify-between">
                    <p>
                        By:{' '}
                        <span className="font-bold text-black">
                            {adminName}
                        </span>
                    </p>

                    <p>
                        Reviewed:{' '}
                        <span className="font-bold text-black">
                            {reviewedAt
                                ? `${formatDate(reviewedAt)} ${formatTime(reviewedAt)}`
                                : '--'}
                        </span>
                    </p>
                </div>
            )}
        </div>
    );
}

export default EODDetails;