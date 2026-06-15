import { supabase } from '../config/supabase';
import type { JobPosition, UserRole } from '../../../shared/types/enums.types'
import type { UserProfile } from '../../../shared/types/profile.types'

export async function getAuthUserId(): Promise<string | null> {
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    console.error('Auth error or no user found:', error);
    return null;
  }
  
  return user.id;
}

export async function isAdmin(): Promise<boolean> {
  const userId = await getAuthUserId();
  if (!userId) return false;

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  if (error || !profile) {
    console.error('Error fetching user profile:', error);
    return false;
  }

  return profile.role === 'admin';
}

export async function isAccountActive(userId: String, role: UserRole): Promise<boolean> {
  if (role === 'Admin') return true 

  const { data: intern, error } = await supabase
    .from('interns')
    .select('status')
    .eq('id', userId)
    .single();

  if (error || !intern) {
    console.error('Error fetching user profile:', error);
    return false;
  }
  
  return intern.status === 'active';
}

export function getAuthUser(): UserProfile | null {
    const storedUser = localStorage.getItem('authUser');

    if (!storedUser) return null;

    try {
        return JSON.parse(storedUser) as UserProfile;
    } catch {
        return null;
    }
}

export function getFullName(user: UserProfile | null): string {
  if (!user) return 'Intern';

  const fullName = [
    user.first_name,
    user.last_name,
  ]
    .filter(Boolean)
    .join(' ');

  return fullName || 'Intern';
}

export function getPosition(user: UserProfile | null): JobPosition | string {
  if (!user) return 'No Position';

  return user.position;
}