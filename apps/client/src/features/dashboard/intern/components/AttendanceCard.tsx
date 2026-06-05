import { useEffect, useState } from 'react';
import { Building2, ChevronDown, Square } from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import StatusMessage from '../../../../components/feedback/StatusMessage';
import {
  getActiveAttendanceAPI,
  timeInAPI,
  timeOutAPI,
} from '../../../../api/attendance.api';
import { useAttendanceTimer } from './attendance/useAttendanceTimer';
import type { WorkSetup } from '../../../../../../shared/types/attendance.types';

function formatToday() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function AttendanceCard() {
  const [selectedWorkSetup, setSelectedWorkSetup] = useState<WorkSetup | ''>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    variant: 'success' | 'error';
    title: string;
    message: string;
  } | null>(null);

    useEffect(() => {
    if (!statusMessage) return;

    const timer = window.setTimeout(() => {
      setStatusMessage(null);
    }, 5000);

    return () => window.clearTimeout(timer);
  }, [statusMessage]);
  
  const { data: activeAttendance, refetch, isLoading } = useQuery({
    queryKey: ['active-attendance'],
    queryFn: getActiveAttendanceAPI,
  });

  const hasAttendanceForToday = Boolean(activeAttendance); 
  const hasTimedIn = Boolean(activeAttendance); 
  const hasTimedOut = false;
  const currentWorkSetup = activeAttendance?.work_setup || selectedWorkSetup;

  const elapsedTime = useAttendanceTimer(
    activeAttendance?.clock_in ?? null,
    activeAttendance?.clock_out ?? null
  );

  const timeInMutation = useMutation({
    mutationFn: (setup: WorkSetup) => timeInAPI(setup), 
    
    onSuccess: async () => {
      setStatusMessage({
        variant: 'success',
        title: 'Time In Successful!',
        message: 'Your attendance has been recorded for today.',
      });
      await refetch();
    },
    
    onError: (error: any) => {
      setStatusMessage({
        variant: 'error',
        title: 'Time In Error',
        message: error.message || 'We could not record your time in. Please try again.',
      });
    },
  });

  const timeOutMutation = useMutation({
    mutationFn: () => {
      if (!activeAttendance?.id) throw new Error("No active session found.");
      return timeOutAPI(activeAttendance.id);
    },
    onSuccess: async () => {
      setStatusMessage({
        variant: 'success',
        title: 'Time Out Successful!',
        message: 'Your total rendered hours have been recorded.',
      });
      await refetch();
    },
    onError: (error) => {
      setStatusMessage({
        variant: 'error',
        title: 'Time Out Error',
        message:
          error.message ||
          'We could not record your time out. Please try again.',
      });
    },
  });

  const handleSelectWorkSetup = (workSetup: WorkSetup) => {
    if (hasAttendanceForToday) {
      showWorkSetupLockedError();
      return;
    }

    setSelectedWorkSetup(workSetup);
    setIsDropdownOpen(false);
  };

  const showWorkSetupLockedError = () => {
  setStatusMessage({
    variant: 'error',
    title: 'Work Setup Cannot Be Changed',
    message:
      'Please contact your immediate supervisor to change it or note it in your EOD report.',
  });

  setIsDropdownOpen(false);
};

  const handleWorkSetupClick = () => {
    if (hasAttendanceForToday) {
      showWorkSetupLockedError();
      return;
    }

    setIsDropdownOpen((prev) => !prev);
  };

  const handleTimeIn = () => {
    if (!selectedWorkSetup) {
      setStatusMessage({
        variant: 'error',
        title: 'Work Setup Required',
        message: 'Please select your work setup before timing in.',
      });
      return;
    }

    timeInMutation.mutate(selectedWorkSetup);
  };

  const handleTimeOut = () => {
    timeOutMutation.mutate();
  };

  return (
    <section className="relative h-full rounded-xl bg-white px-6 py-4 shadow-md sm:px-9">
      {statusMessage && (
        <StatusMessage
          variant={statusMessage.variant}
          title={statusMessage.title}
          message={statusMessage.message}
          isFixed
          onClose={() => setStatusMessage(null)}
        />
      )}

      <h2 className="border-b-4 border-[#FFBF10] pb-1 text-xl font-bold xl:text-2xl">
        Online Attendance
      </h2>

      <div className="mt-7 text-center">
        <p className="text-5xl font-bold leading-none xl:text-[56px]">
          {isLoading ? '00:00:00' : elapsedTime}
        </p>

        <p className="mt-2 text-base xl:text-lg">{formatToday()}</p>

        <div className="relative mx-auto mt-4 w-full max-w-[240px]">
          <button
              type="button"
              onClick={handleWorkSetupClick}
              aria-disabled={hasAttendanceForToday}
              className={`flex w-full items-center justify-between rounded-full px-5 py-2.5 font-bold shadow ${
                hasAttendanceForToday
                  ? 'cursor-not-allowed bg-[#eeeeee] text-gray-500'
                  : 'bg-[#eeeeee] text-black'
              }`}
            >
            <span className="flex items-center gap-3 text-sm">
              <Building2 size={20} />
              {currentWorkSetup || 'WORK SETUP'}
            </span>

            <ChevronDown size={20} />
          </button>

          {isDropdownOpen && !hasAttendanceForToday && (
            <div className="absolute left-0 top-full z-20 mt-1 w-full overflow-hidden rounded-b-3xl bg-[#eeeeee] shadow-md">
              <button
                type="button"
                onClick={() => handleSelectWorkSetup('wfh')}
                className="w-full border-b border-gray-300 px-5 py-3 text-sm font-bold hover:bg-gray-200"
              >
                WORK FROM HOME (WFH)
              </button>

              <button
                type="button"
                onClick={() => handleSelectWorkSetup('onsite')}
                className="w-full px-5 py-3 text-sm font-bold hover:bg-gray-200"
              >
                ONSITE
              </button>
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            disabled={hasTimedIn || timeInMutation.isPending}
            onClick={handleTimeIn}
            className="flex min-w-[115px] items-center justify-center gap-2 rounded-full bg-[#0058DD] px-5 py-2 text-sm font-bold text-white disabled:bg-[#eeeeee] disabled:text-gray-500"
          >
            <span>▶</span>
            TIME IN
          </button>

          <button
            type="button"
            disabled={!hasTimedIn || hasTimedOut || timeOutMutation.isPending}
            onClick={handleTimeOut}
            className="flex min-w-[115px] items-center justify-center gap-2 rounded-full bg-[#0058DD] px-5 py-2 text-sm font-bold text-white disabled:bg-[#eeeeee] disabled:text-gray-500"
          >
            <Square size={9} fill="currentColor" />
            TIME OUT
          </button>
        </div>
      </div>
    </section>
  );
}

export default AttendanceCard;