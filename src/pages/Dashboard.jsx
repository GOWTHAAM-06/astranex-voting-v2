import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { APP_NAME, ELECTION_YEAR } from '@/lib/constants'
import { useElectionStatus } from '@/components/ElectionTimer'
import { 
  Vote, Shield, CheckCircle, Clock, LogOut, 
  BarChart3, Users, FileText, ArrowRight, Ban, Lock, Zap
} from 'lucide-react'

export default function Dashboard() {
  const { student, signOut, isAdmin } = useAuth()
  const { phase, formatCountdown, timeRemaining } = useElectionStatus()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut()
    navigate('/login', { replace: true })
  }

  const guidelines = [
    { icon: Shield, text: 'You can only vote once. Votes are final and cannot be changed.', color: 'text-neon-teal', accent: 'border-neon-teal/30 bg-neon-teal/5' },
    { icon: CheckCircle, text: 'Select one candidate per position. Some positions allow multiple seats.', color: 'text-neon-emerald', accent: 'border-neon-emerald/30 bg-neon-emerald/5' },
    { icon: Clock, text: 'Complete your ballot and submit before the election deadline.', color: 'text-neon-amber', accent: 'border-neon-amber/30 bg-neon-amber/5' },
    { icon: FileText, text: 'Review candidate manifests carefully before casting your vote.', color: 'text-neon-purple', accent: 'border-neon-purple/30 bg-neon-purple/5' },
  ]

  const getPhaseConfig = () => {
    if (phase === 'pre') return { icon: Clock, color: 'text-neon-teal', border: 'border-neon-teal/30', bg: 'bg-neon-teal/5', label: 'Election Not Started', dot: 'bg-neon-teal' }
    if (phase === 'active') return { icon: Vote, color: 'text-neon-emerald', border: 'border-neon-emerald/30', bg: 'bg-neon-emerald/5', label: 'Election Live', dot: 'bg-neon-emerald' }
    return { icon: Ban, color: 'text-red-400', border: 'border-red-500/30', bg: 'bg-red-500/5', label: 'Election Closed', dot: 'bg-red-400' }
  }

  const phaseConfig = getPhaseConfig()
  const PhaseIcon = phaseConfig.icon

  return (
    <div className="min-h-screen p-4 md:p-8 relative">
      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,240,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.015)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-teal/20 to-neon-teal/5 border border-neon-teal/30 flex items-center justify-center neon-icon-teal">
              <Shield className="w-5 h-5 text-neon-teal" />
            </div>
            <div>
              <h1 className="text-2xl font-black uppercase italic tracking-widest">
                <span className="neon-text">{APP_NAME}</span>
              </h1>
              <p className="text-gray-500 font-mono text-xs">{ELECTION_YEAR} Election Portal</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-white font-semibold text-sm">{student?.name}</p>
              <p className="text-gray-500 font-mono text-xs">{student?.student_number}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-dark-500/50 text-gray-400 hover:text-neon-teal hover:border-neon-teal/30 transition-all duration-300 font-mono text-sm hover:bg-neon-teal/5"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Exit</span>
            </button>
          </div>
        </div>

        {/* Election Status Banner */}
        {phase !== 'loading' && (
          <div className={`glass-card p-4 mb-8 border ${phaseConfig.border} animate-slide-up`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${phaseConfig.bg} border ${phaseConfig.border}`}>
                  <PhaseIcon className={`w-4 h-4 ${phaseConfig.color}`} />
                </div>
                <div className="flex items-center gap-2">
                  {phase === 'active' && (
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-neon-emerald/10 border border-neon-emerald/30">
                      <div className="w-1.5 h-1.5 rounded-full bg-neon-emerald animate-pulse" />
                      <span className="text-neon-emerald text-[10px] font-mono font-bold tracking-widest">LIVE</span>
                    </div>
                  )}
                  <span className={`text-sm font-semibold font-mono uppercase tracking-wider ${phaseConfig.color}`}>
                    {phaseConfig.label}
                  </span>
                </div>
              </div>
              {timeRemaining !== null && timeRemaining > 0 && (
                <span className="text-lg font-black text-white font-mono tracking-wider">
                  {formatCountdown(timeRemaining)}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Welcome Banner */}
        <div className="glass-card p-8 mb-8 animate-slide-up" style={{ borderColor: 'rgba(0, 240, 255, 0.08)' }}>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-6 rounded-full bg-gradient-to-b from-neon-teal to-neon-emerald" />
                <h2 className="text-3xl font-black uppercase italic tracking-wider text-white">
                  Welcome, <span className="neon-text">{student?.name?.split(' ')[0]}</span>
                </h2>
              </div>
              <p className="text-gray-400 text-lg ml-3.5">
                You are about to participate in the {APP_NAME} Department Association Election.
              </p>
              <div className="flex items-center gap-3 mt-3 ml-3.5">
                <span className="text-xs text-gray-500 font-mono">{student?.department}</span>
                {student?.department && student?.year && <span className="text-dark-500">•</span>}
                <span className="text-xs text-gray-500 font-mono">{student?.year}</span>
              </div>
            </div>
            
            {student?.has_voted ? (
              <div className="flex items-center gap-3 px-6 py-4 rounded-xl bg-neon-emerald/10 border border-neon-emerald/30 shadow-[0_0_30px_rgba(0,255,136,0.1)]">
                <CheckCircle className="w-6 h-6 text-neon-emerald neon-icon-emerald" />
                <div>
                  <p className="text-neon-emerald font-bold font-mono text-sm">VOTE CAST</p>
                  <p className="text-neon-emerald/60 text-xs font-mono">Ballot submitted</p>
                </div>
              </div>
            ) : (
              <button
                onClick={() => navigate('/vote')}
                disabled={phase !== 'active'}
                className="btn-neon-emerald flex items-center gap-2 text-lg px-8 py-4 animate-glow-pulse disabled:opacity-40 disabled:animate-none disabled:cursor-not-allowed"
              >
                <Vote className="w-6 h-6" />
                {phase === 'pre' ? 'VOTING NOT OPEN' : phase === 'closed' ? 'VOTING ENDED' : 'CAST YOUR VOTE'}
                {phase === 'active' && <ArrowRight className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>

        {/* Guidelines */}
        <div className="mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <h3 className="section-title flex items-center gap-2">
            <FileText className="w-5 h-5 neon-icon-teal" />
            ELECTION GUIDELINES
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {guidelines.map((item, index) => {
              const Icon = item.icon
              return (
                <div 
                  key={index}
                  className={`glass-card p-5 flex items-start gap-4 border-l-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)] ${item.accent}`}
                  style={{ animationDelay: `${index * 0.08}s` }}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${item.accent} border ${item.color.replace('text-', 'border-').replace('neon-', 'neon-') + '/40'}`}>
                    <Icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <p className="text-gray-300 leading-relaxed text-sm">{item.text}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <h3 className="section-title flex items-center gap-2">
            <Zap className="w-5 h-5 neon-icon-teal" />
            Quick Actions
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/vote')}
              disabled={student?.has_voted || phase !== 'active'}
              className="glass-card-hover p-6 text-left disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${student?.has_voted ? 'bg-dark-700/50 border border-dark-500/30' : 'bg-neon-teal/10 border border-neon-teal/30 group-hover:bg-neon-teal/20 group-hover:shadow-[0_0_20px_rgba(0,240,255,0.15)]'}`}>
                  <Vote className={`w-6 h-6 ${student?.has_voted ? 'text-gray-500' : 'text-neon-teal'}`} />
                </div>
                <ArrowRight className={`w-5 h-5 transition-transform duration-300 group-hover:translate-x-1 ${student?.has_voted ? 'text-gray-500' : 'text-neon-teal'}`} />
              </div>
              <h4 className="text-lg font-bold text-white uppercase italic tracking-wider mb-1">
                {student?.has_voted ? 'VOTE ALREADY CAST' : 'VOTING ARENA'}
              </h4>
              <p className="text-gray-400 text-sm">
                {student?.has_voted 
                  ? 'You have already submitted your ballot.' 
                  : 'Cast your vote for the department association positions.'}
              </p>
            </button>

            {isAdmin() && (
              <button
                onClick={() => navigate('/admin')}
                className="glass-card-hover p-6 text-left group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-neon-amber/10 border border-neon-amber/30 flex items-center justify-center transition-all duration-300 group-hover:bg-neon-amber/20 group-hover:shadow-[0_0_20px_rgba(255,184,0,0.15)]">
                    <BarChart3 className="w-6 h-6 text-neon-amber" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-neon-amber transition-transform duration-300 group-hover:translate-x-1" />
                </div>
                <h4 className="text-lg font-bold text-white uppercase italic tracking-wider mb-1">
                  ADMIN PANEL
                </h4>
                <p className="text-gray-400 text-sm">
                  HOD Control Panel — monitor live results and manage elections.
                </p>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}