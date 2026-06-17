import { useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../config/supabase';
import { updateProfileUpdateRequestAPI } from '../../../api/profile.api';
import RequiredMark from '../../../components/ui/RequiredMark';

import type { RecordLog } from '../../../../../shared/types/record.types';
import type { ProfileUpdateRequestForm } from '../../../../../shared/types/profile.types';

type PendingProfileUpdateEditorProps = {
    record: RecordLog;
    onClose: () => void;
    onNotify: (
        variant: 'success' | 'error',
        title: string,
        message: string
    ) => void;
};

function getString(data: Record<string, unknown> | undefined, key: string) {
    const value = data?.[key];

    if (value === null || value === undefined) return '';

    return String(value);
}

function getInternInfo(data: Record<string, unknown> | undefined) {
    const internInfo = data?.intern_info;

    if (
        typeof internInfo === 'object' &&
        internInfo !== null &&
        !Array.isArray(internInfo)
    ) {
        return internInfo as Record<string, unknown>;
    }

    return {};
}

function ProfileUpdate({
    record,
    onClose,
    onNotify,
}: PendingProfileUpdateEditorProps) {
    const queryClient = useQueryClient();
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const requestedData = record.details?.requested_data;
    const internInfo = getInternInfo(requestedData);
    const updateType = record.details?.update_type || 'information_update';

    const isAvatarUpdate = updateType === 'avatar_update';

    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const [formValues, setFormValues] = useState({
        first_name: getString(requestedData, 'first_name'),
        middle_name: getString(requestedData, 'middle_name'),
        last_name: getString(requestedData, 'last_name'),
        suffix: getString(requestedData, 'suffix'),
        birth_date: getString(requestedData, 'birth_date'),
        gender: getString(requestedData, 'gender'),
        email: getString(requestedData, 'email'),
        contact_number: getString(requestedData, 'contact_number'),
        address: getString(requestedData, 'address'),

        year_level: getString(internInfo, 'year_level'),
        program: getString(internInfo, 'program'),
        university: getString(internInfo, 'university'),

        position: getString(requestedData, 'position'),
        department: getString(requestedData, 'department'),
        office: getString(requestedData, 'office'),
        required_hours: getString(internInfo, 'required_hours'),
        start_date: getString(internInfo, 'start_date'),
    });

    const handleChange = (field: keyof typeof formValues, value: string) => {
        setFormValues((prev) => ({
        ...prev,
        [field]: value,
        }));
    };

    const updateMutation = useMutation({
        mutationFn: (payload: ProfileUpdateRequestForm) =>
        updateProfileUpdateRequestAPI(record.id, payload),

        onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['log-details'] });
        queryClient.invalidateQueries({ queryKey: ['records'] });
        queryClient.invalidateQueries({ queryKey: ['intern-profile'] });

        onNotify(
            'success',
            'Pending Request Updated',
            'Your pending profile update request has been updated successfully.'
        );

        onClose();
        },

        onError: (error: Error) => {
        onNotify(
            'error',
            'Update Failed',
            error.message || 'Failed to update your pending profile request.'
        );
        },
    });

    const handleSaveInformationUpdate = () => {
        if (record.status !== 'pending') {
            onNotify(
                'error',
                'Update Failed',
                'Update only allowed for pending records.'
            );
            return; 
        }

        const payload: ProfileUpdateRequestForm = {
        update_type: 'information_update',
        requested_data: {
            first_name: formValues.first_name,
            middle_name: formValues.middle_name,
            last_name: formValues.last_name,
            suffix: formValues.suffix,
            birth_date: formValues.birth_date,
            gender: formValues.gender,
            email: formValues.email,
            contact_number: formValues.contact_number,
            address: formValues.address,

            position: formValues.position,
            department: formValues.department,
            office: formValues.office,

            intern_info: {
            university: formValues.university,
            year_level: Number(formValues.year_level),
            program: formValues.program,
            required_hours: Number(formValues.required_hours),
            start_date: formValues.start_date,
            },
        },
        reason: 'Intern updated pending profile information request.',
        };

        updateMutation.mutate(payload);
    };

    const handleChooseFile = () => {
        fileInputRef.current?.click();
    };

    const handleUploadPreview = (file: File | undefined) => {
        if (!file) return;

        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

        if (!allowedTypes.includes(file.type)) {
        onNotify(
            'error',
            'Invalid File Type',
            'Please upload a JPEG, PNG, or WebP image.'
        );
        return;
        }

        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const handleSaveAvatarUpdate = async () => {
        if (record.status !== 'pending') {
            onNotify(
                'error',
                'Update Failed',
                'Update only allowed for pending records.'
            );
            return; 
        }
        
        if (!selectedFile) {
        onNotify('error', 'No Photo Selected', 'Please select a photo first.');
        return;
        }

        const fileExt = selectedFile.name.split('.').pop();
        const filePath = `pending-profile-updates/${record.id}/avatar-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, selectedFile, {
            cacheControl: '3600',
            upsert: true,
        });

        if (uploadError) {
        onNotify('error', 'Upload Failed', uploadError.message);
        return;
        }

        const payload: ProfileUpdateRequestForm = {
        update_type: 'avatar_update',
        requested_data: {
            avatar_url: filePath,
        },
        reason: 'Intern updated pending profile picture request.',
        };

        updateMutation.mutate(payload);
    };

    if (isAvatarUpdate) {
        return (
        <div className="space-y-5">
            <div className="text-center">
            <p className="text-sm font-medium text-gray-600">
                Current pending profile picture request
            </p>

            <div className="mx-auto mt-4 flex h-40 w-40 items-center justify-center overflow-hidden rounded-full border-4 border-[#FFBF10] bg-[#d9d9d9] shadow-md">
                {previewUrl ? (
                <img
                    src={previewUrl}
                    alt="Profile preview"
                    className="h-full w-full object-cover"
                />
                ) : (
                <p className="px-4 text-center text-xs text-gray-500">
                    Select a new photo to replace the pending request.
                </p>
                )}
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg, image/png, image/webp"
                className="hidden"
                onChange={(event) => handleUploadPreview(event.target.files?.[0])}
            />

            <button
                type="button"
                onClick={handleChooseFile}
                disabled={updateMutation.isPending}
                className="mt-5 rounded-full bg-[#eeeeee] px-7 py-2 text-sm font-semibold text-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
                Choose New Photo
            </button>
            </div>

            <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
            <button
                type="button"
                onClick={onClose}
                disabled={updateMutation.isPending}
                className="px-7 py-2 text-sm font-bold text-gray-600 disabled:cursor-not-allowed disabled:opacity-70"
            >
                Cancel
            </button>

            <button
                type="button"
                onClick={handleSaveAvatarUpdate}
                disabled={updateMutation.isPending || !selectedFile}
                className="rounded-full bg-[#FFBF10] px-7 py-2 text-sm font-bold text-black disabled:cursor-not-allowed disabled:bg-[#eeeeee] disabled:text-gray-500 disabled:opacity-70"
            >
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
            </div>
        </div>
        );
    }

    return (
        <div className="space-y-5">
        <div>
            <h3 className="border-l-4 border-[#FFBF10] pl-2 text-xl font-bold">
            Profile Information
            </h3>
            <p className="mt-1 text-xs text-gray-500">
            Edit or add more changes to your current pending request.
            </p>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <ProfileField
            label="First Name"
            value={formValues.first_name}
            required
            onChange={(value) => handleChange('first_name', value)}
            />

            <ProfileField
            label="Middle Name"
            value={formValues.middle_name}
            onChange={(value) => handleChange('middle_name', value)}
            />

            <ProfileField
            label="Last Name"
            value={formValues.last_name}
            required
            onChange={(value) => handleChange('last_name', value)}
            />

            <ProfileField
            label="Birthdate"
            type="date"
            value={formValues.birth_date}
            required
            onChange={(value) => handleChange('birth_date', value)}
            />

            <ProfileField
            label="Gender"
            value={formValues.gender}
            required
            onChange={(value) => handleChange('gender', value)}
            />

            <ProfileField
            label="Suffix"
            value={formValues.suffix}
            onChange={(value) => handleChange('suffix', value)}
            />

            <div className="md:col-span-2">
            <ProfileField
                label="Email"
                value={formValues.email}
                required
                onChange={(value) => handleChange('email', value)}
            />
            </div>

            <ProfileField
            label="Contact Number"
            value={formValues.contact_number}
            required
            onChange={(value) => handleChange('contact_number', value)}
            />

            <div className="md:col-span-3">
            <ProfileField
                label="Address"
                value={formValues.address}
                required
                onChange={(value) => handleChange('address', value)}
            />
            </div>
        </div>

        <h3 className="border-l-4 border-[#FFBF10] pl-2 text-xl font-bold">
            Academics
        </h3>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-[0.45fr_1fr]">
            <ProfileField
            label="Year Level"
            value={formValues.year_level}
            required
            onChange={(value) => handleChange('year_level', value)}
            />

            <ProfileField
            label="Program"
            value={formValues.program}
            required
            onChange={(value) => handleChange('program', value)}
            />

            <div className="md:col-span-2">
            <ProfileField
                label="University"
                value={formValues.university}
                required
                onChange={(value) => handleChange('university', value)}
            />
            </div>
        </div>

        <h3 className="border-l-4 border-[#FFBF10] pl-2 text-xl font-bold">
            Internship Information
        </h3>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <ProfileField
            label="Position"
            value={formValues.position}
            required
            onChange={(value) => handleChange('position', value)}
            />

            <ProfileField
            label="Department"
            value={formValues.department}
            required
            onChange={(value) => handleChange('department', value)}
            />

            <ProfileField
            label="Start Date"
            type="date"
            value={formValues.start_date}
            required
            onChange={(value) => handleChange('start_date', value)}
            />

            <ProfileField
            label="Required Hours"
            value={formValues.required_hours}
            required
            onChange={(value) => handleChange('required_hours', value)}
            />

            <ProfileField
            label="Office"
            value={formValues.office}
            required
            onChange={(value) => handleChange('office', value)}
            />
        </div>

        <div className="flex flex-col-reverse justify-end gap-3 pt-2 sm:flex-row">
            <button
            type="button"
            onClick={onClose}
            disabled={updateMutation.isPending}
            className="rounded-full bg-[#eeeeee] px-7 py-2 text-sm font-bold text-gray-600 disabled:cursor-not-allowed disabled:opacity-70"
            >
            Cancel
            </button>

            <button
            type="button"
            onClick={handleSaveInformationUpdate}
            disabled={updateMutation.isPending}
            className="rounded-full bg-[#FFBF10] px-7 py-2 text-sm font-bold text-black disabled:cursor-not-allowed disabled:bg-[#eeeeee] disabled:text-gray-500 disabled:opacity-70"
            >
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
        </div>
        </div>
    );
}

type ProfileFieldProps = {
    label: string;
    value: string;
    type?: string;
    required?: boolean;
    onChange: (value: string) => void;
};

function ProfileField({
    label,
    value,
    type = 'text',
    required = false,
    onChange,
    }: ProfileFieldProps) {
    return (
        <div>
        <label className="inline-flex items-center gap-1 text-xs font-medium">
            {label}
            {required && <RequiredMark />}
        </label>

        <input
            type={type}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className="h-9 w-full rounded bg-[#eeeeee] px-3 text-sm outline-none"
        />
        </div>
    );
}

export default ProfileUpdate;