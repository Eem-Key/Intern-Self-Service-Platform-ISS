import { useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import StatusMessage from '../../../components/feedback/StatusMessage';
import { requestProfileUpdateAPI } from '../../../api/profile.api';
import type {
  Profile,
  ProfileUpdateRequest,
} from '../../../../../shared/types/profile.types';

type ProfilePictureCardProps = {
    profile: Profile;
};

function ProfilePictureCard({ profile }: ProfilePictureCardProps) {
    const queryClient = useQueryClient();
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const [previewUrl, setPreviewUrl] = useState<string | null>(
        profile.avatar_url || null
    );

    const [selectedAvatarUrl, setSelectedAvatarUrl] = useState<string | null>(
        null
    );

    const [statusMessage, setStatusMessage] = useState<{
        variant: 'success' | 'error';
        title: string;
        message: string;
    } | null>(null);

    const avatarUpdateMutation = useMutation({
        mutationFn: requestProfileUpdateAPI,

        onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['intern-profile'] });

        setSelectedAvatarUrl(null);

        setStatusMessage({
            variant: 'success',
            title: 'Request Submitted Successfully!',
            message: 'Your profile picture update is now waiting for admin approval.',
        });

        setTimeout(() => {
            setStatusMessage(null);
        }, 5000);
        },

    onError: (error: Error) => {
        setPreviewUrl(profile.avatar_url || null);
        setSelectedAvatarUrl(null);

        setStatusMessage({
            variant: 'error',
            title: 'Request Submission Failed',
            message:
            error.message ||
            'We could not process your profile picture update. Please try again.',
        });

        setTimeout(() => {
            setStatusMessage(null);
        }, 5000);
        },
    });

    const handleChooseFile = () => {
        fileInputRef.current?.click();
    };

    const handleUploadPreview = (file: File | undefined) => {
        if (!file) return;

        const localPreviewUrl = URL.createObjectURL(file);

        setPreviewUrl(localPreviewUrl);
        setSelectedAvatarUrl(localPreviewUrl);
    };

    const handleCancel = () => {
        setPreviewUrl(profile.avatar_url || null);
        setSelectedAvatarUrl(null);

        if (fileInputRef.current) {
        fileInputRef.current.value = '';
        }
    };

    const handleSubmit = () => {
        if (!selectedAvatarUrl) return;

        avatarUpdateMutation.mutate({
        update_type: 'avatar_update',
        requested_data: {
            avatar_url: selectedAvatarUrl,
        },
        reason: 'Intern requested profile picture update.',
        } as unknown as ProfileUpdateRequest);
    };

    const hasSelectedNewPhoto = Boolean(selectedAvatarUrl);

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

            <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            disabled={avatarUpdateMutation.isPending}
            className="hidden"
            onChange={(event) => handleUploadPreview(event.target.files?.[0])}
            />

            {!hasSelectedNewPhoto ? (
            <button
                type="button"
                onClick={handleChooseFile}
                disabled={avatarUpdateMutation.isPending}
                className="mx-auto mt-5 inline-flex rounded-full bg-[#FFBF10] px-8 py-2 text-sm font-semibold text-black transition hover:bg-[#e8a900] disabled:cursor-not-allowed disabled:opacity-60"
            >
                Upload Photo
            </button>
            ) : (
            <div className="mt-5 flex justify-center gap-4">
                <button
                type="button"
                onClick={handleCancel}
                disabled={avatarUpdateMutation.isPending}
                className="min-w-[120px] rounded-full bg-[#eeeeee] px-6 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                Cancel
                </button>

                <button
                type="button"
                onClick={handleSubmit}
                disabled={avatarUpdateMutation.isPending}
                className="min-w-[120px] rounded-full bg-[#FFBF10] px-6 py-2 text-sm font-semibold text-black transition hover:bg-[#e8a900] disabled:cursor-not-allowed disabled:opacity-60"
                >
                {avatarUpdateMutation.isPending ? 'Submitting...' : 'Submit'}
                </button>
            </div>
            )}
        </section>
        </>
    );
}

export default ProfilePictureCard;