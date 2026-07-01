import { useQuery, keepPreviousData } from '@tanstack/react-query';
import type { 
    RecordType,
    ReportStatus,
    CompanyDepartment
} from '../../../../shared/types/enums.types';
import { fetchReviewedApprovalRecordsAPI } from './admin.activity.api';

export function useFetchReviewedApprovalRecords(
    page: number,
    pageSize: number,
    department: CompanyDepartment | null,
    log_category: Exclude<RecordType, 'attendance'> | null,
    status: ReportStatus | null,
    start_date: string | null, 
    end_date: string | null
) {
    return useQuery({
        queryKey: [
        'admin-activity-records',
        page,
        pageSize,
        department,
        log_category,
        status,
        start_date,
        end_date
    ],
    queryFn: () =>
        fetchReviewedApprovalRecordsAPI({
            page,
            pageSize,
            department,
            log_category,
            status,
            start_date,
            end_date
        }),
        placeholderData: keepPreviousData,
        refetchOnWindowFocus: true,
    });
}