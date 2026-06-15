import AdminSidebar from './components/AdminSidebar';
import { useEffect } from 'react';
import { 
    fetchActiveInternsAPI,
    fetchActiveAttendanceAPI,
    fetchAttendancePerDateRange
} from '../../../api/adminDashboard.api';


const active_users = await fetchActiveInternsAPI()

const active_attendace = await fetchActiveAttendanceAPI()

const end_date = new Date().toISOString().split('T')[0]; 

const start = new Date();
start.setDate(start.getDate() - 7);
const start_date = start.toISOString().split('T')[0];

const all_attendance = await fetchAttendancePerDateRange(start_date, end_date)

function AdminDashboard() {

    useEffect(() => {
        document.title = 'Dashboard | Intern Self Service';
        }, []);

    return (
        <main className="min-h-screen bg-[#eeeeee] text-black lg:flex">
        <AdminSidebar />

        <section className="w-full px-4 py-4 sm:px-5 lg:ml-[270px] lg:px-6 lg:py-5">

            <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[1fr_0.95fr] xl:items-stretch">
            <div className="grid gap-5 xl:grid-rows-[1fr_1fr]">
                <div>Active Users: {active_users}</div>
                <div>Active Attendance: {active_attendace}</div>
                
                <div>
                    All Attendance: 
                    <pre className="text-xs">
                        {JSON.stringify(all_attendance, null, 2)}
                    </pre>
                </div>
            </div>

            <div className="grid gap-5 xl:grid-rows-[auto_1fr]">
            </div>
            </div>
        </section>
        </main>
    );
}

export default AdminDashboard;