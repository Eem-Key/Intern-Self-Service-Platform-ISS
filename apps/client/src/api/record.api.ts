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

export const fetchRecordByDate = async (date: string, log_category: RecordType): Promise<Record> => {
    const intern_id = await getAuthUserId();
    if (!intern_id) {
        throw new Error(`You must be logged in to fetch a report.`);
    }

    const { data: recordFetch, error: fetchRecordError } = await supabase
        .from('records')
        .select('*')
        .eq('intern_id', intern_id)
        .eq('log_category', log_category)
        .eq('date_created', date)
        .single();

    if (fetchRecordError){
        console.log(fetchRecordError)
        throw fetchRecordError;
    } 

    console.log('Fetch Record: ', recordFetch.id)

    return recordFetch
};

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