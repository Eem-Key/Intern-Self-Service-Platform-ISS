import { useQuery } from '@tanstack/react-query';
import {
    fetchAttendanceByDateAPI,
    fetchEODReportByDateAPI
} from './intern.dashboard.api'

export function useEODAttendance(date: string) {
    return useQuery({
        queryKey: ['attendance-report', date],
        queryFn: () => fetchAttendanceByDateAPI(date),
        enabled: !!date,
    });
}

export function useFetchEODReport(date: string) {
    return useQuery({
        queryKey: ['eod-report', date],
        queryFn: () => fetchEODReportByDateAPI(date),
        enabled: !!date,
        retry: false,
    });
}