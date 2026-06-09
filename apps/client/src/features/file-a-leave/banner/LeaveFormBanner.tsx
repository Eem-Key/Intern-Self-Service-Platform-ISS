
function Banner() {
    return (
        <div className="relative overflow-hidden rounded-xl bg-[#002D6F] px-5 py-6 shadow-md sm:px-8 sm:py-8">
        <div className="relative z-10 max-w-[760px]">
            <h1 className="text-3xl font-bold text-white sm:text-4xl xl:text-6xl">
            File a Leave
            </h1>

            <p className="mt-2 whitespace-nowrap text-xs text-white sm:text-sm lg:text-base xl:text-lg">
            Submit your leave requests by providing the necessary dates and details for approval.
            </p>
        </div>

        </div>
    );
}

export default Banner;