import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import AdminSidebar from '../AdminSidebar';
import InternListBanner from '../intern-list/banner/InternListBanner'

import TopFilterBar from './components/TopFilterBar';
import InternListCard from './components/InternListCard';

import type { DepartmentFilter } from './components/DepartmentType';
import type { PositionFilter } from './components/PositionType';
import type { StatusTypeFilter } from './components/StatusType';

import type {
    CompanyDepartment,
    InternPosition,
    InternshipStatus,
} from '../../../../shared/types/enums.types';

import { useFetchAllInternListInformationAPI } from '../../api/adminInterns.api';

function getPageNumbers(
    currentPage: number,
    totalPages: number,
    maxVisible: number
) {
    if (totalPages <= maxVisible) {
        return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    if (maxVisible === 2) {
        if (currentPage <= 1) {
            return [1, 2, '...', totalPages];
        }

        if (currentPage >= totalPages) {
            return [1, '...', totalPages - 1, totalPages];
        }

        return [currentPage, '...', totalPages];
    }

    if (currentPage <= 3) {
        return [1, 2, 3, '...', totalPages];
    }

    if (currentPage >= totalPages - 2) {
        return [1, '...', totalPages - 2, totalPages - 1, totalPages];
    }

    return [1, '...', currentPage, '...', totalPages];
}

function AdminInternList() {
    const navigate = useNavigate();

    const [searchValue, setSearchValue] = useState('');
    const [department, setDepartment] = useState<DepartmentFilter>('all');
    const [position, setPosition] = useState<PositionFilter>('all');
    const [status, setStatus] = useState<StatusTypeFilter>('all');

    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 5;

    const querySearchValue = searchValue.trim() || null;
    const queryDepartment =
        department === 'all' ? null : (department as CompanyDepartment);
    const queryPosition =
        position === 'all' ? null : (position as InternPosition);
    const queryStatus =
        status === 'all' ? null : (status as InternshipStatus);

    const { data, isLoading, isFetching, isError, error } =
        useFetchAllInternListInformationAPI(
            currentPage - 1,
            rowsPerPage,
            querySearchValue,
            queryDepartment,
            queryPosition,
            queryStatus
        );

    const interns = data?.data ?? [];
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
        document.title = 'Intern List | Intern Self Service';
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchValue, department, position, status]);

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

    const handleClearFilters = () => {
        setSearchValue('');
        setDepartment('all');
        setPosition('all');
        setStatus('all');
    };

    const handleViewIntern = (internId: string) => {
        navigate(`/admin/interns/${internId}`);
    };

    const handleAddIntern = () => {
    navigate('/admin/interns/add');
};

    return (
        <main className="min-h-screen bg-[#eeeeee] text-black lg:flex">
            <AdminSidebar />

            <section className="w-full px-4 pb-4 pt-20 sm:px-5 sm:pt-24 xl:ml-[270px] xl:px-6 xl:py-5">
                <div className="mx-auto flex min-h-full w-full max-w-[2560px] flex-col gap-5">
                    <InternListBanner onAddIntern={handleAddIntern} />

                    <div className="rounded-xl bg-white shadow-md">
                        <TopFilterBar
                            searchValue={searchValue}
                            department={department}
                            position={position}
                            status={status}
                            onSearchChange={setSearchValue}
                            onDepartmentChange={setDepartment}
                            onPositionChange={setPosition}
                            onStatusChange={setStatus}
                            onClearFilters={handleClearFilters}
                        />

                        {/* Desktop / Laptop Header */}
                        <div className="hidden bg-[#EAF0FA] px-6 py-4 font-bold text-black lg:grid lg:grid-cols-[44px_1.3fr_1.2fr_0.9fr_0.85fr_0.9fr_0.7fr] lg:items-center lg:gap-4">
                            <p></p>
                            <p>Name</p>
                            <p>School</p>
                            <p>Program</p>
                            <p>Department</p>
                            <p>Position</p>
                            <p>Status</p>
                        </div>

                        <div className="relative flex h-[calc(100dvh-330px)] min-h-[430px] flex-col overflow-hidden sm:h-[calc(100dvh-350px)] lg:h-[430px]">
                            {isFetching && !isLoading && (
                                <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-white">
                                    <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#EAF0FA] border-t-[#0058DD]" />
                                    <p className="text-sm font-semibold text-[#002D6F]">
                                        Loading interns...
                                    </p>
                                </div>
                            )}

                            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-3 sm:px-4 lg:space-y-0 lg:px-0 lg:py-0">

                                {isLoading && (
                                    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-white">
                                    <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#EAF0FA] border-t-[#0058DD]" />
                                    <p className="text-sm font-semibold text-[#002D6F]">
                                        Loading interns...
                                    </p>
                                </div>
                                )}

                                {isError && (
                                    <p className="py-16 text-center text-sm text-red-600">
                                        {error instanceof Error
                                            ? error.message
                                            : 'Failed to load intern list.'}
                                    </p>
                                )}

                                {!isLoading &&
                                    !isError &&
                                    interns.length > 0 &&
                                    interns.map((intern) => (
                                        <InternListCard
                                            key={intern.id}
                                            intern={intern}
                                            onView={() =>
                                                handleViewIntern(intern.id)
                                            }
                                        />
                                    ))}

                                {!isLoading &&
                                    !isError &&
                                    interns.length === 0 && (
                                        <p className="items-center py-40 text-center text-sm text-gray-500">
                                            No interns found.
                                        </p>
                                    )}
                            </div>
                        </div>
                    </div>

                    <div className="flex w-full items-center justify-between gap-2 overflow-x-auto px-3 text-xs text-gray-500 sm:px-5">
                        <p className="shrink-0 whitespace-nowrap text-[11px] sm:text-xs">
                            Showing {startEntry} to {endEntry} of {count}{' '}
                            entries
                        </p>

                        {totalPages > 1 && (
                            <div className="flex shrink-0 items-center justify-end gap-1 whitespace-nowrap">
                                <button
                                    type="button"
                                    disabled={currentPage === 1}
                                    onClick={() =>
                                        setCurrentPage((prev) =>
                                            Math.max(1, prev - 1)
                                        )
                                    }
                                    className="shrink-0 rounded-full border border-gray-300 bg-white px-2 py-1.5 text-[10px] text-black disabled:cursor-not-allowed disabled:opacity-50 sm:px-3 sm:text-xs md:px-4 md:text-sm"
                                >
                                    <span className="sm:hidden">Prev</span>
                                    <span className="hidden sm:inline">
                                        Previous
                                    </span>
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
                                            onClick={() =>
                                                setCurrentPage(page)
                                            }
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
                                        setCurrentPage((prev) =>
                                            Math.min(totalPages, prev + 1)
                                        )
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
        </main>
    );
}

export default AdminInternList;