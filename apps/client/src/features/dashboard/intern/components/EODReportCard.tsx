import { useEffect, useRef, useState } from 'react';
import { Clock } from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';

import StatusMessage from '../../../../components/feedback/StatusMessage';
import {
  saveEODDraftAPI,
  submitEODReportAPI,
} from '../../../../api/eodReport.api';
import type { EODReportPayload } from '../../../../../../shared/types/eodReport.types';

import { getTodayAttendanceAPI } from '../../../../api/attendance.api';

type EODReportErrors = Partial<Record<keyof EODReportPayload, string>>;

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

function getYesterdayDate() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().slice(0, 10);
}

function formatHoursLogged(hoursLogged: number | null | undefined) {
  if (!hoursLogged) return '';

  const totalMinutes = Math.round(hoursLogged * 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function EODReportCard() {
  const dateInputRef = useRef<HTMLInputElement | null>(null);
  const today = getTodayDate();
  const yesterday = getYesterdayDate();
  const [formValues, setFormValues] = useState<EODReportPayload>({
    dateWritten: today,
    hoursSpent: '',
    projectName: '',
    taskAccomplished: '',
  });

  const [errors, setErrors] = useState<EODReportErrors>({});

  const [statusMessage, setStatusMessage] = useState<{
    variant: 'success' | 'error';
    title: string;
    message: string;
  } | null>(null);

  const clearForm = () => {
  setFormValues({
    dateWritten: today,
    hoursSpent: '',
    projectName: '',
    taskAccomplished: '',
  });

  setErrors({});
  };


  const showStatusMessage = (
    variant: 'success' | 'error',
    title: string,
    message: string
  ) => {
    setStatusMessage({
      variant,
      title,
      message,
    });

    window.setTimeout(() => {
      setStatusMessage(null);
    }, 5000);
  };

  const validateForm = (mode: 'save' | 'submit') => {
    const validationErrors: EODReportErrors = {};

    if (!formValues.dateWritten) {
      validationErrors.dateWritten = 'Date is required.';
    } else if (
      formValues.dateWritten !== today &&
      formValues.dateWritten !== yesterday
    ) {
      validationErrors.dateWritten = 'Only today or yesterday can be selected.';
    }
    

    if (mode === 'submit' && !formValues.hoursSpent.trim()) {
      validationErrors.hoursSpent = 'Hours spent is required. Please time out first.';
    }

    if (!formValues.projectName.trim()) {
      validationErrors.projectName = 'Project name is required.';
    }

    if (!formValues.taskAccomplished.trim()) {
      validationErrors.taskAccomplished = 'Task accomplished is required.';
    }

    return validationErrors;
  };

  const handleChange = (field: keyof EODReportPayload, value: string) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: undefined,
    }));
  };

  const openDatePicker = () => {
    if (dateInputRef.current?.showPicker) {
      dateInputRef.current.showPicker();
      return;
    }

    dateInputRef.current?.focus();
  };

  const saveMutation = useMutation({
    mutationFn: saveEODDraftAPI,
    onSuccess: () => {
      showStatusMessage(
        'success',
        'Report Draft Saved',
        'Your End of Day (EOD) draft has been saved successfully.'
      );

      clearForm();
    },
    onError: () => {
      showStatusMessage(
        'error',
        'Save Failed',
        "We couldn't save your EOD draft. Please check your connection and try again."
      );
    },
  });

  const submitMutation = useMutation({
    mutationFn: submitEODReportAPI,
    onSuccess: () => {
      showStatusMessage(
        'success',
        'Report Submitted!',
        'Your EOD report has been sent to your supervisor for review.'
      );

      clearForm();
    },
    onError: () => {
      showStatusMessage(
        'error',
        'Report Submission Error',
        "We couldn't save your report. Please check your entries and try again."
      );
    },
  });

  const handleSave = () => {
    const validationErrors = validateForm('save');

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    saveMutation.mutate(formValues);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationErrors = validateForm('submit');

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    submitMutation.mutate(formValues);
  };

  const { data: todayAttendance } = useQuery({
    queryKey: ['today-attendance'],
    queryFn: getTodayAttendanceAPI,
  });

  const attendance = todayAttendance?.data ?? null;
  const hasTimedOut = Boolean(attendance?.clock_out);
  const attendanceHoursSpent = formatHoursLogged(attendance?.hours_logged);

  useEffect(() => {
  if (!hasTimedOut) {
    setFormValues((prev) => ({
      ...prev,
      hoursSpent: '',
    }));
    return;
  }

  setFormValues((prev) => ({
    ...prev,
    hoursSpent: attendanceHoursSpent,
  }));
}, [hasTimedOut, attendanceHoursSpent]);

  return (
    <section className="relative h-full rounded-xl bg-white px-8 py-3 shadow-md sm:px-6">
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
        End of Day (EOD) Report
      </h2>

      <form onSubmit={handleSubmit} className="mt-3 flex h-[calc(100%-44px)] flex-col space-y-2.5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm">Date</label>

            <div>
              <input
                ref={dateInputRef}
                type="date"
                min={yesterday}
                max={today}
                value={formValues.dateWritten}
                onClick={openDatePicker}
                onChange={(event) =>
                  handleChange('dateWritten', event.target.value)
                }
                className="h-10 w-full rounded bg-[#eeeeee] px-4 text-sm outline-none"
              />
            </div>

            {errors.dateWritten && (
              <p className="mt-1 text-xs text-red-600">
                {errors.dateWritten}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm">Hours Spent</label>

            <div className="relative">
              <input
                type="text"
                placeholder="HH:MM"
                value={formValues.hoursSpent}
                disabled
                className="h-10 w-full cursor-not-allowed rounded bg-[#eeeeee] px-4 pr-10 text-sm text-gray-600 outline-none"
              />

              <Clock
                size={17}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              />
            </div>

            {!hasTimedOut && (
              <p className="mt-1 text-[10px] text-gray-500">
                Hours spent will be available after you time out.
              </p>
            )}

            {errors.hoursSpent && (
              <p className="mt-1 text-xs text-red-600">
                {errors.hoursSpent}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="text-sm">Project Name</label>

          <input
            type="text"
            value={formValues.projectName}
            onChange={(event) =>
              handleChange('projectName', event.target.value)
            }
            className="h-10 w-full rounded bg-[#eeeeee] px-4 text-sm outline-none"
          />

          {errors.projectName && (
            <p className="mt-1 text-xs text-red-600">
              {errors.projectName}
            </p>
          )}
        </div>

        <div>
          <label className="text-sm">Task Accomplished</label>

          <textarea
            value={formValues.taskAccomplished}
            onChange={(event) =>
              handleChange('taskAccomplished', event.target.value)
            }
            className="h-[200px] w-full resize-none rounded bg-[#eeeeee] p-3 text-sm outline-none"
          />

          {errors.taskAccomplished && (
            <p className="mt-1 text-xs text-red-600">
              {errors.taskAccomplished}
            </p>
          )}
        </div>

        <div className="mt-2 mb-0 flex flex-col justify-end gap-3 sm:flex-row">
          <button
            type="button"
            onClick={handleSave}
            disabled={saveMutation.isPending || submitMutation.isPending}
            className="rounded-full bg-[#eeeeee] px-7 py-1.5 text-sm font-bold text-gray-500 disabled:cursor-not-allowed disabled:opacity-70 sm:min-w-[85px]"
          >
            {saveMutation.isPending ? 'Saving...' : 'Save'}
          </button>

          <button
            type="submit"
            disabled={
              !hasTimedOut ||
              saveMutation.isPending ||
              submitMutation.isPending
            }
            className="rounded-full bg-[#FFBF10] px-7 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-[#eeeeee] disabled:text-gray-500 disabled:opacity-70 sm:min-w-[100px]"
          >
            {submitMutation.isPending ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </form>
    </section>
  );
}

export default EODReportCard;