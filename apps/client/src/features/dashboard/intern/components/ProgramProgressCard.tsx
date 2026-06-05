import { useQuery } from '@tanstack/react-query';
import { getProgramProgressAPI } from '../../../../api/programProgress.api';

function getAuthUserId(): string | null {
  const storedUser = localStorage.getItem('authUser');

  if (!storedUser) return null;

  try {
    const user = JSON.parse(storedUser);
    return user?.id || null;
  } catch {
    return null;
  }
}

function ProgramProgressCard() {
  const internId = getAuthUserId();

  console.log("Current internId:", internId);

  const { data, isLoading, error } = useQuery({
    queryKey: ['program-progress', internId],
    queryFn: () => getProgramProgressAPI(internId!),
    enabled: !!internId,
  });

  console.log("Query status:", { isLoading, data, error });

  if (isLoading) return <div>Loading...</div>;
  if (!data) return <div>No progress data found.</div>;

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
    <section className="h-full rounded-xl bg-white px-5 py-4 shadow-md sm:px-6">
      <h2 className="border-b-4 border-[#FFBF10] pb-1 text-xl font-bold xl:text-2xl">
        Program Progress
      </h2>

      <div className="mt-6 flex flex-col items-center justify-center gap-6 md:flex-row md:justify-around">
        <div className="flex flex-col items-center">
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

        <div className="hidden h-32 w-px bg-gray-200 md:block" />

        <div className="w-full max-w-[260px]">
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

            <div className="flex h-2 w-full overflow-hidden rounded-full bg-gray-200">
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

          <div className="mt-3 flex flex-col gap-2 text-xs sm:flex-row sm:gap-5">
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