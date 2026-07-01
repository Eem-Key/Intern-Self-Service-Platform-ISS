import { useQuery, keepPreviousData } from '@tanstack/react-query';
import type { RecordType } from '../../../../shared/types/enums.types';
import { 
    fetchPendingRequestsPerRecordAPI,
    fetchPendingApprovalRecordsAPI
 } from './admin.approvals.api';


export function usefetchPendingRequestsPerRecord() {
    return useQuery({
        queryKey: ['admin-pending-requests'],
        queryFn: fetchPendingRequestsPerRecordAPI,
        refetchOnWindowFocus: true, 
    });
};

export function useFetchPendingApprovalRecords(
    page: number,
    pageSize: number,
    logCategory: Exclude<RecordType, 'attendance'>,
    searchValue: string,
    department: string
) {
    return useQuery({
        queryKey: [
        'admin-approval-records',
        page,
        pageSize,
        logCategory,
        searchValue,
        department,
    ],
    queryFn: () =>
        fetchPendingApprovalRecordsAPI({
            page,
            pageSize,
            logCategory,
            searchValue,
            department
        }),
        placeholderData: keepPreviousData,
        refetchOnWindowFocus: true,
    });
}