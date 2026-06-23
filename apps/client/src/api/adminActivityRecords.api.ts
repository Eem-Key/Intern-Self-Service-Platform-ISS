import { supabase } from '../config/supabase';
import { getAuthUserId, isAdmin } from '../utils/auth.util';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import type { 
    RecordType,
    ReportStatus,
    CompanyDepartment
} from '../../../shared/types/enums.types';
import type { ApprovalRecord } from '../../../shared/types/approvals.types';
import { fetchRecordDetails } from '../api/record.api';

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
        fetchReviewedApprovalRecords(
            page,
            pageSize,
            department,
            log_category,
            status,
            start_date,
            end_date
        ),
        placeholderData: keepPreviousData,
        refetchOnWindowFocus: true,
    });
}

export async function fetchReviewedApprovalRecords(
    page: number,
    pageSize: number,
    department: CompanyDepartment | null,
    log_category: Exclude<RecordType, 'attendance'> | null,
    status: ReportStatus | null,
    start_date: string | null, 
    end_date: string | null
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

    let query = supabase
        .from('records')
        .select(`
            *,
            interns!inner (
                intern_position,
                profiles!inner (
                    first_name, middle_name, last_name, suffix, position, department, avatar_url
                )
            )
        `, { count: 'exact' });
    
    query = query.in('status', status ? [status] : ['approved', 'denied']);
    
    if (department) {
        query = query.eq('interns.profiles.department', department);
    }
    
    if (log_category) {
        query = query.eq('log_category', log_category);
    }

    if (start_date) {
        query = query.gte('created_at', start_date);
    }
    
    if (end_date) {
        const nextDay = new Date(end_date);
        nextDay.setDate(nextDay.getDate() + 1);
        const nextDayString = nextDay.toISOString().split('T')[0];
        
        query = query.lt('created_at', nextDayString);
    }

    const from = page * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to).order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error){
        console.log(error)
        throw new Error(`Error fetching revieweed records: ${error.message}`);
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

                avatar_url: record.interns?.profiles?.avatar_url,

                details,
            };
        })
    );

    console.log('fetchReviewedApprovalRecords', mappedRecords)

    return { data: mappedRecords, count: count || 0 };
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