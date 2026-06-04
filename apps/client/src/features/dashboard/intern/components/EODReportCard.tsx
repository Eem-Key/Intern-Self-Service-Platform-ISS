import { useRef, useState } from 'react';
import { Clock } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';

import StatusMessage from '../../../../components/feedback/StatusMessage';
import {
  saveEODDraftAPI,
  submitEODReportAPI,
} from '../../../../api/eodReport.api';
import type { EODReportPayload } from '../../../../../../shared/types/eodReport.types';

type EODReportErrors = Partial<Record<keyof EODReportPayload, string>>;

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

const durationOptions = [
  '00:30',
  '01:00',
  '01:30',
  '02:00',
  '02:30',
  '03:00',
  '03:30',
  '04:00',
  '04:30',
  '05:00',
  '05:30',
  '06:00',
  '06:30',
  '07:00',
  '07:30',
  '08:00',
  '08:30',
  '09:00',
  '09:30',
  '10:00'
];

function EODReportCard() {
  const dateInputRef = useRef<HTMLInputElement | null>(null);

  const [formValues, setFormValues] = useState<EODReportPayload>({
    dateWritten: '',
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

  const today = getTodayDate();

  const clearForm = () => {
    setFormValues({
      dateWritten: '',
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

  const validateForm = () => {
    const validationErrors: EODReportErrors = {};

    if (!formValues.dateWritten) {
      validationErrors.dateWritten = 'Date is required.';
    } else if (formValues.dateWritten < today) {
      validationErrors.dateWritten = 'Previous dates are not allowed.';
    } else if (formValues.dateWritten > today) {
      validationErrors.dateWritten = 'Future dates are not allowed.';
    }

    if (!formValues.hoursSpent.trim()) {
      validationErrors.hoursSpent = 'Hour spent is required.';
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
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    saveMutation.mutate(formValues);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    submitMutation.mutate(formValues);
  };

  const [isDurationOpen, setIsDurationOpen] = useState(false);

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
                min={today}
                max={today}
                value={formValues.dateWritten}
                onClick={openDatePicker}
                onChange={(event) =>
                  handleChange('dateWritten', event.target.value)
                }
                className="h-9 w-full rounded bg-[#eeeeee] px-4 text-sm outline-none"
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
                readOnly
                placeholder="HH:MM"
                value={formValues.hoursSpent}
                onClick={() => setIsDurationOpen((prev) => !prev)}
                className="h-9 w-full cursor-pointer rounded bg-[#eeeeee] px-4 pr-10 text-sm outline-none"
              />

              <button
                type="button"
                onClick={() => setIsDurationOpen((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                aria-label="Open duration options"
              >
                <Clock size={17} />
              </button>

              {isDurationOpen && (
                <div className="absolute left-0 top-full z-30 mt-1 max-h-44 w-full overflow-y-auto rounded-lg bg-white shadow-lg">
                  {durationOptions.map((duration) => (
                    <button
                      key={duration}
                      type="button"
                      onClick={() => {
                        handleChange('hoursSpent', duration);
                        setIsDurationOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-[#eeeeee]"
                    >
                      {duration}
                    </button>
                  ))}
                </div>
              )}
            </div>

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

        <div className="flex flex-1 flex-col">
          <label className="text-sm">Task Accomplished</label>

          <textarea
            value={formValues.taskAccomplished}
            onChange={(event) =>
              handleChange('taskAccomplished', event.target.value)
            }
            className="min-h-[160px] flex-1 resize-none rounded bg-[#eeeeee] p-3 text-sm outline-none"
          />

          {errors.taskAccomplished && (
            <p className="mt-1 text-xs text-red-600">
              {errors.taskAccomplished}
            </p>
          )}
        </div>

        <div className="flex flex-col justify-end gap-3 pt-2 sm:flex-row">
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
            disabled={saveMutation.isPending || submitMutation.isPending}
            className="rounded-full bg-[#FFBF10] px-7 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-70 sm:min-w-[85px]"
          >
            {submitMutation.isPending ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </form>
    </section>
  );
}

export default EODReportCard;