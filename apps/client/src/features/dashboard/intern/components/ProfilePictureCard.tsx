import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { requestProfileUpdateAPI } from '../../../../api/profile.api';
import type {
    Profile,
    ProfileUpdateRequest,
} from '../../../../../../shared/types/profile.types';

type ProfilePictureCardProps = {
    profile: Profile;
};

function ProfilePictureCard({ profile }: ProfilePictureCardProps) {
    const queryClient = useQueryClient();

    const [previewUrl, setPreviewUrl] = useState<string | null>(
        profile.avatar_url || null
    );

    const uploadMutation = useMutation({
        mutationFn: requestProfileUpdateAPI,

        onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['intern-profile'] });
        alert('Profile picture update request submitted for review.');
        },

        onError: (error: Error) => {
        setPreviewUrl(profile.avatar_url || null);
        alert(error.message || 'Failed to submit profile picture update request.');
        },
    });

    const handleUploadPreview = (file: File | undefined) => {
        if (!file) return;

        const url = URL.createObjectURL(file);
        setPreviewUrl(url);

        uploadMutation.mutate({
        update_type: 'avatar_update',
        requested_data: {
            avatar_url: url,
        },
        reason: 'Intern requested profile picture update.',
        } as unknown as ProfileUpdateRequest);
    };

    return (
        <section className="rounded-xl bg-white px-6 py-5 text-center shadow-md">
        <h2 className="mb-5 text-2xl font-bold">Profile Picture</h2>

        <div className="mx-auto flex h-44 w-44 items-center justify-center overflow-hidden rounded-full border-4 border-[#FFBF10] bg-[#d9d9d9] shadow-md">
            {previewUrl ? (
            <img
                src={previewUrl}
                alt="Profile preview"
                className="h-full w-full object-cover"
            />
            ) : null}
        </div>

        <label className="mx-auto mt-5 inline-flex cursor-pointer rounded-full bg-[#FFBF10] px-8 py-2 text-sm font-semibold text-black">
            {uploadMutation.isPending ? 'Submitting...' : 'Upload Photo'}

            <input
            type="file"
            accept="image/*"
            disabled={uploadMutation.isPending}
            className="hidden"
            onChange={(event) => handleUploadPreview(event.target.files?.[0])}
            />
        </label>
        </section>
    );
}

export default ProfilePictureCard;