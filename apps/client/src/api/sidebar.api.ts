import { supabase } from '../config/supabase';
import type { SidebarProfile } from '../../../shared/types/sidebar.types';

export async function fetchSidebarProfile(id: string): Promise<SidebarProfile> {
    const { data: profileData, error } = await supabase
        .from('profiles')
        .select('first_name, last_name, role, position, avatar_url')
        .eq('id', id)
        .single();

    if (error) {
        throw new Error(`Failed to fetch sidebar profile: ${error.message}`);
    }

    return {
        id: id,
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        role: profileData.role,
        position: profileData.position,
        avatar_url: profileData.avatar_url || '',
    };
}