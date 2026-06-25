import { useQuery } from '@tanstack/react-query';
import { ChevronLeft } from 'lucide-react';

import profilepic from '../../../assets/images/default_pic.png';
import { supabase } from '../../../config/supabase';

type InternProfileBannerProps = {
    fullName: string;
    program?: string | null;
    university?: string | null;
    email?: string | null;
    contactNumber?: string | null;
    avatarUrl?: string | null;
    status?: string | null;
    onBack: () => void;
    onDeactivate: () => void;
};

function InternProfileBanner({
    fullName,
    program,
    university,
    email,
    contactNumber,
    avatarUrl,
    status,
    onBack,
    onDeactivate,
}: InternProfileBannerProps) {
    const hasAvatarPath = Boolean(avatarUrl);

    const { data: signedAvatarUrl, isLoading: isAvatarLoading } = useQuery({
        queryKey: ['intern-profile-avatar-signed-url', avatarUrl],
        queryFn: async () => {
            if (!avatarUrl) return null;

            const { data, error } = await supabase.storage
                .from('avatars')
                .createSignedUrl(avatarUrl, 3600);

            if (error) {
                console.error('Error creating intern avatar signed URL:', error);
                return null;
            }

            return data?.signedUrl || null;
        },
        enabled: hasAvatarPath,
        refetchOnMount: 'always',
        refetchOnWindowFocus: true,
        refetchInterval: 1000 * 60 * 50,
    });

    const avatarImage = signedAvatarUrl || profilepic;
    const isDeactivated = status === 'deactivated';

return (
    <section className="relative w-full overflow-hidden rounded-xl bg-[#002D6F] px-5 py-6 text-white shadow-md sm:px-7 sm:py-7 lg:px-8 xl:py-8">
        <button
            type="button"
            onClick={onBack}
            className="mb-4 inline-flex items-center gap-1 text-xs font-bold text-white transition hover:text-[#FFBF10] sm:text-sm"
        >
            <ChevronLeft size={18} />
            Back to List
        </button>

        <div className="flex flex-row items-end justify-between gap-3 sm:gap-5">
            <div className="flex min-w-0 flex-1 flex-row items-center gap-3 sm:gap-4">
                <div className="h-28 w-28 shrink-0 overflow-hidden rounded-full border-4 border-[#FFBF10] bg-[#d9d9d9] shadow-md sm:h-32 sm:w-32 lg:h-36 lg:w-36 xl:h-40 xl:w-40">
                    {isAvatarLoading && hasAvatarPath ? (
                        <div className="h-full w-full animate-pulse bg-gray-300" />
                    ) : (
                        <img
                            src={avatarImage}
                            alt={`${fullName} profile`}
                            className="h-full w-full object-cover"
                        />
                    )}
                </div>

                <div className="min-w-0 flex-1">
                    <h1 className="break-words text-lg font-bold leading-tight text-white sm:text-3xl lg:text-4xl xl:text-5xl">
                        {fullName}
                    </h1>

                    <div className="mt-2 space-y-0.5 text-[10px] leading-snug text-white sm:text-sm lg:text-base">
                        <p className="truncate">{program || '--'}</p>
                        <p className="truncate">{university || '--'}</p>
                        <p className="truncate">Email: {email || '--'}</p>
                        <p className="truncate">
                            Phone Number: {contactNumber || '--'}
                        </p>
                    </div>
                </div>
            </div>

            <button
                type="button"
                onClick={onDeactivate}
                disabled={isDeactivated}
                className={`shrink-0 whitespace-nowrap rounded-md px-4 py-2 text-xs !font-extrabold text-white shadow-md transition sm:px-6 sm:py-2.5 sm:text-sm lg:px-7 lg:text-base ${
                    isDeactivated
                        ? 'cursor-not-allowed bg-gray-400'
                        : 'bg-[#E60000] hover:bg-[#c90000]'
                }`}
            >
                {isDeactivated ? 'Deactivated' : 'Deactivate'}
            </button>
        </div>
    </section>
);
}

export default InternProfileBanner;