import logo from '../../../../../assets/images/Logo2.png';

function WelcomeBanner() {
  return (
    <div className="relative w-full overflow-hidden rounded-xl bg-[#002D6F] px-5 py-6 shadow-md sm:px-7 sm:py-7 lg:px-8 xl:py-8">
      <div className="absolute inset-0 bg-gradient-to-r from-[#002D6F] via-[#002D6F] to-[#F5F5F5] sm:block" />

      <div className="relative z-10 pr-[80px] sm:pr-[130px] lg:pr-[170px] xl:pr-[200px]">
        <h1 className="text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl xl:text-6xl">
          Welcome, Intern!
        </h1>

        <p className="mt-2 max-w-[760px] text-xs leading-snug text-white sm:text-sm lg:text-base xl:text-lg">
          Easily track your attendance, monitor program progress, and submit daily reports in one place.
        </p>
      </div>

      <img
        src={logo}
        alt="Equicom Logo"
        className="absolute right-2 top-1/2 z-10 h-[75px] -translate-y-1/2 object-contain opacity-80 sm:right-3 sm:h-[105px] md:h-[125px] lg:h-[145px] xl:h-[165px]"
      />
    </div>
  );
}

export default WelcomeBanner;