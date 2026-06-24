import React, { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { supabase } from '../config/supabase';
import InternLogs from '../features/activity-logs/InternLogs';
import AdminDashboard from '../features/dashboard/admin/AdminDashboard';
import InternDashboard from '../features/dashboard/intern/InternDashboard';
import InternLeave from '../features/file-a-leave/InternLeaveForm';
import { LoginPage } from '../features/login/Index';
import InternProfile from '../features/profile/InternProfile';

import type { Session } from '@supabase/supabase-js';
import AdminActivityRecords from '../features/activity-records/AdminActivityRecords';
import AdminApprovals from '../features/approvals/AdminApprovals';
import AdminInternList from '../features/intern-list/AdminInternList';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const validateUser = async (currentSession: Session | null) => {
    if (!currentSession) {
      setSession(null);
      setLoading(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', currentSession.user.id)
      .single();

    if (profileError || !profile) {
      await supabase.auth.signOut();
      setSession(null);
      setLoading(false);
      return;
    }

    if (profile.role?.toLowerCase() === 'intern') {
      const { data: intern, error: internError } = await supabase
        .from('interns')
        .select('status')
        .eq('id', currentSession.user.id)
        .single();

      if (internError || intern?.status === 'deactivated') {
        await supabase.auth.signOut();
        setSession(null);
      } else {
        setSession(currentSession);
      }
    } else {
      setSession(currentSession);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      validateUser(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      validateUser(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-white"><p>Loading...</p></div>;
  }

  if (!session) {
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