import { supabase } from '../config/supabase';
import { getAuthUserId, isAdmin } from '../utils/auth';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import type { RecordType } from '../../../shared/types/enums.types';
import type { ApprovalRecord } from '../../../shared/types/approvals.types';


export function usefetchPendingRequestsPerRecord() {
    return useQuery({
        queryKey: ['pendingRequests'],
        queryFn: fetchPendingRequestsPerRecord,
        refetchOnWindowFocus: true, 
    });
};

export async function fetchPendingRequestsPerRecord(): Promise<globalThis.Record<string, number>>{
    const admin_id = await getAuthUserId();
    if (!admin_id) {
        throw new Error('You must be logged in as a user.');
    }

    if (!await isAdmin()) {
        throw new Error('Forbidden: You must be an admin.');
    }

    const { data, error:fetchError } = await supabase
        .from('records')
        .select('log_category')
        .eq('status', 'pending')
        .not('log_category', 'eq', 'attendance');

    if (fetchError) {
        throw new Error(`Error fetching pending counts: ${fetchError.message}`);
    }

    const counts = (data || []).reduce((acc, curr) => {
        const type = curr.log_category;
        acc[type] = (acc[type] || 0) + 1;
        return acc;
    }, {} as globalThis.Record<string, number>);

    return counts;
}



// new
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
        fetchPendingApprovalRecords(
            page,
            pageSize,
            logCategory,
            searchValue,
            department
        ),
        placeholderData: keepPreviousData,
        refetchOnWindowFocus: true,
    });
}
export async function fetchPendingApprovalRecords(
    page: number,
    pageSize: number,
    logCategory: Exclude<RecordType, 'attendance'>,
    searchValue: string,
    department: string
): Promise<{
    data: ApprovalRecord[];
    count: number;
}> {
    const adminId = await getAuthUserId();

    if (!adminId) {
        throw new Error('You must be logged in as a user.');
    }

    if (!(await isAdmin())) {
        throw new Error('Forbidden: You must be an admin.');
    }

    const { data, error } = await supabase
        .from('records')
        .select(`
        *,
            interns (
                intern_position,
                profiles (
                first_name,
                middle_name,
                last_name,
                suffix,
                position,
                department
                )
            )
        `)
        .eq('status', 'pending')
        .eq('log_category', logCategory)
        .order('created_at', { ascending: false });

        if (error) {
            throw new Error(`Error fetching pending approvals: ${error.message}`);
        }

    const mappedRecords = await Promise.all(
        (data || []).map(async (item: any) => {
        const profile = item.interns?.profiles;

        const middleInitial = profile?.middle_name
            ? `${profile.middle_name.charAt(0).toUpperCase()}.`
            : null;

        const name = [
            profile?.first_name,
            middleInitial,
            profile?.last_name,
            profile?.suffix,
        ]
            .filter(Boolean)
            .join(' ')
            .trim();

        let details;

        try {
        details = await getApprovalDetails(item);
        } catch (detailsError) {
        console.error('Error fetching approval details:', detailsError);

        details = {
            date_submitted: item.created_at,
            time_submitted: formatTime(item.created_at),
        };
        }

        return {
            id: item.id,
            intern_id: item.intern_id,
            log_category: item.log_category,
            type: item.log_category,
            created_at: item.created_at,
            date_created: item.date_created,
            display_date: item.created_at,
            activity_description: item.activity_description,
            description: item.activity_description,
            status: item.status,
            admin_id: item.admin_id,
            reviewed_at: item.reviewed_at,
            admin_feedback: item.admin_feedback,

            name: name || '--',
            position: profile?.position || item.interns?.intern_position || '--',
            department: profile?.department || '--',

            details,
        };
        })
    );

    const filteredRecords = mappedRecords.filter((record) => {
        const matchesSearch = record.name
        .toLowerCase()
        .includes(searchValue.toLowerCase());

        const matchesDepartment =
        department === 'all' || record.department === department;

        return matchesSearch && matchesDepartment;
    });

  const from = page * pageSize;
    const to = from + pageSize;

    return {
        data: filteredRecords.slice(from, to),
        count: filteredRecords.length,
    };
}

async function getApprovalDetails(item: any) {
    const baseDetails = {
        date_submitted: item.created_at,
        time_submitted: formatTime(item.created_at),
    };

if (item.log_category === 'eod_report') {
        const { data, error } = await supabase
        .from('eod_reports')
        .select('*')
        .eq('record_id', item.id)
        .limit(1);

    if (error) {
        console.error('Error fetching EOD details:', error);
    }

    const eod = data?.[0];

    return {
        ...baseDetails,
        project_name: eod?.project_name || null,
        task_accomplished: eod?.task_accomplished || null,
        hours_spent: eod?.hours_spent || null,
        intern_role:
            item.interns?.profiles?.position ||
            item.interns?.intern_position ||
            null,
        };
    }

if (item.log_category === 'leave_request') {
    const { data, error } = await supabase
        .from('leave_requests')
        .select('*')
        .eq('record_id', item.id)
        .limit(1);

    if (error) {
        console.error('Error fetching leave request details:', error);
    }

    const leave = data?.[0];

    return {
        ...baseDetails,
        reason_category: leave?.reason_category || null,
        description: leave?.description || null,
        start_date: leave?.start_date || null,
        end_date: leave?.end_date || null,
        };
    }

if (item.log_category === 'profile_update') {
    const { data, error } = await supabase
        .from('profile_update_requests')
        .select('*')
        .eq('record_id', item.id)
        .limit(1);

    if (error) {
        console.error('Error fetching profile update details:', error);
    }

    const profileUpdate = data?.[0];

    return {
        ...baseDetails,
        update_type: profileUpdate?.update_type || null,
        requested_data: profileUpdate?.requested_data || null,

        old_avatar_url:
            profileUpdate?.old_avatar_url ||
            profileUpdate?.requested_data?.old_avatar_url ||
            null,

        new_avatar_url:
            profileUpdate?.new_avatar_url ||
            profileUpdate?.requested_data?.avatar_url ||
            null,
        };
    }

    return baseDetails;
}

function formatTime(value?: string | null) {
    if (!value) return '--';

    return new Date(value).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    });
}