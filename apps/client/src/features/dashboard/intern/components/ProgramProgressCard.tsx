import { useQuery } from '@tanstack/react-query';
import { fetchProgramProgressAPI } from '../../../../api/profile.api';
import { getAuthUserId } from '../../../../utils/auth.util.ts';
import { Home, Building2 } from 'lucide-react';

function ProgramProgressCard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['program-progress'],
    queryFn: async () => {
      const id = await getAuthUserId();
      if (!id) throw new Error("User not authenticated");
      
      return fetchProgramProgressAPI(id);
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

    <div className="mt-5 grid grid-cols-[minmax(90px,0.85fr)_1px_minmax(70px,0.55fr)_minmax(105px,1fr)] items-center gap-3 sm:grid-cols-[minmax(110px,0.8fr)_1px_minmax(90px,0.7fr)_minmax(160px,1fr)] sm:gap-5 xl:gap-8">
    <div className="flex flex-col items-center justify-center">
      <div
        className="relative h-24 w-24 rounded-full sm:h-32 sm:w-32 xl:h-36 xl:w-36"
        style={{ background: donutGradient }}
      >
        <div className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full bg-white text-center sm:h-20 sm:w-20 xl:h-24 xl:w-24">
          <p className="text-xs font-bold leading-none sm:text-base xl:text-xl">
            {isLoading ? '--' : `${Math.round(renderedPercentage)}%`}
          </p>
          <p className="text-[9px] leading-tight text-gray-500 sm:text-[10px]">
            rendered
          </p>
        </div>
      </div>

      <div className="mt-2 text-center sm:mt-3">
        <p className="text-[10px] font-bold sm:text-sm">
          {isLoading ? '--' : renderedHours} /{' '}
          {isLoading ? '--' : requiredHours} hrs
        </p>
        <p className="text-[10px] text-gray-500 sm:text-xs">
          {isLoading ? '--' : hoursLeft} hours left
        </p>
      </div>
    </div>

    <div className="h-28 w-px bg-gray-300 sm:h-32 xl:h-36" />

    <div className="text-center sm:text-left">
      <p className="text-3xl font-bold leading-none sm:text-5xl xl:text-6xl">
        {isLoading ? '--' : renderedHours}
      </p>
      <p className="mt-1 text-[10px] sm:text-sm">hours rendered</p>
    </div>

    <div className="text-left">
      <p className="text-[10px] font-medium text-black sm:text-sm">
        Breakdown of Hours Rendered
      </p>

      <div className="mt-3 flex flex-col gap-2 text-[10px] text-gray-700 sm:mt-4 sm:text-sm">
        <p className="flex items-center gap-1.5 sm:gap-2">
          <Home size={14} className="shrink-0 text-black sm:h-[18px] sm:w-[18px]" />
          <span>WFH - {isLoading ? '--' : wfhHours} hrs</span>
        </p>

        <p className="flex items-center gap-1.5 sm:gap-2">
          <Building2 size={14} className="shrink-0 text-black sm:h-[18px] sm:w-[18px]" />
          <span>Onsite - {isLoading ? '--' : onsiteHours} hrs</span>
        </p>
      </div>
    </div>
  </div>
  </section>
);
}

export default ProgramProgressCard;