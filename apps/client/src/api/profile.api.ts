import { supabase } from '../config/supabase';
import { getAuthUserId, isAdmin } from '../utils/auth.util';
import { useQuery } from '@tanstack/react-query';
import type { 
    ProfileIntern,
    ProfileInsert,
    UserProfile,
} from '../../../shared/types/profile.types';
import type{ 
    InternInfo, 
} from '../../../shared/types/intern.types';
import { 
    fetchProfileAPI 
} from './intern.profile.api'
import {
    fetchProgramProgressHoursAPI
}from '../api/admin.interns.api';

export const useFetchProfileAPI = () => {
    return useQuery({
        queryKey: ['intern-profile'],
        queryFn: fetchProfileAPI,
        staleTime: 0,
        refetchOnMount: 'always',
        refetchOnWindowFocus: true,
    });
};

export const useProgramProgressHours = (id: string) => {
    return useQuery({
        queryKey: ['admin-program-progress', id],
        queryFn: () => fetchProgramProgressHoursAPI(id),
        enabled: !!id,
        staleTime: 1000 * 60,
        refetchOnWindowFocus: true,
    });
};

export async function fetchUserProfileAPI(user_id: string): Promise<UserProfile> {
    const { data: profileData, error: fetchError } = await supabase
        .from('profiles')
        .select(
            `first_name, 
            last_name, 
            role, 
            position, 
            avatar_url, 
            email,
            requires_password_change`)
        .eq('id', user_id)
        .single();

    if (fetchError) {
        throw new Error(`Error fetching profile: ${fetchError.message}`);
    }

    const userProfile: UserProfile = {
        id: user_id,
        ...profileData
    }

    return userProfile;
}

export async function fetchFullNameAPI(
    user_id: string
): Promise<string> {
    const { data: nameData, error: fetchError } = await supabase
        .from('public_profiles')
        .select(`first_name, middle_name, last_name, suffix`)
        .eq('id', user_id)
        .single();

    if (fetchError) {
        console.log(fetchError)
        throw new Error(`Error fetching profile: ${fetchError.message}`);
    }

    const middleInitial = nameData.middle_name 
    ? `${nameData.middle_name.charAt(0).toUpperCase()}.` 
    : null;

    const fullname = [
        nameData.first_name,
        middleInitial,
        nameData.last_name,
        nameData.suffix
    ]
    .filter(Boolean)
    .join(' ');

    return fullname;
}

export async function insertAdminProfileAPI(
    profile: ProfileInsert,
    internInfo: InternInfo
): Promise<ProfileIntern> {
    const admin_id = await getAuthUserId();
    if (!admin_id) {
        throw new Error('You must be logged in as a user to review profile update requests.');
    }

    if (!await isAdmin()) {
        throw new Error('You must be an admin to review profile update requests.');
    }

    const { data, error: insertError } = await supabase
        .rpc('create_intern_profile', {
            profile_data: profile,
            intern_data: internInfo
        })
        .single();

    if (insertError) {
        throw new Error(`Error inserting profile: ${insertError.message}`);
    }

    const insertedProfile = data as ProfileIntern;

    return insertedProfile;
}
//     const userId = await getAuthUserId();
//     if (!userId) {
//         throw new Error('You must be logged in to fetch your profile.');
//     }
    
//     const isAdminCheck = await isAdmin();

//     const { data: summary, error: summaryError } = await supabase
//         .from('intern_hours_summary')
//         .select('*')
//         .eq('intern_id', id)
//         .maybeSingle();

//     if (!isAdminCheck && summary.intern_id !== userId) {
//         throw new Error('Forbidden: You do not have permission to view this request.');
//     }

//     if (summaryError) {
//         throw new Error(`Failed to fetch intern data: ${summaryError.message}`);
//     }

//     return {
//         required_hours: summary.required_hours,
//         rendered_hours: summary?.rendered_hours,
//         remaining_hours: Math.max(0, (summary.required_hours || 0) - (summary?.rendered_hours || 0)),
//     }
// };