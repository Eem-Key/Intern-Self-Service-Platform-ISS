import { z } from 'zod';
import { LEAVE_REASON_VALUES } from '../types/enums.types';

export const leaveFormSchema = z.object({
    reason_category: z.enum(LEAVE_REASON_VALUES).refine(
        (val) => LEAVE_REASON_VALUES.includes(val), 
        { message: "Please select a leave type." }
    ),
    start_date: z.string().min(1, 'Start date is required.'),
    end_date: z.string().min(1, 'End date is required.'),
    description: z.string().trim().min(1, 'Description is required.'),
}).refine((data) => data.end_date >= data.start_date, {
    message: 'End date cannot be earlier than start date.',
    path: ['end_date'],
});