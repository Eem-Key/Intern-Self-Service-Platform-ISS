import { useEffect } from 'react';
import AdminSidebar from '../AdminSidebar';
import type { 
    InternPosition,
    InternshipStatus,
    CompanyDepartment
} from '../../../../shared/types/enums.types';
import { usefetchAllInternListInformationAPI } from '../../api/adminInterns.api';

function AdminInternList() {
    const page: number = 1;
    const pageSize: number = 5;
    const search_value: string | null = null;
    const department: CompanyDepartment | null = null;
    const position: InternPosition | null = null;
    const status: InternshipStatus | null = null;
    const { data, isLoading, isFetching, isError, error } = usefetchAllInternListInformationAPI(
        page - 1,
        pageSize,
        search_value,
        department,
        position,
        status,
    );

    console.log('AdminInternList', data)

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