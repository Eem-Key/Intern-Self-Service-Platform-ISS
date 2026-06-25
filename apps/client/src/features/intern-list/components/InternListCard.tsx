import { useQuery } from '@tanstack/react-query';

import profilepic from '../../../assets/images/default_pic.png';
import { supabase } from '../../../config/supabase';

import type { InternListInfo } from '../../../../../shared/types/intern.types';
import type { InternPosition } from '../../../../../shared/types/enums.types';

type InternListCardProps = {
    intern: InternListInfo;
    onView: () => void;
};


function formatInternPosition(position?: InternPosition | string | null) {
    switch (position) {
        case 'quality_assurance':
            return 'Quality Assurance';
        case 'frontend_developer':
            return 'Front-end Developer';
        case 'backend_developer':
            return 'Back-end Developer';
        case 'business_analyst':
            return 'Business Analyst';
        default:
            return position || '--';
    }
}

function formatStatus(status?: string | null) {
    if (!status) return '--';

    switch (status) {
        case 'active':
            return 'Active';
        case 'deactivated':
            return 'Deactivated';
        default:
            return status.charAt(0).toUpperCase() + status.slice(1);
    }
}

function InternListCard({ intern, onView }: InternListCardProps) {
    const avatarPath = intern.avatar_url || null;
    const hasAvatarPath = Boolean(avatarPath);

    const { data: signedAvatarUrl, isLoading: isAvatarLoading } = useQuery({
        queryKey: ['intern-list-avatar-signed-url', intern.id, avatarPath],
        queryFn: async () => {
            if (!avatarPath) return null;

            const { data, error } = await supabase.storage
                .from('avatars')
                .createSignedUrl(avatarPath, 3600);

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

    const avatarImage = signedAvatarUrl || (!hasAvatarPath ? profilepic : null);
    const isActive = intern.status === 'active';

    return (
        <button
            type="button"
            onClick={onView}
            className="relative w-full rounded-xl border border-gray-100 bg-white p-4 text-left shadow-sm transition hover:z-10 hover:border-[#0058DD] hover:bg-[#F8FBFF] hover:shadow-md hover:ring-1 hover:ring-[#0058DD] lg:grid lg:min-h-[86px] lg:grid-cols-[44px_1.3fr_1.2fr_0.9fr_0.85fr_0.9fr_0.7fr] lg:items-center lg:gap-4 lg:rounded-none lg:border-0 lg:border-b lg:border-gray-100 lg:px-6 lg:py-3 lg:shadow-none lg:hover:border-b-transparent"
        >
            {/* Mobile / Tablet + Desktop Avatar/Name */}
            <div className="flex min-w-0 items-start gap-4 lg:contents">
                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-[#d9d9d9]">
                    {isAvatarLoading && hasAvatarPath ? (
                        <div className="h-full w-full animate-pulse bg-gray-300" />
                    ) : avatarImage ? (
                        <img
                            src={avatarImage}
                            alt={`${intern.name} profile`}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="h-full w-full bg-[#d9d9d9]" />
                    )}
                </div>

                <div className="min-w-0 flex-1 lg:flex-none">
                    <div className="flex items-start justify-between gap-3 lg:block">
                        <div className="min-w-0">
                            <h3 className="break-words text-sm font-bold text-black sm:text-base lg:truncate">
                                {intern.name}
                            </h3>

                            <p className="mt-1 text-sm text-gray-500 lg:hidden">
                                {formatInternPosition(intern.intern_position)}
                            </p>
                        </div>

                        <div className="shrink-0 lg:hidden">
                            <StatusPill
                                status={formatStatus(intern.status)}
                                isActive={isActive}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Desktop School */}
            <div className="hidden lg:block">
                <p className="line-clamp-2 text-sm leading-tight text-black">
                    {intern.university || '--'}
                </p>
            </div>

            {/* Desktop Program */}
            <div className="hidden lg:block">
                <p className="line-clamp-2 text-sm leading-tight text-black">
                    {intern.program || '--'}
                </p>
            </div>

            {/* Desktop Department */}
            <div className="hidden lg:block">
                <p className="text-sm text-black">{intern.department || '--'}</p>
            </div>

            {/* Desktop Position */}
            <div className="hidden lg:block">
                <p className="text-sm text-black">
                    {formatInternPosition(intern.intern_position)}
                </p>
            </div>

            {/* Desktop Status */}
            <div className="hidden lg:block">
                <StatusPill
                    status={formatStatus(intern.status)}
                    isActive={isActive}
                />
            </div>

            {/* Mobile Details */}
            <div className="mt-4 grid grid-cols-2 gap-3 lg:hidden">
                <MobileField label="School" value={intern.university || '--'} />
                <MobileField label="Program" value={intern.program || '--'} />
                <MobileField
                    label="Department"
                    value={intern.department || '--'}
                />
                <MobileField
                    label="Position"
                    value={formatInternPosition(intern.intern_position)}
                />
            </div>
        </button>
    );
}

function StatusPill({
    status,
    isActive,
}: {
    status: string;
    isActive: boolean;
}) {
    return (
        <span
            className={`inline-flex min-w-[72px] justify-center rounded-full px-3 py-1 text-xs font-bold ${
                isActive
                    ? 'bg-green-100 text-green-600'
                    : 'bg-blue-100 text-blue-600'
            }`}
        >
            {status}
        </span>
    );
}

function MobileField({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="text-xs font-medium text-gray-500">{label}</p>
            <p className="mt-1 line-clamp-2 text-xs font-semibold leading-tight text-gray-700">
                {value}
            </p>
        </div>
    );
}

export default InternListCard;