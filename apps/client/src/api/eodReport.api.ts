import { supabase } from '../config/supabase';
import { getAuthUserId } from '../utils/auth';
import type {
    EODReportStatus,
    EODReport,
    EODReportPayload,
    EODReportResponse,
} from '../../../shared/types/eodReport.types';
import { useQuery } from '@tanstack/react-query';
import { getAttendanceByDateAPI } from '../api/attendance.api';

export function useEODAttendance(date: string) {
    return useQuery({
        queryKey: ['attendance-report', date],
        queryFn: () => getAttendanceByDateAPI(date),
        enabled: !!date,
    });
}

export function useEODReport(date: string) {
    return useQuery({
        queryKey: ['eod-report', date],
        queryFn: () => fetchEODReportByDateAPI(date),
        enabled: !!date,
    });
}

export async function fetchEODReportByDateAPI(date: string) {
    const intern_id = await getAuthUserId();
    if (!intern_id) {
        throw new Error(`You must be logged in to fetch a report.`);
    }

    const { data: reportData, error: fetchError } = await supabase
        .from('eod_reports')
        .select('*')
        .eq('date_written', date)
        .eq('intern_id', intern_id)
        .single();

    if (fetchError) {
        throw new Error(`Error fetching report: ${fetchError.message}`);
    }
    return reportData;
}

export async function insertEODDraftAPI(
    payload: EODReportPayload,
    reportStatus: EODReportStatus
): Promise<EODReportResponse> {
    const intern_id = await getAuthUserId();
    if (!intern_id) {
        throw new Error(`You must be logged in to save a ${reportStatus}.`);
    }

    const report: EODReport = {
        intern_id: intern_id,
        date_written: payload.dateWritten,
        project_name: payload.projectName,
        task_accomplished: payload.taskAccomplished,
        hours_spent: payload.hoursSpent,
        status: reportStatus,
    };

    const { data: newReportData, error: insertError } = await supabase
        .from('eod_reports')
        .insert(report)
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
    payload: EODReportPayload,
    reportStatus: EODReportStatus
): Promise<EODReportResponse> {
    const intern_id = await getAuthUserId();
    if (!intern_id) {
        throw new Error(`You must be logged in to update a ${reportStatus}.`);
    }

    const report: EODReport = {
        intern_id: intern_id,
        date_written: payload.dateWritten,
        project_name: payload.projectName,
        task_accomplished: payload.taskAccomplished,
        hours_spent: payload.hoursSpent,
        status: reportStatus,
    };

    const { data: updatedReportData, error: updateError } = await supabase
        .from('eod_reports')
        .update(report)
        .eq('id', reportId)
        .select()
        .single();

    if (updateError) {
        console.error('Error updating report:', updateError.message);
        throw updateError;
    }

    return {
        message: `EOD ${reportStatus} updated successfully`,
        data: updatedReportData,
    };
}