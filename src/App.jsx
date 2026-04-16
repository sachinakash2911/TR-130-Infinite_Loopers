import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext.jsx';
import Navbar from './components/Navbar.jsx';
import Toast from './components/Toast.jsx';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/Dashboard.jsx';
import AdminDashboardPage from './pages/AdminDashboard.jsx';
import ReportPage from './pages/ReportPage.jsx';
import MapPage from './pages/MapPage.jsx';
import FinderPage from './pages/FinderPage.jsx';

function ProtectedRoute({ children, role }) {
  const { user } = useAppContext();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to={user.role === 'admin' ? '/admin-dashboard' : '/user-dashboard'} replace />;
  }

  return children;
}

function AppRoutes() {
  const { user } = useAppContext();

  return (
    <BrowserRouter>
      {user && <Navbar />}
      <div className="min-h-screen bg-slate-950 text-slate-100 pb-10">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/user-dashboard"
            element={
              <ProtectedRoute role="user">
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute role="admin">
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/report"
            element={
              <ProtectedRoute role="user">
                <ReportPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/map"
            element={
              <ProtectedRoute role="admin">
                <MapPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/finder"
            element={
              <ProtectedRoute role="user">
                <FinderPage />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to={user ? (user.role === 'admin' ? '/admin-dashboard' : '/user-dashboard') : '/login'} replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
      <Toast />
    </BrowserRouter>
  );
}

export async function preloadHygieneModel() {
  const { loadModel } = await import('./utils/hygieneModel.js');
  await loadModel();
}

// Preload model on app start
preloadHygieneModel().catch(console.error);


export default function App() {
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  );
}
