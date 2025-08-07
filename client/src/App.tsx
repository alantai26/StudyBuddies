import { AuthProvider } from '@/context/AuthContext.tsx';
import { Toaster } from 'react-hot-toast';
import { Routes, Route, Outlet } from 'react-router-dom';

import LandingPage from '@/pages/LandingPage.tsx';
import LoginPage from '@/pages/LoginPage.tsx';
import RegisterPage from '@/pages/RegisterPage.tsx';
import DashboardPage from '@/pages/DashboardPage.tsx';
import Navbar from '@/components/Navbar.tsx';
import ProtectedRoute from '@/components/ProtectedRoute.tsx';

const AppLayout = () => (
  <>
    <Navbar />
    <Outlet />
  </>
);

function App() {
  return (
    <AuthProvider>
      <Toaster />
      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route element={<AppLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
