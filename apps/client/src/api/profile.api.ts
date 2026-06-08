import { supabase } from '../config/supabase';
import { getAuthUserId, isAdmin } from '../utils/auth';
import type { 
    Profile,
    ProfileInsert,
    ProfileUpdate,
    ProfileUpdateRequest,
    AdminReviewProfileUpdateRequest
} from '../../../shared/types/profile.types';

export async function fetchProfileAPI(): Promise<Profile> {
    const userId = await getAuthUserId();
    if (!userId) {
        throw new Error('You must be logged in to fetch your profile.');
    }
    
    const isAdminCheck = await isAdmin();

    const { data: profileData, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
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

export async function adminInsertProfileAPI(
    profile: ProfileInsert
): Promise<Profile> {
    const adminId = await getAuthUserId();
    if (!adminId) {
        throw new Error('You must be logged in as a user to review profile update requests.');
    }

    if (!await isAdmin()) {
        throw new Error('You must be an admin to review profile update requests.');
    }

    const { data: insertedProfile, error: insertError } = await supabase
        .from('profiles')
        .insert(profile)
        .select()
        .single();

    if (insertError) {
        throw new Error(`Error inserting profile: ${insertError.message}`);
    }

    return insertedProfile;
}

export async function adminUpdateProfileAPI(
    profileId: string,
    profile: ProfileUpdate
): Promise<Profile> {
    const adminId = await getAuthUserId();
    if (!adminId) {
        throw new Error('You must be logged in as a user to update profiles.');
    }

    if (!await isAdmin()) {
        throw new Error('You must be an admin to update profiles.');
    }

    const { data: updatedProfile, error: updateError } = await supabase
        .from('profiles')
        .update(profile)
        .eq('id', profileId)
        .select()
        .single();

    if (updateError) {
        throw new Error(`Error updating profile: ${updateError.message}`);
    }

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
    updateRequest: ProfileUpdateRequest
): Promise<ProfileUpdateRequest> {
    const userId = await getAuthUserId();
    if (!userId) {
        throw new Error('You must be logged in to request a profile update.');
    }

    const { data: insertedUpdateRequest, error: insertError } = await supabase
        .from('profile_update_requests')
        .insert({
            intern_id: userId,
            update_type: updateRequest.update_type,
            requested_data: updateRequest.requested_data,
            reason: updateRequest.reason || null,
            status: 'pending',
        })
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
        .eq('id', review.requestId)
        .select()
        .single();

    if (updateError) {
        throw new Error(`Error reviewing profile update request: ${updateError.message}`);
    }

    return updatedUpdateRequest;
}