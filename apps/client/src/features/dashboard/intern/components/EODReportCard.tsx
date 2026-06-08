import { useEffect, useRef, useState } from 'react';
import { Clock } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import StatusMessage from '../../../../components/feedback/StatusMessage';
import {
  insertEODReportAPI,
  updateEODReportAPI,
  useEODAttendance,
  useEODReport,
} from '../../../../api/eodReport.api';
import type { EODReportPayload } from '../../../../../../shared/types/eodReport.types';

const getTodayDate = () => new Date().toISOString().slice(0, 10);
const getYesterdayDate = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
};

type EODReportErrors = Partial<Record<keyof EODReportPayload, string>>;

function EODReportCard() {
  const queryClient = useQueryClient();
  const today = getTodayDate();
  const yesterday = getYesterdayDate();
  const dateInputRef = useRef<HTMLInputElement | null>(null);
  const [reportId, setReportId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<EODReportPayload>({
    dateWritten: getTodayDate(),
    hoursSpent: 0,
    projectName: '',
    taskAccomplished: '',
  });
  const { data: attendanceData } = useEODAttendance(formValues.dateWritten);
  const { data: existingReport } = useEODReport(formValues.dateWritten);
  const [errors, setErrors] = useState<EODReportErrors>({});
  const [statusMessage, setStatusMessage] = useState<any>(null);
  const hasTimedOut = !!attendanceData?.clock_out;
  const isSubmitted = existingReport?.status === 'submitted';

  const openDatePicker = () => {
    if (dateInputRef.current?.showPicker) {
      dateInputRef.current.showPicker();
      return;
    }

    dateInputRef.current?.focus();
  };

  useEffect(() => {
    if (existingReport) {
      setReportId(existingReport.id);
      setFormValues({
        dateWritten: existingReport.date_written,
        hoursSpent: existingReport.hours_spent,
        projectName: existingReport.project_name,
        taskAccomplished: existingReport.task_accomplished,
      });
    } else {
      setReportId(null);
      setFormValues(prev => ({
        ...prev,
        hoursSpent: attendanceData?.hours_logged ? attendanceData.hours_logged : 0,
        projectName: '',
        taskAccomplished: '',
      }));
    }
  }, [existingReport, attendanceData]);

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

    if (mode === 'submit' && !formValues.hoursSpent) {
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

  const saveMutation = useMutation({
    mutationFn: (payload: EODReportPayload) => 
      reportId 
        ? updateEODReportAPI(reportId, payload, 'draft') 
        : insertEODReportAPI(payload, 'draft'),
    onSuccess: () => { 
      showStatusMessage('success', 'Saved', 'Draft saved successfully.'); 
      queryClient.invalidateQueries({ queryKey: ['eod-report', formValues.dateWritten] });
    },
    onError: () => showStatusMessage('error', 'Error', 'Failed to save draft.'),
  });

  const submitMutation = useMutation({
    mutationFn: (payload: EODReportPayload) => 
      reportId 
        ? updateEODReportAPI(reportId, payload, 'submitted') 
        : insertEODReportAPI(payload, 'submitted'),
    onSuccess: () => { 
      showStatusMessage('success', 'Submitted', 'Report sent successfully.'); 
      queryClient.invalidateQueries({ queryKey: ['eod-report', formValues.dateWritten] });
      // clearForm(); 
    },
    onError: () => showStatusMessage('error', 'Error', 'Submission failed.'),
  });

  const showStatusMessage = (variant: 'success' | 'error', title: string, message: string) => {
    setStatusMessage({ variant, title, message });
    setTimeout(() => setStatusMessage(null), 5000);
  };

  // const clearForm = () => {
  //   setFormValues({ dateWritten: getTodayDate(), hoursSpent: 0, projectName: '', taskAccomplished: '' });
  //   setErrors({});
  // };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (existingReport?.status === 'submitted') {
      showStatusMessage('error', 'Cannot Edit', 'This report has already been submitted and cannot be changed.');
      return;
    }
    const validationErrors = validateForm('save');
    if (Object.keys(validationErrors).length > 0) return setErrors(validationErrors);
    saveMutation.mutate(formValues);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (existingReport?.status === 'submitted') {
      showStatusMessage('error', 'Cannot Submit', 'This report has already been submitted.');
      return;
    }
    const validationErrors = validateForm('submit');
    if (Object.keys(validationErrors).length > 0) return setErrors(validationErrors);
    submitMutation.mutate(formValues);
  };

  return (
    <section className="relative h-full rounded-xl bg-white px-8 py-3 shadow-md sm:px-6">
      {statusMessage && <StatusMessage {...statusMessage} isFixed onClose={() => setStatusMessage(null)} />}
      
      <h2 className="border-b-4 border-[#FFBF10] pb-1 text-xl font-bold xl:text-2xl">End of Day (EOD) Report</h2>

      <form onSubmit={handleSubmit} className="mt-3 flex h-[calc(100%-44px)] flex-col space-y-2.5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm">Date</label>
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
            {errors.dateWritten && <p className="text-xs text-red-600">{errors.dateWritten}</p>}
          </div>
          <div>
            <label className="text-sm">Hours Spent</label>
            <div className="relative">
              <input type="number" value={formValues.hoursSpent} disabled className="h-10 w-full rounded bg-[#eeeeee] px-4 text-sm text-gray-600 outline-none" />
              <Clock size={17} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
            </div>
            {!hasTimedOut && <p className="mt-1 text-[10px] text-gray-500">Available after time out.</p>}
          </div>
        </div>

        <div>
          <label className="text-sm">Project Name</label>
          <input disabled={isSubmitted} type="text" value={formValues.projectName} onChange={(e) => handleChange('projectName', e.target.value)} className="h-10 w-full rounded bg-[#eeeeee] px-4 text-sm outline-none" />
        </div>

        <div>
          <label className="text-sm">Task Accomplished</label>
          <textarea disabled={isSubmitted} value={formValues.taskAccomplished} onChange={(e) => handleChange('taskAccomplished', e.target.value)} className="h-[200px] w-full resize-none rounded bg-[#eeeeee] p-3 text-sm outline-none" />
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={
              saveMutation.isPending || 
              submitMutation.isPending || 
              existingReport?.status === 'submitted'
            }
            className="rounded-full bg-[#eeeeee] px-7 py-1.5 text-sm font-bold text-gray-500 disabled:cursor-not-allowed disabled:opacity-70 sm:min-w-[85px]"
          >
            {saveMutation.isPending ? 'Saving...' : 'Save'}
          </button>

          <button
            type="submit"
            disabled={
              !hasTimedOut ||
              saveMutation.isPending ||
              submitMutation.isPending || 
              existingReport?.status === 'submitted'
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