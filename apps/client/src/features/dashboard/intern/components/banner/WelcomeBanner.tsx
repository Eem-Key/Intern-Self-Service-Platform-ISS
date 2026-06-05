import logo from '../../../../../assets/images/Logo2.png';

function WelcomeBanner() {
  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#002D6F] via-[#002D6F] to-[#F5F5F5] px-5 py-6 shadow-md sm:px-8 sm:py-8">
      <div className="relative z-10 max-w-[760px]">
        <h1 className="text-3xl font-bold text-white sm:text-4xl xl:text-6xl">
          Welcome, Intern!
        </h1>

        <p className="mt-2 whitespace-nowrap text-xs text-white sm:text-sm lg:text-base xl:text-lg">
          Easily track your attendance, monitor program progress, and submit daily reports in one place.
        </p>
      </div>

      <img
        src={logo}
        alt="Equicom Logo"
        className="absolute -right-2 top-1/2 hidden h-[135px] -translate-y-1/2 object-contain sm:block lg:h-[160px] xl:h-[170px]"
      />
    </div>
  );
}

export default WelcomeBanner;