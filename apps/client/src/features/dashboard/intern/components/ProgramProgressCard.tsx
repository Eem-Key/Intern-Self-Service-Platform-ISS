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

  const hoursLeft = progress?.hours_left ?? 0;
  const renderedHours = progress?.rendered_hours ?? 0;
  const requiredHours = progress?.required_hours ?? 0;
  const wfhHours = progress?.wfh_hours ?? 0;
  const onsiteHours = progress?.onsite_hours ?? 0;

  const renderedPercentage =
    requiredHours > 0 ? Math.min((renderedHours / requiredHours) * 100, 100) : 0;

  const wfhPercentage =
    renderedHours > 0 ? (wfhHours / renderedHours) * 100 : 0;

  const onsitePercentage =
    renderedHours > 0 ? (onsiteHours / renderedHours) * 100 : 0;

  const donutGradient =
    renderedHours > 0
      ? `conic-gradient(#0058DD 0deg ${
          onsitePercentage * 3.6
        }deg, #FFDB4A ${onsitePercentage * 3.6}deg 360deg)`
      : 'conic-gradient(#e5e5e5 0deg 360deg)';

  return (
    <section className="h-full rounded-xl bg-white px-5 py-4 shadow-md sm:px-6">
      <h2 className="border-b-4 border-[#FFBF10] pb-1 text-xl font-bold xl:text-2xl">
        Program Progress
      </h2>

      <div className="mt-6 flex flex-col items-center justify-center gap-7 md:flex-row md:justify-around">
        <div
          className="relative h-32 w-32 rounded-full xl:h-36 xl:w-36"
          style={{ background: donutGradient }}
        >
          <div className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white xl:h-24 xl:w-24" />
        </div>

        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-4xl font-bold leading-none">
                {isLoading ? '--' : hoursLeft}
              </p>
              <p className="text-xs">hours left</p>

              <div className="mt-2 h-1 w-24 rounded-full bg-gray-200">
                <div
                  className="h-1 rounded-full bg-[#FFBF10]"
                  style={{
                    width:
                      requiredHours > 0
                        ? `${Math.min((hoursLeft / requiredHours) * 100, 100)}%`
                        : '0%',
                  }}
                />
              </div>
            </div>

            <div>
              <p className="text-4xl font-bold leading-none">
                {isLoading ? '--' : renderedHours}
              </p>
              <p className="text-xs">hours rendered</p>

              <div className="mt-2 h-1 w-24 rounded-full bg-gray-200">
                <div
                  className="h-1 rounded-full bg-[#0058DD]"
                  style={{
                    width: `${renderedPercentage}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 text-xs sm:flex-row sm:gap-6">
            <p className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-[#FFDB4A]" />
              WFH - {isLoading ? '--' : wfhHours}hrs
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