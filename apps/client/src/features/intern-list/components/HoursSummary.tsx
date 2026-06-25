type HoursSummaryProps = {
    requiredHours: number;
    renderedHours: number;
};

function HoursSummary({ requiredHours, renderedHours }: HoursSummaryProps) {
    const remainingHours = Math.max(requiredHours - renderedHours, 0);

    return (
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
            <HourCard
                label="Required Hours"
                value={requiredHours}
                className="text-[#002D6F]"
            />
            <HourCard
                label="Rendered Hours"
                value={renderedHours}
                className="text-[#00A83B]"
            />
            <HourCard
                label="Remaining Hours"
                value={remainingHours}
                className="text-[#FFBF10]"
            />
        </div>
    );
}

function HourCard({
    label,
    value,
    className,
}: {
    label: string;
    value: number;
    className: string;
}) {
    return (
        <section className="flex min-h-[125px] flex-col justify-between rounded-xl bg-white px-4 py-4 shadow-md sm:min-h-[120px] sm:px-5">
            <p className="min-h-[40px] text-sm font-bold leading-tight text-black sm:min-h-0 sm:text-base">
                {label}
            </p>

            <p
                className={`text-right text-3xl font-black leading-none sm:text-4xl ${className}`}
            >
                {Number.isInteger(value) ? value : value.toFixed(2)}
            </p>
        </section>
    );
}

export default HoursSummary;