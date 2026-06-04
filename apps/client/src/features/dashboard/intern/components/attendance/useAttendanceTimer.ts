import { useEffect, useState } from 'react';

function formatElapsedTime(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [
    String(hours).padStart(2, '0'),
    String(minutes).padStart(2, '0'),
    String(seconds).padStart(2, '0'),
  ].join(':');
}

export function useAttendanceTimer(clockIn: string | null, clockOut: string | null) {
  const [elapsedTime, setElapsedTime] = useState('00:00:00');

  useEffect(() => {
    if (!clockIn) {
      setElapsedTime('00:00:00');
      return;
    }

    const startTime = new Date(clockIn).getTime();
    const endTime = clockOut ? new Date(clockOut).getTime() : null;

    const updateElapsedTime = () => {
      const currentTime = endTime ?? Date.now();
      const elapsedSeconds = Math.max(
        0,
        Math.floor((currentTime - startTime) / 1000)
      );

      setElapsedTime(formatElapsedTime(elapsedSeconds));
    };

    updateElapsedTime();

    if (clockOut) return;

    const intervalId = window.setInterval(updateElapsedTime, 1000);

    return () => window.clearInterval(intervalId);
  }, [clockIn, clockOut]);

  return elapsedTime;
}