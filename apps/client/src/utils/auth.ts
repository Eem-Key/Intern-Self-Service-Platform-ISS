import { supabase } from '../config/supabase';

export async function getAuthUserId(): Promise<string | null> {
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    console.error('Auth error or no user found:', error);
    return null;
  }
  
  return user.id;
}