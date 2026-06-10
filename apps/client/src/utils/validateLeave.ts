import { leaveFormSchema } from '../../../shared/schemas/leave.schema';
import type { LeaveForm, LeaveFormErrors } from '../../../shared/types/leave.types';

export const validateLeaveForm = (data: LeaveForm): LeaveFormErrors => {
  const result = leaveFormSchema.safeParse(data);

  if (result.success) return {};

  const errors: LeaveFormErrors = {};
  result.error.issues.forEach((issue) => {
    const field = issue.path[0] as keyof LeaveForm;
    if (field) {
      errors[field] = issue.message;
    }
  });

  return errors;
};