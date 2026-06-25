import { supabase } from '../config/supabase';
import { getAuthUserId } from '../utils/auth.util';
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

export async function fetchEodReportById(
    record_id: string
) {
    const intern_id = await getAuthUserId();
    if (!intern_id) {
        throw new Error(`You must be logged in to fetch a record.`);
    }

    const { data: fetchData, error: fetchError } = await supabase
        .from('eod_reports')
        .select('*')
        .eq('record_id', record_id)
        .single();

    if (fetchError) {
        console.error('Error fetching record:', fetchError.message);
        throw fetchError;
    }

    return fetchData
}