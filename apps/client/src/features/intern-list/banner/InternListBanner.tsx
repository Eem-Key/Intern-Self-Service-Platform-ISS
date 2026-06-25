type InternListBannerProps = {
    onAddIntern: () => void;
};

function InternListBanner({ onAddIntern }: InternListBannerProps) {
    return (
        <div className="relative w-full overflow-hidden rounded-xl bg-[#002D6F] px-5 py-6 shadow-md sm:px-7 sm:py-7 lg:px-8 xl:py-8">
            <div className="relative z-10 flex w-full items-end justify-between gap-4">
                <div className="min-w-0 flex-1">
                    <h1 className="text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl xl:text-6xl">
                        Interns
                    </h1>

                    <p className="mt-2 max-w-[1100px] text-xs leading-snug text-white sm:text-sm lg:text-base xl:text-lg">
                        Manage and oversee the complete list of interns, their roles,
                        and current program statuses.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={onAddIntern}
                    className="mt-4 shrink-0 whitespace-nowrap rounded-md bg-[#FFBF10] px-4 py-2 text-xs !font-extrabold text-white shadow-md transition hover:bg-[#e5aa0e] sm:mt-5 sm:px-6 sm:py-2.5 sm:text-sm lg:mt-6 lg:px-7 lg:text-base"
                >
                    Add Intern
                </button>
            </div>
        </div>
    );
}

export default InternListBanner;