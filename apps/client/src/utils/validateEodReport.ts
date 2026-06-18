import { eodReportSchema } from '../../../shared/schemas/eodReport.schema';
import type { EODReportForm, EODReportFormErrors } from '../../../shared/types/eodReport.types';
import { z } from 'zod';

export const validateEodReport = (
  data: EODReportForm,
  mode: 'save' | 'submit' | 'resubmit'
): EODReportFormErrors => {
  const dynamicSchema = eodReportSchema.extend({
    hours_spent: mode === 'submit' 
      ? z.coerce
          .number({ message: 'Hours spent must be a number.' })
          .min(0.1, { message: 'Hours spent is required. Please time out first.' }) 
      : z.any().optional(),
  });

  const result = dynamicSchema.safeParse(data);
  if (result.success) return {};

  const errors: EODReportFormErrors = {};
  result.error.issues.forEach((issue) => {
    const field = issue.path[0] as keyof EODReportForm;
    if (field) {
      errors[field] = issue.message;
    }
  });

  console.log(errors);
  return errors;
};