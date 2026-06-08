import { supabase } from '../config/supabase';

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