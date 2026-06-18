import { supabase } from '../config/supabase.ts';
import { getAuthUserId } from '../utils/auth';
import { useQuery } from '@tanstack/react-query';
import { fetchAttendanceById } from './attendance.api';
import { fetchEodReportById } from './eodReport.api';
import { fetchLeaveRequestById } from './leave.api';
import { fetchProfileUpdateRequestById } from './profile.api';
import type { 
    ReportStatus, 
    RecordType,
    ActivityDescription,
} from '../../../shared/types/enums.types.ts';
import type { 
    Record, 
    RecordInsert,
    RecordLog
} from '../../../shared/types/record.types.ts';

export function useLogDetails(record: RecordLog) {
    return useQuery({
        queryKey: ['log-details', record.id],
        queryFn: async () => {
            switch (record.log_category) {
                case 'attendance': return await fetchAttendanceById(record.id);
                case 'eod_report': return await fetchEodReportById(record.id);
                case 'leave_request': return await fetchLeaveRequestById(record.id);
                case 'profile_update': return await fetchProfileUpdateRequestById(record.id);
                default: return null;
            }
        },
    });
}

export function useFetchRecordsPaginatedIntern(
    page:number, 
    pageSize: number,
    log_category?: RecordType
) {
    return useQuery({
        queryKey: ['records', page, log_category], 
        queryFn: () => fetchRecordsPaginatedIntern(page, pageSize, log_category),
    });
}

export const fetchRecordsPaginatedIntern = async (
    page: number, 
    pageSize: number = 5,
    log_category?: string
): Promise<{
    data: (Record & { display_date: string })[];
    count: number;
}> => {
    const intern_id = await getAuthUserId();
    if (!intern_id) {
        throw new Error('You must be logged in to fetch records');
    }
    const from = page * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
        .from('view_all_timeline_records')
        .select('*', { count: 'exact' })
        .eq('intern_id', intern_id);

    if (log_category) {
        query = query.eq('log_category', log_category);
    }

    const { data, error, count } = await query
        .order('display_date', { ascending: false })
        .range(from, to);
    if (error) throw error;
    
    return { data: data || [], count: count ?? 0 };
};

export const insertRecord = async (record: RecordInsert): Promise<string> => {
    const { data: recordInsert, error: insertRecordError } = await supabase
    .from('records')
    .insert([record])
    .select('id')
    .single();

    if (insertRecordError){
        console.log(insertRecordError)
        throw insertRecordError;
    }

    console.log('Insert Record: ', recordInsert)

    return recordInsert.id
};

export const updateRecord = async (record_id: string, description: ActivityDescription, status?: ReportStatus) => {
    const { data: recordUpdate, error: updateRecordError } = await supabase
    .from('records')
    .update({
        status:status,
        activity_description: description,
    })
    .eq('id', record_id)
    .select('status')
    .single();

    if (updateRecordError){
        console.log(updateRecordError)
        throw updateRecordError;
    }

    console.log('Updated Record: ', recordUpdate)
};