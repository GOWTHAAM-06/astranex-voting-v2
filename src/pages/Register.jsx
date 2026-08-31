import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { APP_NAME, ELECTION_YEAR } from '@/lib/constants'
import { UserPlus, Shield, AlertTriangle, Loader2, Eye, EyeOff, CheckCircle, ArrowLeft } from 'lucide-react'

const DEPARTMENTS = [
  'Computer Science and Engineering',
  'Information Technology',
  'Artificial Intelligence and Data Science',
  'Cybersecurity',
]

const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year']

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    studentNumber: '',
    email: '',
    department: '',
    year: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()
  const { signUp } = useAuth()

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!formData.name || !formData.studentNumber || !formData.email || !formData.department || !formData.year || !formData.password) {
      setError('All fields are required.')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address.')
      return
    }

    setLoading(true)

    const result = await signUp({
      name: formData.name,
      studentNumber: formData.studentNumber.toUpperCase(),
      email: formData.email.toLowerCase(),
      department: formData.department,
      year: formData.year,
      password: formData.password,
    })

    if (result.success) {
      setSuccess(true)
      setTimeout(() => {
        navigate('/dashboard', { replace: true })
      }, 2000)
    } else {
      setError(result.error)
    }

    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,240,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
        <div className="text-center animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-neon-emerald/20 border-2 border-neon-emerald/40 mb-6">
            <CheckCircle className="w-10 h-10 text-neon-emerald" />
          </div>
          <h2 className="text-3xl font-black uppercase italic tracking-wider text-white mb-2">
            Registration <span className="neon-text-emerald">Successful</span>
          </h2>
          <p className="text-gray-400">Redirecting to your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,240,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-neon-teal/5 rounded-full blur-[128px]" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-neon-emerald/5 rounded-full blur-[128px]" />

      <div className="w-full max-w-lg relative z-10 animate-fade-in">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-neon-teal/20 to-neon-teal/5 border border-neon-teal/30 mb-3 glow-border">
            <UserPlus className="w-7 h-7 text-neon-teal" />
          </div>
          <h1 className="text-2xl font-black uppercase italic tracking-widest text-white">
            <span className="neon-text">REGISTER</span> TO VOTE
          </h1>
          <p className="text-gray-400 font-mono text-xs mt-1">{APP_NAME} | {ELECTION_YEAR} Pre-Election Registration</p>
        </div>

        {/* STRICT POLICY DISCLAIMER */}
        <div className="p-4 rounded-xl bg-red-500/15 border-2 border-red-500/40 mb-6 animate-glow-pulse">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-red-400 font-bold uppercase tracking-wider text-sm">⚠ Strict Policy — Read Carefully</h4>
              <p className="text-red-300 text-sm mt-1 leading-relaxed">
                Remember your chosen password. If you forget your credentials, you will not be able to access the voting arena on election day. 
                The department will <span className="font-bold underline">not</span> be able to recover or reset your password. 
                Store it securely.
              </p>
            </div>
          </div>
        </div>

        {/* Registration Form */}
        <div className="glass-card p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wider font-mono">
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={handleChange('name')}
                placeholder="e.g., John Doe"
                className="input-neon"
                autoFocus
                required
              />
            </div>

            {/* Student Number */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wider font-mono">
                Student / Roll Number
              </label>
              <input
                type="text"
                value={formData.studentNumber}
                onChange={handleChange('studentNumber')}
                placeholder="e.g., STU-2024-0001"
                className="input-neon font-mono text-sm"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wider font-mono">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={handleChange('email')}
                placeholder="e.g., john.doe@university.edu"
                className="input-neon"
                required
              />
            </div>

            {/* Department & Year Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wider font-mono">
                  Department
                </label>
                <select
                  value={formData.department}
                  onChange={handleChange('department')}
                  className="input-neon"
                  required
                >
                  <option value="" disabled>Select...</option>
                  {DEPARTMENTS.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wider font-mono">
                  Year
                </label>
                <select
                  value={formData.year}
                  onChange={handleChange('year')}
                  className="input-neon"
                  required
                >
                  <option value="" disabled>Select...</option>
                  {YEARS.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wider font-mono">
                Choose a Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange('password')}
                  placeholder="Min. 6 characters"
                  className="input-neon pr-12"
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-neon-teal transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wider font-mono">
                Confirm Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleChange('confirmPassword')}
                placeholder="Re-enter your password"
                className={`input-neon ${formData.confirmPassword && formData.password !== formData.confirmPassword ? 'border-red-500/60 focus:border-red-500' : ''}`}
                minLength={6}
                required
              />
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-red-400 text-xs mt-1 font-mono">Passwords do not match</p>
              )}
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-neon w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <UserPlus className="w-5 h-5" />
              )}
              {loading ? 'Registering...' : 'Register & Continue'}
            </button>

            <div className="text-center mt-4">
              <Link
                to="/login"
                className="text-sm text-gray-500 hover:text-neon-teal transition-colors font-mono inline-flex items-center gap-1"
              >
                <ArrowLeft className="w-3 h-3" />
                Already registered? Sign in
              </Link>
            </div>
          </form>
        </div>

        <p className="text-center text-gray-600 text-xs mt-4 font-mono">
          By registering, you agree to the election guidelines and code of conduct.
        </p>
      </div>
    </div>
  )
}