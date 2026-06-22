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
        if (formValues[key] !== (profile[key as keyof typeof profile] ?? '')) {
            changes[key] = formValues[key];
        }
    });

    const internChanges: any = {};
    const internFields: (keyof any)[] = ['university', 'year_level', 'program', 'required_hours', 'start_date'];
    
    internFields.forEach((key) => {
        const originalValue = (key === 'year_level' || key === 'required_hours')
            ? String(profile.intern_info?.[key as keyof InternInfo] ?? '')
            : (profile.intern_info?.[key as keyof InternInfo] ?? '');

        if (formValues[key] !== String(originalValue)) {
            internChanges[key] = (key === 'year_level' || key === 'required_hours') 
                ? Number(formValues[key]) 
                : formValues[key];
        }
    });

    // Check if there are any changes
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