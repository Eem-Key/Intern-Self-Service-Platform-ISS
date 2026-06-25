import type { ReactNode } from 'react';

type InfoSectionProps = {
    title: string;
    children: ReactNode;
};

export function StatusPill({
    status,
}: {
    status?: string | null;
}) {
    const normalizedStatus = status?.toLowerCase();
    const isActive = normalizedStatus === 'active';

    const displayStatus = !status
        ? '--'
        : normalizedStatus === 'active'
          ? 'Active'
          : normalizedStatus === 'deactivated'
            ? 'Deactivated'
            : status.charAt(0).toUpperCase() + status.slice(1);

    return (
        <span
            className={`inline-flex min-w-[72px] justify-center rounded-full px-3 py-1 text-xs font-bold ${
                isActive
                    ? 'bg-green-100 text-green-600'
                    : 'bg-blue-100 text-blue-600'
            }`}
        >
            {displayStatus}
        </span>
    );
}

function InfoSection({ title, children }: InfoSectionProps) {
    return (
        <section className="rounded-xl bg-white px-4 py-4 shadow-md sm:px-5">
            <h2 className="border-l-4 border-[#FFBF10] pl-2 text-lg font-bold text-black sm:text-xl">
                {title}
            </h2>

            <div className="mt-4 grid grid-cols-3 gap-4 text-sm sm:grid-cols-3">
                {children}
            </div>
        </section>
    );
}

export function InfoItem({
    label,
    value,
    full = false,
}: {
    label: string;
    value: ReactNode;
    full?: boolean;
}) {
    return (
        <div className={full ? 'sm:col-span-2' : ''}>
            <p className="text-xs font-medium text-gray-500">{label}</p>

            <div className="mt-1 whitespace-pre-line font-bold text-black">
                {value || '--'}
            </div>
        </div>
    );
}
export default InfoSection;