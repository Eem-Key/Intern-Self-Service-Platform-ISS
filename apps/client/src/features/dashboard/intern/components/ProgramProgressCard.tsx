import { useQuery } from '@tanstack/react-query';
import { getProgramProgressAPI } from '../../../../api/programProgress.api';
import { getAuthUserId } from '../../../../utils/auth.util.ts';
import { Home, Building2 } from 'lucide-react';

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

  {/*const wfhRenderedPercentage =
    renderedHours > 0 ? (wfhHours / renderedHours) * 100 : 0;

  const onsiteRenderedPercentage =
    renderedHours > 0 ? (onsiteHours / renderedHours) * 100 : 0;*/}

  return (
  <section className="h-full w-full rounded-xl bg-white px-5 py-4 shadow-md sm:px-6">
    <h2 className="border-b-4 border-[#FFBF10] pb-1 text-xl font-bold xl:text-2xl">
      Program Progress
    </h2>

    <div className="mt-6 grid grid-cols-1 items-center gap-6 md:grid-cols-[minmax(120px,0.8fr)_1px_minmax(100px,0.7fr)_minmax(180px,1fr)] md:gap-5 xl:gap-8">
      <div className="flex flex-col items-center justify-center">
        <div
          className="relative h-28 w-28 rounded-full sm:h-32 sm:w-32 xl:h-36 xl:w-36"
          style={{ background: donutGradient }}
        >
          <div className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full bg-white text-center sm:h-20 sm:w-20 xl:h-24 xl:w-24">
            <p className="text-sm font-bold leading-none sm:text-base xl:text-xl">
              {isLoading ? '--' : `${Math.round(renderedPercentage)}%`}
            </p>
            <p className="text-[10px] leading-tight text-gray-500">rendered</p>
          </div>
        </div>

        <div className="mt-3 text-center">
          <p className="text-xs font-bold sm:text-sm">
            {isLoading ? '--' : renderedHours} /{' '}
            {isLoading ? '--' : requiredHours} hrs
          </p>
          <p className="text-xs text-gray-500">
            {isLoading ? '--' : hoursLeft} hours left
          </p>
        </div>
      </div>

      <div className="hidden h-32 w-px bg-gray-300 md:block xl:h-36" />

      <div className="text-center md:text-left">
        <p className="text-5xl font-bold leading-none xl:text-6xl">
          {isLoading ? '--' : renderedHours}
        </p>
        <p className="mt-1 text-xs sm:text-sm">hours rendered</p>
      </div>
      
      <div className="text-center md:text-left">
        <p className="text-xs font-medium text-black sm:text-md">
          Breakdown of Hours Rendered
        </p>

        <div className="mt-4 flex flex-col gap-2 text-xs text-gray-700 sm:text-md">
          <p className="flex items-center gap-2">
            <Home size={18} className="shrink-0 text-[#000000]" />
            <span>WFH - {isLoading ? '--' : wfhHours} hrs</span>
          </p>

          <p className="flex items-center gap-2">
            <Building2 size={18} className="shrink-0 text-[#000000]" />
            <span>Onsite - {isLoading ? '--' : onsiteHours} hrs</span>
          </p>
        </div>
      </div>
    </div>
  </section>
);
}

export default ProgramProgressCard;