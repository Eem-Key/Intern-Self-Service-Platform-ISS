import type { ReactNode } from 'react';

type InfoSectionProps = {
    title: string;
    children: ReactNode;
};

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
    value: string;
    full?: boolean;
}) {
    return (
        <div className={full ? 'sm:col-span-2' : ''}>
            <p className="text-xs font-medium text-gray-500">{label}</p>
            <p className="mt-1 whitespace-pre-line font-bold text-black">
                {value || '--'}
            </p>
        </div>
    );
}

export default InfoSection;