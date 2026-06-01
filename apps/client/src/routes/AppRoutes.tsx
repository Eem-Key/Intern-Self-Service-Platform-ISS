import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { LoginPage } from '../features/login/Index';

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* Temporary dashboard route */}
        <Route
          path="/dashboard"
          element={
            <div className="flex min-h-screen items-center justify-center bg-white">
              <h1 className="text-2xl font-bold text-black">Dashboard</h1>
            </div>
          }
        />

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;