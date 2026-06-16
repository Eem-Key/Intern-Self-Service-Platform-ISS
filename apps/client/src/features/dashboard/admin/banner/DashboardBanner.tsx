function Banner() {
    return (
        <div className="relative w-full overflow-hidden rounded-xl bg-[#002D6F] px-5 py-6 shadow-md sm:px-7 sm:py-7 lg:px-8 xl:py-8">
            
        <div className="relative z-10 max-w-[820px]">
            <h1 className="text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl xl:text-6xl">
            Dashboard
            </h1>

            <p className="mt-2 max-w-[760px] text-xs leading-snug text-white sm:text-sm lg:text-base xl:text-lg">
            View and manage your profile, academic records, and internship details.
            </p>
        </div>
        </div>
    );
}

export default Banner;