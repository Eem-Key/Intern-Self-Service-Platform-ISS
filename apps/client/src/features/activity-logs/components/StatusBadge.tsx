type StatusBadgeProps = {
    status: string;
};

function formatStatus(status: string) {
    if (status === 'denied') return 'Declined';
    return status;
}

function getStatusClass(status: string) {
    switch (status.toLowerCase()) {
        case 'approved':
        return 'bg-green-100 text-green-700';

        case 'pending':
        return 'bg-yellow-100 text-yellow-600';

        case 'denied':
        case 'declined':
        case 'rejected':
        return 'bg-red-100 text-red-600';

        case 'draft':
        return 'bg-blue-100 text-blue-700';

        default:
        return 'bg-gray-100 text-gray-600';
    }
}

function StatusBadge({ status }: StatusBadgeProps) {
    return (
        <span
        className={`inline-flex min-w-[90px] justify-center rounded-full px-4 py-1 text-xs font-bold uppercase ${getStatusClass(
            status
        )}`}
        >
        {formatStatus(status)}
        </span>
    );
}

export default StatusBadge;