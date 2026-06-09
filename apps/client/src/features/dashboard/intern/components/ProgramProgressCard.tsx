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
  <section className="h-full w-full rounded-xl bg-white px-4 py-4 shadow-md sm:px-5 lg:px-6">
    <h2 className="border-b-4 border-[#FFBF10] pb-1 text-lg font-bold sm:text-xl xl:text-2xl">
      Program Progress
    </h2>

    <div className="mt-5 grid grid-cols-1 items-center gap-6 lg:grid-cols-[minmax(160px,0.8fr)_1px_minmax(220px,1fr)] xl:gap-8">
      <div className="flex flex-col items-center justify-center">
        <div
          className="relative h-28 w-28 rounded-full sm:h-32 sm:w-32 xl:h-36 xl:w-36"
          style={{ background: donutGradient }}
        >
          <div className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full bg-white text-center sm:h-22 sm:w-22 xl:h-24 xl:w-24">
            <p className="text-lg font-bold leading-none sm:text-xl">
              {isLoading ? '--' : `${Math.round(renderedPercentage)}%`}
            </p>
            <p className="text-[10px] text-gray-500">rendered</p>
          </div>
        </div>

        <div className="mt-3 text-center">
          <p className="text-xs font-semibold sm:text-sm">
            {isLoading ? '--' : renderedHours} /{' '}
            {isLoading ? '--' : requiredHours} hrs
          </p>
          <p className="text-xs text-gray-500">
            {isLoading ? '--' : hoursLeft} hours left
          </p>
        </div>
      </div>

      <div className="hidden h-full min-h-32 w-px bg-gray-200 lg:block" />

      <div className="w-full min-w-0">
        <div className="text-center lg:text-left">
          <p className="text-3xl font-bold leading-none sm:text-4xl">
            {isLoading ? '--' : renderedHours}
          </p>
          <p className="text-xs sm:text-sm">Hours Rendered</p>
        </div>

        <div className="mt-4 w-full">
          <div className="mb-2 flex items-center justify-between text-xs text-gray-500">
            <span>Breakdown of Rendered Hours</span>
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 sm:h-2.5 xl:h-3">
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

        <div className="mt-3 flex flex-col gap-2 text-xs sm:flex-row sm:flex-wrap sm:gap-x-5 sm:gap-y-2">
          <p className="flex items-center gap-2 whitespace-nowrap">
            <span className="h-3 w-3 shrink-0 rounded-full bg-[#FFDB4A]" />
            WFH - {isLoading ? '--' : wfhHours} hrs
          </p>

          <p className="flex items-center gap-2 whitespace-nowrap">
            <span className="h-3 w-3 shrink-0 rounded-full bg-[#0058DD]" />
            Onsite - {isLoading ? '--' : onsiteHours} hrs
          </p>
        </div>
      </div>
    </div>
  </section>
);
}

export default ProgramProgressCard;