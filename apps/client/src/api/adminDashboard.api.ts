import { supabase } from '../config/supabase';
import type { AttendanceRecord } from '../../../shared/types/attendance.types';
import { getAuthUserId, isAdmin } from '../utils/auth';

export async function fetchActiveInternsAPI(): Promise<number> {
    const userId = await getAuthUserId();
    if (!userId) {
        throw new Error('You must be logged in to fetch your profile.');
    }
    
    const isAdminCheck = await isAdmin();
    if (!isAdminCheck) {
        throw new Error('Forbidden: You do not have permission to view this request.');
    }

    const { count, error: fetchError } = await supabase
        .from('interns')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

    if (fetchError) {
        throw new Error(`Error fetching count: ${fetchError.message}`);
    }

    return count ?? 0;
}

export async function fetchActiveAttendanceAPI(): Promise<number> {
    const userId = await getAuthUserId();
    if (!userId) {
        throw new Error('You must be logged in to fetch your profile.');
    }
    
    const isAdminCheck = await isAdmin();
    if (!isAdminCheck) {
        throw new Error('Forbidden: You do not have permission to view this request.');
    }

    const today = new Date().toISOString().split('T')[0];

    const { count, error: fetchError } = await supabase
        .from('attendance_logs')
        .select('*', { count: 'exact', head: true })
        .eq('work_date', today)
        .is('clock_out', null);

    if (fetchError) {
        throw new Error(`Error fetching count: ${fetchError.message}`);
    }

    return count ?? 0;
}

export async function fetchAttendancePerDateRange(
    start_date: string, 
    end_date: string
): Promise<AttendanceRecord[]>{
    const userId = await getAuthUserId();
    if (!userId) {
        throw new Error('You must be logged in to fetch your profile.');
    }
    
    const isAdminCheck = await isAdmin();
    if (!isAdminCheck) {
        throw new Error('Forbidden: You do not have permission to view this request.');
    }

    const { data: attendanceLogs, error: fetchError } = await supabase
        .from('attendance_logs')
        .select('*')
        .gte('work_date', start_date)
        .lte('work_date', end_date);
    
    if (fetchError) {
        throw new Error(`Error fetching attendance: ${fetchError.message}`);
    }

    return (attendanceLogs as AttendanceRecord[]) || [];
}