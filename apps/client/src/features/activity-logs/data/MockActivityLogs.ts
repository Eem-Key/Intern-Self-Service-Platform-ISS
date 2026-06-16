import type { ActivityLog } from '../../../../../shared/types/activityLog.types';

export const mockActivityLogs: ActivityLog[] = [
    {
        id: 'attendance-1-time-out',
        source_id: 'attendance-1',
        type: 'attendance',
        activity: 'Time Out',
        status: 'approved',
        submitted_at: '2026-03-24T17:30:00',
        details: {
        date: '2026-03-24',
        time_in: '2026-03-24T08:20:00',
        time_out: '2026-03-24T17:30:00',
        hours_spent: 8,
        },
    },
    {
        id: 'attendance-2-time-in',
        source_id: 'attendance-2',
        type: 'attendance',
        activity: 'Time In',
        status: 'approved',
        submitted_at: '2026-03-24T08:20:00',
        details: {
        date: '2026-03-24',
        time_in: '2026-03-24T08:20:00',
        time_out: null,
        hours_spent: null,
        },
    },

    {
        id: 'eod-pending-1',
        source_id: 'eod-pending-1',
        type: 'eod_report',
        activity: 'Submission of EOD Report',
        status: 'pending',
        submitted_at: '2026-03-23T16:30:00',
        details: {
        date: '2026-03-23',
        hours_spent: 8,
        project_name: 'ISS Platform',
        task_accomplished:
            'Implemented UI updates and fixed layout issues for the intern dashboard.',
        },
    },
    {
        id: 'eod-draft-1',
        source_id: 'eod-draft-1',
        type: 'eod_report',
        activity: 'Submission of EOD Report',
        status: 'draft',
        submitted_at: '2026-06-16T16:30:00',
        details: {
        date: '2026-06-16',
        hours_spent: 8,
        project_name: 'ISS Platform',
        task_accomplished:
            'Drafted work progress for UI implementation and pending fixes.',
        },
    },
    {
        id: 'eod-approved-1',
        source_id: 'eod-approved-1',
        type: 'eod_report',
        activity: 'Submission of EOD Report',
        status: 'approved',
        submitted_at: '2026-03-21T17:00:00',
        details: {
        date: '2026-03-21',
        hours_spent: 8,
        project_name: 'ISS Platform',
        task_accomplished:
            'Completed frontend layout updates for profile and logs pages.',
        admin_feedback: 'Approved. Good progress on the assigned UI tasks.',
        },
    },
    {
        id: 'eod-denied-1',
        source_id: 'eod-denied-1',
        type: 'eod_report',
        activity: 'Submission of EOD Report',
        status: 'denied',
        submitted_at: '2026-03-20T17:00:00',
        details: {
        date: '2026-03-20',
        hours_spent: 8,
        project_name: 'ISS Platform',
        task_accomplished:
            'Worked on frontend components and reported initial progress.',
        admin_feedback:
            'Please provide more specific details about the completed tasks.',
        },
    },

    {
        id: 'leave-pending-1',
        source_id: 'leave-pending-1',
        type: 'leave_request',
        activity: 'Sick Leave/Medical Leave',
        status: 'pending',
        submitted_at: '2026-03-15T09:00:00',
        details: {
        leave_start_date: '2026-03-16',
        leave_end_date: '2026-03-17',
        leave_reason: 'Sick Leave/Medical Leave',
        description: 'Filed a leave request due to medical reasons.',
        admin_feedback: null,
        },
    },
    {
        id: 'leave-approved-1',
        source_id: 'leave-approved-1',
        type: 'leave_request',
        activity: 'School Activity/Academic Leave',
        status: 'approved',
        submitted_at: '2026-03-13T17:00:00',
        details: {
        leave_start_date: '2026-03-14',
        leave_end_date: '2026-03-15',
        leave_reason: 'School Activity/Academic Leave',
        description:
            'Filed an academic leave request for a school-related activity.',
        admin_feedback: 'Approved. Please ensure your report is updated after the leave.',
        },
    },
    {
        id: 'leave-denied-1',
        source_id: 'leave-denied-1',
        type: 'leave_request',
        activity: 'Sick Leave/Medical Leave',
        status: 'denied',
        submitted_at: '2026-03-02T08:30:00',
        details: {
        leave_start_date: '2026-03-03',
        leave_end_date: '2026-03-04',
        leave_reason: 'Sick Leave/Medical Leave',
        description: 'Filed a sick leave request for two days.',
        admin_feedback:
            'Request denied due to missing supporting details. Please resubmit with complete information.',
        },
    },

    {
        id: 'profile-update-info-pending-1',
        source_id: 'profile-update-info-pending-1',
        type: 'profile_update',
        activity: 'Profile Information Update',
        status: 'pending',
        submitted_at: '2026-03-10T10:00:00',
        details: {
        update_type: 'information_update',
        requested_data: {
            first_name: 'Joehanna',
            middle_name: '',
            last_name: 'Cansino',
            suffix: '',
            birth_date: '2003-05-12',
            gender: 'female',
            email: 'jhnnacansino@gmail.com',
            contact_number: '+639123456789',
            address: 'Updated address here',
            position: 'Front-end Developer',
            department: 'ISS',
            office: 'makati',
            intern_info: {
            university: 'De La Salle University',
            year_level: 4,
            program: 'Information Systems',
            required_hours: 480,
            start_date: '2026-06-01',
            },
        },
        admin_feedback: null,
        },
    },
    {
        id: 'profile-update-avatar-pending-1',
        source_id: 'profile-update-avatar-pending-1',
        type: 'profile_update',
        activity: 'Profile Picture Update',
        status: 'pending',
        submitted_at: '2026-03-11T10:00:00',
        details: {
        update_type: 'avatar_update',
        requested_data: {
            avatar_url: 'avatars/sample-avatar.png',
        },
        admin_feedback: null,
        },
    },
    {
        id: 'profile-update-approved-1',
        source_id: 'profile-update-approved-1',
        type: 'profile_update',
        activity: 'Profile Information Update',
        status: 'approved',
        submitted_at: '2026-03-09T10:00:00',
        details: {
        update_type: 'information_update',
        requested_data: {
            contact_number: '+639987654321',
            address: 'Previously approved address',
        },
        admin_feedback: 'Approved. Your profile information has been updated.',
        },
    },
];