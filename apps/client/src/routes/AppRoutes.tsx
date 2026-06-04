import React, { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { supabase } from '../config/supabase';
import { LoginPage } from '../features/login/Index';
import InternDashboard from '../features/dashboard/intern/InternDashboard';
import AdminDashboard from '../features/dashboard/admin/AdminDashboard';
import InternProfile from '../features/dashboard/intern/InternProfile';
import InternLeave from '../features/dashboard/intern/InternLeaveForm';
import InternLogs from '../features/dashboard/intern/InternLogs';
import type { Session } from '@supabase/supabase-js';

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

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;