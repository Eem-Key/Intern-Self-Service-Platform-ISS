import { supabase } from '../config/supabase';
import { getAuthUserId } from '../utils/auth';
import type { ReportStatus } from '../../../shared/types/enums.types';
import type {
    EODReport,
    EODReportForm,
    EODReportInsert,
    EODReportUpdate,
    EODReportResponse,
} from '../../../shared/types/eodReport.types';
import { useQuery } from '@tanstack/react-query';
import { getAttendanceByDateAPI } from '../api/attendance.api';
import type {
    Record,
    RecordInsert,
} from '../../../shared/types/record.types';
import {
    insertRecord,
    updateRecordStatus
} from './record.api'

export function useEODAttendance(date: string) {
    return useQuery({
        queryKey: ['attendance-report', date],
        queryFn: () => getAttendanceByDateAPI(date),
        enabled: !!date,
        retry: false,
    });
}

export function useFetchEODReport(date: string) {
    return useQuery({
        queryKey: ['eod-report', date],
        queryFn: () => fetchEODReportByDateAPI(date),
        enabled: !!date,
    });
}

export async function fetchEODReportByDateAPI(
    date: string
): Promise<{
  report: EODReport;
  status: ReportStatus | null;
}>  {
    const intern_id = await getAuthUserId();
    if (!intern_id) {
        throw new Error(`You must be logged in to fetch a report.`);
    }

    const { data: reportData, error: fetchError } = await supabase
        .from('eod_reports')
        .select(`
            *,
            records!inner(
            status
            )
            `)
        .eq('records.intern_id', intern_id)
        .eq('records.log_category', 'eod_report')
        .eq('records.date_written', date)
        .single();

    if (fetchError) {
        throw new Error(`Error fetching report: ${fetchError.message}`);
    }

    const { records, ...report } = reportData;

    return {
        report: report as EODReport,
        status: records.status as ReportStatus
    };
}

export async function insertEODReportAPI(
    payload: EODReportForm,
    reportStatus: ReportStatus
): Promise<EODReportResponse> {
    const intern_id = await getAuthUserId();
    if (!intern_id) {
        throw new Error(`You must be logged in to save a ${reportStatus}.`);
    }

    const record: RecordInsert = {
        intern_id: intern_id,
        log_category: 'eod_report',
        status: reportStatus
    }

    const record_id = await insertRecord(record);

    const report: EODReportInsert = {
        record_id: record_id,
        date_written: payload.date_written,
        project_name: payload.project_name,
        task_accomplished: payload.task_accomplished,
        hours_spent: payload.hours_spent,
    };

    const { data: newReportData, error: insertError } = await supabase
        .from('eod_reports')
        .insert([report])
        .select()
        .single();

    if (insertError) {
        console.error('Error inserting report:', insertError.message);
        throw insertError;
    }

    return {
        message: `EOD ${reportStatus} saved successfully`,
        data: newReportData,
    };
}

export async function updateEODReportAPI(
    reportId: string,
    payload: EODReportForm,
    reportStatus: ReportStatus
): Promise<EODReportResponse> {
    const intern_id = await getAuthUserId();
    if (!intern_id) {
        throw new Error(`You must be logged in to update a ${reportStatus}.`);
    }

    const report: EODReportUpdate = {
        project_name: payload.project_name,
        task_accomplished: payload.task_accomplished,
    };

    const { data: updatedReportData, error: updateError } = await supabase
        .from('eod_reports')
        .update([report])
        .eq('record_id', reportId)
        .select()
        .single();

    if (updateError) {
        console.error('Error updating report:', updateError.message);
        throw updateError;
    }

    await updateRecordStatus(reportId, reportStatus);

    return {
        message: `EOD ${reportStatus} updated successfully`,
        data: updatedReportData,
    };
}    