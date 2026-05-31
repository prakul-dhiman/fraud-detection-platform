import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Toaster, toast } from 'sonner';
import { io } from 'socket.io-client';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import SinglePredict from './pages/SinglePredict';
import BulkUpload from './pages/BulkUpload';
import History from './pages/History';
import AdminPanel from './pages/AdminPanel';
import Landing from './pages/Landing';
import AlertCenter from './pages/AlertCenter';
import OnboardingWizard from './components/OnboardingWizard';
import GlobalSearch from './components/GlobalSearch';
import Reports from './pages/Reports';
import ApiPlayground from './pages/ApiPlayground';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import Billing from './pages/Billing';
import Support from './pages/Support';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Security from './pages/Security';
import Status from './pages/Status';

/* ------------------------------------------------------------------ */
/*  Route Guards                                                         */
/* ------------------------------------------------------------------ */

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0a0f' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="spinner-lg" />
          <p className="text-white/40 text-sm">Loading FraudShield…</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0a0f' }}>
        <div className="spinner-lg" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0a0f' }}>
        <div className="spinner-lg" />
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
}

/* ------------------------------------------------------------------ */
/*  Authenticated Layout                                                 */
/* ------------------------------------------------------------------ */

function AppLayout({ children }) {
  return (
    <div className="flex min-h-screen" style={{ background: '#0a0a0f' }}>
      <Sidebar />
      <main
        className="flex-1 overflow-auto pb-16 lg:pb-0 lg:ml-[240px]"
      >
        <Topbar />
        <div className="min-h-screen p-6 lg:p-8">
          {children}
        </div>
      </main>
      <GlobalSearch />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  App Component                                                        */
/* ------------------------------------------------------------------ */

export default function App() {
  useEffect(() => {
    const socket = io('http://localhost:5000');
    
    socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    socket.on('new_fraud_alert', (data) => {
      toast.error('High Risk Fraud Detected', {
        description: data?.message || 'A new fraudulent transaction has been flagged.',
        duration: 5000,
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <>
      <Toaster theme="dark" position="top-right" />
      <Routes>
      {/* Public routes */}
      <Route
        path="/"
        element={
          <PublicRoute>
            <Landing />
          </PublicRoute>
        }
      />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      {/* Protected routes */}
      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <OnboardingWizard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Dashboard />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/predict"
        element={
          <ProtectedRoute>
            <AppLayout>
              <SinglePredict />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/bulk"
        element={
          <ProtectedRoute>
            <AppLayout>
              <BulkUpload />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <AppLayout>
              <History />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/alerts"
        element={
          <ProtectedRoute>
            <AppLayout>
              <AlertCenter />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Reports />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/api-playground"
        element={
          <ProtectedRoute>
            <AppLayout>
              <ApiPlayground />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Settings />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Profile />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/billing"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Billing />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/support"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Support />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Admin routes */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AppLayout>
              <AdminPanel />
            </AppLayout>
          </AdminRoute>
        }
      />

      {/* Fallback & Footer Pages */}
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/security" element={<Security />} />
      <Route path="/status" element={<Status />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  );
}
