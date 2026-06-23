import { supabase } from '../config/supabase';
import { getAuthUserId, isAdmin } from '../utils/auth.util';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import type { RecordType } from '../../../shared/types/enums.types';
import type { ApprovalRecord } from '../../../shared/types/approvals.types';
import { fetchRecordDetails } from '../api/record.api';


export function usefetchPendingRequestsPerRecord() {
    return useQuery({
        queryKey: ['admin-pending-requests'],
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
    const admin_id = await getAuthUserId();

    if (!admin_id) {
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
        (data || []).map(async (record: any) => {
            const profile = record.interns?.profiles;

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

            let details= {
                date_submitted: record.created_at,
                time_submitted: formatTime(record.created_at),
            }

            try {
                const approval_details = await fetchRecordDetails(record.id, record.log_category);
                details = {
                    ...details,
                    ...(approval_details || {})
                }
            } catch (detailsError) {
                console.error('Error fetching approval details:', detailsError);
            }

            return {
                id: record.id,
                intern_id: record.intern_id,
                log_category: record.log_category,
                created_at: record.created_at,
                date_created: record.date_created,
                activity_description: record.activity_description,
                status: record.status,
                admin_id: record.admin_id,
                reviewed_at: record.reviewed_at,
                admin_feedback: record.admin_feedback,

                name: name || '--',
                position: profile?.position || record.interns?.intern_position || '--',
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

function formatTime(value?: string | null) {
    if (!value) return '--';

    return new Date(value).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    });
}