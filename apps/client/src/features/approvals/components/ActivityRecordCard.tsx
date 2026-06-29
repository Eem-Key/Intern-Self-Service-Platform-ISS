import type { ApprovalRecord } from '../../../../../shared/types/approvals.types';

type ActivityRecordCardProps = {
    record: ApprovalRecord;
    onView: () => void;
};

function formatLabel(key: string) {
    return key
        .replaceAll('_', ' ')
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDisplayName(name?: string | null) {
    if (!name?.trim()) return '--';

    return name
        .replace(/\s+\.\s+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function formatActivityDescription(value?: string | null) {
    if (!value) return '--';

    switch (value) {
        case 'time_in':
        case 'Time In':
            return 'Time In';

        case 'time_out':
        case 'Time Out':
            return 'Time Out';

        case 'submission_of_eod_report':
        case 'Submission of EOD Report':
            return 'Submission of EOD Report';

        case 'submission_of_draft':
        case 'Submission of Draft':
            return 'Submission of Draft';

        case 'academic_leave':
        case 'Academic Leave':
            return 'Academic Leave';

        case 'medical_leave':
        case 'Medical Leave':
            return 'Medical Leave';

        case 'profile_information':
        case 'Profile Information':
            return 'Profile Information';

        case 'profile_picture':
        case 'Profile Picture':
            return 'Profile Picture';

        default:
            return formatLabel(value);
    }
}

function formatInternRole(value?: string | null) {
    if (!value) return '--';

    switch (value) {
        case 'quality_assurance':
        case 'Quality Assurance':
            return 'Quality Assurance';

        case 'frontend_developer':
        case 'Front_end_Developer':
        case 'Front-end Developer':
            return 'Front-end Developer';

        case 'backend_developer':
        case 'Back_end_Developer':
        case 'Back-end Developer':
            return 'Back-end Developer';

        case 'business_analyst':
        case 'Business_Analyst':
        case 'Business Analyst':
            return 'Business Analyst';

        default:
            return formatLabel(value);
    }
}

function ActivityRecordCard({ record, onView }: ActivityRecordCardProps) {
    return (
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm lg:flex lg:min-h-[86px] lg:items-center lg:justify-between lg:rounded-none lg:border-0 lg:border-b lg:border-gray-100 lg:p-0 lg:py-3 lg:shadow-none">
        <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-gray-500 lg:hidden">
            {record.log_category === 'eod_report'
                ? 'EOD Report'
                : record.log_category === 'leave_request'
                ? 'Leave Request'
                : 'Profile Change'}
            </p>

            <h3 className="mt-1 break-words text-sm font-bold text-black sm:text-base lg:mt-0 lg:truncate">
            {formatDisplayName(record.name)}
            </h3>

            <p className="mt-0.5 truncate text-xs text-black sm:text-sm">
            {formatInternRole(record.position)} |{' '} | {record.department || '--'}
            </p>

            <p className="mt-1 line-clamp-2 text-xs leading-snug text-gray-600 sm:text-sm">
            {formatActivityDescription(record.activity_description)}
            </p>
        </div>

        <div className="mt-3 flex justify-end lg:mt-0 lg:pl-4">
            <button
            type="button"
            onClick={onView}
            className="rounded-full px-3 py-1 text-xs font-bold text-[#0058DD] transition hover:bg-[#EAF0FA] lg:rounded-none lg:px-2.5 lg:py-1 lg:text-[11px]"
            >
            View
            </button>
        </div>
        </div>
    );
}

export default ActivityRecordCard;