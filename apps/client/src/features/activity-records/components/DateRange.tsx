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
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        <input
            type="date"
            value={startDate}
            onChange={(event) => onStartDateChange(event.target.value)}
            className="h-9 w-[145px] rounded-lg bg-white px-2 text-[11px] shadow-sm outline-none sm:w-[155px] sm:text-xs lg:h-10 lg:w-[175px] lg:text-sm"
        />

        <span className="shrink-0 text-xs font-bold text-black sm:text-sm">
            -
        </span>

        <input
            type="date"
            value={endDate}
            onChange={(event) => onEndDateChange(event.target.value)}
            className="h-9 w-[145px] rounded-lg bg-white px-2 text-[11px] shadow-sm outline-none sm:w-[155px] sm:text-xs lg:h-10 lg:w-[175px] lg:text-sm"
        />
        </div>
    );
}

export default DateRange;