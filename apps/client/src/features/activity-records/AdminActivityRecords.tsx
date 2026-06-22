import { useEffect } from 'react';
import AdminSidebar from '../AdminSidebar';
import Banner from '../activity-records/banner/ActivityRecordBanner'
import type { 
    RecordType,
    ReportStatus,
    CompanyDepartment
} from '../../../../shared/types/enums.types';
import {
    useFetchReviewedApprovalRecords,
} from '../../api/adminActivityRecords.api';

function AdminActivityRecords() {
    const currentPage = 1;
    const rowsPerPage = 5;
    const department: CompanyDepartment | null = 'SDS';
    const log_category: Exclude<RecordType, 'attendance'> | null = null;
    const status: ReportStatus | null = 'denied';

    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const start_date = null;
    const end_date = null;
    // const start_date = yesterday.toISOString().split('T')[0];
    // const end_date = today.toISOString().split('T')[0];

    const { data: reviewedData, isLoading } = useFetchReviewedApprovalRecords(
            currentPage - 1,
            rowsPerPage,
            department,
            log_category,
            status,
            start_date,
            end_date
        );
    
    console.log('AdminActivityRecords: ', reviewedData)

    useEffect(() => {
        document.title = 'Activity Records | Intern Self Service';
    }, []);

    return (
        <main className="min-h-screen bg-[#eeeeee] text-black lg:flex">
        <AdminSidebar />

        <section className="w-full px-4 pb-4 pt-20 sm:px-5 sm:pt-24 lg:ml-[270px] lg:px-6 lg:py-5">
        {/*<section className="flex min-h-screen w-full px-4 py-4 sm:px-5 lg:ml-[270px] lg:px-6 lg:py-5">*/}
            <div className="mx-auto flex min-h-full w-full max-w-[2560px] flex-col">
            <Banner />
            </div>
        </section>
        </main>
    );
}

export default AdminActivityRecords;