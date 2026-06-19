import { supabase } from '../config/supabase';
import { getAuthUserId, isAdmin } from '../utils/auth';
import type { 
    Profile,
    ProfileInsert,
    ProfileUpdate,
    UserProfile,
    ProfileUpdateRequest,
    ProfileUpdateRequestForm,
} from '../../../shared/types/profile.types';
import type{ InternInfo } from '../../../shared/types/intern.types';
import type {
    Record,
    RecordInsert,
} from '../../../shared/types/record.types';
import { 
    insertRecord 
} from './record.api'

export async function fetchProfileAPI(): Promise<Profile> {
    const userId = await getAuthUserId();
    if (!userId) {
        throw new Error('You must be logged in to fetch your profile.');
    }
    
    const isAdminCheck = await isAdmin();

    const { data: profileData, error: fetchError } = await supabase
        .from('profiles')
        .select(`
            *,
            intern_info:interns(*)
        `)
        .eq('id', userId)
        .single();

    if (fetchError) {
        throw new Error(`Error fetching profile: ${fetchError.message}`);
    }

    if (!isAdminCheck && profileData.id !== userId) {
        throw new Error('Forbidden: You do not have permission to view this request.');
    }

    return profileData;
}

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
        .from('profiles')
        .select(`first_name, middle_name, last_name, suffix`)
        .eq('id', user_id)
        .single();

    if (fetchError) {
        throw new Error(`Error fetching profile: ${fetchError.message}`);
    }

    const fullname = [
        nameData.first_name,
        nameData.middle_name,
        nameData.last_name,
        nameData.suffix
    ]
    .filter(Boolean)
    .join(' ');

    return fullname;
}

export async function adminInsertProfileAPI(
    profile: ProfileInsert,
    internInfo: InternInfo
): Promise<Profile> {
    const adminId = await getAuthUserId();
    if (!adminId) {
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

    const insertedProfile = data as Profile;

    return insertedProfile;
}

// export async function adminUpdateProfileAPI(
//     profileId: string,
//     profile: ProfileUpdate,
//     internInfo: InternInfo
// ): Promise<Profile> {
//     const adminId = await getAuthUserId();
//     if (!adminId) {
//         throw new Error('You must be logged in as a user to update profiles.');
//     }

//     if (!await isAdmin()) {
//         throw new Error('You must be an admin to update profiles.');
//     }

//     const { data, error: updateError } = await supabase
//         .rpc('update_intern_profile', {
//             p_id: profileId,
//             profile_data: profile as unknown as Record<string, any>,
//             intern_data: internInfo as unknown as Record<string, any>
//         })
//         .single();

//     if (updateError) {
//         throw new Error(`Error updating profile: ${updateError.message}`);
//     }

//     const updatedProfile = data as Profile;

//     return updatedProfile;
// }

export async function fetchProfileUpdateRequestById(
    record_id: string
) {
    const userId = await getAuthUserId();
    if (!userId) {
        throw new Error('You must be logged in to fetch a profile update request.');
    }

    const { data: updateRequest, error: fetchError } = await supabase
        .from('profile_update_requests')
        .select('*')
        .eq('record_id', record_id)
        .single();

    if (fetchError) {
        console.log(fetchError)
        throw new Error(`Error fetching profile update requests: ${fetchError.message}`);
    }

    return updateRequest;
}

export async function insertProfileUpdateRequestAPI(
    updateRequest: ProfileUpdateRequestForm
): Promise<ProfileUpdateRequest> {
    const intern_id = await getAuthUserId();
    if (!intern_id) {
        throw new Error('You must be logged in to request a profile update.');
    }

    const record: RecordInsert = {
        intern_id: intern_id,
        log_category: 'profile_update',
        activity_description: updateRequest.update_type === 'avatar_update'
        ? 'Profile Picture'
        : 'Profile Information',
        status: 'pending'
    }

    const record_id = await insertRecord(record);

    const requestProfileUpdateInsert: ProfileUpdateRequest = {
        record_id: record_id,
        update_type: updateRequest.update_type,
        requested_data: updateRequest.requested_data,
        reason: updateRequest.reason
    }

    const { data: insertedUpdateRequest, error: insertError } = await supabase
        .from('profile_update_requests')
        .insert([requestProfileUpdateInsert])
        .select()
        .single();

    if (insertError) {
        console.log(insertError)
        throw new Error(`Error submitting profile update request: ${insertError.message}`);
    }

    return insertedUpdateRequest;
}

// export async function adminReviewProfileUpdateAPI(
//     review: AdminReviewProfileUpdateRequest
// ): Promise<ProfileUpdateRequest> {
//     const adminId = await getAuthUserId();
//     if (!adminId) {
//         throw new Error('You must be logged in as a user to review profile update requests.');
//     }

//     if (!await isAdmin()) {
//         throw new Error('You must be an admin to review profile update requests.');
//     }

//     const { data: updatedUpdateRequest, error: updateError } = await supabase
//         .from('profile_update_requests')
//         .update({
//             status: review.status,
//             admin_id: adminId,
//             reviewed_at: new Date().toISOString(),
//             admin_feedback: review.admin_feedback || null,
//         })
//         .eq('id', review.id)
//         .select()
//         .single();

//     if (updateError) {
//         throw new Error(`Error reviewing profile update request: ${updateError.message}`);
//     }

//     return updatedUpdateRequest;
// }

export async function hasPendingProfileUpdateRequestAPI(updateType: string) {
    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
        throw new Error('User not authenticated.');
    }

    const { data, error } = await supabase
        .from('profile_update_requests')
        .select(`
            record_id,
            update_type,
            records!inner (
                id,
                intern_id,
                status,
                log_category
            )
        `)
        .eq('update_type', updateType)
        .eq('records.intern_id', user.id)
        .eq('records.log_category', 'profile_update')
        .eq('records.status', 'pending')
        .maybeSingle();

    if (error) {
        throw new Error(error.message);
    }

    console.log('pending profile request result:', data);

    return !!data;
}

export async function updateProfileUpdateRequestAPI(
    record_id: string,
    updateRequest: ProfileUpdateRequestForm
): Promise<ProfileUpdateRequest> {
    const userId = await getAuthUserId();

    if (!userId) {
        throw new Error('You must be logged in to update a profile update request.');
    }
    const { data: updatedRequest, error } = await supabase
        .from('profile_update_requests')
        .update({
        requested_data: updateRequest.requested_data,
        reason: updateRequest.reason || null,
        })
        .eq('record_id', record_id)
        .select()
        .single();
    
    if (error) {
        throw new Error(`Error updating profile update request: ${error.message}`);
    }

    return updatedRequest;
}