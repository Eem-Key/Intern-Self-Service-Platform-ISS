import { useState } from 'react';
import { X } from 'lucide-react';

import type { EODReportAdminReviewed } from '../../../../../shared/types/eodReport.types';
import type { ReportStatus } from '../../../../../shared/types/enums.types';

import EODDetails from './EODDetails';

type EODReportWithRecordStatus = EODReportAdminReviewed & {
    status?: ReportStatus | null;
};

type EODReportsTableProps = {
    reports: EODReportWithRecordStatus[];
    isLoading?: boolean;
    internName?: string;
    internSubtitle?: string;
};

function formatDate(value?: string | null) {
    if (!value) return '--';

    return new Date(value).toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
    });
}

function formatFullDate(value?: string | null) {
    if (!value) return '--';

    return new Date(value).toLocaleDateString('en-US', {
        month: 'long',
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

function formatStatus(value?: string | null) {
    if (!value) return '--';

    switch (value) {
        case 'approved':
            return 'Approved';
        case 'denied':
            return 'Failed';
        case 'failed':
            return 'Failed';
        case 'pending':
            return 'Pending';
        case 'draft':
            return 'Draft';
        default:
            return value.charAt(0).toUpperCase() + value.slice(1);
    }
}

function EODReportsTable({
    reports,
    isLoading,
    internName = 'Intern',
    internSubtitle = '',
}: EODReportsTableProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedReport, setSelectedReport] =
        useState<EODReportWithRecordStatus | null>(null);

    const nonDraftReports = reports.filter((report) => report.status !== 'draft');
    const visibleReports = nonDraftReports.slice(0, 5);

    return (
        <>
            <section className="flex min-h-[360px] flex-col rounded-xl bg-white shadow-md">
                <div className="px-4 py-4 sm:px-5">
                    <h2 className="border-l-4 border-[#FFBF10] pl-2 text-lg font-bold text-black sm:text-xl">
                        End of Day Reports
                    </h2>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 sm:px-5 lg:px-0 lg:pb-0">
                    {/* Mobile / Tablet Cards */}
                    <div className="space-y-3 lg:hidden">
                        {isLoading && (
                            <LoadingState message="Loading EOD reports..." />
                        )}

                        {!isLoading && visibleReports.length === 0 && (
                            <EmptyState message="No EOD reports found." />
                        )}

                        {!isLoading &&
                            visibleReports.map((report) => (
                                <EODReportCard
                                    key={report.record_id}
                                    report={report}
                                    onView={() => setSelectedReport(report)}
                                />
                            ))}
                    </div>

                    {/* Desktop Table */}
                    <div className="hidden h-full overflow-y-auto lg:block">
                        <table className="w-full table-fixed border-collapse">
                            <colgroup>
                                <col className="w-[30%]" />
                                <col className="w-[25%]" />
                                <col className="w-[25%]" />
                                <col className="w-[20%]" />
                            </colgroup>

                            <thead className="sticky top-0 z-10 bg-[#EAF0FA]">
                                <tr>
                                    <TableHead>Date</TableHead>
                                    <TableHead center>Submission</TableHead>
                                    <TableHead center>Status</TableHead>
                                    <TableHead center>Action</TableHead>
                                </tr>
                            </thead>

                            <tbody>
                                {isLoading && (
                                    <tr>
                                        <td colSpan={4} className="h-[240px]">
                                            <LoadingState message="Loading EOD reports..." />
                                        </td>
                                    </tr>
                                )}

                                {!isLoading && visibleReports.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={4}
                                            className="px-6 py-10 text-center text-sm text-gray-500"
                                        >
                                            No EOD reports found.
                                        </td>
                                    </tr>
                                )}

                                {!isLoading &&
                                    visibleReports.map((report) => (
                                        <EODReportTableRow
                                            key={report.record_id}
                                            report={report}
                                            onView={() => setSelectedReport(report)}
                                        />
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {nonDraftReports.length > 5 && (
                    <button
                        type="button"
                        onClick={() => setIsModalOpen(true)}
                        className="border-t border-gray-100 bg-[#EAF0FA] py-3 text-sm font-medium text-black transition hover:bg-[#dfeafb]"
                    >
                        Load More
                    </button>
                )}
            </section>

            {isModalOpen && (
                <EODReportsModal
                    reports={nonDraftReports}
                    internName={internName}
                    internSubtitle={internSubtitle}
                    onClose={() => setIsModalOpen(false)}
                    onView={(report) => setSelectedReport(report)}
                />
            )}

            {selectedReport && (
                <EODDetails
                    report={selectedReport}
                    onClose={() => setSelectedReport(null)}
                />
            )}
        </>
    );
}

function EODReportsModal({
    reports,
    internName,
    internSubtitle,
    onClose,
    onView,
}: {
    reports: EODReportWithRecordStatus[];
    internName: string;
    internSubtitle: string;
    onClose: () => void;
    onView: (report: EODReportWithRecordStatus) => void;
}) {
    return (
        <div className="fixed inset-0 z-[99998] flex items-center justify-center bg-black/55 px-3 backdrop-blur-sm sm:px-4 xl:left-[270px]">
            <button
                type="button"
                aria-label="Close EOD reports modal overlay"
                className="fixed inset-0"
                onClick={onClose}
            />

            <div className="relative flex h-[85dvh] max-h-[720px] w-full max-w-[660px] flex-col overflow-hidden rounded-xl bg-white shadow-xl">
                <div className="flex items-center justify-between bg-gradient-to-r from-[#005de8] to-[#003d8f] px-5 py-4 text-white sm:px-6">
                    <h2 className="border-l-4 border-[#FFBF10] pl-2 text-xl font-bold sm:text-2xl">
                        End of Day Reports
                    </h2>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full p-1 transition hover:bg-white/10"
                        aria-label="Close EOD reports"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="border-b border-gray-100 px-5 py-4 sm:px-6">
                    <h3 className="border-l-4 border-[#FFBF10] pl-2 text-xl font-bold text-black sm:text-2xl">
                        {internName}
                    </h3>

                    {internSubtitle && (
                        <p className="pl-2 text-sm text-black">
                            {internSubtitle}
                        </p>
                    )}
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-4 sm:px-5 lg:px-0 lg:pb-0">
                    {/* Mobile / Tablet Cards */}
                    <div className="space-y-3 py-4 lg:hidden">
                        {reports.length === 0 ? (
                            <EmptyState message="No EOD reports found." />
                        ) : (
                            reports.map((report) => (
                                <EODReportCard
                                    key={report.record_id}
                                    report={report}
                                    onView={() => onView(report)}
                                />
                            ))
                        )}
                    </div>

                    {/* Desktop Table */}
                    <div className="hidden h-full overflow-auto lg:block">
                        <table className="w-full table-fixed border-collapse">
                            <colgroup>
                            <col className="w-[28%]" />
                            <col className="w-[24%]" />
                            <col className="w-[24%]" />
                            <col className="w-[24%]" />
                        </colgroup>

                        <thead className="sticky top-0 z-10 bg-[#EAF0FA]">
                            <tr>
                                <TableHead>Date</TableHead>
                                <TableHead center>Submission</TableHead>
                                <TableHead center>Status</TableHead>
                                <TableHead center>Action</TableHead>
                            </tr>
                        </thead>

                            <tbody>
                                {reports.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={4}
                                            className="px-6 py-10 text-center text-sm text-gray-500"
                                        >
                                            No EOD reports found.
                                        </td>
                                    </tr>
                                ) : (
                                    reports.map((report) => (
                                        <EODReportTableRow
                                            key={report.record_id}
                                            report={report}
                                            onView={() => onView(report)}
                                        />
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

function EODReportCard({
    report,
    onView,
}: {
    report: EODReportWithRecordStatus;
    onView: () => void;
}) {
    return (
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="break-words text-sm font-bold text-black">
                        {formatFullDate(report.date_written)}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                        Submission:{' '}
                        {formatTime(report.reviewed_at || report.date_written)}
                    </p>
                </div>

                <StatusPill status={formatStatus(report.status)} />
            </div>

            <div className="mt-4 flex items-center justify-between rounded-lg bg-[#F7F7F7] p-3">
                <div>
                    <p className="text-[11px] font-semibold text-gray-500">
                        Project
                    </p>
                    <p className="mt-1 text-xs font-bold text-black">
                        {report.project_name || '--'}
                    </p>
                </div>

                <button
                    type="button"
                    onClick={onView}
                    className="shrink-0 text-xs font-bold text-[#002D6F] transition hover:text-[#0058DD]"
                >
                    View
                </button>
            </div>
        </div>
    );
}

function EODReportTableRow({
    report,
    onView,
}: {
    report: EODReportWithRecordStatus;
    onView: () => void;
}) {
    return (
        <tr className="border-b border-gray-100">
            <TableCell>{formatFullDate(report.date_written)}</TableCell>

            <TableCell center>
                {formatTime(report.reviewed_at || report.date_written)}
            </TableCell>

            <TableCell center>
                <div className="flex justify-center">
                    <StatusPill status={formatStatus(report.status)} />
                </div>
            </TableCell>

            <TableCell center>
                <button
                    type="button"
                    onClick={onView}
                    className="text-sm font-bold text-[#002D6F] transition hover:text-[#0058DD]"
                >
                    View
                </button>
            </TableCell>
        </tr>
    );
}

function StatusPill({ status }: { status: string }) {
    const normalized = status.toLowerCase();

    const className =
        normalized === 'approved'
            ? 'bg-green-100 text-green-600'
            : normalized === 'failed' || normalized === 'denied'
                ? 'bg-red-100 text-red-600'
                : normalized === 'pending'
                ? 'bg-yellow-100 text-yellow-600'
                : 'bg-gray-100 text-gray-600';

    return (
        <span
            className={`inline-flex w-fit min-w-[76px] justify-center rounded-full px-3 py-1 text-xs font-bold ${className}`}
        >
            {status}
        </span>
    );
}

function TableHead({
    children,
    center = false,
}: {
    children: React.ReactNode;
    center?: boolean;
}) {
    return (
        <th
            className={`whitespace-nowrap px-4 py-4 text-sm font-bold text-black ${
                center ? 'text-center' : 'text-left'
            }`}
        >
            {children}
        </th>
    );
}

function TableCell({
    children,
    center = false,
}: {
    children: React.ReactNode;
    center?: boolean;
}) {
    return (
        <td
            className={`truncate px-4 py-4 text-sm text-black ${
                center ? 'text-center' : 'text-left'
            }`}
        >
            {children}
        </td>
    );
}

function LoadingState({ message }: { message: string }) {
    return (
        <div className="flex h-[240px] flex-col items-center justify-center gap-3">
            <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#EAF0FA] border-t-[#0058DD]" />
            <p className="text-sm font-medium text-gray-500">{message}</p>
        </div>
    );
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="py-10 text-center text-sm text-gray-500">
            {message}
        </div>
    );
}

export default EODReportsTable;