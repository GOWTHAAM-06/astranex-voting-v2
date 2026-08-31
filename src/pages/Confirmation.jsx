import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, Shield, Vote, ArrowLeft, Sparkles } from 'lucide-react'
import { APP_NAME, ELECTION_YEAR } from '@/lib/constants'

// Confetti particle generator
function ConfettiBurst() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const colors = ['#00F0FF', '#00FF88', '#FFB800', '#8B5CF6', '#FF006E', '#ffffff']
    const particles = Array.from({ length: 80 }, () => ({
      x: canvas.width / 2 + (Math.random() - 0.5) * 200,
      y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 12,
      vy: -(Math.random() * 12 + 4),
      size: Math.random() * 8 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 8,
      opacity: 1,
      gravity: 0.3 + Math.random() * 0.2,
      shape: Math.random() > 0.5 ? 'rect' : 'circle',
    }))

    let animId
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      let allDead = true

      particles.forEach(p => {
        if (p.opacity <= 0) return
        allDead = false
        p.x += p.vx
        p.y += p.vy
        p.vy += p.gravity
        p.vx *= 0.99
        p.rotation += p.rotationSpeed
        p.opacity -= 0.008

        ctx.save()
        ctx.globalAlpha = Math.max(0, p.opacity)
        ctx.translate(p.x, p.y)
        ctx.rotate((p.rotation * Math.PI) / 180)
        ctx.fillStyle = p.color

        if (p.shape === 'rect') {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2)
        } else {
          ctx.beginPath()
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.restore()
      })

      if (!allDead) {
        animId = requestAnimationFrame(draw)
      }
    }

    animId = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(animId)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-20"
      style={{ opacity: 0.9 }}
    />
  )
}

export default function Confirmation() {
  const navigate = useNavigate()

  useEffect(() => {
    // Push a new history state to prevent back navigation
    window.history.pushState(null, '', window.location.href)
    
    const handlePopState = () => {
      window.history.pushState(null, '', window.location.href)
    }

    window.addEventListener('popstate', handlePopState)
    
    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  const handleReturnHome = () => {
    // Clear any lingering session
    sessionStorage.removeItem('astranex_session')
    localStorage.removeItem('astranex_vote')
    navigate('/login', { replace: true })
  }

  // Generate a stable transaction ID for this page instance
  const txId = useRef(crypto.randomUUID().split('-').pop().toUpperCase()).current

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Confetti burst on mount */}
      <ConfettiBurst />

      {/* Background effects */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,136,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,136,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
      <div className="absolute top-1/4 -left-40 w-[500px] h-[500px] bg-neon-emerald/5 rounded-full blur-[150px]" />
      <div className="absolute bottom-1/4 -right-40 w-[400px] h-[400px] bg-neon-teal/4 rounded-full blur-[120px]" />

      {/* Floating sparkle orbs */}
      <div className="absolute top-1/3 left-1/4 w-2 h-2 rounded-full bg-neon-emerald animate-float" style={{ animationDelay: '0s' }} />
      <div className="absolute top-2/3 right-1/4 w-1.5 h-1.5 rounded-full bg-neon-teal animate-float" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/6 w-1 h-1 rounded-full bg-neon-amber animate-float" style={{ animationDelay: '2s' }} />

      <div className="max-w-lg w-full relative z-10 animate-scale-in">
        <div className="glass-card p-8 md:p-12 text-center" style={{ borderColor: 'rgba(0, 255, 136, 0.15)', boxShadow: '0 0 80px rgba(0, 255, 136, 0.08), 0 4px 24px rgba(0,0,0,0.4)' }}>
          
          {/* Success Icon with rings */}
          <div className="relative inline-flex items-center justify-center mb-8">
            {/* Outer ring */}
            <div className="absolute w-36 h-36 rounded-full border border-neon-emerald/10 animate-spin-slow" />
            {/* Middle ring */}
            <div className="absolute w-28 h-28 rounded-full border border-neon-emerald/20 animate-spin-slow" style={{ animationDirection: 'reverse', animationDuration: '8s' }} />
            {/* Icon container */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-neon-emerald/30 to-neon-teal/20 border-2 border-neon-emerald/50 flex items-center justify-center animate-glow-pulse" style={{ boxShadow: '0 0 40px rgba(0, 255, 136, 0.3)' }}>
              <CheckCircle className="w-10 h-10 text-neon-emerald" />
            </div>
          </div>

          {/* Brand */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-neon-teal neon-icon-teal" />
            <span className="text-xs font-bold uppercase italic tracking-widest text-neon-teal font-mono">{APP_NAME}</span>
            <Shield className="w-4 h-4 text-neon-teal neon-icon-teal" />
          </div>

          <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tight text-white mb-3">
            Vote <span className="neon-text-emerald">Confirmed</span>
          </h1>

          <div className="w-20 h-1 bg-gradient-to-r from-neon-emerald to-neon-teal rounded-full mx-auto mb-6" />

          <p className="text-gray-300 text-lg mb-2">
            Your ballot has been successfully cast for the {ELECTION_YEAR} election.
          </p>
          <p className="text-gray-500 text-sm mb-8">
            Your voice matters. Thank you for participating in democracy.
          </p>

          {/* Transaction receipt */}
          <div className="rounded-2xl p-5 mb-8" style={{ background: 'linear-gradient(135deg, rgba(0,255,136,0.06) 0%, rgba(0,240,255,0.04) 100%)', border: '1px solid rgba(0,255,136,0.2)' }}>
            <div className="flex items-center justify-center gap-2 text-neon-emerald mb-3">
              <Vote className="w-5 h-5" />
              <span className="text-sm font-mono font-bold uppercase tracking-widest">BALLOT SUBMITTED</span>
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="w-full h-px bg-gradient-to-r from-transparent via-neon-emerald/30 to-transparent mb-3" />
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-gray-500">Transaction ID</span>
              <span className="text-neon-teal font-bold tracking-wider"># {txId}</span>
            </div>
            <div className="flex items-center justify-between text-xs font-mono mt-1">
              <span className="text-gray-500">Status</span>
              <span className="text-neon-emerald font-bold flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-neon-emerald animate-pulse" />
                CONFIRMED
              </span>
            </div>
            <div className="flex items-center justify-between text-xs font-mono mt-1">
              <span className="text-gray-500">Election Year</span>
              <span className="text-white font-bold">{ELECTION_YEAR}</span>
            </div>
          </div>

          <button
            onClick={handleReturnHome}
            className="btn-neon w-full flex items-center justify-center gap-2 text-base"
          >
            <ArrowLeft className="w-5 h-5" />
            Return to Login
          </button>
        </div>

        <p className="text-center text-gray-600 text-xs mt-6 font-mono">
          Your vote has been encrypted and recorded. This page is non-cacheable.
        </p>
      </div>
    </div>
  )
}