import { eodReportSchema, type EODReportFormValues } from '../../../shared/schemas/eodReport.schema';
import { z } from 'zod';

export type EODReportErrors = Partial<Record<keyof EODReportFormValues, string>>;

export const validateEodReport = (
  formData: EODReportFormValues,
  mode: 'save' | 'submit'
): EODReportErrors => {
  const dynamicSchema = eodReportSchema.extend({
    hoursSpent: mode === 'submit' 
      ? z.coerce
          .number({ message: 'Hours spent must be a number.' })
          .min(0, { message: 'Hours spent is required. Please time out first.' }) 
      : z.any().optional(),
  });

  const result = dynamicSchema.safeParse(formData);

  if (result.success) return {};

  const errors: EODReportErrors = {};
  result.error.issues.forEach((issue) => {
    const field = issue.path[0] as keyof EODReportFormValues;
    if (field) {
      errors[field] = issue.message;
    }
  });

  return errors;
};