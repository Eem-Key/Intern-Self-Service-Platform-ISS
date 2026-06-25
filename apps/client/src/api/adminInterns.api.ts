import { supabase } from '../config/supabase';
import { supabaseAdmin } from '../config/supabaseAdmin';
import { getAuthUserId, isAdmin } from '../utils/auth.util';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { 
    AttendanceRecord 
} from '../../../shared/types/attendance.types';
import type { 
    EODReportAdminReviewed 
} from '../../../shared/types/eodReport.types';
import type { 
    ProfileIntern,
    ProfileInternInsert
} from '../../../shared/types/profile.types';
import type { 
    InternPosition,
    InternshipStatus,
    CompanyDepartment
} from '../../../shared/types/enums.types';
import type{ 
    InternListInfo, 
} from '../../../shared/types/intern.types';

export function useFetchAllInternListInformationAPI(
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

export function useFetchProfileByIdAPI(
    user_id: string
) {
    return useQuery({
        queryKey: [
            'admin-intern-profile',
            user_id
        ],
        queryFn: () =>
            fetchProfileByIdAPI(
                user_id
            ),
            refetchOnWindowFocus: true, 
    });
};

export function useFetchAllAttendanceByIdAPI(
    user_id: string
) {
    return useQuery({
        queryKey: [
            'admin-intern-attendance',
            user_id
        ],
        queryFn: () =>
            fetchAllAttendanceByIdAPI(
                user_id
            ),
            refetchOnWindowFocus: true, 
    });
};

export function useFetchAllEodReportByIdAPI(
    user_id: string
) {
    return useQuery({
        queryKey: [
            'admin-intern-eod-report',
            user_id
        ],
        queryFn: () =>
            fetchAllEodReportByIdAPI(
                user_id
            ),
            refetchOnWindowFocus: true, 
    });
};

export const useInviteInternAPIMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProfileInternInsert) => inviteInternAPI(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-intern-list'] });
      alert("Intern invited successfully!");
    },
    onError: (error) => {
      alert(`Error: ${error.message}`);
    }
  });
};

export const useResendInviteInternAPIMutation = () => {
  return useMutation({
    mutationFn: (email: string) => resendInviteInternAPI(email),
    onSuccess: () => {
      alert("Resent intern invitation successfully!");
    },
    onError: (error) => {
      alert(`Error: ${error.message}`);
    }
  });
};

export const useDeactivateInternAPIMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: { intern_id: string; deactivate_reason: string }) => 
      deactivateInternAPI(variables.intern_id, variables.deactivate_reason),
    
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-intern-list'] });
      alert("Intern deactivated successfully!");
    },
    onError: (error: any) => {
      alert(`Error: ${error.message}`);
    }
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
    const admin_id = await getAuthUserId();

    if (!admin_id) {
        throw new Error('You must be logged in as a user.');
    }

    if (!(await isAdmin())) {
        throw new Error('Forbidden: You must be an admin.');
    }

    let query = supabase
        .from('intern_list_view')
        .select(`
            id, university, program, status, intern_position, 
            department, avatar_url, first_name, middle_name, 
            last_name, suffix`, 
            { count: 'exact' }
        );

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



    const mappedInterns = (data || []).map((item: any): InternListInfo => {
    const middleInitial = item?.middle_name
        ? `${item.middle_name.charAt(0).toUpperCase()}.`
        : null;

    const fullName = [
        item?.first_name,
        middleInitial,
        item?.last_name,
        item?.suffix,
    ].filter(Boolean).join(' ');

    return {
        id: item.id,
        university: item.university,
        program: item.program,
        status: item.status,
        intern_position: item.intern_position,
        department: item.department,
        name: fullName || item.full_name,
        avatar_url: item.avatar_url,
    };
});
    return {data: mappedInterns, count: count || 0 }
};

export async function fetchProfileByIdAPI(user_id: string): Promise<ProfileIntern> {
    const admin_id = await getAuthUserId();

    if (!admin_id) {
        throw new Error('You must be logged in as a user.');
    }

    if (!(await isAdmin())) {
        throw new Error('Forbidden: You must be an admin.');
    }

    const { data: profileData, error: fetchError } = await supabase
        .from('profiles')
        .select(`
            *,
            intern_info:interns(*)
        `)
        .eq('id', user_id)
        .single();

    if (fetchError) {
        throw new Error(`Error fetching profile: ${fetchError.message}`);
    }

    return profileData;
}

export async function fetchAllAttendanceByIdAPI(user_id: string): Promise<AttendanceRecord[]>{
    const admin_id = await getAuthUserId();

    if (!admin_id) {
        throw new Error('You must be logged in as a user.');
    }

    if (!(await isAdmin())) {
        throw new Error('Forbidden: You must be an admin.');
    }

    const { data: attendanceLogs, error: fetchError } = await supabase
        .from('attendance_logs')
        .select(`
            *,
            records!inner()
        `)
        .eq('records.intern_id', user_id)
        .order('work_date', { ascending: false });
    
    if (fetchError) {
        console.log(fetchError)
        throw new Error(`Error fetching attendances: ${fetchError.message}`);
    }

    return (attendanceLogs || []).map((item: any) => ({
        record_id: item.record_id,
        clock_in: item.clock_in,
        clock_out: item.clock_out,
        work_date: item.work_date,
        hours_logged: item.hours_logged,
        work_setup: item.work_setup,
    })) as AttendanceRecord[];
}


export async function fetchAllEodReportByIdAPI(user_id: string): Promise<EODReportAdminReviewed[]>{
    const admin_id = await getAuthUserId();

    if (!admin_id) {
        throw new Error('You must be logged in as a user.');
    }

    if (!(await isAdmin())) {
        throw new Error('Forbidden: You must be an admin.');
    }

    const { data: eodReports, error: fetchError } = await supabase
        .from('eod_reports')
        .select(`
            *,
            records!inner(
                admin_id,
                admin_feedback,
                reviewed_at
            )
        `)
        .eq('records.intern_id', user_id)
        .order('date_written', { ascending: false });
    
    if (fetchError) {
        console.log(fetchError)
        throw new Error(`Error fetching eod reports: ${fetchError.message}`);
    }

    return (eodReports || []).map((item: any) => ({
        record_id: item.record_id,
        date_written: item.date_written,
        project_name: item.project_name,
        task_accomplished: item.task_accomplished,
        hours_spent: item.hours_spent,
        admin_id: item.records.admin_id,
        admin_feedback: item.records.admin_feedback,
        reviewed_at: item.records.reviewed_at
    })) as EODReportAdminReviewed[];
}

export async function inviteInternAPI(
    profile_info: ProfileInternInsert
){
    const admin_id = await getAuthUserId();

    if (!admin_id) {
        throw new Error('You must be logged in as a user.');
    }

    if (!(await isAdmin())) {
        throw new Error('Forbidden: You must be an admin.');
    }
    const { data, error } = await supabase.auth.signInWithOtp({
        email: profile_info.email,
        options: {
            data: {
                first_name: profile_info.first_name,
                middle_name: profile_info.middle_name,
                last_name: profile_info.last_name,
                suffix: profile_info.suffix,
                role: profile_info.role,
                position: profile_info.position,
                department: profile_info.department,
                office: profile_info.office,
                birth_date: profile_info.birth_date,
                gender: profile_info.gender,
                contact_number: profile_info.contact_number,
                address: profile_info.address,

                // Intern
                university: profile_info.university,
                year_level: profile_info.year_level,
                program: profile_info.program,
                required_hours: profile_info.required_hours,
                start_date: profile_info.start_date,
                intern_position: profile_info.intern_position
            },
            emailRedirectTo: 'http://localhost:5173/login',
        },
    });

  if (error) {
    throw error;
  }

  return data
}

export async function resendInviteInternAPI(email: string){
    const admin_id = await getAuthUserId();

    if (!admin_id) {
        throw new Error('You must be logged in as a user.');
    }

    if (!(await isAdmin())) {
        throw new Error('Forbidden: You must be an admin.');
    }
    const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
        emailRedirectTo: 'http://localhost:5173/login',
        },
    });

  if (error) {
    throw error;
  }
}

export async function deactivateInternAPI(
    intern_id: string,
    deactivate_reason: string
) {
    const { error: dbError } = await supabase
        .from('interns')
        .update({ status: 'deactivated', deactivate_reason })
        .eq('id', intern_id);

    if (dbError) throw dbError;

    const { error: adminError } = await supabaseAdmin.auth.admin.updateUserById(intern_id, {
        ban_duration: '876000h' 
    });

    if (adminError) {
        console.error("Ban failed:", adminError);
        throw new Error("Intern profile updated, but could not ban user.");
    }
}