import { useEffect } from 'react';
import AdminSidebar from '../AdminSidebar';
import type { 
    InternPosition,
    InternshipStatus,
    CompanyDepartment
} from '../../../../shared/types/enums.types';
import { 
    useProgramProgressHours,
} from '../../api/profile.api';
import { 
    useFetchProfileByIdAPI,
    useFetchAllInternListInformationAPI,
    useFetchAllAttendanceByIdAPI,
    useFetchAllEodReportByIdAPI
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

    // const intern_id = '66f43717-d234-44dd-9f30-44b15a51fd1b'
    const intern_id = '2f961278-7887-4fea-a718-166b7da9ab69'
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

    useEffect(() => {
            document.title = 'Intern List | Intern Self Service';
            }, []);
    
            
    return (
        <main className="flex min-h-screen items-center justify-center bg-[#eeeeee]">
            <AdminSidebar />
        <h1 className="text-2xl font-bold text-black">Intern List</h1>
        </main>
    );
}

export default AdminInternList;