import { useEffect } from 'react';
import AdminSidebar from '../AdminSidebar';
import type { 
    InternPosition,
    InternshipStatus,
    CompanyDepartment
} from '../../../../shared/types/enums.types';
import type { 
    ProfileInternInsert
} from '../../../../shared/types/profile.types';
import { 
    useProgramProgressHours,
} from '../../api/profile.api';
import { 
    useFetchProfileByIdAPI,
    useFetchAllInternListInformationAPI,
    useFetchAllAttendanceByIdAPI,
    useFetchAllEodReportByIdAPI,
    useInviteInternAPIMutation,
    useResendInviteInternAPIMutation,
    useDeactivateInternAPIMutation
} from '../../api/adminInterns.api';

function AdminInternList() {
    const page: number = 1;
    const pageSize: number = 5;
    const search_value: string | null = null;
    const department: CompanyDepartment | null = null;
    const position: InternPosition | null = null;
    const status: InternshipStatus | null = null;
    const { data, isLoading, isFetching, isError, error } = useFetchAllInternListInformationAPI(
        page - 1,
        pageSize,
        search_value,
        department,
        position,
        status,
    );

    console.log('AdminInternList', data)

    const intern_id = '66f43717-d234-44dd-9f30-44b15a51fd1b'
    // const intern_id = '2f961278-7887-4fea-a718-166b7da9ab69'
    const { data: profile, isLoading: isLoading2, isFetching: isFetching2, isError: isError2, error: error2 } = useFetchProfileByIdAPI(
        intern_id
    );
    
    console.log('AdminInternProfile', profile)

    const { data: progress, isLoading: isLoading3, isFetching: isFetching3, isError: isError3, error: error3 } = useProgramProgressHours(
        intern_id
    );
    
    console.log('AdminProgramProgress', progress)

    const { data: attendance, isLoading: isLoading4, isFetching: isFetching4, isError: isError4, error: error4 } = useFetchAllAttendanceByIdAPI(
        intern_id
    );
    
    console.log('AdminInternAttendance', attendance)

    const { data: eod_report, isLoading: isLoading5, isFetching: isFetching5, isError: isError5, error: error5 } = useFetchAllEodReportByIdAPI(
        intern_id
    );
    
    console.log('AdminInternEodReport', eod_report)

    const sampleIntern: ProfileInternInsert = {
        email: "ianmatthewyanga@gmail.com",
        first_name: "Juan",
        middle_name: "Rizal",
        last_name: "Dela Cruz",
        suffix: "Jr.",
        role: "intern",
        position: "Quality Assurance",
        department: "SDS",
        office: "makati",
        birth_date: "2002-05-15",
        gender: "male",
        contact_number: "09171234567",
        address: "123 Mabini St, Makati City",
        // Intern
        university: "University of the Philippines",
        year_level: 4,
        program: "BS Computer Science",
        required_hours: 600,
        start_date: "2026-07-01",
        intern_position: "frontend_developer"
    };

    const { mutate: invite, isPending } = useInviteInternAPIMutation();

    const handleInvite = (intern_data: ProfileInternInsert) => {
        invite(intern_data);
    };

    const email = 'ianmatthewyanga@gmail.com'

    const { mutate: resendInvite, isPending: isPending2 } = useResendInviteInternAPIMutation();

    const handleResendInvite = (email: string) => {
        resendInvite(email, {
            onSuccess: () => {
                alert(`New magic link sent to ${email}`);
            },
            onError: (error: any) => {
                alert(`Failed to resend: ${error.message}`);
            }
        });
    };

    const { mutate: deactivate, isPending: isPending3 } = useDeactivateInternAPIMutation();

    const handleDeactivateIntern = (intern_id: string, deactivate_reason: string) => {
        deactivate({ intern_id, deactivate_reason });
    };

    useEffect(() => {
            document.title = 'Intern List | Intern Self Service';
            }, []);
    
            
    return (
        <main className="flex min-h-screen items-center justify-center bg-[#eeeeee]">
            <AdminSidebar />
        <h1 className="text-2xl font-bold text-black">Intern List</h1>
            <button 
                onClick={() => handleInvite(sampleIntern)} 
                disabled={isPending}
                className="bg-blue-500 text-white p-2 rounded"
            >
                {isPending ? 'Sending...' : 'Invite New Intern'}
            </button>

            <button 
                onClick={() => handleResendInvite(email)} 
                disabled={isPending2}
                className="bg-green-500 text-white p-2 rounded ml-2"
            >
                {isPending2 ? 'Resending...' : 'Resend Invite'}
            </button>

            <button 
                onClick={() => handleDeactivateIntern(intern_id, 'completed eme eme')} 
                disabled={isPending3}
                className="bg-red-500 text-white p-2 rounded ml-2"
            >
                {isPending2 ? 'Resending...' : 'Deactivate Account'}
            </button>
        </main>
    );
}

export default AdminInternList;