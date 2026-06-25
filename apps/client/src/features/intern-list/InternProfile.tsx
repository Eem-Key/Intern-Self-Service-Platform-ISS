import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import AdminSidebar from '../AdminSidebar';

import {
    useDeactivateInternAPIMutation,
    useFetchAllAttendanceByIdAPI,
    useFetchAllEodReportByIdAPI,
    useFetchProfileByIdAPI,
} from '../../api/adminInterns.api';

import type { InternPosition, InternshipStatus, } from '../../../../shared/types/enums.types';

import InternProfileBanner from './banner/InternProfileBanner';
import InfoSection, { InfoItem } from './components/InfoSection';
import HoursSummary from './components/HoursSummary';
import AttendanceLogTable from './components/AttendanceLogTable';
import EODReportsTable from './components/EODReportsTable';
import DeactivateInternModal from './components/DeactivateInternModal';

type InternInfoForProfile = {
    status?: InternshipStatus | null;
    intern_position?: InternPosition | null;
    required_hours?: number | string | null;
    start_date?: string | null;
    program?: string | null;
    university?: string | null;
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

function formatGender(value?: string | null) {
    switch (value) {
        case 'male':
            return 'Male';
        case 'female':
            return 'Female';
        case 'non-binary':
            return 'Non-binary';
        case 'prefer_not_to_say':
            return 'Prefer not to say';
        default:
            return value || '--';
    }
}

function formatDate(value?: string | null) {
    if (!value) return '--';

    return new Date(value).toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
    });
}

function formatFullName(profile: any) {
    const middleInitial = profile?.middle_name
        ? `${String(profile.middle_name).trim().charAt(0).toUpperCase()}.`
        : '';

    return [
        profile?.first_name,
        middleInitial,
        profile?.last_name,
        profile?.suffix,
    ]
        .filter(Boolean)
        .join(' ')
        .trim();
}

function getAttendanceHours(record: any, now: number) {
    const savedHours = Number(record.hours_logged || 0);

    if (record.clock_in && !record.clock_out) {
        const clockIn = new Date(record.clock_in).getTime();
        const diffMs = Math.max(now - clockIn, 0);
        const liveHours = diffMs / (1000 * 60 * 60);

        return savedHours + liveHours;
    }

    return savedHours;
}

function AdminInternProfile() {
    const { internId } = useParams();
    const navigate = useNavigate();

    const [now, setNow] = useState(Date.now());
    const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);

    const {
        data: profile,
        isLoading: isProfileLoading,
        isError: isProfileError,
        error: profileError,
        refetch: refetchProfile,
    } = useFetchProfileByIdAPI(internId || '');

    const {
        data: attendanceRecords = [],
        isLoading: isAttendanceLoading,
    } = useFetchAllAttendanceByIdAPI(internId || '');

    const {
        data: eodReports = [],
        isLoading: isEodLoading,
    } = useFetchAllEodReportByIdAPI(internId || '');

    const deactivateInternMutation = useDeactivateInternAPIMutation();

    useEffect(() => {
        document.title = 'Intern Profile | Intern Self Service';
    }, []);

    useEffect(() => {
        const timer = window.setInterval(() => {
            setNow(Date.now());
        }, 60_000);

        return () => window.clearInterval(timer);
    }, []);

    const fullName = useMemo(() => {
        if (!profile) return '--';
        return formatFullName(profile) || '--';
    }, [profile]);

    const internInfo = profile?.intern_info as InternInfoForProfile | undefined;

    const requiredHours = Number(internInfo?.required_hours || 0);

    const renderedHours = useMemo(() => {
        return attendanceRecords.reduce((total: number, record: any) => {
            return total + getAttendanceHours(record, now);
        }, 0);
    }, [attendanceRecords, now]);

    const reviewedEodReports = useMemo(() => {
        return eodReports.filter((report: any) => report.status !== 'draft');
    }, [eodReports]);

    const handleDeactivate = (reason: string) => {
        if (!internId) return;

        deactivateInternMutation.mutate(
            {
                intern_id: internId,
                deactivate_reason: reason,
            },
            {
                onSuccess: async () => {
                    setIsDeactivateModalOpen(false);
                    await refetchProfile();
                },
            }
        );
    };

    if (!internId) {
        return (
            <main className="min-h-screen bg-[#eeeeee] text-black lg:flex">
                <AdminSidebar />
                <section className="w-full px-4 pb-4 pt-20 sm:px-5 sm:pt-24 xl:ml-[270px] xl:px-6 xl:py-5">
                    <p className="text-sm text-red-600">Intern ID not found.</p>
                </section>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#eeeeee] text-black lg:flex">
            <AdminSidebar />

            <section className="w-full px-4 pb-4 pt-20 sm:px-5 sm:pt-24 xl:ml-[270px] xl:px-6 xl:py-5">
                <div className="mx-auto flex min-h-full w-full max-w-[2560px] flex-col gap-5">
                    {isProfileLoading && (
                        <div className="flex min-h-[420px] flex-col items-center justify-center gap-3">
                            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#EAF0FA] border-t-[#0058DD]" />
                            <p className="text-sm font-semibold text-[#002D6F]">
                                Loading intern profile...
                            </p>
                        </div>
                    )}

                    {isProfileError && (
                        <p className="py-16 text-center text-sm text-red-600">
                            {profileError instanceof Error
                                ? profileError.message
                                : 'Failed to load intern profile.'}
                        </p>
                    )}

                    {!isProfileLoading && !isProfileError && profile && (
                        <>
                            <InternProfileBanner
                                fullName={fullName}
                                program={internInfo?.program}
                                university={internInfo?.university}
                                email={profile.email}
                                contactNumber={profile.contact_number}
                                avatarUrl={profile.avatar_url}
                                status={internInfo?.status}
                                onBack={() => navigate('/admin/interns')}
                                onDeactivate={() =>
                                    setIsDeactivateModalOpen(true)
                                }
                            />

                            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.3fr_0.9fr]">
                                <InfoSection title="Intern Information">
                                    <InfoItem
                                        label="Internship Position"
                                        value={formatInternPosition(
                                            internInfo?.intern_position
                                        )}
                                    />
                                    <InfoItem
                                        label="Department"
                                        value={profile.department || '--'}
                                    />
                                    <InfoItem
                                        label="Office Location"
                                        value={profile.office || '--'}
                                    />
                                    <InfoItem
                                        label="Start Date"
                                        value={formatDate(
                                            internInfo?.start_date
                                        )}
                                    />
                                    <InfoItem
                                        label="Status"
                                        value={
                                            internInfo?.status ===
                                            'deactivated'
                                                ? 'Deactivated'
                                                : 'Active'
                                        }
                                    />
                                </InfoSection>

                                <InfoSection title="Additional Info">
                                    <InfoItem
                                        label="Gender"
                                        value={formatGender(profile.gender)}
                                    />
                                    <InfoItem
                                        label="Birthdate"
                                        value={formatDate(profile.birth_date)}
                                    />
                                    <InfoItem
                                        label="Address"
                                        value={profile.address || '--'}
                                        full
                                    />
                                </InfoSection>
                            </div>

                            <HoursSummary
                                requiredHours={requiredHours}
                                renderedHours={renderedHours}
                            />

                            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                                <AttendanceLogTable
                                    records={attendanceRecords}
                                    isLoading={isAttendanceLoading}
                                    internName={fullName}
                                    internSubtitle={`Intern - ${profile.department || '--'}`}
                                />

                                <EODReportsTable
                                    reports={eodReports}
                                    isLoading={isEodLoading}
                                    internName={fullName}
                                    internSubtitle={`Intern - ${profile.department || '--'}`}
                                />
                            </div>
                        </>
                    )}
                </div>
            </section>

            {isDeactivateModalOpen && profile && (
                <DeactivateInternModal
                    internName={fullName}
                    department={profile?.department}
                    isSubmitting={deactivateInternMutation.isPending}
                    onClose={() => setIsDeactivateModalOpen(false)}
                    onConfirm={handleDeactivate}
                />
            )}
        </main>
    );
}

export default AdminInternProfile;