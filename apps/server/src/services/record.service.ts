import { prisma } from '../db.js';

export type TableKey = 'attendance_log' | 'eod_report' | 'leave_request' | 'profile_update';

export const fetchRecordDetailsById = async (record_id: string, table: TableKey) => {
    try {
        switch (table) {
            case 'attendance_log':
                return await prisma.attendance_logs.findUnique({ where: { record_id } });
            case 'eod_report':
                return await prisma.eod_reports.findUnique({ where: { record_id } });
            case 'leave_request':
                return await prisma.leave_requests.findUnique({ where: { record_id } });
            case 'profile_update':
                return await prisma.profile_update_requests.findUnique({ where: { record_id } });
            default:
                console.warn(`Attempted to fetch details from unknown table: ${table}`);
                return null;
        }
    } catch (error) {
        console.error(`Error in getRecordDetailsById for table ${table}:`, error);
        throw error;
    }
};