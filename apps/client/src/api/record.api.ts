import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { 
    ReportStatus, 
    RecordType,
} from '../../../shared/types/enums.types.ts';
import {
    fetchRecordsPaginatedAPI,
    fetchAttendanceByIdAPI,
    fetchEodReportByIdAPI,
    fetchLeaveRequestByIdAPI,
    fetchProfileUpdateRequestWithProfileByIdAPI,
    fetchProfileUpdateRequestByIdAPI
} from './intern.logs.api'

export function useFetchRecordsPaginatedIntern(
    page:number, 
    pageSize: number,
    log_category?: RecordType
) {
    return useQuery({
        queryKey: ['records', page, log_category], 
        queryFn: () => fetchRecordsPaginatedAPI(page, pageSize, log_category),
        placeholderData: keepPreviousData,
        staleTime: 30_000,
    });
}

export function useFetchCompleteRecordDetails(
    record_id: string, 
    record_category: RecordType, 
    status: ReportStatus
) {
    return useQuery({
        queryKey: ['log-details', record_id],
        queryFn: async () => {
            let data: any;

            switch (record_category) {
                case 'attendance': 
                    data = await fetchAttendanceByIdAPI(record_id);
                    break;
                case 'eod_report': 
                    data = await fetchEodReportByIdAPI(record_id);
                    break;
                case 'leave_request': 
                    data = await fetchLeaveRequestByIdAPI(record_id);
                    break;
                case 'profile_update': 
                    data = status === 'pending' 
                        ? await fetchProfileUpdateRequestWithProfileByIdAPI(record_id)
                        : await fetchProfileUpdateRequestByIdAPI(record_id);
                    break;
                default: 
                    return null;
            }
            
            return data ?? null;
        },
        enabled: !!record_id
    });
}