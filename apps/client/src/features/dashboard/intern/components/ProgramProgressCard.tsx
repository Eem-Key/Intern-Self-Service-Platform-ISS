import { useQuery } from '@tanstack/react-query';
import { getProgramProgressAPI } from '../../../../api/programProgress.api';
import { getAuthUserId } from '../../../../utils/auth.ts';

function ProgramProgressCard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['program-progress'],
    queryFn: async () => {
      const id = await getAuthUserId();
      if (!id) throw new Error("User not authenticated");
      
      return getProgramProgressAPI(id);
    },
    
  });

  const progress = data?.data;
  const renderedHours = progress?.rendered_hours ?? 0;
  const requiredHours = progress?.required_hours ?? 0;
  const wfhHours = progress?.wfh_hours ?? 0;
  const onsiteHours = progress?.onsite_hours ?? 0;

  const hoursLeft = Math.max(requiredHours - renderedHours, 0);

  const renderedPercentage =
    requiredHours > 0
      ? Math.min((renderedHours / requiredHours) * 100, 100)
      : 0;

  const renderedDegrees = renderedPercentage * 3.6;

  const donutGradient =
    requiredHours > 0
      ? `conic-gradient(#0058DD 0deg ${renderedDegrees}deg, #E5E7EB ${renderedDegrees}deg 360deg)`
      : 'conic-gradient(#E5E7EB 0deg 360deg)';

  const wfhRenderedPercentage =
    renderedHours > 0 ? (wfhHours / renderedHours) * 100 : 0;

  const onsiteRenderedPercentage =
    renderedHours > 0 ? (onsiteHours / renderedHours) * 100 : 0;

  return (
    <section className="h-fit w-full max-w-2xl mx-auto rounded-xl bg-white px-4 py-5 shadow-md sm:px-6 sm:py-6">
      <h2 className="border-b-4 border-[#FFBF10] pb-1 text-xl font-bold xl:text-2xl">
        Program Progress
      </h2>

      <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-4 md:gap-8">
        <div className="flex flex-col items-center flex-1 w-full">
          <div
            className="relative h-32 w-32 rounded-full xl:h-36 xl:w-36"
            style={{ background: donutGradient }}
          >
            <div className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full bg-white text-center xl:h-24 xl:w-24">
              <p className="text-xl font-bold leading-none">
                {isLoading ? '--' : `${Math.round(renderedPercentage)}%`}
              </p>
              <p className="text-[10px] text-gray-500">rendered</p>
            </div>
          </div>

          <div className="mt-3 text-center">
            <p className="text-sm font-semibold">
              {isLoading ? '--' : renderedHours} / {isLoading ? '--' : requiredHours} hrs
            </p>
            <p className="text-xs text-gray-500">
              {isLoading ? '--' : hoursLeft} hours left
            </p>
          </div>
        </div>

        <div className="hidden sm:block h-28 w-px bg-gray-100 self-center" />

        <div className="w-full flex-1 max-w-[280px] sm:max-w-none pt-4 sm:pt-0 border-t border-gray-100 sm:border-t-0">
          <div>
            <p className="text-4xl font-bold leading-none">
              {isLoading ? '--' : renderedHours}
            </p>
            <p className="text-xs">Hours Rendered</p>
          </div>

          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between text-xs text-gray-500">
              <span>Breakdown of Rendered Hours</span>
            </div>

            <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full bg-[#FFDB4A]"
                style={{ width: `${wfhRenderedPercentage}%` }}
              />

              <div
                className="h-full bg-[#0058DD]"
                style={{ width: `${onsiteRenderedPercentage}%` }}
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs font-medium text-gray-600">
            <p className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-[#FFDB4A]" />
              WFH - {isLoading ? '--' : wfhHours} hrs 
            </p>

            <p className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-[#0058DD]" />
              Onsite - {isLoading ? '--' : onsiteHours} hrs 
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProgramProgressCard;