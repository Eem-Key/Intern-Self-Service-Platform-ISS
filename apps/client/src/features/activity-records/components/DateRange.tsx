type DateRangeProps = {
    startDate: string;
    endDate: string;
    onStartDateChange: (value: string) => void;
    onEndDateChange: (value: string) => void;
};

function DateRange({
    startDate,
    endDate,
    onStartDateChange,
    onEndDateChange,
}: DateRangeProps) {
    return (
        <div className="grid w-full grid-cols-[1fr_auto_1fr] items-center gap-2">
            <input
                type="date"
                value={startDate}
                onChange={(event) => onStartDateChange(event.target.value)}
                className="h-10 min-w-0 rounded-lg bg-white px-2 text-xs shadow-sm outline-none ring-1 ring-gray-100 xl:text-sm"
            />

            <span className="shrink-0 text-xs font-bold text-black sm:text-sm">
                -
            </span>

            <input
                type="date"
                value={endDate}
                onChange={(event) => onEndDateChange(event.target.value)}
                className="h-10 min-w-0 rounded-lg bg-white px-2 text-xs shadow-sm outline-none ring-1 ring-gray-100 xl:text-sm"
            />
        </div>
    );
}

export default DateRange;

