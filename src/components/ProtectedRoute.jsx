import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2 } from 'lucide-react'

export function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, student, adminConfig, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-neon-teal animate-spin" />
          <p className="text-gray-400 font-mono text-sm">Authenticating...</p>
        </div>
      </div>
    )
  }

  // No authenticated user at all — redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Admin route — requires adminConfig from admin_config table
  if (requireAdmin) {
    if (!adminConfig) {
      return <Navigate to="/login" state={{ from: location }} replace />
    }
    return children
  }

  // Student route — requires student data from students table + a completed sign-in
  if (!student) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

export function RedirectIfAuthenticated({ children }) {
  const { user, student, adminConfig, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-neon-teal animate-spin" />
          <p className="text-gray-400 font-mono text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  // Only redirect if the user exists AND has completed a full sign-in
  // (has either student data for students, or adminConfig for admins).
  // A bare Supabase auth user without student/adminConfig means the
  // session wasn't properly established — treat as unauthenticated.
  if (user) {
    if (adminConfig) {
      return <Navigate to="/admin" replace />
    }
    if (student) {
      return <Navigate to="/dashboard" replace />
    }
    // User exists but no student/adminConfig → let login page render
  }

  return children
}