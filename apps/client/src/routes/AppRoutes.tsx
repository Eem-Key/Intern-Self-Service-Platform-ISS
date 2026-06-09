import React, { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { supabase } from '../config/supabase';
import AdminDashboard from '../features/dashboard/admin/AdminDashboard';
import InternDashboard from '../features/dashboard/intern/InternDashboard';
import InternLeave from '../features/file-a-leave/InternLeaveForm';
import InternLogs from '../features/dashboard/intern/InternLogs';
import { LoginPage } from '../features/login/Index';
import InternProfile from '../features/profile/InternProfile';

import type { Session } from '@supabase/supabase-js';
import AdminActivityRecords from '../features/dashboard/admin/AdminActivityRecords';
import AdminApprovals from '../features/dashboard/admin/AdminApprovals';
import AdminInternList from '../features/dashboard/admin/AdminInternList';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const accessToken = localStorage.getItem('accessToken');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-gray-500">Loading authorization...</p>
      </div>
    );
  }

  if (!session && !accessToken) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/intern/dashboard"
          element={
            <ProtectedRoute>
              <InternDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/intern/profile"
          element={
            <ProtectedRoute>
              <InternProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/intern/leave"
          element={
            <ProtectedRoute>
              <InternLeave />
            </ProtectedRoute>
          }
        />

        <Route
          path="/intern/logs"
          element={
            <ProtectedRoute>
              <InternLogs />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/interns"
          element={
            <ProtectedRoute>
              <AdminInternList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/approvals"
          element={
            <ProtectedRoute>
              <AdminApprovals />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/activity-records"
          element={
            <ProtectedRoute>
              <AdminActivityRecords />
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;