import React, { useEffect, useRef, useState } from 'react';
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';
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
import AdminAddIntern from '../features/intern-list/AdminAddIntern';
import AdminInternProfile from '../features/intern-list/InternProfile';

type ProtectedRouteProps = {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireIntern?: boolean;
};

function ForbiddenPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#eeeeee] px-6 text-center">
      <h1 className="text-8xl font-extrabold text-[#002D6F] sm:text-9xl">
        403
      </h1>

      <h2 className="mt-4 text-2xl font-bold text-black sm:text-3xl">
        Forbidden
      </h2>

      <p className="mt-3 max-w-md text-sm leading-relaxed text-gray-500 sm:text-base">
        You do not have permission to access this page.
      </p>

      <button
        type="button"
        onClick={() => window.history.back()}
        className="mt-8 rounded-full bg-[#FFBF10] px-8 py-2.5 text-sm font-bold text-black transition hover:bg-[#e8a900]"
      >
        Go Back
      </button>
    </main>
  );
}

function ProtectedRoute({
  children,
  requireAdmin = false,
  requireIntern = false,
}: ProtectedRouteProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isForbidden, setIsForbidden] = useState(false);

  const validateUser = async (currentSession: Session | null) => {
    setLoading(true);
    setIsForbidden(false);

    try {
      if (!currentSession) {
        setSession(null);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', currentSession.user.id)
        .maybeSingle();

      if (profileError || !profile) {
        await supabase.auth.signOut();
        setSession(null);
        return;
      }

      const role = profile.role?.toLowerCase();

      if (requireAdmin && role !== 'admin') {
        setSession(currentSession);
        setIsForbidden(true);
        return;
      }

      if (requireIntern && role !== 'intern') {
        setSession(currentSession);
        setIsForbidden(true);
        return;
      }

      setSession(currentSession);
    } catch (error) {
      console.error('Session validation failed:', error);
      await supabase.auth.signOut();
      setSession(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (isMounted) {
        await validateUser(session);
      }
    };

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) {
        validateUser(session);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [requireAdmin, requireIntern]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <p>Loading...</p>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (isForbidden) {
    return <ForbiddenPage />;
  }

  return children;
}

function AccountStatusGuard({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  const [isDeactivated, setIsDeactivated] = useState(false);
  const logoutTimerRef = useRef<number | null>(null);
  const isLoggingOutRef = useRef(false);
  const isDeactivatedRef = useRef(false);
  

  const blockAndLogout = async () => {
    if (isLoggingOutRef.current) return;

    isDeactivatedRef.current = true;
    setIsDeactivated(true);

    document.body.style.cursor = 'not-allowed';

    if (logoutTimerRef.current) {
      window.clearTimeout(logoutTimerRef.current);
    }

    logoutTimerRef.current = window.setTimeout(async () => {
      isLoggingOutRef.current = true;

      await supabase.auth.signOut();

      document.body.style.cursor = '';
      isDeactivatedRef.current = false;
      setIsDeactivated(false);
      logoutTimerRef.current = null;
      isLoggingOutRef.current = false;
    }, 8000);
  };

  const checkInternStatus = async () => {
    if (isLoggingOutRef.current || isDeactivatedRef.current) return;

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) return;

    console.log('CURRENT AUTH USER ID:', session.user.id);

    const { data: intern, error } = await supabase
      .from('interns')
      .select('id, status')
      .eq('id', session.user.id)
      .maybeSingle();

    if (error) {
      console.error('Unable to check intern status:', error);
      return;
    }

    // Admins usually have no row in interns table, so ignore them.
    if (!intern) return;

    const status = String(intern.status || '').toLowerCase().trim();

    console.log('CURRENT INTERN ROW:', intern);
    console.log('CURRENT INTERN STATUS:', status);

    if (status === 'deactivated') {
      await blockAndLogout();
    }
  };

  useEffect(() => {
    checkInternStatus();
  }, [location.pathname]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      checkInternStatus();
    }, 2000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const handleGlobalClick = (event: MouseEvent) => {
      if (isDeactivatedRef.current || isLoggingOutRef.current) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      checkInternStatus();
    };

    document.addEventListener('click', handleGlobalClick, true);
    document.addEventListener('mousedown', handleGlobalClick, true);

    return () => {
      document.removeEventListener('click', handleGlobalClick, true);
      document.removeEventListener('mousedown', handleGlobalClick, true);
    };
  }, []);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        document.body.style.cursor = '';
        isDeactivatedRef.current = false;
        setIsDeactivated(false);
        return;
      }

      checkInternStatus();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const subscribeToInternStatus = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) return;

      channel = supabase
        .channel(`intern-status-watch-${session.user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'interns',
            filter: `id=eq.${session.user.id}`,
          },
          (payload) => {
            const newStatus = String(payload.new?.status || '')
              .toLowerCase()
              .trim();

            console.log('REALTIME INTERN STATUS:', newStatus);

            if (newStatus === 'deactivated') {
              blockAndLogout();
            }
          }
        )
        .subscribe();
    };

    subscribeToInternStatus();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      document.body.style.cursor = '';

      if (logoutTimerRef.current) {
        window.clearTimeout(logoutTimerRef.current);
      }
    };
  }, []);

  return (
    <>
      <div
        className={
          isDeactivated
            ? 'pointer-events-none select-none'
            : ''
        }
        style={isDeactivated ? { cursor: 'not-allowed' } : undefined}
        aria-hidden={isDeactivated}
      >
        {children}
      </div>

      {isDeactivated && <AccountDeactivatedModal />}
    </>
  );
}

function AccountDeactivatedModal() {
  return (
    <div className="fixed inset-0 z-[99999] flex cursor-not-allowed items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
      <div className="pointer-events-none w-full max-w-[530px] overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="bg-gradient-to-r from-[#005de8] to-[#003d8f] px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FFBF10] text-sm font-black text-[#002D6F]">
              !
            </div>

            <h2 className="text-xl font-bold text-white sm:text-2xl">
              Account No Longer Active
            </h2>
          </div>
        </div>

        <div className="px-6 py-7">
          <p className="text-sm leading-relaxed text-black">
            Your intern account has been deactivated. Access to the Intern
            Self-Service Portal is no longer available.
          </p>

          <p className="mt-4 text-xs font-medium text-gray-500">
            You will be logged out automatically in a few seconds...
          </p>
        </div>
      </div>
    </div>
  );
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <AccountStatusGuard>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/intern/dashboard"
            element={
              <ProtectedRoute requireIntern>
                <InternDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/intern/profile"
            element={
              <ProtectedRoute requireIntern>
                <InternProfile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/intern/leave"
            element={
              <ProtectedRoute requireIntern>
                <InternLeave />
              </ProtectedRoute>
            }
          />

          <Route
            path="/intern/logs"
            element={
              <ProtectedRoute requireIntern>
                <InternLogs />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requireAdmin>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/interns"
            element={
              <ProtectedRoute requireAdmin>
                <AdminInternList />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/interns/add"
            element={
              <ProtectedRoute requireAdmin>
                <AdminAddIntern />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/interns/:internId"
            element={
              <ProtectedRoute requireAdmin>
                <AdminInternProfile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/approvals"
            element={
              <ProtectedRoute requireAdmin>
                <AdminApprovals />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/activity-records"
            element={
              <ProtectedRoute requireAdmin>
                <AdminActivityRecords />
              </ProtectedRoute>
            }
          />

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AccountStatusGuard>
    </BrowserRouter>
  );
}

export default AppRoutes;