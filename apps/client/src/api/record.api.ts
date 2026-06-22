import { supabase } from '../config/supabase.ts';
import { getAuthUserId, isAdmin } from '../utils/auth';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { fetchAttendanceById } from './attendance.api';
import { fetchEodReportById } from './eodReport.api';
import { fetchLeaveRequestById } from './leave.api';
import { fetchProfileUpdateRequestById } from './profile.api';
import { 
    insertInternNotificationAPI,
    insertAdminNotificationAPI
 } from './notification.api'
import type { 
    ReportStatus, 
    RecordType,
    ActivityDescription,
    ProfileUpdateType,
} from '../../../shared/types/enums.types.ts';
import type { ProfileUpdate } from '../../../shared/types/profile.types.ts';
import type { InternInfo } from '../../../shared/types/intern.types.ts';
import type { 
    Record, 
    RecordInsert,
} from '../../../shared/types/record.types.ts';

export function useFetchRecordDetails(record_id: string, record_category: RecordType) {
    return useQuery({
        queryKey: ['log-details', record_id],
        queryFn: async () => {
            switch (record_category) {
                case 'attendance': return await fetchAttendanceById(record_id);
                case 'eod_report': return await fetchEodReportById(record_id);
                case 'leave_request': return await fetchLeaveRequestById(record_id);
                case 'profile_update': return await fetchProfileUpdateRequestById(record_id);
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
        placeholderData: keepPreviousData,
        staleTime: 30_000,
    });
}

// export function useUpdateAdminReviewRecord(
//     record_id: string, 
//     admin_feedback: string, 
//     status: ReportStatus,
//     update_type?: ProfileUpdateType,
//     profile_data?: Profile,
//     intern_data?: InternInfo
// ) {
//     return useQuery({
//         queryKey: ['admin_review', page, log_category], 
//         queryFn: () => fetchRecordsPaginatedIntern(page, pageSize, log_category),
//         placeholderData: keepPreviousData,
//         staleTime: 30_000,
//     });
// }

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
    .select('*')
    .single();

    if (insertRecordError){
        console.log(insertRecordError)
        throw insertRecordError;
    }

    console.log('Insert Record: ', recordInsert.id);

    if(record.log_category !== 'attendance'){
        await insertInternNotificationAPI(recordInsert);
    }
    // await insertInternNotificationAPI(recordInsert);


    return recordInsert.id;
};

export const updateRecord = async (record_id: string, description: ActivityDescription, status?: ReportStatus) => {
    const { data: recordUpdate, error: updateRecordError } = await supabase
        .from('records')
        .update({
            status: status,
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

export async function updateAdminReviewRecord(
    record_id: string, 
    admin_feedback: string, 
    status: ReportStatus,
    update_type?: ProfileUpdateType,
    profile_data?: ProfileUpdate,
    intern_data?: InternInfo
) {
    const admin_id = await getAuthUserId();
    if (!admin_id) {
        throw new Error('You must be logged in as a user.');
    }

    if (!await isAdmin()) {
        throw new Error('Forbidden: You must be an admin.');
    }

    const { data: recordData, error: updateError } = await supabase
        .rpc('update_admin_review', {
            p_record_id: record_id,
            p_admin_id: admin_id,
            p_admin_feedback: admin_feedback,
            p_status: status,
            p_update_type: update_type || null,
            p_profile_data: profile_data || null,
            p_intern_data: intern_data || null
        })
        .single();

    if (updateError) {
        console.error('RPC Error:', updateError);
        throw updateError;
    }
    
    await insertAdminNotificationAPI(recordData as Record);

    console.log('Record, Profile, and Intern data updated successfully via RPC.');
}