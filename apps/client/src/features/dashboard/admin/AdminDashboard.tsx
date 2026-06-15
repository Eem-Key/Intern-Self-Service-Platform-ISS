import { useEffect, useState } from 'react';
import AdminSidebar from './components/AdminSidebar';
import type { 
    AttendanceWithName
} from '../../../../../shared/types/attendance.types';
import { 
    fetchActiveInternsAPI,
    fetchActiveAttendanceAPI,
    fetchAttendancePerDateRange
} from '../../../api/adminDashboard.api';
import {
    getAuthUserId
} from '../../../utils/auth.ts'

function AdminDashboard() {
    // TEMP
    const [all_attendance, setAllAttendance] = useState<AttendanceWithName[]>([]);
    interface DashboardStats {
        active_users: number;
        active_attendance: number;
        all_attendance: AttendanceWithName[];
    }
    const [stats, setStats] = useState<DashboardStats>({
        active_users: 0,
        active_attendance: 0,
        all_attendance: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        document.title = 'Dashboard | Intern Self Service';

        // TEMP
        async function loadData() {
            try {
                const userId = await getAuthUserId();
                if (!userId) {
                    console.warn("No user found, redirecting...");
                    return; 
                }
                const end_date = new Date().toISOString().split('T')[0];
                const start = new Date();
                start.setDate(start.getDate() - 7);
                const start_date = start.toISOString().split('T')[0];

                const [users, attendance, logs] = await Promise.all([
                    fetchActiveInternsAPI(),
                    fetchActiveAttendanceAPI(),
                    fetchAttendancePerDateRange(start_date, end_date)
                ]);

                setStats({
                    active_users: users as number,
                    active_attendance: attendance,
                    all_attendance: logs
                });
            } catch (err) {
                console.error("Auth error, redirecting or showing error...", err);
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, []);

    if (loading) return <div>Loading...</div>;

    return (
        <main className="min-h-screen bg-[#eeeeee] text-black lg:flex">
        <AdminSidebar />

        <section className="w-full px-4 py-4 sm:px-5 lg:ml-[270px] lg:px-6 lg:py-5">

            <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[1fr_0.95fr] xl:items-stretch">
            <div className="grid gap-5 xl:grid-rows-[1fr_1fr]">
                <div>Active Users: {stats.active_users}</div>
                <div>Active Attendance: {stats.active_attendance}</div>
                
                <div>
                    All Attendance: 
                    <pre className="text-xs">
                        {JSON.stringify(stats.all_attendance, null, 2)}
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