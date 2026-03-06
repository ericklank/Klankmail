import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './hooks/useAuth.jsx'
import Layout from './components/Layout.jsx'
import LoginPage from './pages/LoginPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import AnalyzePage from './pages/AnalyzePage.jsx'
import ReportPage from './pages/ReportPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import AdminPage from './pages/AdminPage.jsx'
import SharedReportPage from './pages/SharedReportPage.jsx'

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>Loading…</div>
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}

function AppRoutes() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--bg-elevated)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-light)',
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: 'var(--green)', secondary: 'var(--bg)' } },
          error: { iconTheme: { primary: 'var(--red)', secondary: 'var(--bg)' } },
        }}
      />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/report/:id" element={<SharedReportPage />} />
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/analyze" replace />} />
          <Route path="analyze" element={<AnalyzePage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="report/:id" element={<ReportPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="admin" element={<AdminPage />} />
        </Route>
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
