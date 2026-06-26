import { supabase } from '../config/supabase.ts';
import { getAuthUserId, isAdmin } from '../utils/auth.util.ts';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { 
    ReportStatus, 
    RecordType,
    ProfileUpdateType,
} from '../../../shared/types/enums.types.ts';
import type { ProfileUpdate } from '../../../shared/types/profile.types.ts';
import type { InternInfo } from '../../../shared/types/intern.types.ts';
import type { 
    Record, 
} from '../../../shared/types/record.types.ts';
import { 
    insertAdminNotificationAPI
 } from './admin.dashboard.api'
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

export async function fetchRecordDetails(record_id: string, record_category: RecordType) {
     try {
        switch (record_category) {
            case 'attendance': return await fetchAttendanceByIdAPI(record_id);
            case 'eod_report': return await fetchEodReportByIdAPI(record_id);
            case 'leave_request': return await fetchLeaveRequestByIdAPI(record_id);
            case 'profile_update': return await fetchProfileUpdateRequestByIdAPI(record_id);
            default: 
                console.warn(`No handler for category: ${record_category}`);
                return null;
        }
    } catch (error) {
        console.error(`Error fetching details for ${record_category}:`, error);
        return null;
    }
}

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