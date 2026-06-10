import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import type {
    Profile,
    ProfileUpdateRequest,
} from '../../../../../shared/types/profile.types';
import { requestProfileUpdateAPI } from '../../../api/profile.api';
import StatusMessage from '../../../components/feedback/StatusMessage';
import ConfirmationModal from '../../../components/feedback/confirmationModal';
import { validateProfileUpdateRequest } from '../../../utils/validateProfile.ts';
import {
    USER_GENDER_VALUES,
    type UserGender,
} from '../../../../../shared/types/enums.types';
import { ChevronDown } from 'lucide-react';
import RequiredMark from '../../../components/ui/RequiredMark.tsx';

type ProfileDetailsCardProps = {
    profile: Profile;
};


function ProfileDetailsCard(
    { profile }: ProfileDetailsCardProps
) {
    const formatGenderLabel = (gender: UserGender) => {
    switch (gender) {
        case 'male':
        return 'Male';
        case 'female':
        return 'Female';
        case 'non-binary':
        return 'Non-binary';
        case 'prefer_not_to_say':
        return 'Prefer not to say';
        default:
        return gender;
    }
    };

    const [isGenderDropdownOpen, setIsGenderDropdownOpen] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const queryClient = useQueryClient();
    const [statusMessage, setStatusMessage] = useState<{
    variant: 'success' | 'error';
    title: string;
    message: string;
    } | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    const [formValues, setFormValues] = useState({
        first_name: profile.first_name || '',
        middle_name: profile.middle_name || '',
        last_name: profile.last_name || '',
        suffix: profile.suffix || '',
        birth_date: profile.birth_date || '',
        gender: profile.gender || '',
        email: profile.email || '',
        contact_number: profile.contact_number || '',
        address: profile.address || '',

        year_level: profile.intern_info?.year_level ? String(profile.intern_info.year_level) : '',
        program: profile.intern_info?.program || '',
        university: profile.intern_info?.university || '',

        position: profile.position || '',
        department: profile.department || '',
        // supervisor: profile.intern_info?.supervisor || '',
        required_hours: profile.intern_info?.required_hours ? String(profile.intern_info.required_hours) : '',
        // work_setup: profile.intern_info?.work_setup || '',
        office: profile.office || '',
        start_date: profile.intern_info?.start_date || '',
    });

    useEffect(() => {
        resetFormValues();
    }, [profile]);

    const updateRequestMutation = useMutation({
        mutationFn: (payload: ProfileUpdateRequest) => requestProfileUpdateAPI(payload),
        
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['intern-profile'] });
            setIsEditing(false);

            setStatusMessage({
            variant: 'success',
            title: 'Request Submitted Successfully!',
            message: 'Your changes are now waiting for admin approval.',
            });

            setTimeout(() => {
            setStatusMessage(null);
            }, 5000);
        },

        onError: (error: Error) => {
            setStatusMessage({
            variant: 'error',
            title: 'Request Submission Failed',
            message:
                error.message ||
                'We could not process your request. Please review your information and try again.',
            });

            setTimeout(() => {
            setStatusMessage(null);
            }, 5000);
        },
    });

    const handleChange = (field: keyof typeof formValues, value: string) => {
    setFormValues((prev) => ({
        ...prev,
        [field]: value,
    }));
    };

    const resetFormValues = () => {
    setFormValues({
        first_name: profile.first_name || '',
        middle_name: profile.middle_name || '',
        last_name: profile.last_name || '',
        suffix: profile.suffix || '',
        birth_date: profile.birth_date || '',
        gender: profile.gender || '',
        email: profile.email || '',
        contact_number: profile.contact_number || '',
        address: profile.address || '',

        year_level: profile.intern_info?.year_level ? String(profile.intern_info.year_level) : '',
        program: profile.intern_info?.program || '',
        university: profile.intern_info?.university || '',

        position: profile.position || '',
        department: profile.department || '',
        // supervisor: profile.supervisor || '',
        required_hours: profile.intern_info?.required_hours ? String(profile.intern_info.required_hours) : '',
        // work_setup: profile.work_setup || '',
        office: profile.office || '',
        start_date: profile.intern_info?.start_date || '',
    });
    };

    const handleCancel = () => {
        resetFormValues();
        setIsEditing(false);
        setIsGenderDropdownOpen(false);
    };

    const handleSubmitRequest = () => {
        const payload: ProfileUpdateRequest = {
            update_type: 'information_update',
            requested_data: {
                    first_name: formValues.first_name,
                    middle_name: formValues.middle_name,
                    last_name: formValues.last_name,
                    suffix: formValues.suffix,
                    birth_date: formValues.birth_date,
                    gender: formValues.gender,
                    contact_number: formValues.contact_number,
                    address: formValues.address,

                    year_level: formValues.year_level,
                    program: formValues.program,
                    university: formValues.university,
                },
            reason: 'Intern requested profile information update.',
        };

        const validationErrors = validateProfileUpdateRequest(payload);
    
        if (Object.keys(validationErrors).length > 0) {
            console.error("Validation Errors:", validationErrors);
            setStatusMessage({ 
                variant: 'error', 
                title: 'Validation Error', 
                message: Object.values(validationErrors)[0] 
            });
            return;
        }

        updateRequestMutation.mutate(payload);
    };

    return (
        <>
        
            {statusMessage && (
        <StatusMessage
            variant={statusMessage.variant}
            title={statusMessage.title}
            message={statusMessage.message}
            isFixed
            onClose={() => setStatusMessage(null)}
        />
        )}

        <ConfirmationModal
        isOpen={showConfirmModal}
        title="Confirm Changes?"
        message="Are you sure you want to save these changes? Please note that your updated personal information will be subject to Admin review and approval before it is permanently saved to your profile."
        confirmText="Yes, Submit"
        cancelText="Cancel"
        isLoading={updateRequestMutation.isPending}
        onCancel={() => setShowConfirmModal(false)}
        onConfirm={() => {
            setShowConfirmModal(false);
            handleSubmitRequest();
        }}
        />

        <section className="rounded-xl bg-white px-4 py-4 shadow-md sm:px-6 sm:py-5 xl:px-8 xl:py-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="border-l-4 border-[#FFBF10] pl-2 text-2xl font-bold">
            Personal Information
            </h2>

        {!isEditing ? (
            <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="rounded-full bg-[#FFBF10] px-5 py-2 text-sm font-semibold text-black"
            >
                Edit Info
            </button>
            ) : (
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:gap-3">
                <button
                type="button"
                onClick={handleCancel}
                className="rounded-full bg-[#eeeeee] px-5 py-2 text-sm font-semibold text-gray-600"
                >
                Cancel
                </button>

                <button
                type="button"
                onClick={() => setShowConfirmModal(true)}
                disabled={updateRequestMutation.isPending}
                className="rounded-full bg-[#FFBF10] px-5 py-2 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-60"
                >
                {updateRequestMutation.isPending ? 'Sending...' : 'Save'}
                </button>
            </div>
            )}
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <ProfileField
            label="First Name"
            value={formValues.first_name}
            disabled={!isEditing}
            onChange={(value) => handleChange('first_name', value)}
            />

            <ProfileField
            label="Middle Name"
            value={formValues.middle_name}
            disabled={!isEditing}
            onChange={(value) => handleChange('middle_name', value)}
            />

            <ProfileField
            label="Last Name"
            value={formValues.last_name}
            disabled={!isEditing}
            onChange={(value) => handleChange('last_name', value)}
            />

            <ProfileField
            label="Birthdate"
            type="date"
            value={formValues.birth_date}
            disabled={!isEditing}
            onChange={(value) => handleChange('birth_date', value)}
            />

            <ProfileDropdownField
            label="Gender"
            value={formValues.gender}
            disabled={!isEditing}
            isOpen={isGenderDropdownOpen}
            options={USER_GENDER_VALUES.map((gender) => ({
                label: formatGenderLabel(gender),
                value: gender,
            }))}
            placeholder="Select gender"
            onToggle={() => setIsGenderDropdownOpen((prev) => !prev)}
            onSelect={(value) => {
                handleChange('gender', value);
                setIsGenderDropdownOpen(false);
            }}
            />

            <ProfileField
            label="Suffix"
            value={formValues.suffix}
            disabled={!isEditing}
            onChange={(value) => handleChange('suffix', value)}
            />

            <div className="md:col-span-2">
            <ProfileField
                label="Email"
                value={formValues.email}
                disabled={!isEditing}
                onChange={(value) => handleChange('email', value)}
            />
            </div>

            <ProfileField
            label="Contact Number"
            value={formValues.contact_number}
            disabled={!isEditing}
            onChange={(value) => handleChange('contact_number', value)}
            />

            <div className="md:col-span-3">
            <ProfileField
                label="Address"
                value={formValues.address}
                disabled={!isEditing}
                onChange={(value) => handleChange('address', value)}
            />
            </div>
        </div>

        <h2 className="mb-4 mt-5 border-l-4 border-[#FFBF10] pl-2 text-2xl font-bold">
            Academics
        </h2>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-[0.45fr_1fr]">
            <ProfileField
                label="Year Level"
                value={formValues.year_level}
                disabled={!isEditing}
                onChange={(value) => handleChange('year_level', value)}
            />

            <ProfileField
                label="Program"
                value={formValues.program}
                disabled={!isEditing}
                onChange={(value) => handleChange('program', value)}
            />


            <div className="md:col-span-2">
            <ProfileField
                label="University"
                value={formValues.university}
                disabled={!isEditing}
                onChange={(value) => handleChange('university', value)}
            />
            </div>
        </div>

        <h2 className="mb-4 mt-5 border-l-4 border-[#FFBF10] pl-2 text-2xl font-bold">
            Internship Information
        </h2>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <ProfileField
            label="Position"
            value={formValues.position}
            disabled
            onChange={(value) => handleChange('position', value)}
            />

            <ProfileField
            label="Department"
            value={formValues.department}
            disabled
            onChange={(value) => handleChange('department', value)}
            />

            {/* <ProfileField
            label="Supervisor"
            value={formValues.supervisor}
            disabled
            onChange={(value) => handleChange('supervisor', value)}
            /> */}

            <div className="grid grid-cols-2 gap-3">

            <ProfileField
                label="Start Date"
                type="date"
                value={formValues.start_date}
                disabled
                onChange={(value) => handleChange('start_date', value)}
            />
            
            <ProfileField
                label="Required Hours"
                value={formValues.required_hours}
                disabled
                onChange={(value) => handleChange('required_hours', value)}
            />

            {/* <ProfileField
                label="Work Set-Up"
                value={formValues.work_setup}
                disabled
                onChange={(value) => handleChange('work_setup', value)}
            /> */}
            </div>

            <ProfileField
            label="Office"
            value={formValues.office}
            disabled
            onChange={(value) => handleChange('office', value)}
            />
        </div>
        </section>
        </>
    );
}

type ProfileFieldProps = {
    label: string;
    value: string;
    type?: string;
    disabled?: boolean;
    onChange: (value: string) => void;
};

function ProfileField({
    label,
    value,
    type = 'text',
    disabled = false,
    onChange,
}: ProfileFieldProps) {
    return (
        <div>
        <label className="text-xs font-medium">{label}</label>

        <input
            type={type}
            value={value}
            disabled={disabled}
            onChange={(event) => onChange(event.target.value)}
            className="h-9 w-full rounded bg-[#eeeeee] px-3 text-sm outline-none disabled:cursor-not-allowed disabled:text-gray-600"
        />
        </div>
    );
}

type ProfileDropdownFieldProps = {
    label: string;
    value: string;
    disabled?: boolean;
    placeholder?: string;
    isOpen: boolean;
    options: {
        label: string;
        value: string;
    }[];
    onToggle: () => void;
    onSelect: (value: string) => void;
};

function ProfileDropdownField({
    label,
    value,
    disabled = false,
    placeholder = 'Select option',
    isOpen,
    options,
    onToggle,
    onSelect,
}: ProfileDropdownFieldProps) {
    const selectedLabel =
        options.find((option) => option.value === value)?.label || placeholder;

    return (
        <div>
        <label className="text-xs font-medium">{label}</label>

        <div className="relative">
            <button
            type="button"
            disabled={disabled}
            onClick={onToggle}
            className={`flex h-9 w-full items-center justify-between rounded bg-[#eeeeee] px-3 text-left text-sm outline-none disabled:cursor-not-allowed disabled:text-gray-600 ${
                value ? 'text-black' : 'text-gray-400'
            }`}
            >
            <span className="truncate">{selectedLabel}</span>
            <ChevronDown size={16} className="shrink-0 text-gray-600" />
            </button>

            {isOpen && !disabled && (
            <div className="absolute left-0 top-full z-30 mt-1 w-full overflow-hidden rounded bg-white shadow-lg">
                {options.map((option) => (
                <button
                    key={option.value}
                    type="button"
                    onClick={() => onSelect(option.value)}
                    className="w-full px-3 py-2.5 text-left text-sm hover:bg-[#eeeeee]"
                >
                    {option.label}
                </button>
                ))}
            </div>
            )}
        </div>
        </div>
    );
}


export default ProfileDetailsCard;