import { useEffect, useState } from 'react';

import AdminSidebar from '../AdminSidebar';
import Banner from './banner/ActivityRecordBanner';
import TopFilterBar from './components/TopFilterBar';
import ActivityRecordCard, {
    type AdminActivityRecordItem,
} from './components/ActivityRecordCard';
import RecordDetails from './components/RecordDetails';

import type { DepartmentFilter } from './components/DepartmentType';
import type { RecordTypeFilter } from './components/RecordType';
import type { StatusTypeFilter } from './components/StatusType';

import { useFetchReviewedApprovalRecords } from '../../api/adminActivityRecords.api';

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

function getTodayDateString() {
    return new Date().toISOString().split('T')[0];
}

function AdminActivityRecords() {
    const today = getTodayDateString();

    const [department, setDepartment] = useState<DepartmentFilter>('all');
    const [recordType, setRecordType] = useState<RecordTypeFilter>('all');
    const [status, setStatus] = useState<StatusTypeFilter>('all');
    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);
    const [selectedRecord, setSelectedRecord] =
        useState<AdminActivityRecordItem | null>(null);

    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 5;

    const { data, isLoading, isFetching, isError, error } = useFetchReviewedApprovalRecords(
        currentPage - 1,
        rowsPerPage,
        department === 'all' ? null : department,
        recordType === 'all' ? null : recordType,
        status === 'all' ? null : status,
        startDate || null,
        endDate || null
    );

    const records = (data?.data ?? []) as AdminActivityRecordItem[];
    const count = data?.count ?? 0;
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
        document.title = 'Activity Records | Intern Self Service';
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [department, recordType, status, startDate, endDate]);

    const handleStartDateChange = (newStartDate: string) => {
        setStartDate(newStartDate);

        if (newStartDate > endDate) {
        setEndDate(newStartDate);
        }
    };

    const handleEndDateChange = (newEndDate: string) => {
        setEndDate(newEndDate);
    };

    const handleClearFilters = () => {
        setDepartment('all');
        setRecordType('all');
        setStatus('all');
        setStartDate(today);
        setEndDate(today);
    };

    

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
        <AdminSidebar />

        <section className="w-full px-4 pb-4 pt-20 sm:px-5 sm:pt-24 xl:ml-[270px] xl:px-6 xl:py-5">
            <div className="mx-auto flex min-h-full w-full max-w-[2560px] flex-col gap-5">
            <Banner />

            <div className="rounded-xl bg-white shadow-md">
            <TopFilterBar
                department={department}
                recordType={recordType}
                status={status}
                startDate={startDate}
                endDate={endDate}
                onDepartmentChange={setDepartment}
                onRecordTypeChange={setRecordType}
                onStatusChange={setStatus}
                onStartDateChange={handleStartDateChange}
                onEndDateChange={handleEndDateChange}
                onClearFilters={handleClearFilters}
            />

                {/* Desktop / Laptop Header */}
                <div className="hidden bg-[#EAF0FA] px-6 py-4 font-bold text-black lg:grid lg:grid-cols-[44px_1.5fr_0.9fr_1fr_1fr_0.7fr_0.45fr] lg:items-center lg:gap-4">
                    <p></p>
                    <p>Name</p>
                    <p>Department</p>
                    <p>Type</p>
                    <p>Submission</p>
                    <p>Status</p>
                    <p className="text-center">Action</p>
                </div>

                <div className="flex h-[calc(100dvh-330px)] min-h-[430px] flex-col sm:h-[calc(100dvh-350px)] lg:h-[430px]">
                    <div className="relative min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-3 sm:px-4 lg:space-y-0 lg:px-0 lg:py-0">
                        {isFetching && !isLoading && (
                            <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/90">
                                <div className="flex flex-col items-center gap-3 px-6 py-5">
                                    <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#EAF0FA] border-t-[#0058DD]" />
                                    <p className="text-sm font-semibold text-[#002D6F]">
                                        Loading records...
                                    </p>
                                </div>
                            </div>
                        )}

                        {isLoading && (
                            <div className="flex h-full flex-col items-center justify-center gap-3">
                                <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#EAF0FA] border-t-[#0058DD]" />
                                <p className="text-sm font-semibold text-gray-500">
                                    Loading activity records...
                                </p>
                            </div>
                        )}

                        {isError && (
                            <p className="py-16 text-center text-sm text-red-600">
                                {error instanceof Error
                                    ? error.message
                                    : 'Failed to load activity records.'}
                            </p>
                        )}

                        {!isLoading &&
                            !isError &&
                            records.length > 0 &&
                            records.map((record) => (
                                <ActivityRecordCard
                                    key={record.id}
                                    record={record}
                                    onView={() => setSelectedRecord(record)}
                                />
                            ))}

                        {!isLoading && !isError && records.length === 0 && (
                            <p className="py-40 text-center items-center text-sm text-gray-500">
                                No activity records found.
                            </p>
                        )}
                    </div>
                </div>
            </div>

<div className="flex w-full items-center justify-between gap-2 overflow-x-auto px-3 text-xs text-gray-500 sm:px-5">
    <p className="shrink-0 whitespace-nowrap text-[11px] sm:text-xs">
        Showing {startEntry} to {endEntry} of {count} entries
    </p>

    {totalPages > 1 && (
        <div className="flex shrink-0 items-center justify-end gap-1 whitespace-nowrap">
            <button
                type="button"
                disabled={currentPage === 1}
                onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                }
                className="shrink-0 rounded-full border border-gray-300 bg-white px-2 py-1.5 text-[10px] text-black disabled:cursor-not-allowed disabled:opacity-50 sm:px-3 sm:text-xs md:px-4 md:text-sm"
            >
                <span className="sm:hidden">Prev</span>
                <span className="hidden sm:inline">Previous</span>
            </button>

            {pageNumbers.map((page, index) => {
                if (typeof page === 'string') {
                    return (
                        <span
                            key={`ellipsis-${index}`}
                            className="flex h-7 w-4 shrink-0 items-center justify-center text-[10px] text-gray-400 sm:h-8 sm:w-6 sm:text-sm md:w-8"
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
                className="shrink-0 rounded-full border border-gray-300 bg-white px-2 py-1.5 text-[10px] text-black disabled:cursor-not-allowed disabled:opacity-50 sm:px-3 sm:text-xs md:px-4 md:text-sm"
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
            />
        )}
        </main>
    );
}

export default AdminActivityRecords;