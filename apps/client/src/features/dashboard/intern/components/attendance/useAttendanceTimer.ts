import { useEffect, useState } from 'react';

function formatElapsedTime(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  return [
    String(hours).padStart(2, '0'),
    String(minutes).padStart(2, '0'),
  ].join(':');
}

function getLunchBreakOverlapInSeconds(start: Date, end: Date) {
  const lunchStart = new Date(start);
  lunchStart.setHours(12, 0, 0, 0);

  const lunchEnd = new Date(start);
  lunchEnd.setHours(13, 0, 0, 0);

  const overlapStart = Math.max(start.getTime(), lunchStart.getTime());
  const overlapEnd = Math.min(end.getTime(), lunchEnd.getTime());

  return Math.max(0, Math.floor((overlapEnd - overlapStart) / 1000));
}

function isCurrentlyLunchBreak() {
  const now = new Date();
  const lunchStart = new Date(now);
  lunchStart.setHours(12, 0, 0, 0);

  const lunchEnd = new Date(now);
  lunchEnd.setHours(13, 0, 0, 0);

  return now >= lunchStart && now < lunchEnd;
}

export function useAttendanceTimer(
  clockIn: string | null,
  clockOut: string | null
) {
  const [elapsedTime, setElapsedTime] = useState('00:00');
  const [isLunchBreak, setIsLunchBreak] = useState(false);

  useEffect(() => {
    if (!clockIn) {
      setElapsedTime('00:00');
      setIsLunchBreak(false);
      return;
    }

    const startTime = new Date(clockIn);
    const endTime = clockOut ? new Date(clockOut) : null;

    const updateElapsedTime = () => {
      const currentTime = endTime ?? new Date();

      const totalSeconds = Math.max(
        0,
        Math.floor((currentTime.getTime() - startTime.getTime()) / 1000)
      );

      const lunchBreakSeconds = getLunchBreakOverlapInSeconds(
        startTime,
        currentTime
      );

      const netSeconds = Math.max(0, totalSeconds - lunchBreakSeconds);

      setElapsedTime(formatElapsedTime(netSeconds));
      setIsLunchBreak(!clockOut && isCurrentlyLunchBreak());
    };

    updateElapsedTime();

    if (clockOut) return;

    const intervalId = window.setInterval(updateElapsedTime, 1000);

    return () => window.clearInterval(intervalId);
  }, [clockIn, clockOut]);

  return {
    elapsedTime,
    isLunchBreak,
  };
}