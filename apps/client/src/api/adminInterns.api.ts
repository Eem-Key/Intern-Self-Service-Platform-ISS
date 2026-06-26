import { supabase } from '../config/supabase';
import { getAuthUserId, isAdmin } from '../utils/auth.util';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { 
    ProfileInternInsert
} from '../../../shared/types/profile.types';
import type { 
    InternPosition,
    InternshipStatus,
    CompanyDepartment
} from '../../../shared/types/enums.types';
import {
    fetchAllInternListInformationAPI,
    fetchProfileByIdAPI,
    fetchAllAttendanceByIdAPI,
    fetchAllEodReportByIdAPI,
    deactivateInternAPI
} from '../api/admin.interns.api';

export function useFetchAllInternListInformationAPI(
    page: number,
    pageSize: number,
    search_value: string | null,
    department: CompanyDepartment | null,
    position: InternPosition | null,
    status: InternshipStatus | null,
) {
    return useQuery({
        queryKey: [
            'admin-intern-list',
            page,
            pageSize,
            search_value,
            department,
            position,
            status,
        ],
        queryFn: () =>
            fetchAllInternListInformationAPI({
                page,
                pageSize,
                search_value,
                department,
                position,
                status,
            }),
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
    },
  });
};

export const useResendInviteInternAPIMutation = () => {
  return useMutation({
    mutationFn: (email: string) => resendInviteInternAPI(email),
    onSuccess: () => {
    },
  });
};

export const useDeactivateInternAPIMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: { intern_id: string; deactivate_reason: string }) => 
      deactivateInternAPI(variables.intern_id, variables.deactivate_reason),
    
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-intern-list'] });
    },
  });
};

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