import { leaveFormSchema } from '../../../shared/schemas/leave.schema';
import type { 
  LeaveRequestForm, 
  LeaveRequestFormErrors 
} from '../../../shared/types/leave.types';

export const validateLeaveForm = (
  data: LeaveRequestForm
): LeaveRequestFormErrors => {
  const result = leaveFormSchema.safeParse(data);

  if (result.success) return {};

  const errors: LeaveRequestFormErrors = {};
  result.error.issues.forEach((issue) => {
    const field = issue.path[0] as keyof LeaveRequestForm;
    if (field) {
      errors[field] = issue.message;
    }
  });

  return errors;
};