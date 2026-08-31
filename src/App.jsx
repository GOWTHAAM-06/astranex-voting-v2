import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { ProtectedRoute, RedirectIfAuthenticated } from '@/components/ProtectedRoute'
import { Loader2 } from 'lucide-react'

const Login = lazy(() => import('@/pages/Login'))
const Register = lazy(() => import('@/pages/Register'))
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const Vote = lazy(() => import('@/pages/Vote'))
const Confirmation = lazy(() => import('@/pages/Confirmation'))
const Admin = lazy(() => import('@/pages/Admin'))

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-dark-900">
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="w-8 h-8 text-neon-teal animate-spin" />
      <p className="text-gray-400 font-mono text-sm">Loading module...</p>
    </div>
  </div>
)

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Public routes */}
            <Route 
              path="/login" 
              element={
                <RedirectIfAuthenticated>
                  <Login />
                </RedirectIfAuthenticated>
              } 
            />
            
            <Route 
              path="/register" 
              element={
                <RedirectIfAuthenticated>
                  <Register />
                </RedirectIfAuthenticated>
              } 
            />

            {/* Protected routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/vote" 
              element={
                <ProtectedRoute>
                  <Vote />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/admin" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <Admin />
                </ProtectedRoute>
              } 
            />

            {/* Confirmation - accessible without auth (session was destroyed) */}
            <Route path="/confirmation" element={<Confirmation />} />

            {/* Fallback */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  )
}
