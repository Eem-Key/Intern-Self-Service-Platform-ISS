import { useRef, useState} from 'react';
import { useMutation, useQueryClient, useQuery  } from '@tanstack/react-query';
import { supabase } from '../../../config/supabase';
import StatusMessage from '../../../components/feedback/StatusMessage';
import ConfirmationModal from '../../../components/feedback/confirmationModal';
import profilepic from '../../../assets/images/default_pic.png';
import { insertProfileUpdateRequestAPI, hasPendingProfileUpdateRequestAPI, } from '../../../api/profile.api';
import type {
    Profile,
} from '../../../../../shared/types/profile.types';


type ProfilePictureCardProps = {
    profile: Profile;
};

function ProfilePictureCard({ profile }: ProfilePictureCardProps) {
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const queryClient = useQueryClient();
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [selectedAvatarUrl, setSelectedAvatarUrl] = useState<string | null>(
        null
    );

    const { data: hasPendingAvatarRequest = false } = useQuery({
        queryKey: ['pending-profile-update-request', 'avatar_update', profile.id],
        queryFn: () => hasPendingProfileUpdateRequestAPI('avatar_update'),
        staleTime: 0,
        refetchOnMount: 'always',
        refetchOnWindowFocus: true,
    });

    console.log('hasPendingAvatarRequest:', hasPendingAvatarRequest);

    const [statusMessage, setStatusMessage] = useState<{
        variant: 'success' | 'error';
        title: string;
        message: string;
    } | null>(null);

    const { data: signedUrlData } = useQuery({
        queryKey: ['avatar-url', profile.avatar_url],
        queryFn: async () => {
            if (!profile.avatar_url) return null;
            const { data } = await supabase.storage
                .from('avatars')
                .createSignedUrl(profile.avatar_url, 3600);
            return data?.signedUrl;
        },
        enabled: !!profile.avatar_url,
        refetchInterval: 1000 * 60 * 50,
    });

    const avatarUpdateMutation = useMutation({
        mutationFn: insertProfileUpdateRequestAPI,

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['intern-profile'] });
            queryClient.invalidateQueries({
            queryKey: ['pending-profile-update-request', 'avatar_update', profile.id],
            });

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
            setPreviewUrl(null);
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
    if (hasPendingAvatarRequest) {
        showPendingRequestMessage();
        return;
    }

    fileInputRef.current?.click();
    };

    const handleUploadPreview = (file: File | undefined) => {
        if (!file) return;

        const localPreviewUrl = URL.createObjectURL(file);

        setPreviewUrl(localPreviewUrl);
        setSelectedAvatarUrl(localPreviewUrl);
    };

    const handleCancel = () => {
        setPreviewUrl(null);
        setSelectedAvatarUrl(null);

        if (fileInputRef.current) {
        fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async () => {
        const file = fileInputRef.current?.files?.[0];

        if (!file) return;

        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    
        if (!allowedTypes.includes(file.type)) {
            setStatusMessage({
                variant: 'error',
                title: 'Invalid File Type',
                message: 'Please upload a JPEG, PNG, or WebP image.',
            });
            return;
        }

        const fileExt = file.name.split('.').pop();
        const filePath = `${profile.id}/avatar-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true,
            });

        if (uploadError) {
            setStatusMessage({
            variant: 'error',
            title: 'Upload Failed',
            message: uploadError.message,
            });

            setTimeout(() => {
            setStatusMessage(null);
            }, 5000);

            return;
        }

        {/*const { data: auth, error: signedUrlError } = await supabase.storage
            .from('avatars')
            .createSignedUrl(filePath, 60);

        if (signedUrlError || !auth.signedUrl) {
            setStatusMessage({ variant: 'error', title: 'Error', message: 'Could not generate access link.' });
            return;
        }*/}

        avatarUpdateMutation.mutate({
            update_type: 'avatar_update',
            requested_data: {
                avatar_url: filePath,
        },
            reason: 'Intern requested profile picture update.',
        });
    };

    const hasSelectedNewPhoto = Boolean(selectedAvatarUrl);
    const displayedAvatar = previewUrl || signedUrlData || profilepic;

    const showPendingRequestMessage = () => {
        setStatusMessage({
            variant: 'error',
            title: 'Pending Request',
            message:
            'You already have a pending profile picture request. Please check your activity logs to edit or add more changes.',
    });

        setTimeout(() => {
            setStatusMessage(null);
        }, 5000);
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
        message="Are you sure you want to upload this photo? Your new profile picture will be reviewed by the Admin before it is displayed on your portal."
        confirmText="Yes, Submit"
        cancelText="Cancel"
        isLoading={avatarUpdateMutation.isPending}
        onCancel={() => setShowConfirmModal(false)}
        onConfirm={() => {
            setShowConfirmModal(false);
            handleSubmit();
        }}
        />

        <section className="rounded-xl bg-white px-4 py-4 shadow-md sm:px-6 sm:py-5 xl:px-8 xl:py-6 text-center">
            <h2 className="mb-5 text-2xl font-bold">Profile Picture</h2>

            <div className="mx-auto flex h-44 w-44 items-center justify-center overflow-hidden rounded-full border-4 border-[#FFBF10] bg-[#d9d9d9] shadow-md">
                <img
                src={displayedAvatar}
                alt="Profile preview"
                className="h-full w-full object-cover"
                />
            </div>

            <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg, image/png, image/webp"
            disabled={avatarUpdateMutation.isPending}
            className="hidden"
            onChange={(event) => handleUploadPreview(event.target.files?.[0])}
            />

            {!hasSelectedNewPhoto ? (
            <button
                type="button"
                onClick={handleChooseFile}
                disabled={avatarUpdateMutation.isPending}
                className={`mx-auto mt-5 inline-flex rounded-full px-8 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                    hasPendingAvatarRequest
                    ? 'cursor-not-allowed bg-[#eeeeee] text-gray-500'
                    : 'bg-[#FFBF10] text-black hover:bg-[#e8a900]'
                }`}
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
                onClick={() => setShowConfirmModal(true)}
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