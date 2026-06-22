import { useEffect, useState } from 'react';
import { Building2, ChevronDown, Square } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import StatusMessage from '../../../../components/feedback/StatusMessage';
import {
  fetchAttendanceByDateAPI,
  timeInAPI,
  timeOutAPI,
} from '../../../../api/attendance.api';
import { useAttendanceTimer } from './attendance/useAttendanceTimer';
import type { WorkSetup } from '../../../../../../shared/types/enums.types';

function formatToday() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function getTodayDateKey() {
  return new Date().toISOString().split('T')[0];
}

function formatTime(time?: string | null) {
  if (!time) return '--:--';

  return new Date(time).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function isHalfDayClockIn(clockIn?: string | null) {
  if (!clockIn) return false;

  const clockInDate = new Date(clockIn);
  const hours = clockInDate.getHours();
  const minutes = clockInDate.getMinutes();

  return hours > 10 || (hours === 10 && minutes >= 0);
}

function AttendanceCard() {
  const [selectedWorkSetup, setSelectedWorkSetup] = useState<WorkSetup | ''>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    variant: 'success' | 'error';
    title: string;
    message: string;
  } | null>(null);

  const queryClient = useQueryClient();
  const todayDateKey = getTodayDateKey();

  const {
    data: todayAttendance,
    refetch,
    isLoading,
  } = useQuery({
    queryKey: ['attendance-by-date', todayDateKey],
    queryFn: async () => {
      try {
        return await fetchAttendanceByDateAPI(todayDateKey);
      } catch (error: any) {
        if (
          error?.code === 'PGRST116' ||
          error?.message?.includes('JSON object requested')
        ) {
          return null;
        }

        throw error;
      }
    },
  });

  const hasTimedIn = Boolean(todayAttendance?.clock_in);
  const hasTimedOut = Boolean(todayAttendance?.clock_out);
  const isHalfDay = isHalfDayClockIn(todayAttendance?.clock_in);
  const hasAttendanceForToday = Boolean(todayAttendance);
  const currentWorkSetup = todayAttendance?.work_setup || selectedWorkSetup;

  const { elapsedTime, isLunchBreak } = useAttendanceTimer(
    todayAttendance?.clock_in ?? null,
    todayAttendance?.clock_out ?? null
  );

  useEffect(() => {
    if (!statusMessage) return;

    const timer = window.setTimeout(() => {
      setStatusMessage(null);
    }, 5000);

    return () => window.clearTimeout(timer);
  }, [statusMessage]);

  const timeInMutation = useMutation({
    mutationFn: (setup: WorkSetup) => timeInAPI(setup),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['attendance-by-date', todayDateKey],
      });

      setStatusMessage({
        variant: 'success',
        title: 'Time In Successful!',
        message: 'Your attendance has been recorded for today.',
      });

      await refetch();
    },

    onError: (error: Error) => {
      setStatusMessage({
        variant: 'error',
        title: 'Time In Error',
        message:
          error.message || 'We could not record your time in. Please try again.',
      });
    },
  });

  const timeOutMutation = useMutation({
    mutationFn: () => {
      if (!todayAttendance?.record_id) {
        throw new Error('No attendance record found.');
      }

      return timeOutAPI(todayAttendance.record_id);
    },

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['attendance-by-date', todayDateKey],
        }),
        queryClient.invalidateQueries({ queryKey: ['program-progress'] }),
        queryClient.invalidateQueries({ queryKey: ['attendance-report'] }),
        queryClient.invalidateQueries({ queryKey: ['eod-report', todayDateKey] }),
      ]);

      setStatusMessage({
        variant: 'success',
        title: 'Time Out Successful!',
        message: 'Your total rendered hours have been recorded.',
      });

      await refetch();
    },

    onError: (error: Error) => {
      setStatusMessage({
        variant: 'error',
        title: 'Time Out Error',
        message:
          error.message ||
          'We could not record your time out. Please try again.',
      });
    },
  });

  const showWorkSetupLockedError = () => {
    setStatusMessage({
      variant: 'error',
      title: 'Work Setup Cannot Be Changed',
      message:
        'Please contact your immediate supervisor to change it or note it in your EOD report.',
    });

    setIsDropdownOpen(false);
  };

  const handleSelectWorkSetup = (workSetup: WorkSetup) => {
    if (hasAttendanceForToday) {
      showWorkSetupLockedError();
      return;
    }

    setSelectedWorkSetup(workSetup);
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

  const handleMainAction = () => {
    if (!hasTimedIn) {
      handleTimeIn();
      return;
    }

    if (hasTimedIn && !hasTimedOut) {
      handleTimeOut();
    }
  };

  const isTimeInDisabled =
    !selectedWorkSetup || timeInMutation.isPending || isLoading;

  const isTimeOutDisabled =
    !hasTimedIn || hasTimedOut || timeOutMutation.isPending || isLoading;

  const isMainButtonDisabled = !hasTimedIn
    ? isTimeInDisabled
    : isTimeOutDisabled;

  const mainButtonLabel = !hasTimedIn
    ? timeInMutation.isPending
      ? 'TIMING IN...'
      : 'TIME IN'
    : timeOutMutation.isPending
      ? 'TIMING OUT...'
      : hasTimedOut
        ? 'COMPLETED'
        : 'TIME OUT';

  const mainButtonClass = !hasTimedIn
    ? 'bg-[#0058DD] text-white disabled:bg-[#eeeeee] disabled:text-gray-500'
    : hasTimedOut
      ? 'bg-[#eeeeee] text-gray-500'
      : 'bg-[#E60000] text-white disabled:bg-[#eeeeee] disabled:text-gray-500';

  const [showLunchTooltip, setShowLunchTooltip] = useState(false);

  return (
    <section className="rounded-xl bg-white px-4 py-4 shadow-md sm:px-6 sm:py-5 xl:px-8 xl:py-6">
      {statusMessage && (
        <StatusMessage
          variant={statusMessage.variant}
          title={statusMessage.title}
          message={statusMessage.message}
          isFixed
          onClose={() => setStatusMessage(null)}
        />
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
      <h2 className="text-lg font-bold sm:text-xl xl:text-2xl">
        Online Attendance
      </h2>

      <div className="flex flex-wrap items-center gap-2">
        {isHalfDay && hasTimedIn && (
          <span className="rounded-full bg-[#FFE8E8] px-3 py-1 text-xs font-semibold text-[#B42318]">
            Half day
          </span>
        )}

        {isLunchBreak && hasTimedIn && !hasTimedOut && (
          <span className="rounded-full bg-[#FFF3C4] px-3 py-1 text-xs font-semibold text-[#9A6B00]">
            Lunch break
          </span>
        )}
      </div>
    </div>

      <div className="mt-6 text-center">
      <div className="group relative mx-auto inline-block">
          <p
            onClick={() => {
              if (isLunchBreak && hasTimedIn && !hasTimedOut) {
                setShowLunchTooltip((prev) => !prev);
              }
            }}
            onMouseLeave={() => setShowLunchTooltip(false)}
            className={`text-5xl font-bold leading-none tracking-tight sm:text-5xl xl:text-[56px] ${
              isLunchBreak && hasTimedIn && !hasTimedOut
                ? 'cursor-help text-gray-700'
                : 'text-black'
            }`}
          >
            {isLoading ? '00:00' : elapsedTime}
          </p>

          {isLunchBreak && hasTimedIn && !hasTimedOut && (
            <div
              className={`pointer-events-none absolute left-1/2 top-full z-30 mt-2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#FFF3C4] px-3 py-1.5 text-xs font-semibold text-[#9A6B00] shadow-md transition-opacity ${
                showLunchTooltip
                  ? 'opacity-100'
                  : 'opacity-0 group-hover:opacity-100'
              }`}
            >
              On pause during lunch break
            </div>
          )}
      </div>

        <p className="mt-2 text-sm text-gray-700 sm:text-base">
          {formatToday()}
        </p>

        <div className="mx-auto mt-7 grid w-full max-w-[520px] grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_160px] xl:max-w-[1440px]">
          <div className="relative w-full">
            <button
              type="button"
              onClick={handleWorkSetupClick}
              aria-disabled={hasAttendanceForToday}
              className={`flex h-12 w-full items-center justify-between rounded-full border border-gray-300 px-5 font-bold shadow-sm transition ${
                hasAttendanceForToday
                  ? 'cursor-not-allowed bg-[#eeeeee] text-gray-500'
                  : 'bg-[#eeeeee] text-black hover:bg-gray-200'
              }`}
            >
              <span className="flex min-w-0 items-center gap-3 text-xs sm:text-sm">
                <Building2 size={18} className="shrink-0" />
                <span className="truncate">
                  {currentWorkSetup
                    ? currentWorkSetup.toUpperCase()
                    : 'WORK SETUP'}
                </span>
              </span>

              <ChevronDown size={18} className="shrink-0" />
            </button>

            {isDropdownOpen && !hasAttendanceForToday && (
              <div className="absolute left-0 top-full z-20 mt-1 w-full overflow-hidden rounded-2xl bg-[#eeeeee] shadow-lg">
                <button
                  type="button"
                  onClick={() => handleSelectWorkSetup('wfh')}
                  className="w-full border-b border-gray-300 px-5 py-3 text-left text-xs font-bold transition hover:bg-gray-200 sm:text-sm"
                >
                  WORK FROM HOME (WFH)
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectWorkSetup('onsite')}
                  className="w-full px-5 py-3 text-left text-xs font-bold transition hover:bg-gray-200 sm:text-sm"
                >
                  ONSITE
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleMainAction}
            disabled={isMainButtonDisabled}
            className={`flex h-12 w-full items-center justify-center gap-2 rounded-full px-6 text-sm font-bold transition-all active:scale-95 disabled:pointer-events-none ${mainButtonClass}`}
          >
            {!hasTimedIn ? (
              <span className="text-xs">▶</span>
            ) : (
              <Square size={9} fill="currentColor" />
            )}

            {mainButtonLabel}
          </button>
        </div>

        <div className="mx-auto mt-5 flex w-full max-w-[520px] overflow-hidden rounded-md bg-[#eeeeee] text-sm shadow xl:max-w-[1440px]">
          <div className="flex flex-1 items-center justify-start border-r border-gray-300 px-4 py-3">
            <span className="font-bold">Time in:</span>
            <span className="ml-1">
              {formatTime(todayAttendance?.clock_in)}
            </span>
          </div>

          <div className="flex flex-1 items-center justify-start px-4 py-3">
            <span className="font-bold">Time out:</span>
            <span className="ml-1">
              {formatTime(todayAttendance?.clock_out)}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AttendanceCard;