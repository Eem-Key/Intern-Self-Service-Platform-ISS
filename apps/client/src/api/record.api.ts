import { supabase } from '../config/supabase.ts';
import { getAuthUserId } from '../utils/auth';
import type { 
    ReportStatus, 
    RecordType 
} from '../../../shared/types/enums.types.ts';
import type { 
    Record, 
    RecordInsert 
} from '../../../shared/types/record.types.ts';

export const insertRecord = async (record: RecordInsert): Promise<string> => {
    const { data: recordInsert, error: insertRecordError } = await supabase
    .from('records')
    .insert([record])
    .select('id')
    .single();

    if (insertRecordError){
        console.log(insertRecordError)
        throw insertRecordError;
    }

    console.log('Insert Record: ', recordInsert)

    return recordInsert.id
};

export const updateRecordStatus = async (record_id: string, status: ReportStatus) => {
    const { data: recordUpdate, error: updateRecordError } = await supabase
    .from('records')
    .update({
        status:status
    })
    .eq('id', record_id)
    .select('status')
    .single();

    if (updateRecordError){
        console.log(updateRecordError)
        throw updateRecordError;
    }

    console.log('Updated Record: ', recordUpdate)
};