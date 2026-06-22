import { eodReportSchema } from '../../../shared/schemas/eodReport.schema';
import type {
    EODReportForm,
    EODReportFormErrors,
} from '../../../shared/types/eodReport.types';
import { z } from 'zod';

function getLocalDateString(date: Date) {
    return date.toLocaleDateString('en-CA');
}

function isTodayOrYesterday(dateValue: string) {
    const selectedDate = dateValue;

    const today = new Date();

    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const todayString = getLocalDateString(today);
    const yesterdayString = getLocalDateString(yesterday);

    return selectedDate === todayString || selectedDate === yesterdayString;
}

export const validateEodReport = (
    data: EODReportForm,
    mode: 'save' | 'submit' | 'resubmit'
): EODReportFormErrors => {
    const dynamicSchema = eodReportSchema.extend({
        hours_spent:
            mode === 'submit' || mode === 'resubmit'
                ? z.coerce
                      .number({ message: 'Hours spent must be a number.' })
                      .min(0.1, {
                          message:
                              'Hours spent is required. Please time out first.',
                      })
                : z.any().optional(),
    });

    const result = dynamicSchema.safeParse(data);

    const errors: EODReportFormErrors = {};

    if (!result.success) {
        result.error.issues.forEach((issue) => {
            const field = issue.path[0] as keyof EODReportForm;

            if (field) {
                errors[field] = issue.message;
            }
        });
    }

    if (
        mode === 'submit' &&
        data.date_written &&
        !isTodayOrYesterday(data.date_written)
    ) {
        errors.date_written =
            'You can only submit an EOD report for today or yesterday.';
    }

    return errors;
};