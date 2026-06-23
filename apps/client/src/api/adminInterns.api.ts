import { supabase } from '../config/supabase';
import { getAuthUserId, isAdmin } from '../utils/auth.util';
import { useQuery } from '@tanstack/react-query';
import type { 
    InternPosition,
    InternshipStatus,
    CompanyDepartment
} from '../../../shared/types/enums.types';
import type{ 
    InternListInfo, 
} from '../../../shared/types/intern.types';
import { 
    fetchFullNameAPI 
} from './profile.api'

export function usefetchAllInternListInformationAPI(
    page: number,
    pageSize: number,
    search_value: string | null,
    department: CompanyDepartment | null,
    posiion: InternPosition | null,
    status: InternshipStatus | null,
) {
    return useQuery({
        queryKey: [
            'admin-intern-list',
            page,
            pageSize,
            search_value,
            department,
            posiion,
            status,
        ],
        queryFn: () =>
            fetchAllInternListInformationAPI(
                page,
                pageSize,
                search_value,
                department,
                posiion,
                status,
            ),
            refetchOnWindowFocus: true, 
    });
};

export async function fetchAllInternListInformationAPI(
    page: number,
    pageSize: number,
    search_value: string | null,
    department: CompanyDepartment | null,
    position: InternPosition | null,
    status: InternshipStatus | null,
): Promise<{
    data: InternListInfo[];
    count: number;
}> {
    const adminId = await getAuthUserId();

    if (!adminId) {
        throw new Error('You must be logged in as a user.');
    }

    if (!(await isAdmin())) {
        throw new Error('Forbidden: You must be an admin.');
    }

    let query = supabase
        .from('intern_list_view')
        .select('*', { count: 'exact' });

    if (search_value) {
        const term = `%${search_value}%`;
        query = query.or(`program.ilike.${term},university.ilike.${term},full_name.ilike.${term}`);    
    }
    if (department) query = query.eq('department', department);
    if (position) query = query.eq('intern_position', position);
    if (status) query = query.eq('status', status);

    const from = page * pageSize;
    const to = from + pageSize - 1;

    query = query.range(from, to).order('profile_created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
        console.log(error)
        throw new Error(`Error fetching Intern List: ${error.message}`);
    }

    const mappedInterns = (data || []).map((item: any) => ({
        id: item.id,
        university: item.university,
        program: item.program,
        status: item.status,
        intern_position: item.intern_position,
        department: item.department,
        name: item.full_name
    } as InternListInfo));

    return {data: mappedInterns, count: count || 0 }
};