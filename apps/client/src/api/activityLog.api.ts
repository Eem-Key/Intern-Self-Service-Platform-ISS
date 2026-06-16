// import { supabase } from '../config/supabase.ts';
// import { getAuthUserId } from '../utils/auth.ts';
// import type { 
//     ActivityLog, 
//     ActivityLogInsert 
// } from '../../../shared/types/activityLog.types.ts';
// import type { LogType } from '../../../shared/types/enums.types.ts';

// export const insertActivityLog = async (activity_log: ActivityLogInsert): Promise<ActivityLog> => {
//     console.log(activity_log)
//     const { data: new_activity_log, error: insertError } = await supabase
//         .from('activity_logs')
//         .insert([activity_log]) 
//         .select()
//         .single();

//     if (insertError) {
//         console.log(insertError)
//         throw new Error(insertError.message);
//     }
    
//     console.log(new_activity_log)
//     return new_activity_log;
// };