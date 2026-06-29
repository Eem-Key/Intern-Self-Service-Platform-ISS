import type { ProfileIntern } from '../../../shared/types/profile.types';
import type { InternInfo } from '../../../shared/types/intern.types';
import type { ProfileUpdateRequestForm } from '../../../shared/types/profile.types';

export function calculateProfileChanges(
    formValues: any, 
    profile: ProfileIntern
): Partial<ProfileUpdateRequestForm> | null {
    
    const changes: any = {};
    const fieldsToCompare: (keyof any)[] = [
        'first_name', 'middle_name', 'last_name', 'suffix', 'birth_date', 
        'gender', 'email', 'contact_number', 'address', 'position', 
        'department', 'office'
    ];

    fieldsToCompare.forEach((key) => {
        let formVal = formValues[key] ?? '';
        let originalVal = profile[key as keyof typeof profile] ?? '';

        if (key === 'birth_date') {
            formVal = normalizeFormDate(formVal);
            originalVal = formatDateForComparison(originalVal);
        }

        if (String(formVal) !== String(originalVal)) {
            changes[key] = formVal;
        }
    });

    const internChanges: any = {};
    const internFields: (keyof any)[] = ['university', 'year_level', 'program', 'required_hours', 'start_date'];
    
    internFields.forEach((key) => {
        let formVal = formValues[key] ?? '';
        let originalVal = profile.intern_info?.[key as keyof InternInfo] ?? '';

        if (key === 'start_date') {
            formVal = normalizeFormDate(formVal);
            originalVal = formatDateForComparison(originalVal);
        }

        if (String(formVal) !== String(originalVal)) {
            internChanges[key] = (key === 'year_level' || key === 'required_hours') 
                ? Number(formVal) 
                : formVal;
        }
    });

    if (Object.keys(changes).length === 0 && Object.keys(internChanges).length === 0) {
        return null;
    }

    return {
        update_type: 'information_update',
        requested_data: {
            ...changes,
            ...(Object.keys(internChanges).length > 0 ? { intern_info: internChanges } : {})
        },
        reason: 'Intern requested profile information update.',
    };
}

function normalizeFormDate(dateStr: string | undefined): string {
    if (!dateStr || typeof dateStr !== 'string') return '';
    // If it's already YYYY-MM-DD, return it
    if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) return dateStr;
    // Assume DD-MM-YYYY and convert
    const parts = dateStr.split('-');
    if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
    return dateStr;
}

// Helper: Safely converts any DB date format to 'YYYY-MM-DD'
function formatDateForComparison(val: any): string {
    if (!val) return '';
    if (val instanceof Date) return val.toISOString().split('T')[0];
    if (typeof val === 'string') {
        const d = new Date(val);
        return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0];
    }
    return '';
}