import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { APP_NAME, APP_TAGLINE, ELECTION_YEAR } from '@/lib/constants'
import { 
  LogIn, Shield, Eye, EyeOff, Loader2, Users, 
  Lock, Key, Terminal, UserCheck, ChevronRight
} from 'lucide-react'

export default function Login() {
  const [accessMode, setAccessMode] = useState('student') // 'student' | 'admin'
  const [studentNumber, setStudentNumber] = useState('')
  const [password, setPassword] = useState('')
  const [adminUsername, setAdminUsername] = useState('')
  const [adminPasskey, setAdminPasskey] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { signIn, adminSignIn } = useAuth()

  const handleStudentLogin = async (e) => {
    e.preventDefault()
    setError('')
    if (!studentNumber || !password) {
      setError('Please enter your student number and password.')
      return
    }
    setLoading(true)
    const result = await signIn(studentNumber, password)
    if (result.success) {
      navigate('/dashboard', { replace: true })
    } else {
      setError(result.error)
    }
    setLoading(false)
  }

  const handleAdminLogin = async (e) => {
    e.preventDefault()
    setError('')
    if (!adminUsername || !adminPasskey) {
      setError('Please enter your command identity and secure passkey.')
      return
    }
    setLoading(true)
    const result = await adminSignIn(adminUsername, adminPasskey)
    if (result.success) {
      navigate('/admin', { replace: true })
    } else {
      setError(result.error)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Background grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,240,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />

      {/* ======= LEFT PANEL ======= */}
      <div className="hidden lg:flex w-1/2 relative flex-col justify-between p-12">
        {/* Glowing orbs — layered for depth */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-neon-teal/8 rounded-full blur-[128px] animate-float" style={{ animationDuration: '6s' }} />
        <div className="absolute bottom-1/4 -left-16 w-80 h-80 bg-neon-emerald/5 rounded-full blur-[100px] animate-float" style={{ animationDuration: '8s', animationDelay: '2s' }} />
        <div className="absolute top-2/3 left-1/3 w-48 h-48 bg-neon-purple/4 rounded-full blur-[80px] animate-float" style={{ animationDuration: '10s', animationDelay: '4s' }} />

        {/* Top branding */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-neon-teal/20 to-neon-teal/5 border border-neon-teal/30 flex items-center justify-center">
              <Shield className="w-6 h-6 text-neon-teal" />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase italic tracking-widest text-white">
                <span className="neon-text">{APP_NAME}</span>
              </h2>
              <p className="text-gray-500 font-mono text-xs">{APP_TAGLINE}</p>
            </div>
          </div>
        </div>

        {/* Big hero typography */}
        <div className="relative z-10">
          <h1 className="text-6xl lg:text-7xl xl:text-8xl font-black uppercase italic leading-[0.9] tracking-tighter">
            <span className="text-white">ASTRA</span><span style={{ background: 'linear-gradient(135deg, #00F0FF 0%, #00FF88 50%, #00F0FF 100%)', backgroundSize: '200% auto', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', animation: 'shimmer 3s linear infinite' }}>NEX</span>
            <br />
            <span style={{ background: 'linear-gradient(135deg, #00F0FF 0%, #8B5CF6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>2026</span>
          </h1>
          <div className="mt-6 space-y-2">
            <p className="text-3xl font-bold uppercase italic tracking-widest text-white/90">
              LEAD THE <span className="neon-text-emerald">EVOLUTION</span>
            </p>
            <p className="text-gray-400 text-lg max-w-md leading-relaxed">
              Cast your vote for the next generation of department leadership. 
              Every voice shapes the future.
            </p>
          </div>
        </div>

        {/* Bottom metric cards */}
        <div className="relative z-10 grid grid-cols-3 gap-4">
          <div className="glass-card p-4 text-center">
            <Shield className="w-5 h-5 text-neon-teal mx-auto mb-2" />
            <p className="text-neon-teal font-bold font-mono text-lg">256-BIT</p>
            <p className="text-gray-500 text-xs uppercase tracking-wider">Secured</p>
          </div>
          <div className="glass-card p-4 text-center">
            <Users className="w-5 h-5 text-neon-emerald mx-auto mb-2" />
            <p className="text-neon-emerald font-bold font-mono text-lg">8</p>
            <p className="text-gray-500 text-xs uppercase tracking-wider">Portfolios</p>
          </div>
          <div className="glass-card p-4 text-center">
            <Lock className="w-5 h-5 text-neon-amber mx-auto mb-2" />
            <p className="text-neon-amber font-bold font-mono text-lg">AES</p>
            <p className="text-gray-500 text-xs uppercase tracking-wider">Encrypted</p>
          </div>
        </div>
      </div>

      {/* ======= RIGHT PANEL ======= */}
      <div className="w-full lg:w-1/2 min-h-screen flex items-center justify-center p-4 md:p-8 relative">
        {/* Glowing orb for right side */}
        <div className="absolute top-1/3 -right-32 w-96 h-96 bg-neon-purple/5 rounded-full blur-[128px]" />

        <div className="w-full max-w-md relative z-10 animate-fade-in">
          {/* Mobile brand (visible only on small screens) */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-neon-teal/20 to-neon-teal/5 border border-neon-teal/30 mb-3 glow-border">
              <Shield className="w-7 h-7 text-neon-teal" />
            </div>
            <h1 className="text-2xl font-black uppercase italic tracking-widest">
              <span className="neon-text">{APP_NAME}</span>
              <span className="text-white"> 2026</span>
            </h1>
            <p className="text-gray-500 font-mono text-xs mt-1">{APP_TAGLINE}</p>
          </div>

          {/* Glass container */}
          <div className="glass-card p-6 md:p-8">
            {/* Toggle Pill */}
            <div className="flex p-1 rounded-xl bg-dark-700/70 border border-dark-500/50 mb-8">
              <button
                onClick={() => { setAccessMode('student'); setError('') }}
                className={`
                  flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold 
                  transition-all duration-300 font-mono uppercase tracking-wider
                  ${accessMode === 'student' 
                    ? 'bg-gradient-to-r from-neon-teal/20 to-neon-teal/10 text-neon-teal border border-neon-teal/30 shadow-[0_0_20px_rgba(0,240,255,0.1)]' 
                    : 'text-gray-400 hover:text-white'
                  }
                `}
              >
                <UserCheck className="w-4 h-4" />
                Student Access
              </button>
              <button
                onClick={() => { setAccessMode('admin'); setError('') }}
                className={`
                  flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold 
                  transition-all duration-300 font-mono uppercase tracking-wider
                  ${accessMode === 'admin' 
                    ? 'bg-gradient-to-r from-neon-amber/20 to-neon-amber/10 text-neon-amber border border-neon-amber/30 shadow-[0_0_20px_rgba(255,184,0,0.1)]' 
                    : 'text-gray-400 hover:text-white'
                  }
                `}
              >
                <Terminal className="w-4 h-4" />
                Admin Command
              </button>
            </div>

            {/* Student Access Form */}
            {accessMode === 'student' ? (
              <form onSubmit={handleStudentLogin} className="space-y-5">
                <div className="text-center mb-2">
                  <h2 className="text-xl font-bold text-white uppercase italic tracking-wider">
                    Student Sign In
                  </h2>
                  <p className="text-gray-500 text-sm mt-1">Enter your registration credentials</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wider font-mono">
                    Student / Roll Number
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      value={studentNumber}
                      onChange={(e) => setStudentNumber(e.target.value.toUpperCase())}
                      placeholder="e.g., STU-2024-0001"
                      className="input-neon pl-10 font-mono text-sm"
                      autoFocus
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wider font-mono">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="input-neon pl-10 pr-12"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-neon-teal transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
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
                    <LogIn className="w-5 h-5" />
                  )}
                  {loading ? 'Authenticating...' : 'Access Voting Arena'}
                </button>

                <div className="text-center mt-4">
                  <Link
                    to="/register"
                    className="text-sm text-gray-500 hover:text-neon-teal transition-colors font-mono inline-flex items-center gap-1"
                  >
                    New voter? Register here
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </form>
            ) : (
              /* Admin Command Form */
              <form onSubmit={handleAdminLogin} className="space-y-5">
                <div className="text-center mb-2">
                  <h2 className="text-xl font-bold text-white uppercase italic tracking-wider">
                    <span className="neon-text-amber">Command</span> Access
                  </h2>
                  <p className="text-gray-500 text-sm mt-1">Authorized personnel only</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wider font-mono">
                    Command Identity (Username)
                  </label>
                  <div className="relative">
                    <Terminal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      value={adminUsername}
                      onChange={(e) => setAdminUsername(e.target.value)}
                      placeholder="Admin username or email"
                      className="input-neon pl-10 font-mono text-sm"
                      autoFocus
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wider font-mono">
                    Secure Passkey
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={adminPasskey}
                      onChange={(e) => setAdminPasskey(e.target.value)}
                      placeholder="Enter passkey"
                      className="input-neon pl-10 pr-12"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-neon-amber transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 font-semibold rounded-xl 
                    bg-gradient-to-r from-neon-amber/20 to-neon-amber/10 border border-neon-amber/40 
                    text-neon-amber transition-all duration-300
                    hover:from-neon-amber/30 hover:to-neon-amber/20 hover:border-neon-amber/60
                    hover:shadow-[0_0_30px_rgba(255,184,0,0.2)] active:scale-95
                    disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Terminal className="w-5 h-5" />
                  )}
                  {loading ? 'Authenticating...' : 'INITIATE COMMAND'}
                </button>

                <div className="text-center mt-4">
                  <button
                    type="button"
                    onClick={() => { setAccessMode('student'); setError(''); setAdminUsername(''); setAdminPasskey('') }}
                    className="text-sm text-gray-500 hover:text-neon-teal transition-colors font-mono inline-flex items-center gap-1"
                  >
                    <ChevronRight className="w-3 h-3" />
                    Switch to Student Access
                  </button>
                </div>
              </form>
            )}
          </div>

          <p className="text-center text-gray-600 text-xs mt-4 font-mono">
            Authorized access only. All votes are encrypted and secured.
          </p>
        </div>
      </div>
    </div>
  )
}