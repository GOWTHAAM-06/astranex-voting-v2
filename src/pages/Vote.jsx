import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { POSITIONS, APP_NAME, ELECTION_YEAR } from '@/lib/constants'
import { useElectionStatus } from '@/components/ElectionTimer'
import { 
  CheckCircle, ArrowLeft, ArrowRight, 
  Loader2, AlertTriangle, FileText, X, ScrollText,
  UserCheck, Send, Clock, Ban, Vote as VoteIcon, Lock, Shield
} from 'lucide-react'

function CandidateCard({ candidate, isSelected, onSelect, disabled }) {
  return (
    <button
      onClick={() => onSelect(candidate)}
      disabled={disabled}
      className={`
        relative p-5 rounded-2xl border-2 transition-all duration-300 text-left w-full group
        ${isSelected 
          ? 'border-neon-emerald bg-neon-emerald/10 shadow-[0_0_30px_rgba(0,255,136,0.15)] -translate-y-1' 
          : disabled
            ? 'border-dark-500/30 bg-dark-700/20 opacity-50'
            : 'border-dark-500/50 bg-dark-700/30 hover:border-neon-teal/40 hover:bg-dark-700/50 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,240,255,0.08)]'
        }
        ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {/* Selected ring glow overlay */}
      {isSelected && (
        <div className="absolute inset-0 rounded-2xl border border-neon-emerald/30 pointer-events-none" />
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Gradient avatar bubble */}
          <div className={`
            w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg flex-shrink-0
            transition-all duration-300
            ${isSelected 
              ? 'bg-gradient-to-br from-neon-emerald/30 to-neon-teal/20 text-neon-emerald border border-neon-emerald/40 shadow-[0_0_15px_rgba(0,255,136,0.2)]' 
              : 'bg-gradient-to-br from-dark-600/80 to-dark-700/60 text-gray-300 border border-dark-500/40 group-hover:border-neon-teal/30 group-hover:text-white'
            }
          `}>
            {candidate.name.charAt(0)}
          </div>
          <div>
            <h4 className={`font-bold text-base transition-colors duration-200 ${isSelected ? 'text-neon-emerald' : 'text-white group-hover:text-neon-teal/90'}`}>
              {candidate.name}
            </h4>
            <p className="text-xs text-gray-400 font-mono mt-0.5">{candidate.year || 'Candidate'}</p>
          </div>
        </div>
        
        {/* Selection indicator */}
        <div className={`
          w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-300
          ${isSelected 
            ? 'bg-neon-emerald border-neon-emerald shadow-[0_0_10px_rgba(0,255,136,0.4)]' 
            : 'border-dark-500/50 group-hover:border-neon-teal/40'
          }
        `}>
          {isSelected && <CheckCircle className="w-4 h-4 text-dark-900" />}
        </div>
      </div>

      {candidate.manifest && (
        <div className="mt-3 pt-3 border-t border-dark-500/30">
          <div className="flex items-start gap-2">
            <FileText className="w-3.5 h-3.5 text-gray-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-gray-400 line-clamp-2">{candidate.manifest}</p>
          </div>
        </div>
      )}
    </button>
  )
}

function ManifestModal({ candidate, onClose }) {
  if (!candidate) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="glass-card max-w-lg w-full p-8 animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neon-teal/20 to-neon-emerald/10 border border-neon-teal/30 flex items-center justify-center font-black text-xl text-neon-teal">
              {candidate.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{candidate.name}</h3>
              <p className="text-sm text-gray-400 font-mono">{candidate.year || 'Candidate'}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors w-8 h-8 rounded-lg bg-dark-700/50 flex items-center justify-center">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-neon-teal uppercase tracking-wider mb-2">Manifest</h4>
            <p className="text-gray-300 leading-relaxed">{candidate.manifest || 'No manifest provided.'}</p>
          </div>

          {candidate.achievements && (
            <div>
              <h4 className="text-sm font-semibold text-neon-amber uppercase tracking-wider mb-2">Achievements</h4>
              <p className="text-gray-300">{candidate.achievements}</p>
            </div>
          )}

          {candidate.proposal && (
            <div>
              <h4 className="text-sm font-semibold text-neon-emerald uppercase tracking-wider mb-2">Proposal</h4>
              <p className="text-gray-300">{candidate.proposal}</p>
            </div>
          )}
        </div>

        <button onClick={onClose} className="btn-neon w-full mt-6">
          Close
        </button>
      </div>
    </div>
  )
}

function BallotReview({ selections, candidates, onConfirm, onBack, submitting }) {
  const selectedCandidates = Object.entries(selections)
    .filter(([_, candidateId]) => candidateId)
    .map(([positionId, candidateId]) => {
      const position = POSITIONS.find(p => p.id === positionId)
      const candidate = candidates[positionId]?.find(c => c.id === candidateId)
      return { position: position?.label || positionId, candidate }
    })
    .filter(item => item.candidate)

  return (
    <div className="glass-card p-8 animate-slide-up">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-neon-amber/20 border border-neon-amber/30 mb-4 shadow-[0_0_30px_rgba(255,184,0,0.15)]">
          <ScrollText className="w-8 h-8 text-neon-amber" />
        </div>
        <h2 className="text-2xl font-black uppercase italic tracking-wider text-white">Review Your Ballot</h2>
        <p className="text-gray-400 mt-1">Please verify your selections before submitting</p>
        <div className="w-16 h-0.5 bg-gradient-to-r from-neon-amber to-neon-teal rounded-full mx-auto mt-4" />
      </div>

      <div className="space-y-2 mb-8">
        {selectedCandidates.map(({ position, candidate }, idx) => (
          <div
            key={candidate.id}
            className="flex items-center justify-between p-4 rounded-xl bg-dark-700/30 border border-dark-500/30 hover:border-neon-teal/20 transition-colors"
            style={{ animationDelay: `${idx * 0.05}s` }}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-teal/20 to-neon-emerald/10 border border-neon-teal/30 flex items-center justify-center font-bold text-sm text-neon-teal">
                {candidate.name.charAt(0)}
              </div>
              <div>
                <p className="text-xs text-neon-teal font-mono uppercase tracking-wider">{position}</p>
                <p className="text-white font-semibold mt-0.5">{candidate.name}</p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-neon-emerald/20 border border-neon-emerald/30 flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-neon-emerald" />
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 rounded-xl bg-neon-amber/5 border border-neon-amber/20 mb-6">
        <p className="text-xs text-neon-amber/80 font-mono text-center">
          ⚠ Once submitted, your ballot is final and cannot be changed.
        </p>
      </div>

      <div className="flex gap-4">
        <button onClick={onBack} className="btn-neon flex-1 flex items-center justify-center gap-2">
          <ArrowLeft className="w-5 h-5" />
          Go Back
        </button>
        <button 
          onClick={onConfirm}
          disabled={submitting}
          className="btn-neon-emerald flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {submitting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
          {submitting ? 'Submitting...' : 'Confirm & Submit'}
        </button>
      </div>
    </div>
  )
}

export default function Vote() {
  const { student, destroySession, updateStudentHasVoted } = useAuth()
  const navigate = useNavigate()
  const { phase, formatCountdown, timeRemaining } = useElectionStatus()
  const [candidates, setCandidates] = useState({})
  const [selections, setSelections] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [reviewing, setReviewing] = useState(false)
  const [manifestCandidate, setManifestCandidate] = useState(null)
  const [currentPositionIndex, setCurrentPositionIndex] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    fetchCandidates()
  }, [])

  useEffect(() => {
    const selected = Object.keys(selections).filter(k => selections[k]).length
    const total = POSITIONS.length
    setProgress(Math.round((selected / total) * 100))
  }, [selections])

  const fetchCandidates = async () => {
    try {
      setLoading(true)
      const { data, error: fetchError } = await supabase
        .from('candidates')
        .select('*')
        .eq('is_approved', true)
        .order('name')

      if (fetchError) throw fetchError

      const grouped = {}
      POSITIONS.forEach(pos => {
        grouped[pos.id] = (data || []).filter(c => c.position === pos.id) || []
      })
      setCandidates(grouped)
    } catch (err) {
      setError('Failed to load candidates. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = (positionId) => (candidate) => {
    if (phase !== 'active') return
    setSelections(prev => {
      const next = { ...prev }
      if (next[positionId] === candidate.id) {
        delete next[positionId]
      } else {
        next[positionId] = candidate.id
      }
      return next
    })
  }

  const handleSubmitVote = async () => {
    setSubmitting(true)
    setError('')

    try {
      const votesData = Object.entries(selections)
        .filter(([_, candidateId]) => candidateId)
        .map(([positionId, candidateId]) => ({
          student_id: student.id,
          candidate_id: candidateId,
          position: positionId,
          election_year: ELECTION_YEAR,
        }))

      if (votesData.length === 0) {
        setError('You must select at least one candidate.')
        setSubmitting(false)
        return
      }

      const { error: insertError } = await supabase
        .from('votes')
        .insert(votesData)

      if (insertError) throw insertError

      const { error: updateError } = await supabase
        .from('students')
        .update({ has_voted: true })
        .eq('id', student.id)

      if (updateError) throw updateError

      // Mark has_voted in context state before destroying session
      updateStudentHasVoted()

      // ABSOLUTE SESSION DESTRUCTION
      destroySession()

      // Navigate to confirmation - replace to prevent back navigation
      navigate('/confirmation', { replace: true })
    } catch (err) {
      setError(err.message || 'Failed to submit your vote. Please try again.')
      setSubmitting(false)
    }
  }

  // ── Guard: loading candidates ──
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-neon-teal animate-spin" />
          <p className="text-gray-400 font-mono text-sm">Loading candidates...</p>
        </div>
      </div>
    )
  }

  // ── Guard: already voted ──
  if (student?.has_voted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md text-center animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-neon-emerald/20 border-2 border-neon-emerald/40 mb-6 shadow-[0_0_40px_rgba(0,255,136,0.15)]">
            <CheckCircle className="w-10 h-10 text-neon-emerald" />
          </div>
          <h1 className="text-3xl font-black uppercase italic tracking-wider text-white mb-2">
            Already <span className="text-neon-emerald">Voted</span>
          </h1>
          <p className="text-gray-400 mb-6">Your ballot has already been submitted for this election.</p>
          <button onClick={() => navigate('/dashboard')} className="btn-neon inline-flex items-center gap-2">
            <ArrowLeft className="w-5 h-5" /> Return to Dashboard
          </button>
        </div>
      </div>
    )
  }

  // ── Guard: syncing election phase ──
  if (phase === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-neon-teal animate-spin" />
          <p className="text-gray-400 font-mono text-sm">Syncing election status...</p>
        </div>
      </div>
    )
  }

  // ── Guard: election closed ──
  if (phase === 'closed') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md text-center animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/20 border-2 border-red-500/40 mb-6">
            <Ban className="w-10 h-10 text-red-400" />
          </div>
          <h1 className="text-3xl font-black uppercase italic tracking-wider text-white mb-2">
            Voting <span className="text-red-400">Closed</span>
          </h1>
          <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-mono mb-4 mx-auto w-fit">
            <Lock className="w-4 h-4" />
            <span>ELECTION SEALED</span>
          </div>
          <p className="text-gray-400 mb-6">The election window has ended. No further votes can be accepted.</p>
          <button onClick={() => navigate('/dashboard')} className="btn-neon inline-flex items-center gap-2">
            <ArrowLeft className="w-5 h-5" /> Return to Dashboard
          </button>
        </div>
      </div>
    )
  }

  // ── Guard: election not yet started (pre phase) ──
  if (phase === 'pre') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md text-center animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-neon-teal/20 border-2 border-neon-teal/40 mb-6 shadow-[0_0_40px_rgba(0,240,255,0.15)]">
            <Clock className="w-10 h-10 text-neon-teal" />
          </div>
          <h1 className="text-3xl font-black uppercase italic tracking-wider text-white mb-2">
            Election <span className="text-neon-teal">Not Started</span>
          </h1>
          <p className="text-gray-400 mb-4">The voting arena is not yet open. Check back when the election begins.</p>
          <div className="glass-card p-5 border border-neon-teal/30 mb-6 text-center">
            <p className="text-xs text-gray-500 font-mono uppercase tracking-wider mb-2">Voting Opens In</p>
            <p className="text-4xl font-black text-white font-mono tracking-widest">
              {formatCountdown(timeRemaining)}
            </p>
          </div>
          <button onClick={() => navigate('/dashboard')} className="btn-neon inline-flex items-center gap-2">
            <ArrowLeft className="w-5 h-5" /> Return to Dashboard
          </button>
        </div>
      </div>
    )
  }

  // ── At this point phase === 'active' ──

  const currentPosition = POSITIONS[currentPositionIndex]
  const positionCandidates = candidates[currentPosition?.id] || []
  const hasAllPositionsSelected = POSITIONS.every(pos => selections[pos.id])
  const selectedCount = Object.keys(selections).filter(k => selections[k]).length
  const votingEnabled = phase === 'active'

  if (reviewing) {
    return (
      <div className="min-h-screen p-4 md:p-8 relative">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,240,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
        <div className="max-w-2xl mx-auto relative z-10">
          <BallotReview 
            selections={selections}
            candidates={candidates}
            onConfirm={handleSubmitVote}
            onBack={() => setReviewing(false)}
            submitting={submitting}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 md:p-8 relative">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,240,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/dashboard')}
              className="w-10 h-10 rounded-xl bg-dark-700/50 border border-dark-500/30 flex items-center justify-center text-gray-400 hover:text-neon-teal transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-black uppercase italic tracking-widest">
                <span className="neon-text">VOTING ARENA</span>
              </h1>
              <p className="text-gray-500 font-mono text-xs">{ELECTION_YEAR} | {APP_NAME}</p>
            </div>
          </div>

          {/* Selection counter + Live badge */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-neon-emerald/10 border border-neon-emerald/30 text-neon-emerald text-xs font-mono">
              <div className="w-1.5 h-1.5 rounded-full bg-neon-emerald animate-pulse" />
              LIVE
            </div>
            <div className="text-right">
              <p className="text-neon-teal font-bold text-lg font-mono">{selectedCount}/{POSITIONS.length}</p>
              <p className="text-gray-500 text-xs">Selected</p>
            </div>
          </div>
        </div>

        {/* Active Election Timer Banner */}
        <div className="glass-card p-5 border border-neon-emerald/30 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-neon-emerald/20 flex items-center justify-center">
              <VoteIcon className="w-5 h-5 text-neon-emerald" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold uppercase tracking-wider font-mono text-neon-emerald">Voting Ends In</p>
                <span className="text-2xl font-black text-white font-mono tracking-widest">{formatCountdown(timeRemaining)}</span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">Election is live. Cast your vote now!</p>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="glass-card p-4 mb-6">
          <div className="flex items-center gap-4 mb-3">
            <div className="flex-1 h-2 rounded-full bg-dark-600 overflow-hidden">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-neon-teal to-neon-emerald transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-sm font-mono text-gray-400 flex-shrink-0">{progress}%</span>
          </div>
          {/* Position step dots */}
          <div className="flex items-center gap-1.5 justify-center flex-wrap">
            {POSITIONS.map((pos, idx) => (
              <button
                key={pos.id}
                onClick={() => setCurrentPositionIndex(idx)}
                title={pos.label}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  idx === currentPositionIndex
                    ? 'bg-neon-teal scale-125 shadow-[0_0_8px_rgba(0,240,255,0.6)]'
                    : selections[pos.id]
                      ? 'bg-neon-emerald shadow-[0_0_6px_rgba(0,255,136,0.4)]'
                      : 'bg-dark-500/80 hover:bg-dark-400'
                }`}
              />
            ))}
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm mb-6 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Position tab pills */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {POSITIONS.map((pos, index) => (
            <button
              key={pos.id}
              onClick={() => setCurrentPositionIndex(index)}
              className={`
                px-4 py-2 rounded-xl whitespace-nowrap text-sm font-mono transition-all duration-300 flex-shrink-0 flex items-center gap-1.5
                ${currentPositionIndex === index 
                  ? 'bg-neon-teal/20 border border-neon-teal/40 text-neon-teal shadow-[0_0_15px_rgba(0,240,255,0.1)]' 
                  : selections[pos.id] 
                    ? 'bg-neon-emerald/10 border border-neon-emerald/30 text-neon-emerald'
                    : 'bg-dark-700/50 border border-dark-500/30 text-gray-400 hover:text-white'
                }
              `}
            >
              {selections[pos.id] && <CheckCircle className="w-3 h-3" />}
              {pos.label}
            </button>
          ))}
        </div>

        {/* Position card */}
        <div className="animate-slide-up" key={currentPosition?.id}>
          <div className="glass-card p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold uppercase italic tracking-wider text-white">
                  {currentPosition?.label}
                </h2>
                <p className="text-xs text-gray-500 font-mono mt-0.5">Select one candidate</p>
              </div>
              <div className="text-sm font-mono text-gray-400 bg-dark-700/50 px-3 py-1.5 rounded-lg border border-dark-500/30">
                {currentPositionIndex + 1} / {POSITIONS.length}
              </div>
            </div>

            {positionCandidates.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <UserCheck className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No candidates for this position</p>
              </div>
            ) : positionCandidates.length === 1 ? (
              <div className="flex items-center justify-center py-4">
                <CandidateCard
                  candidate={positionCandidates[0]}
                  isSelected={selections[currentPosition?.id] === positionCandidates[0].id}
                  onSelect={handleSelect(currentPosition?.id)}
                  disabled={!votingEnabled}
                />
              </div>
            ) : (
              <div className="space-y-3">
                {positionCandidates.map((candidate, index) => (
                  <div key={candidate.id} className="relative">
                    {index === 0 && positionCandidates.length === 2 && (
                      <div className="flex justify-center -mb-3 relative z-10">
                        <span className="vs-badge text-sm">VS</span>
                      </div>
                    )}
                    <CandidateCard
                      candidate={candidate}
                      isSelected={selections[currentPosition?.id] === candidate.id}
                      onSelect={handleSelect(currentPosition?.id)}
                      disabled={!votingEnabled}
                    />
                  </div>
                ))}
              </div>
            )}

            {positionCandidates.some(c => c.manifest) && (
              <div className="mt-4 pt-4 border-t border-dark-500/20 text-center flex flex-wrap gap-2 justify-center">
                {positionCandidates.map(candidate => (
                  candidate.manifest && (
                    <button
                      key={candidate.id}
                      onClick={() => setManifestCandidate(candidate)}
                      className="text-xs text-gray-400 hover:text-neon-teal transition-colors font-mono px-3 py-1.5 rounded-lg bg-dark-700/40 border border-dark-500/30 hover:border-neon-teal/30"
                    >
                      {candidate.name}'s Manifest →
                    </button>
                  )
                ))}
              </div>
            )}
          </div>

          {/* Navigation buttons */}
          <div className="flex gap-4">
            <button
              onClick={() => setCurrentPositionIndex(prev => Math.max(0, prev - 1))}
              disabled={currentPositionIndex === 0}
              className="btn-neon flex-1 flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-5 h-5" />
              Previous
            </button>

            {currentPositionIndex < POSITIONS.length - 1 ? (
              <button
                onClick={() => setCurrentPositionIndex(prev => Math.min(POSITIONS.length - 1, prev + 1))}
                className="btn-neon flex-1 flex items-center justify-center gap-2"
              >
                Next
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={() => {
                  if (!hasAllPositionsSelected) {
                    setError('Please select candidates for all positions before reviewing.')
                    return
                  }
                  setError('')
                  setReviewing(true)
                }}
                className="btn-neon-emerald flex-1 flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                Review Ballot
              </button>
            )}
          </div>
        </div>
      </div>

      <ManifestModal 
        candidate={manifestCandidate}
        onClose={() => setManifestCandidate(null)}
      />
    </div>
  )
}