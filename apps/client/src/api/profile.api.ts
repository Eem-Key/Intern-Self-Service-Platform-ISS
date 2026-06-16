import { supabase } from '../config/supabase';
import { getAuthUserId, isAdmin } from '../utils/auth';
import type { 
    Profile,
    ProfileInsert,
    ProfileUpdate,
    UserProfile,
    ProfileUpdateRequest,
    ProfileUpdateRequestForm,
    ProfileUpdateRequestInsert,
    AdminReviewProfileUpdateRequest,
    InternInfo
} from '../../../shared/types/profile.types';

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

export async function adminUpdateProfileAPI(
    profileId: string,
    profile: ProfileUpdate,
    internInfo: InternInfo
): Promise<Profile> {
    const adminId = await getAuthUserId();
    if (!adminId) {
        throw new Error('You must be logged in as a user to update profiles.');
    }

    if (!await isAdmin()) {
        throw new Error('You must be an admin to update profiles.');
    }

    const { data, error: updateError } = await supabase
        .rpc('update_intern_profile', {
            p_id: profileId,
            profile_data: profile as unknown as Record<string, any>,
            intern_data: internInfo as unknown as Record<string, any>
        })
        .single();

    if (updateError) {
        throw new Error(`Error updating profile: ${updateError.message}`);
    }

    const updatedProfile = data as Profile;

    return updatedProfile;
}

export async function fetchProfileUpdateRequestAPI(
    requestId?: string
): Promise<ProfileUpdateRequest> {
    const userId = await getAuthUserId();
    if (!userId) {
        throw new Error('You must be logged in to fetch a profile update request.');
    }

    const isAdminCheck = await isAdmin();

    const { data: updateRequest, error: fetchError } = await supabase
        .from('profile_update_requests')
        .select('*')
        .eq('id', requestId)
        .single();

    if (fetchError) {
        throw new Error(`Error fetching profile update requests: ${fetchError.message}`);
    }

    if (!isAdminCheck && updateRequest.intern_id !== userId) {
        throw new Error('Forbidden: You do not have permission to view this request.');
    }

    return updateRequest;
}

export async function requestProfileUpdateAPI(
    updateRequest: ProfileUpdateRequestForm
): Promise<ProfileUpdateRequest> {
    const userId = await getAuthUserId();
    if (!userId) {
        throw new Error('You must be logged in to request a profile update.');
    }

    const requestProfileUpdateInsert: ProfileUpdateRequestInsert = {
        intern_id: userId,
        update_type: updateRequest.update_type,
        requested_data: updateRequest.requested_data,
        reason: updateRequest.reason || null,
        status: 'pending',
    }

    const { data: insertedUpdateRequest, error: insertError } = await supabase
        .from('profile_update_requests')
        .insert([requestProfileUpdateInsert])
        .select()
        .single();

    if (insertError) {
        throw new Error(`Error submitting profile update request: ${insertError.message}`);
    }

    return insertedUpdateRequest;
}

export async function adminReviewProfileUpdateAPI(
    review: AdminReviewProfileUpdateRequest
): Promise<ProfileUpdateRequest> {
    const adminId = await getAuthUserId();
    if (!adminId) {
        throw new Error('You must be logged in as a user to review profile update requests.');
    }

    if (!await isAdmin()) {
        throw new Error('You must be an admin to review profile update requests.');
    }

    const { data: updatedUpdateRequest, error: updateError } = await supabase
        .from('profile_update_requests')
        .update({
            status: review.status,
            admin_id: adminId,
            reviewed_at: new Date().toISOString(),
            admin_feedback: review.admin_feedback || null,
        })
        .eq('id', review.id)
        .select()
        .single();

    if (updateError) {
        throw new Error(`Error reviewing profile update request: ${updateError.message}`);
    }

    return updatedUpdateRequest;
}

export async function hasPendingProfileUpdateRequestAPI(
    updateType: 'information_update' | 'avatar_update'
    ): Promise<boolean> {
    const userId = await getAuthUserId();

    if (!userId) {
        throw new Error('You must be logged in to check profile update requests.');
    }

    const { data, error } = await supabase
        .from('profile_update_requests')
        .select('id')
        .eq('intern_id', userId)
        .eq('update_type', updateType)
        .eq('status', 'pending')
        .limit(1);

    if (error) {
        throw new Error(
        `Error checking pending profile update request: ${error.message}`
        );
    }

    return data.length > 0;
}

export async function updateProfileUpdateRequestAPI(
    requestId: string,
    updateRequest: ProfileUpdateRequestForm
): Promise<ProfileUpdateRequest> {
    const userId = await getAuthUserId();

    if (!userId) {
        throw new Error('You must be logged in to update a profile update request.');
    }

    const { data: updatedRequest, error } = await supabase
        .from('profile_update_requests')
        .update({
        update_type: updateRequest.update_type,
        requested_data: updateRequest.requested_data,
        reason: updateRequest.reason || null,
        })
        .eq('id', requestId)
        .eq('intern_id', userId)
        .eq('status', 'pending')
        .select()
        .single();

    if (error) {
        throw new Error(`Error updating profile update request: ${error.message}`);
    }

    return updatedRequest;
}