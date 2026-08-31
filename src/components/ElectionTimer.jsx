import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Clock, Lock, Unlock, Vote, Ban } from 'lucide-react'

export function useElectionStatus() {
  const [phase, setPhase] = useState('loading') // 'pre' | 'active' | 'closed'
  const [timeRemaining, setTimeRemaining] = useState(null)
  const [electionInfo, setElectionInfo] = useState({ start: null, end: null })

  useEffect(() => {
    let interval

    const fetchElectionWindow = async () => {
      try {
        const { data, error } = await supabase
          .from('admin_config')
          .select('start_time, end_time')
          .limit(1)
          .maybeSingle()

        if (error || !data || !data.start_time || !data.end_time) {
          setPhase('closed')
          return
        }

        const start = new Date(data.start_time).getTime()
        const end = new Date(data.end_time).getTime()
        setElectionInfo({ start, end })

        const updatePhase = () => {
          const now = Date.now()
          if (now < start) {
            setPhase('pre')
            setTimeRemaining(start - now)
          } else if (now >= start && now <= end) {
            setPhase('active')
            setTimeRemaining(end - now)
          } else {
            setPhase('closed')
            setTimeRemaining(0)
          }
        }

        updatePhase()
        // Tick every second
        interval = setInterval(updatePhase, 1000)
      } catch (err) {
        console.error('Failed to fetch election window:', err)
        setPhase('closed')
      }
    }

    fetchElectionWindow()

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [])

  const formatCountdown = (ms) => {
    if (ms === null || ms <= 0) return '00:00:00'
    const totalSeconds = Math.floor(ms / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  return { phase, timeRemaining, formatCountdown, electionInfo }
}

export default function ElectionTimer({ compact = false }) {
  const { phase, timeRemaining, formatCountdown } = useElectionStatus()

  // Determine display
  let statusLabel, statusColor, StatusIcon, desc

  if (phase === 'loading') {
    return (
      <div className="glass-card p-4 border-dark-500/30 animate-pulse">
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-gray-500" />
          <div className="space-y-1">
            <p className="text-sm text-gray-500 font-mono">Loading election status...</p>
          </div>
        </div>
      </div>
    )
  }

  if (phase === 'pre') {
    statusLabel = 'Voting Starts In'
    statusColor = 'text-neon-teal'
    StatusIcon = Clock
    desc = 'Election has not yet begun. Prepare your ballot.'
  } else if (phase === 'active') {
    statusLabel = 'Voting Ends In'
    statusColor = 'text-neon-emerald'
    StatusIcon = Vote
    desc = 'Election is live. Cast your vote now!'
  } else {
    statusLabel = 'Voting Closed'
    statusColor = 'text-red-400'
    StatusIcon = Ban
    desc = 'The election window has ended.'
  }

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${statusColor}`}>
        <StatusIcon className="w-4 h-4" />
        <span className="text-xs font-mono font-bold">{statusLabel}</span>
        {timeRemaining !== null && timeRemaining > 0 && (
          <span className="text-xs font-mono text-white">{formatCountdown(timeRemaining)}</span>
        )}
      </div>
    )
  }

  return (
    <div className={`glass-card p-5 border ${phase === 'active' ? 'border-neon-emerald/30' : phase === 'pre' ? 'border-neon-teal/30' : 'border-red-500/30'}`}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
          phase === 'active' ? 'bg-neon-emerald/20 text-neon-emerald'
          : phase === 'pre' ? 'bg-neon-teal/20 text-neon-teal'
          : 'bg-red-500/20 text-red-400'
        }`}>
          <StatusIcon className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <p className={`text-sm font-bold uppercase tracking-wider font-mono ${statusColor}`}>
              {statusLabel}
            </p>
            {timeRemaining !== null && timeRemaining > 0 && (
              <span className="text-2xl font-black text-white font-mono tracking-widest">
                {formatCountdown(timeRemaining)}
              </span>
            )}
            {phase === 'closed' && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-500/10 border border-red-500/30">
                <Lock className="w-3.5 h-3.5 text-red-400" />
                <span className="text-xs font-mono text-red-400">SEALED</span>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
        </div>
      </div>
    </div>
  )
}