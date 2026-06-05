import { supabase } from '../config/supabase';
import type { ProgramProgressResponse } from '../../../shared/types/programProgress.types';

export async function getProgramProgressAPI(id: string): Promise<ProgramProgressResponse> {
    const { data: summary, error: summaryError } = await supabase
        .from('intern_hours_summary')
        .select('*')
        .eq('intern_id', id)
        .maybeSingle();

    const { data: intern, error: internError } = await supabase
        .from('interns')
        .select('required_hours')
        .eq('id', id)
        .single();

    console.log("Searching for ID:", id);
    console.log("Intern record found:", intern);
    
    if (internError) {
        throw new Error(`Failed to fetch intern data: ${internError.message}`);
    }

    return {
        message: 'Program progress fetched successfully',
        data: {
            required_hours: intern.required_hours,
            rendered_hours: summary?.rendered_hours,
            hours_left: intern.required_hours - summary?.rendered_hours,
            wfh_hours: summary?.total_online_hours,
            onsite_hours: summary?.total_onsite_hours,
        }
    };
}