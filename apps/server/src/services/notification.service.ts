import { prisma } from '../db.js';

export const insertInternNotificationService = async (record: any) => {
    const profile = await prisma.profiles.findUnique({
        where: { id: record.intern_id },
        select: { first_name: true, last_name: true }
    });

    const fullName = profile 
        ? `${profile.first_name} ${profile.last_name}`.trim() 
        : 'Intern';

    const recordStr = record.log_category?.toString().toUpperCase().replace(/_/g, ' ');
    const conjunction = record.log_category === 'eod_report' ? 'an' : 'a';
    const now = new Date();
    const readableDate = now.toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
    });

    const title = `${recordStr || 'REPORT or REQUEST'} is pending for review`;
    const message = `${fullName} submitted ${conjunction} ${recordStr || 'Report or Request'} on ${readableDate}.`;

    return await prisma.notifications.create({
        data: {
            record_id: record.id,
            intern_id: record.intern_id,
            title,
            message,
            status: record.status,
            is_read: false
        }
    });
};

export const insertAdminNotificationService = async (record: any) => {
    const recordstr = record.log_category?.toString().toUpperCase().replace(/_/g, ' ');
    const title = `${recordstr || 'Report or Request'} has been ${record.status?.toString().toUpperCase() || 'Reviewed'}`;
    
    let message = 'Error No Admin';
    if (record.reviewed_at) {
        const now = new Date();
        const readableDate = now.toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
        message = `Your ${recordstr || 'Report or Request'} has been ${record.status?.toString().toUpperCase() || 'Reviewed'} on ${readableDate} by your supervisor.`;
    }

    return await prisma.notifications.create({
        data: {
            record_id: record.id,
            intern_id: record.intern_id,
            title,
            message,
            status: record.status,
            is_read: false
        },
        select: { id: true }
    });
};