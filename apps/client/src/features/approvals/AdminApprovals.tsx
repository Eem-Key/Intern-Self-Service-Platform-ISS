import { useEffect, useState } from 'react';

import AdminSidebar from '../AdminSidebar';
import Banner from '../approvals/banner/ApprovalBanner';
import TopFilterBar from '../approvals/components/TopFilterBar';
import SearchBar from '../approvals/components/SearchBar';
import DepartmentType from '../approvals/components/DepartmentType';
import ActivityRecordCard from '../approvals/components/ActivityRecordCard';
import RecordDetails from '../approvals/components/RecordDetails';
import {
    usefetchPendingRequestsPerRecord,
    useFetchPendingApprovalRecords,
} from '../../api/adminApprovals.api';

import type {
    ApprovalTab,
    ApprovalRecord,
} from '../../../../shared/types/approvals.types';

import StatusMessage from '../../components/feedback/AdminStatusMessage';
import { useQueryClient } from '@tanstack/react-query';
import { updateAdminReviewRecord } from '../../api/record.api';
import type {
    ReportStatus,
    ProfileUpdateType,
} from '../../../../shared/types/enums.types';
import type { ProfileUpdate } from '../../../../shared/types/profile.types';
import type { InternInfo } from '../../../../shared/types/intern.types';


function getPageNumbers(
    currentPage: number,
    totalPages: number,
    maxVisible: number
) {
    if (totalPages <= maxVisible) {
        return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    // Mobile / tablet
    if (maxVisible === 2) {
        if (currentPage <= 1) {
            return [1, 2, '...', totalPages];
        }

        if (currentPage >= totalPages) {
            return [1, '...', totalPages - 1, totalPages];
        }

        return [currentPage, '...', totalPages];
    }

    // Desktop / laptop
    if (currentPage <= 3) {
        return [1, 2, 3, '...', totalPages];
    }

    if (currentPage >= totalPages - 2) {
        return [1, '...', totalPages - 2, totalPages - 1, totalPages];
    }

    return [1, '...', currentPage, '...', totalPages];
}

function getSuccessTitle(record: ApprovalRecord) {
    if (record.log_category === 'eod_report') return 'EOD Report Approved';
    if (record.log_category === 'leave_request') return 'Leave Request Approved';

    if (record.details?.update_type === 'avatar_update') {
        return 'Profile Picture Updated';
    }

    return 'Changes Saved';
}

function getSuccessMessage(record: ApprovalRecord) {
    if (record.log_category === 'eod_report') {
        return 'The submission has been verified and recorded.';
    }

    if (record.log_category === 'leave_request') {
        return 'The leave request has been successfully approved and updated in the records.';
    }

    if (record.details?.update_type === 'avatar_update') {
        return 'The profile picture has been successfully updated in the system.';
    }

    return 'The profile information has been successfully updated in the system.';
}

function getDeclineTitle(record: ApprovalRecord) {
    if (record.log_category === 'eod_report') return 'EOD Report Declined';
    if (record.log_category === 'leave_request') return 'Request Declined';

    return 'Update Failed';
}

function getDeclineMessage(record: ApprovalRecord) {
    if (record.log_category === 'eod_report') {
        return 'The submission has been rejected. This entry will be returned to the intern to edit.';
    }

    if (record.log_category === 'leave_request') {
        return 'The leave request has been declined. The intern will be notified of the status change.';
    }

    return 'The request has been declined. The intern will be notified of the status change.';
}

function AdminApprovals() {
    const queryClient = useQueryClient();

    const { data: counts = {} } = usefetchPendingRequestsPerRecord();

    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 5;

    const [activeTab, setActiveTab] = useState<ApprovalTab>('eod_report');
    const [searchValue, setSearchValue] = useState('');
    const [department, setDepartment] = useState('all');
    const [selectedRecord, setSelectedRecord] = useState<ApprovalRecord | null>(
        null
    );

    const [statusMessage, setStatusMessage] = useState<{
    variant: 'success' | 'error';
    title: string;
    message: string;
    } | null>(null);

    const { data: approvalData, isLoading } = useFetchPendingApprovalRecords(
        currentPage - 1,
        rowsPerPage,
        activeTab,
        searchValue,
        department
    );

    const records = approvalData?.data ?? [];
    const count = approvalData?.count ?? 0;

    const totalPages = count ? Math.ceil(count / rowsPerPage) : 0;
    const [isMobileOrTablet, setIsMobileOrTablet] = useState(false);
        const pageNumbers = getPageNumbers(
            currentPage,
            totalPages,
            isMobileOrTablet ? 2 : 5
        );

    const startEntry = count === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
    const endEntry = Math.min(currentPage * rowsPerPage, count);

    useEffect(() => {
        document.title = 'Approvals | Intern Self Service';
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab, searchValue, department]);

    
    const handleReview = async (
    record: ApprovalRecord,
    status: ReportStatus,
    feedback: string
) => {
    try {
        const updateType = record.details?.update_type as
        | ProfileUpdateType
        | undefined;

    let profileData: ProfileUpdate | undefined;
    let internData: InternInfo | undefined;

    if (record.log_category === 'profile_update') {
        const requestedData = record.details?.requested_data as
            | (ProfileUpdate & { intern_info?: InternInfo })
            | undefined;

        if (updateType === 'avatar_update') {
            profileData = {
            avatar_url:
                record.details?.avatar_url ||
                requestedData?.avatar_url ||
                '',
            };
        }

        if (updateType === 'information_update' && requestedData) {
            const { intern_info, ...profileFields } = requestedData;

            profileData = profileFields as ProfileUpdate;
            internData = intern_info;
        }
    }

    await updateAdminReviewRecord(
        record.id,
        feedback,
        status,
        updateType,
        profileData,
        internData
    );

    await queryClient.invalidateQueries({
        queryKey: ['pendingRequests'],
    });

    await queryClient.invalidateQueries({
        queryKey: ['admin-approval-records'],
    });

    setSelectedRecord(null);

    setStatusMessage({
        variant: status === 'approved' ? 'success' : 'error',
        title:
            status === 'approved'
            ? getSuccessTitle(record)
            : getDeclineTitle(record),
        message:
            status === 'approved'
            ? getSuccessMessage(record)
            : getDeclineMessage(record),
        });
    } catch (error) {
        console.error('Failed to review record:', error);

        setStatusMessage({
        variant: 'error',
        title: 'Update Failed',
        message: 'The request could not be updated. Please try again.',
        });
    }
};

    useEffect(() => {
        if (!statusMessage) return;

        const timeout = window.setTimeout(() => {
            setStatusMessage(null);
        }, 4000);

        return () => window.clearTimeout(timeout);
        }, [statusMessage]);

    useEffect(() => {
        const updateScreenSize = () => {
            setIsMobileOrTablet(window.innerWidth < 768);
        };

        updateScreenSize();
        window.addEventListener('resize', updateScreenSize);

        return () => {
            window.removeEventListener('resize', updateScreenSize);
        };
    }, []);

    return (
        <main className="min-h-screen bg-[#eeeeee] text-black lg:flex">
            {statusMessage && (
            <StatusMessage
                isFixed
                variant={statusMessage.variant}
                title={statusMessage.title}
                message={statusMessage.message}
                onClose={() => setStatusMessage(null)}
            />
            )}
        <AdminSidebar />

        <section className="w-full px-4 pb-4 pt-20 sm:px-5 sm:pt-24 xl:ml-[270px] xl:px-6 xl:py-5">
            <div className="mx-auto flex min-h-full w-full max-w-[2560px] flex-col gap-5">
            <Banner />

            <div className="overflow-hidden rounded-xl bg-white shadow-md">
                <TopFilterBar
                activeTab={activeTab}
                onChange={setActiveTab}
                counts={{
                    eod_report: counts.eod_report || 0,
                    leave_request: counts.leave_request || 0,
                    profile_update: counts.profile_update || 0,
                }}
                />

                <div className="flex flex-row items-center gap-2 bg-[#EAF0FA] px-3 py-3 sm:gap-3 sm:px-4 sm:py-4">
                    <SearchBar value={searchValue} onChange={setSearchValue} />
                    <DepartmentType value={department} onChange={setDepartment} />
                </div>

                <div className="flex h-[430px] min-h-0 flex-col">
                <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-3 sm:px-4 lg:space-y-0 lg:divide-y lg:divide-gray-100">
                    {isLoading ? (
                    <div className="flex h-full flex-col items-center justify-center gap-3">
                        <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#EAF0FA] border-t-[#0058DD]" />
                        <p className="text-sm font-medium text-gray-500">
                        Loading pending records...
                        </p>
                    </div>
                    ) : records.length > 0 ? (
                    records.map((record) => (
                        <ActivityRecordCard
                        key={record.id}
                        record={record}
                        onView={() => setSelectedRecord(record)}
                        />
                    ))
                    ) : (
                    <div className="flex h-full items-center justify-center">
                        <p className="text-center text-sm text-gray-500">
                        No pending approval requests found.
                        </p>
                    </div>
                    )}
                </div>
                </div>
            </div>

            <div className="flex w-full items-center justify-between gap-2 overflow-x-auto px-3 text-xs text-gray-500 sm:px-5">
                <p className="shrink-0 whitespace-nowrap text-[11px] sm:text-xs">
                    Showing {startEntry} to {endEntry} of {count} entries
                </p>

                {totalPages > 1 && (
                    <div className="flex shrink-0 items-center justify-end gap-1 whitespace-nowrap sm:gap-2">
                        <button
                            type="button"
                            disabled={currentPage === 1}
                            onClick={() =>
                                setCurrentPage((prev) => Math.max(1, prev - 1))
                            }
                            className="shrink-0 rounded-full border border-gray-300 bg-white px-2 py-1.5 text-[10px] text-black disabled:cursor-not-allowed disabled:opacity-50 sm:px-3 sm:text-xs lg:px-4 lg:text-sm"
                        >
                            <span className="sm:hidden">Prev</span>
                            <span className="hidden sm:inline">Previous</span>
                        </button>

                        {pageNumbers.map((page, index) => {
                            if (typeof page === 'string') {
                                return (
                                    <span
                                        key={`ellipsis-${index}`}
                                        className="flex h-7 w-4 shrink-0 items-center justify-center text-[10px] text-gray-400 sm:h-8 sm:w-6 sm:text-sm lg:w-8"
                                    >
                                        ...
                                    </span>
                                );
                            }

                            return (
                                <button
                                    key={page}
                                    type="button"
                                    onClick={() => setCurrentPage(page)}
                                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[11px] sm:h-8 sm:w-8 sm:text-sm ${
                                        currentPage === page
                                            ? 'border-[#FFBF10] bg-[#FFBF10] text-black'
                                            : 'border-gray-300 bg-white text-black'
                                    }`}
                                >
                                    {page}
                                </button>
                            );
                        })}

                        <button
                            type="button"
                            disabled={currentPage === totalPages}
                            onClick={() =>
                                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                            }
                            className="shrink-0 rounded-full border border-gray-300 bg-white px-2 py-1.5 text-[10px] text-black disabled:cursor-not-allowed disabled:opacity-50 sm:px-3 sm:text-xs lg:px-4 lg:text-sm"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
            </div>
        </section>

        {selectedRecord && (
        <RecordDetails
            record={selectedRecord}
            onClose={() => setSelectedRecord(null)}
            onReview={(status, feedback) =>
                handleReview(selectedRecord, status, feedback)
            }
            />
        )}
        </main>
    );
}

export default AdminApprovals;