import { useEffect, useRef, useState } from 'react';
import { Clock } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import StatusMessage from '../../../../components/feedback/StatusMessage';
import {
  insertEODReportAPI,
  updateEODReportAPI,
  useEODAttendance,
  useFetchEODReport,
} from '../../../../api/eodReport.api';
import type { EODReportForm, EODReportFormErrors } from '../../../../../../shared/types/eodReport.types';
import { validateEodReport } from '../../../../utils/validateEodReport';
import RequiredMark from '../../../../components/ui/RequiredMark';

const getTodayDate = () => new Date().toISOString().slice(0, 10);
const getYesterdayDate = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
};

function EODReportCard() {
  const queryClient = useQueryClient();
  const today = getTodayDate();
  const yesterday = getYesterdayDate();
  const dateInputRef = useRef<HTMLInputElement | null>(null);
  const [reportId, setReportId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<EODReportForm>({
    date_written: getTodayDate(),
    hours_spent: 0,
    project_name: '',
    task_accomplished: '',
  });
  const { data: attendanceData } = useEODAttendance(formValues.date_written);
  const { data: eodReport } = useFetchEODReport(formValues.date_written);
  const [errors, setErrors] = useState<EODReportFormErrors>({});
  const [statusMessage, setStatusMessage] = useState<any>(null);
  const existingReport = eodReport?.report;
  const hasTimedOut = !!attendanceData?.clock_out;
  const isSubmitted = eodReport?.status === 'pending';

  const openDatePicker = () => {
    if (dateInputRef.current?.showPicker) {
      dateInputRef.current.showPicker();
      return;
    }

    dateInputRef.current?.focus();
  };

  useEffect(() => {
    setReportId(null);
    setFormValues(prev => ({
      ...prev,
      hours_spent: attendanceData?.hours_logged ? attendanceData.hours_logged : 0,
      project_name: '',
      task_accomplished: '',
    }));

    if (existingReport){
      setReportId(existingReport.record_id);
      setFormValues(prev => ({
        ...prev,
        hours_spent: hasTimedOut 
          ? (attendanceData?.hours_logged ? attendanceData.hours_logged : 0) 
          : existingReport.hours_spent,
        project_name: existingReport.project_name,
        task_accomplished: existingReport.task_accomplished,
      }));
    }
    
  }, [existingReport, attendanceData]);

  const handleChange = (field: keyof EODReportForm, value: string) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: undefined,
    }));
  };

  const saveMutation = useMutation({
    mutationFn: (payload: EODReportForm) => 
      reportId 
        ? updateEODReportAPI(reportId, payload, 'draft') 
        : insertEODReportAPI(payload, 'draft'),
    onSuccess: () => { 
      showStatusMessage('success', 'Saved', 'Draft saved successfully.'); 
      queryClient.invalidateQueries({ queryKey: ['eod-report', formValues.date_written] });
    },
    onError: () => showStatusMessage('error', 'Error', 'Failed to save draft.'),
  });

  const submitMutation = useMutation({
    mutationFn: (payload: EODReportForm) => 
      reportId 
        ? updateEODReportAPI(reportId, payload, 'pending') 
        : insertEODReportAPI(payload, 'pending'),
    onSuccess: () => { 
      showStatusMessage('success', 'Submitted', 'Report sent successfully.'); 
      queryClient.invalidateQueries({ queryKey: ['eod-report', formValues.date_written] });
      // clearForm(); 
    },
    onError: () => showStatusMessage('error', 'Error', 'Submission failed.'),
  });

  const showStatusMessage = (variant: 'success' | 'error', title: string, message: string) => {
    setStatusMessage({ variant, title, message });
    setTimeout(() => setStatusMessage(null), 5000);
  };

  // const clearForm = () => {
  //   setFormValues({ date_written: getTodayDate(), hours_spent: 0, project_name: '', task_accomplished: '' });
  //   setErrors({});
  // };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitted) {
      showStatusMessage('error', 'Cannot Edit', 'This report has already been submitted and cannot be changed.');
      return;
    }
    
    const validationErrors = validateEodReport(formValues, 'save');
    if (Object.keys(validationErrors).length > 0) return setErrors(validationErrors);
    saveMutation.mutate(formValues);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitted) {
      showStatusMessage('error', 'Cannot Submit', 'This report has already been submitted.');
      return;
    }
    const validationErrors = validateEodReport(formValues, 'submit');
    if (Object.keys(validationErrors).length > 0) return setErrors(validationErrors);
    submitMutation.mutate(formValues);
  };

  return (
    <section className="rounded-xl bg-white px-4 py-4 shadow-md sm:px-6 sm:py-5 xl:px-8 xl:py-6">
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
                value={formValues.date_written}
                onClick={openDatePicker}
                onChange={(event) =>
                  handleChange('date_written', event.target.value)
                }
                className="h-10 w-full rounded bg-[#eeeeee] px-4 text-sm outline-none"
              />
            {errors.date_written && <p className="text-xs text-red-600">{errors.date_written}</p>}
          </div>
          <div>
            <label className="text-sm">Hours Spent</label>
            <div className="relative">
              <input type="text" value={hasTimedOut ? formValues.hours_spent : 'Available after time out.'} disabled className="h-10 w-full rounded bg-[#eeeeee] px-4 text-[8px] text-gray-300 outline-none"/>
              <Clock size={17} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
            </div>
            
          </div>
        </div>

        <div>
          <label className="text-sm">Project Name</label> <RequiredMark/>
          <input disabled={isSubmitted} type="text" value={formValues.project_name} onChange={(e) => handleChange('project_name', e.target.value)} className="h-10 w-full rounded bg-[#eeeeee] px-4 text-sm outline-none" />
        </div>

        <div>
          <label className="text-sm">Task Accomplished</label> <RequiredMark/>
          <textarea disabled={isSubmitted} value={formValues.task_accomplished} onChange={(e) => handleChange('task_accomplished', e.target.value)} className="h-[200px] w-full resize-none rounded bg-[#eeeeee] p-3 text-sm outline-none" />
        </div>

        <div className="pt-2 flex flex-col-reverse sm:flex-row justify-end gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={
              saveMutation.isPending || 
              submitMutation.isPending || 
              isSubmitted
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
              isSubmitted
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