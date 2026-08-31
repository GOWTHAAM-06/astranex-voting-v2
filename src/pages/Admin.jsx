import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { POSITIONS, APP_NAME, ELECTION_YEAR } from '@/lib/constants'
import { 
  BarChart3, Users, Vote, Shield, LogOut, AlertTriangle,
  Trash2, CheckCircle, X, Loader2, 
  TrendingUp, UserCheck, UserX, ArrowLeft,
  Plus, UserPlus, BookOpen, Target, ScrollText,
  PieChart, Activity, Zap, ChevronsLeftRight, Clock, Timer
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell, PieChart as RePieChart, Pie, 
  RadialBarChart, RadialBar, Legend, Sector,
  AreaChart, Area
} from 'recharts'
import { useNavigate } from 'react-router-dom'

const CHART_COLORS = ['#00F0FF', '#00FF88', '#FFB800', '#FF006E', '#8B5CF6', '#FF6B35', '#00D4FF', '#FF3366']
const GRADIENT_CYAN = '#00F0FF'
const GRADIENT_EMERALD = '#00FF88'
const GRADIENT_AMBER = '#FFB800'

const YEAR_COLORS = {
  '1st Year': '#00F0FF',
  '2nd Year': '#00FF88',
  '3rd Year': '#FFB800',
  '4th Year': '#FF006E',
}

function StatCard({ icon: Icon, label, value, sublabel, color, glowColor }) {
  return (
    <div className="glass-card p-6 transition-all duration-300 hover:-translate-y-1" style={{ borderColor: glowColor ? `${glowColor}20` : undefined, boxShadow: glowColor ? `0 4px 24px rgba(0,0,0,0.3), 0 0 0 1px ${glowColor}08` : undefined }}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-gray-400 text-sm font-mono uppercase tracking-wider">{label}</p>
          <p className={`text-3xl font-black mt-1 ${color || 'text-white'}`}>{value}</p>
          {sublabel && <p className="text-gray-500 text-xs mt-1">{sublabel}</p>}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color || 'text-neon-teal'}`}
          style={{ background: glowColor ? `${glowColor}15` : 'rgba(26, 35, 50, 0.5)', border: `1px solid ${glowColor ? glowColor + '30' : 'rgba(45,62,86,0.3)'}`, boxShadow: glowColor ? `0 0 20px ${glowColor}20` : undefined }}
        >
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  )
}

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-4 border border-neon-teal/30">
        <p className="text-white font-semibold">{label}</p>
        <p className="text-neon-teal font-mono text-lg font-bold">{payload[0].value} votes</p>
      </div>
    )
  }
  return null
}

function AreaTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-4 border border-neon-amber/30">
        <p className="text-gray-400 text-xs font-mono">{label}</p>
        <p className="text-neon-amber font-mono text-lg font-bold">{payload[0].value} votes</p>
      </div>
    )
  }
  return null
}

function PieTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-4 border border-neon-teal/30">
        <p className="text-white font-semibold">{payload[0].name}</p>
        <p className="text-neon-teal font-mono text-lg font-bold">{payload[0].value} students</p>
        <p className="text-gray-400 text-xs">{((payload[0].payload.percent || 0) * 100).toFixed(1)}%</p>
      </div>
    )
  }
  return null
}

function renderActiveShape(props) {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props
  return (
    <g>
      <text x={cx} y={cy - 10} textAnchor="middle" fill="#fff" className="text-xl font-bold">{payload.name}</text>
      <text x={cx} y={cy + 15} textAnchor="middle" fill="#00F0FF" className="text-lg font-mono font-bold">{value} students</text>
      <text x={cx} y={cy + 35} textAnchor="middle" fill="#9CA3AF" className="text-xs font-mono">{`${(percent * 100).toFixed(1)}%`}</text>
      <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 6} startAngle={startAngle} endAngle={endAngle} fill={fill} opacity={0.6} />
      <Sector cx={cx} cy={cy} innerRadius={innerRadius - 2} outerRadius={outerRadius + 2} startAngle={startAngle} endAngle={endAngle} fill={fill} />
    </g>
  )
}

function AddCandidateModal({ open, onClose, onAdded }) {
  const [form, setForm] = useState({ name: '', position: '', year: '', manifest: '', achievements: '', proposal: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const handleChange = (field) => (e) => { setForm(prev => ({ ...prev, [field]: e.target.value })); setError('') }
  const handleSubmit = async (e) => {
    e.preventDefault(); setError('')
    if (!form.name || !form.position) { setError('Name and position are required.'); return }
    setSubmitting(true)
    try {
      const { error: insertError } = await supabase.from('candidates').insert({
        name: form.name, position: form.position, year: form.year || null,
        manifest: form.manifest || null, achievements: form.achievements || null,
        proposal: form.proposal || null, is_approved: true,
      })
      if (insertError) throw insertError
      setForm({ name: '', position: '', year: '', manifest: '', achievements: '', proposal: '' })
      onAdded(); onClose()
    } catch (err) { setError(err.message || 'Failed to add candidate.') }
    finally { setSubmitting(false) }
  }
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="glass-card max-w-lg w-full p-6 md:p-8 animate-slide-up max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-neon-emerald/20 border border-neon-emerald/30 flex items-center justify-center"><UserPlus className="w-5 h-5 text-neon-emerald" /></div>
            <h2 className="text-xl font-bold uppercase italic tracking-wider text-white">Add Candidate</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors"><X className="w-6 h-6" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wider font-mono">Full Name *</label>
            <input type="text" value={form.name} onChange={handleChange('name')} placeholder="Candidate's full name" className="input-neon" autoFocus required /></div>
          <div><label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wider font-mono">Position / Portfolio *</label>
            <select value={form.position} onChange={handleChange('position')} className="input-neon" required>
              <option value="" disabled>Select position...</option>
              {POSITIONS.map(pos => <option key={pos.id} value={pos.id}>{pos.label}</option>)}
            </select></div>
          <div><label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wider font-mono">Year</label>
            <select value={form.year} onChange={handleChange('year')} className="input-neon">
              <option value="">Not specified</option><option value="1st Year">1st Year</option><option value="2nd Year">2nd Year</option><option value="3rd Year">3rd Year</option><option value="4th Year">4th Year</option>
            </select></div>
          <div><label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wider font-mono"><BookOpen className="w-3.5 h-3.5 inline mr-1" />Manifest</label>
            <textarea value={form.manifest} onChange={handleChange('manifest')} placeholder="Candidate's manifesto..." rows={3} className="input-neon resize-none" /></div>
          <div><label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wider font-mono"><Target className="w-3.5 h-3.5 inline mr-1" />Achievements</label>
            <textarea value={form.achievements} onChange={handleChange('achievements')} placeholder="Notable achievements..." rows={2} className="input-neon resize-none" /></div>
          <div><label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wider font-mono"><ScrollText className="w-3.5 h-3.5 inline mr-1" />Proposal</label>
            <textarea value={form.proposal} onChange={handleChange('proposal')} placeholder="Key proposals..." rows={2} className="input-neon resize-none" /></div>
          {error && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>}
          <button type="submit" disabled={submitting} className="btn-neon-emerald w-full flex items-center justify-center gap-2 disabled:opacity-50">
            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />}
            {submitting ? 'Adding...' : 'Add Candidate to Roster'}
          </button>
        </form>
      </div>
    </div>
  )
}

function RemoveConfirmModal({ open, candidate, onClose, onRemoved }) {
  const [removing, setRemoving] = useState(false)
  const handleRemove = async () => {
    setRemoving(true)
    try {
      const { error } = await supabase.from('candidates').delete().eq('id', candidate.id)
      if (error) throw error
      onRemoved(); onClose()
    } catch (err) { alert('Failed to remove candidate.') }
    finally { setRemoving(false) }
  }
  if (!open || !candidate) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="glass-card max-w-sm w-full p-6 animate-slide-up border-red-500/30" onClick={(e) => e.stopPropagation()}>
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-500/20 border border-red-500/30 mb-4"><AlertTriangle className="w-7 h-7 text-red-400" /></div>
          <h3 className="text-lg font-bold text-white">Remove Candidate</h3>
          <p className="text-gray-400 text-sm mt-1">Remove <span className="text-white font-semibold">{candidate.name}</span> from the roster?</p>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-neon flex-1" disabled={removing}>Cancel</button>
          <button onClick={handleRemove} disabled={removing} className="btn-danger flex-1 flex items-center justify-center gap-2 disabled:opacity-50">
            {removing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}{removing ? 'Removing...' : 'Remove'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────
// MARGIN OF VICTORY GAUGE
// ──────────────────────────────────────────────
function MarginGauge({ position, candidates }) {
  if (!candidates || candidates.length < 2) return null
  const sorted = [...candidates].sort((a, b) => b.votes - a.votes)
  const leader = sorted[0]
  const runner = sorted[1]
  const total = leader.votes + runner.votes
  const leaderPct = total > 0 ? (leader.votes / total) * 100 : 50
  const gap = leader.votes - runner.votes

  return (
    <div className="bg-dark-700/30 border border-dark-500/30 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-semibold text-neon-amber uppercase tracking-wider">{position} — Battle</h4>
        <span className="text-xs font-mono text-gray-400">Lead: {gap > 0 ? `+${gap}` : 'Tied'}</span>
      </div>
      {/* Leader bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-neon-teal font-semibold truncate max-w-[120px]">{leader.name}</span>
          <span className="text-white font-mono">{leader.votes}</span>
        </div>
        <div className="relative h-3 rounded-full bg-dark-600 overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-neon-teal to-neon-emerald transition-all duration-700" style={{ width: `${leaderPct}%` }} />
          {/* Divider notch */}
          <div className="absolute top-0 bottom-0 w-0.5 bg-neon-amber shadow-[0_0_8px_rgba(255,184,0,0.6)]" style={{ left: `${Math.min(leaderPct, 50)}%` }} />
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-neon-amber/80 font-semibold truncate max-w-[120px]">{runner.name}</span>
          <span className="text-white font-mono">{runner.votes}</span>
        </div>
      </div>
      {gap > 0 && <p className="text-[10px] text-gray-500 font-mono mt-2">Margin: {gap} vote{gap !== 1 ? 's' : ''}</p>}
    </div>
  )
}

// ──────────────────────────────────────────────
// MAIN ADMIN COMPONENT
// ──────────────────────────────────────────────
export default function Admin() {
  const { adminConfig, signOut } = useAuth()
  const navigate = useNavigate()

  const [voteData, setVoteData] = useState([])
  const [candidates, setCandidates] = useState([])
  const [totalStudents, setTotalStudents] = useState(0)
  const [votedStudents, setVotedStudents] = useState(0)
  const [departmentData, setDepartmentData] = useState([])
  const [yearStackData, setYearStackData] = useState([])
  const [timelineData, setTimelineData] = useState([])   // Voting Velocity (Area)
  const [tickerEntries, setTickerEntries] = useState([]) // Ballot Ticker

  const [loading, setLoading] = useState(true)
  const [purging, setPurging] = useState(false)
  const [showPurgeConfirm, setShowPurgeConfirm] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [removeCandidate, setRemoveCandidate] = useState(null)
  const [realtimeStatus, setRealtimeStatus] = useState('connected')
  const [activeIndex, setActiveIndex] = useState(0)

  // Election Time Controller
  const [electionStart, setElectionStart] = useState('')
  const [electionEnd, setElectionEnd] = useState('')
  const [updatingWindow, setUpdatingWindow] = useState(false)
  const [windowStatus, setWindowStatus] = useState('')
  const configFetched = useRef(false)

  const fetchData = useCallback(async () => {
    try {
      // Fetch ALL votes with candidate and student data
      const { data: votes, error: votesError } = await supabase
        .from('votes')
        .select(`id, candidate_id, position, created_at, candidates(name, position), students(year, department, student_number)`)

      if (votesError) throw votesError
      const safeVotes = votes || []

      // Candidates
      const { data: cands, error: candsError } = await supabase
        .from('candidates').select('*').eq('is_approved', true).order('position').order('name')
      if (candsError) throw candsError
      setCandidates(cands || [])

      // Student counts
      const { count: total, error: totalError } = await supabase
        .from('students').select('*', { count: 'exact', head: true })
      if (totalError) throw totalError
      setTotalStudents(total || 0)

      const { count: voted, error: votedError } = await supabase
        .from('students').select('*', { count: 'exact', head: true }).eq('has_voted', true)
      if (votedError) throw votedError
      setVotedStudents(voted || 0)

      // ─── VOTE COUNTS PER CANDIDATE ───
      const voteCounts = {}
      const deptStudents = {}   // { department: Set(student_id) }
      const yearCandidateVotes = {}
      const timeBuckets = {}    // { "HH:00": count }

      ;(safeVotes).forEach(v => {
        const cId = v.candidate_id
        if (!voteCounts[cId]) {
          const candidate = (cands || []).find(c => c.id === cId)
          voteCounts[cId] = { name: candidate?.name || 'Unknown', position: candidate?.position || v.position, votes: 0 }
        }
        voteCounts[cId].votes += 1

        // Department — track unique students per dept
        const dept = v.students?.department || 'Unknown'
        if (!deptStudents[dept]) deptStudents[dept] = new Set()
        deptStudents[dept].add(v.students?.student_number || v.id)

        // Year per candidate
        const yr = v.students?.year || 'Unknown'
        const cName = voteCounts[cId].name
        if (!yearCandidateVotes[cName]) yearCandidateVotes[cName] = { name: cName }
        yearCandidateVotes[cName][yr] = (yearCandidateVotes[cName][yr] || 0) + 1

        // Timeline — hourly buckets
        if (v.created_at) {
          const d = new Date(v.created_at)
          const key = `${d.getHours().toString().padStart(2, '0')}:00`
          timeBuckets[key] = (timeBuckets[key] || 0) + 1
        }
      })

      setVoteData(Object.values(voteCounts).sort((a, b) => b.votes - a.votes))

      // Department Pie (unique students per dept)
      const deptArr = Object.entries(deptStudents)
        .map(([name, studentSet]) => ({ name, value: studentSet.size }))
        .sort((a, b) => b.value - a.value)
      setDepartmentData(deptArr)

      // Year stacked
      const allYears = ['1st Year', '2nd Year', '3rd Year', '4th Year']
      const stackArr = Object.values(yearCandidateVotes)
      stackArr.forEach(item => { allYears.forEach(y => { if (!item[y]) item[y] = 0 }) })
      setYearStackData(stackArr)

      // Timeline sorted
      const timelineArr = Object.entries(timeBuckets)
        .map(([hour, count]) => ({ hour, votes: count }))
        .sort((a, b) => a.hour.localeCompare(b.hour))
      setTimelineData(timelineArr)

      // ─── BALLOT TICKER ───
      const ticker = []
      const positionGroups = {}
      safeVotes.forEach(v => {
        const pos = v.candidates?.position || v.position
        const cName = v.candidates?.name || 'Unknown'
        if (!positionGroups[pos]) positionGroups[pos] = {}
        if (!positionGroups[pos][cName]) positionGroups[pos][cName] = 0
        positionGroups[pos][cName]++
      })
      Object.entries(positionGroups).forEach(([pos, candsMap]) => {
        const posLabel = POSITIONS.find(p => p.id === pos)?.label || pos
        const entries = Object.entries(candsMap)
          .sort((a, b) => b[1] - a[1])
          .map(([name, count]) => `${name} (${count})`)
        ticker.push(`● ${posLabel.toUpperCase()}: ${entries.join(' | ')}`)
      })
      setTickerEntries(ticker)

    } catch (err) {
      console.error('Failed to fetch admin data:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch current election window config
  useEffect(() => {
    if (!configFetched.current) {
      configFetched.current = true
      supabase
        .from('admin_config')
        .select('start_time, end_time')
        .limit(1)
        .maybeSingle()
        .then(({ data, error }) => {
          if (!error && data) {
            if (data.start_time) {
              const d = new Date(data.start_time)
              setElectionStart(d.toISOString().slice(0, 16))
            }
            if (data.end_time) {
              const d = new Date(data.end_time)
              setElectionEnd(d.toISOString().slice(0, 16))
            }
          }
        })
    }
  }, [])

  // Update election window — fetch real row ID first, then update by ID
  const handleUpdateWindow = async () => {
    if (!electionStart || !electionEnd) {
      setWindowStatus('Both start and end times are required.')
      return
    }
    if (new Date(electionEnd) <= new Date(electionStart)) {
      setWindowStatus('End time must be after start time.')
      return
    }
    setUpdatingWindow(true)
    setWindowStatus('')
    try {
      // Fetch the real config row ID first
      const { data: configRow, error: fetchError } = await supabase
        .from('admin_config')
        .select('id')
        .limit(1)
        .maybeSingle()

      if (fetchError) throw fetchError

      const payload = {
        start_time: new Date(electionStart).toISOString(),
        end_time: new Date(electionEnd).toISOString(),
      }
      if (configRow) payload.id = configRow.id

      const { error } = await supabase
        .from('admin_config')
        .upsert(payload)

      if (error) throw error
      setWindowStatus('Election window updated successfully!')
      setTimeout(() => setWindowStatus(''), 3000)
    } catch (err) {
      setWindowStatus('Failed to update: ' + err.message)
    } finally {
      setUpdatingWindow(false)
    }
  }

  // Instant live: start now + 2 hours
  const handleInstantLive = async () => {
    setUpdatingWindow(true)
    setWindowStatus('')
    try {
      const now = new Date()
      const end = new Date(now.getTime() + 2 * 60 * 60 * 1000)
      const startISO = now.toISOString()
      const endISO = end.toISOString()

      // Fetch real row ID first
      const { data: configRow, error: fetchError } = await supabase
        .from('admin_config')
        .select('id')
        .limit(1)
        .maybeSingle()

      if (fetchError) throw fetchError

      const payload = { start_time: startISO, end_time: endISO }
      if (configRow) payload.id = configRow.id

      const { error } = await supabase
        .from('admin_config')
        .upsert(payload)

      if (error) throw error

      setElectionStart(startISO.slice(0, 16))
      setElectionEnd(endISO.slice(0, 16))
      setWindowStatus('🔥 Election is NOW LIVE for 2 hours!')
      setTimeout(() => setWindowStatus(''), 4000)
    } catch (err) {
      setWindowStatus('Failed: ' + err.message)
    } finally {
      setUpdatingWindow(false)
    }
  }

  useEffect(() => {
    fetchData()
    const channel = supabase.channel('admin-votes-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'votes' }, () => {
        setRealtimeStatus('updating'); fetchData().then(() => setRealtimeStatus('connected'))
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'students' }, () => {
        setRealtimeStatus('updating'); fetchData().then(() => setRealtimeStatus('connected'))
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'candidates' }, () => {
        setRealtimeStatus('updating'); fetchData().then(() => setRealtimeStatus('connected'))
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [fetchData])

  const handlePurge = async () => {
    setPurging(true)
    try {
      await supabase.from('votes').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      await supabase.from('students').update({ has_voted: false }).neq('id', '00000000-0000-0000-0000-000000000000')
      await fetchData(); setShowPurgeConfirm(false)
    } catch (err) { console.error('Purge failed:', err); alert('Failed to purge data.') }
    finally { setPurging(false) }
  }

  const handleLogout = async () => { await signOut(); navigate('/login', { replace: true }) }

  const turnout = totalStudents > 0 ? Math.round((votedStudents / totalStudents) * 100) : 0
  const remaining = 100 - turnout
  const noVotesYet = votedStudents === 0

  // Group candidates by position
  const candidatesByPosition = {}
  POSITIONS.forEach(pos => {
    const filtered = candidates.filter(c => c.position === pos.id)
    if (filtered.length > 0) candidatesByPosition[pos.id] = filtered
  })

  // Pie data — percentage based on unique students per dept / total unique voters
  const deptPieData = useMemo(() => {
    const totalUnique = departmentData.reduce((sum, d) => sum + d.value, 0)
    return departmentData.map(d => ({ ...d, percent: totalUnique > 0 ? d.value / totalUnique : 0 }))
  }, [departmentData])

  const radialData = [
    { name: 'Voted', value: turnout, fill: 'url(#turnoutGradient)' },
    { name: 'Remaining', value: remaining, fill: '#243044' },
  ]

  // Aggregate per-position votes for margin gauges
  const positionVotes = useMemo(() => {
    const groups = {}
    voteData.forEach(v => {
      if (!groups[v.position]) groups[v.position] = []
      groups[v.position].push(v)
    })
    return groups
  }, [voteData])

  const onPieEnter = useCallback((_, index) => { setActiveIndex(index) }, [])

  // Build ticker string
  const tickerText = tickerEntries.length > 0
    ? tickerEntries.join('  │  ') + '  │  '
    : 'SYSTEM LIVE — AWAITING FIRST BALLOT  │  '

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-neon-teal animate-spin" />
          <p className="text-gray-400 font-mono text-sm">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 md:p-8 relative">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,240,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* ─── HEADER ─── */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/login')} className="w-10 h-10 rounded-xl bg-dark-700/50 border border-dark-500/30 flex items-center justify-center text-gray-400 hover:text-neon-teal transition-colors" title="Exit to Login">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black uppercase italic tracking-widest text-white"><span className="neon-text-amber">HOD</span> CONTROL</h1>
                <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-mono ${
                  realtimeStatus === 'connected' ? 'bg-neon-emerald/10 text-neon-emerald border border-neon-emerald/30'
                  : realtimeStatus === 'updating' ? 'bg-neon-amber/10 text-neon-amber border border-neon-amber/30'
                  : 'bg-red-500/10 text-red-400 border border-red-500/30'
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${realtimeStatus === 'connected' ? 'bg-neon-emerald animate-pulse' : realtimeStatus === 'updating' ? 'bg-neon-amber' : 'bg-red-400'}`} />
                  LIVE
                </div>
              </div>
              <p className="text-gray-500 font-mono text-xs">{APP_NAME} Election Monitoring | {ELECTION_YEAR}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-white font-semibold text-sm">{adminConfig?.admin_name}</p>
              <p className="text-neon-amber font-mono text-xs">CHIEF ELECTORAL OFFICER</p>
            </div>
            <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-dark-500/50 text-gray-400 hover:text-neon-teal hover:border-neon-teal/30 transition-all duration-300 font-mono text-sm">
              <LogOut className="w-4 h-4" /><span className="hidden sm:inline">Exit</span>
            </button>
          </div>
        </div>

        {/* ─── BALLOT TICKER (STOCK MARKET STYLE) ─── */}
        <div className="glass-card p-3 mb-6 overflow-hidden border-neon-teal/20 relative">
          {/* Left fade mask */}
          <div className="absolute left-0 top-0 bottom-0 w-12 z-10 pointer-events-none" style={{ background: 'linear-gradient(to right, rgba(17,24,39,0.9), transparent)' }} />
          {/* Right fade mask */}
          <div className="absolute right-0 top-0 bottom-0 w-12 z-10 pointer-events-none" style={{ background: 'linear-gradient(to left, rgba(17,24,39,0.9), transparent)' }} />
          <div className="relative overflow-hidden whitespace-nowrap">
            <div className="inline-block" style={{ animation: 'marquee 40s linear infinite' }}>
              <span className="text-sm font-mono text-neon-teal tracking-wider">{tickerText}</span>
            </div>
          </div>
        </div>

        {/* ─── WELCOME BANNER ─── */}
        <div className="glass-card p-6 mb-8 border-neon-amber/20 animate-slide-up">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-neon-amber/20 to-neon-amber/5 border border-neon-amber/30 flex items-center justify-center flex-shrink-0">
              <Shield className="w-7 h-7 text-neon-amber" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold italic tracking-wide text-white">Welcome <span className="text-neon-amber font-black">{adminConfig?.admin_name}</span></h2>
              <p className="text-neon-amber/80 text-sm md:text-base italic font-light tracking-wide mt-0.5">Mr/Mrs young and dynamic chief electoral officer</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-dark-500/30 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-neon-emerald animate-pulse" />
            <p className="text-xs text-gray-500 font-mono">Command session active · {new Date().toLocaleString()}</p>
          </div>
        </div>

        {/* ─── ELECTION TIME CONTROLLER ─── */}
        <div className="glass-card p-6 mb-8 border-neon-teal/20">
          <h3 className="text-lg font-bold uppercase italic tracking-wider text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-neon-teal" /> Election Time Controller
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: datetime inputs */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wider font-mono">Start Time</label>
                <input type="datetime-local" value={electionStart} onChange={(e) => setElectionStart(e.target.value)}
                  className="input-neon text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wider font-mono">End Time</label>
                <input type="datetime-local" value={electionEnd} onChange={(e) => setElectionEnd(e.target.value)}
                  className="input-neon text-sm" />
              </div>
              <button onClick={handleUpdateWindow} disabled={updatingWindow}
                className="btn-neon w-full flex items-center justify-center gap-2 disabled:opacity-50">
                {updatingWindow ? <Loader2 className="w-4 h-4 animate-spin" /> : <Timer className="w-4 h-4" />}
                {updatingWindow ? 'Updating...' : 'Update Election Window'}
              </button>
              {windowStatus && (
                <div className={`p-3 rounded-lg text-sm ${windowStatus.includes('successfully') || windowStatus.includes('LIVE') ? 'bg-neon-emerald/10 border border-neon-emerald/30 text-neon-emerald' : 'bg-red-500/10 border border-red-500/30 text-red-400'}`}>
                  {windowStatus}
                </div>
              )}
            </div>
            {/* Right: quick actions + status */}
            <div className="space-y-4">
              <p className="text-sm text-gray-400 font-mono">Quick Actions</p>
              <button onClick={handleInstantLive} disabled={updatingWindow}
                className="btn-neon-emerald w-full flex items-center justify-center gap-2 disabled:opacity-50 text-base py-4">
                <Zap className="w-5 h-5" />
                Start Election Now (2-Hour Window)
              </button>
              <div className="glass-card p-4 bg-dark-700/30">
                <p className="text-xs text-gray-500 font-mono uppercase tracking-wider mb-2">Current Election Status</p>
                {electionStart && electionEnd ? (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Start:</span>
                      <span className="text-white font-mono">{new Date(electionStart).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">End:</span>
                      <span className="text-white font-mono">{new Date(electionEnd).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs mt-2">
                      <span className="text-gray-400">Duration:</span>
                      <span className="text-neon-teal font-mono">
                        {Math.round((new Date(electionEnd) - new Date(electionStart)) / (1000 * 60 * 60) * 10) / 10}h
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 italic">Not configured</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ─── STATS GRID ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Users} label="Total Students" value={totalStudents} sublabel="Registered voters" color="text-neon-teal" glowColor="#00F0FF" />
          <StatCard icon={CheckCircle} label="Votes Cast" value={votedStudents} sublabel={`${turnout}% turnout`} color="text-neon-emerald" glowColor="#00FF88" />
          <StatCard icon={UserX} label="Pending" value={totalStudents - votedStudents} sublabel="Yet to vote" color="text-neon-amber" glowColor="#FFB800" />
          <StatCard icon={BarChart3} label="Candidates" value={candidates.length} sublabel={`Across ${Object.keys(candidatesByPosition).length} positions`} color="text-neon-purple" glowColor="#8B5CF6" />
        </div>

        {/* ─── ROW 1: TURNOUT GAUGE + DEPT PIE ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Overall Turnout — Radial */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold uppercase italic tracking-wider text-white mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-neon-teal" /> Overall Turnout
            </h3>
            <div className="h-[300px] relative">
              <svg style={{ height: 0, width: 0 }}>
                <defs><linearGradient id="turnoutGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={GRADIENT_CYAN} /><stop offset="100%" stopColor={GRADIENT_EMERALD} />
                </linearGradient></defs>
              </svg>
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart cx="50%" cy="50%" innerRadius="30%" outerRadius="90%" barSize={16} data={radialData} startAngle={180} endAngle={0}>
                  <RadialBar dataKey="value" cornerRadius={8} background={{ fill: '#1A2332' }} />
                  <Legend wrapperStyle={{ fontSize: '12px', color: '#9CA3AF' }} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                <p className="text-5xl font-black text-white font-mono">{turnout}%</p>
                <p className="text-neon-teal text-xs font-mono uppercase tracking-wider mt-1">Turnout</p>
              </div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 font-mono mt-2">
              <span>{votedStudents} voted</span><span>{totalStudents - votedStudents} pending</span>
            </div>
          </div>

          {/* Department Pie — unique students */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold uppercase italic tracking-wider text-white mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-neon-emerald" /> Department-wise Breakdown
            </h3>
            <div className="h-[300px]">
              {noVotesYet ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <div className="w-16 h-16 rounded-full bg-neon-amber/10 border border-neon-amber/20 flex items-center justify-center mb-4">
                    <Activity className="w-8 h-8 text-neon-amber animate-pulse-neon" />
                  </div>
                  <p className="text-sm text-neon-amber font-mono uppercase tracking-wider">System Live</p>
                  <p className="text-gray-500 text-xs mt-1 italic">Awaiting First Ballot</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie data={deptPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100}
                      dataKey="value" nameKey="name" activeIndex={activeIndex}
                      activeShape={renderActiveShape} onMouseEnter={onPieEnter} paddingAngle={3}>
                      {deptPieData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                  </RePieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* ─── ROW 2: VOTING VELOCITY (AREA CHART) ─── */}
        <div className="glass-card p-6 mb-8">
          <h3 className="text-lg font-bold uppercase italic tracking-wider text-white mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-neon-amber" /> Voting Velocity — Volume by Hour
          </h3>
          <div className="h-[250px]">
            {timelineData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="velocityGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FFB800" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#FFB800" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#243044" vertical={false} />
                  <XAxis dataKey="hour" stroke="#6B7280" tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                  <YAxis stroke="#6B7280" tick={{ fill: '#9CA3AF', fontSize: 11 }} allowDecimals={false} />
                  <Tooltip content={<AreaTooltip />} />
                  <Area type="monotone" dataKey="votes" stroke="#FFB800" strokeWidth={2} fill="url(#velocityGradient)" dot={{ fill: '#FFB800', stroke: '#FFB800', strokeWidth: 2, r: 3 }} activeDot={{ r: 6, fill: '#FFB800' }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <div className="w-16 h-16 rounded-full bg-neon-amber/10 border border-neon-amber/20 flex items-center justify-center mb-4">
                  <Activity className="w-8 h-8 text-neon-amber animate-pulse-neon" />
                </div>
                <p className="text-sm text-neon-amber font-mono uppercase tracking-wider">System Live</p>
                <p className="text-gray-500 text-xs mt-1 italic">Awaiting First Ballot</p>
              </div>
            )}
          </div>
        </div>

        {/* ─── ROW 3: YEAR MATRIX + MARGIN GAUGES ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Year-Wise Popularity Stack */}
          <div className="glass-card p-6 lg:col-span-1">
            <h3 className="text-lg font-bold uppercase italic tracking-wider text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-neon-teal" /> Year-Wise Popularity
            </h3>
            <div className="h-[250px]">
              {yearStackData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={yearStackData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#243044" vertical={false} />
                    <XAxis dataKey="name" stroke="#6B7280" tick={{ fill: '#9CA3AF', fontSize: 10 }} />
                    <YAxis stroke="#6B7280" tick={{ fill: '#9CA3AF', fontSize: 10 }} allowDecimals={false} />
                    <Tooltip contentStyle={{ background: '#111827', border: '1px solid #00F0FF40', borderRadius: '12px' }} labelStyle={{ color: '#fff' }} />
                    <Legend wrapperStyle={{ fontSize: '10px', color: '#9CA3AF' }} formatter={(v) => <span style={{ color: '#9CA3AF' }}>{v}</span>} />
                    {Object.entries(YEAR_COLORS).map(([year, color]) => (
                      <Bar key={year} dataKey={year} stackId="a" fill={color} radius={[4, 4, 0, 0]} />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <div className="w-16 h-16 rounded-full bg-neon-amber/10 border border-neon-amber/20 flex items-center justify-center mb-4">
                    <Activity className="w-8 h-8 text-neon-amber animate-pulse-neon" />
                  </div>
                  <p className="text-sm text-neon-amber font-mono uppercase tracking-wider">System Live</p>
                  <p className="text-gray-500 text-xs mt-1 italic">Awaiting First Ballot</p>
                </div>
              )}
            </div>
            <div className="flex gap-4 justify-center mt-2">
              {Object.entries(YEAR_COLORS).map(([year, color]) => (
                <div key={year} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-[10px] text-gray-400 font-mono">{year}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Margin of Victory Battle Gauges */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold uppercase italic tracking-wider text-white mb-4 flex items-center gap-2">
              <ChevronsLeftRight className="w-5 h-5 text-neon-amber" /> Margin of Victory
            </h3>
            <div className="space-y-4">
              {noVotesYet ? (
                <div className="flex flex-col items-center justify-center h-[200px] text-gray-500">
                  <div className="w-16 h-16 rounded-full bg-neon-amber/10 border border-neon-amber/20 flex items-center justify-center mb-4">
                    <Activity className="w-8 h-8 text-neon-amber animate-pulse-neon" />
                  </div>
                  <p className="text-sm text-neon-amber font-mono uppercase tracking-wider">System Live</p>
                  <p className="text-gray-500 text-xs mt-1 italic">Awaiting First Ballot</p>
                </div>
              ) : (
                <>
                  <MarginGauge position="President" candidates={positionVotes['president'] || []} />
                  <MarginGauge position="Vice President" candidates={positionVotes['vice_president'] || []} />
                </>
              )}
            </div>
          </div>
        </div>

        {/* ─── POSITION-WISE RESULTS ─── */}
        <div className="glass-card p-6 mb-8">
          <h3 className="text-lg font-bold uppercase italic tracking-wider text-white mb-6 flex items-center gap-2">
            <Vote className="w-5 h-5 text-neon-teal" /> Position-wise Results
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {POSITIONS.map(position => {
              const pVotes = voteData.filter(v => v.position === position.id)
              const total = pVotes.reduce((s, v) => s + v.votes, 0)
              return (
                <div key={position.id} className="bg-dark-700/30 border border-dark-500/30 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-neon-teal uppercase tracking-wider">{position.label}</h4>
                    <span className="text-xs font-mono text-gray-400">{total} votes</span>
                  </div>
                  {pVotes.length > 0 ? (
                    <div className="space-y-2">
                      {pVotes.map((c, idx) => (
                        <div key={c.name} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold" style={{ backgroundColor: `${CHART_COLORS[idx % CHART_COLORS.length]}20`, color: CHART_COLORS[idx % CHART_COLORS.length] }}>
                              {c.name.charAt(0)}
                            </div>
                            <span className="text-sm text-gray-300">{c.name}</span>
                          </div>
                          <span className="text-sm font-mono text-white font-bold">{c.votes}</span>
                        </div>
                      ))}
                    </div>
                  ) : (<p className="text-xs text-gray-500">No votes yet</p>)}
                </div>
              )
            })}
          </div>
        </div>

        {/* ─── CANDIDATE ROSTER ─── */}
        <div className="glass-card p-6 mb-8 border-neon-teal/20">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold uppercase italic tracking-wider text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-neon-teal" /> Candidate Roster Management
            </h3>
            <button onClick={() => setShowAddModal(true)} className="btn-neon-emerald flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Candidate
            </button>
          </div>
          {Object.keys(candidatesByPosition).length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <Users className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg">No candidates in the roster</p>
              <p className="text-sm text-gray-600 mt-1">Add candidates using the button above</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {POSITIONS.map(position => {
                const posCands = candidatesByPosition[position.id]
                if (!posCands) return null
                return (
                  <div key={position.id} className="bg-dark-700/30 border border-dark-500/30 rounded-xl p-4">
                    <h4 className="text-sm font-semibold text-neon-amber uppercase tracking-wider mb-3">
                      {position.label}<span className="text-gray-500 text-xs font-mono ml-2">({posCands.length})</span>
                    </h4>
                    <div className="space-y-2">
                      {posCands.map(candidate => (
                        <div key={candidate.id} className="flex items-center justify-between p-2 rounded-lg bg-dark-800/40 border border-dark-500/20 hover:border-dark-500/50 transition-colors group">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-dark-600/50 flex items-center justify-center font-bold text-sm text-white flex-shrink-0">{candidate.name.charAt(0)}</div>
                            <div className="min-w-0">
                              <p className="text-sm text-white font-medium truncate">{candidate.name}</p>
                              {candidate.year && <p className="text-xs text-gray-500 font-mono">{candidate.year}</p>}
                            </div>
                          </div>
                          <button onClick={() => setRemoveCandidate(candidate)} className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-all flex-shrink-0" title={`Remove ${candidate.name}`}>
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* ─── PURGE ─── */}
        <div className="glass-card p-6 border-red-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 flex-shrink-0"><AlertTriangle className="w-6 h-6" /></div>
              <div>
                <h3 className="text-lg font-bold uppercase italic tracking-wider text-red-400">Danger Zone</h3>
                <p className="text-gray-400 text-sm mt-1">Purge all voting data. This action is irreversible and will reset the entire election.</p>
              </div>
            </div>
            <button onClick={() => setShowPurgeConfirm(true)} className="btn-danger flex items-center gap-2"><Trash2 className="w-5 h-5" /> Purge & Reset</button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showPurgeConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="glass-card max-w-md w-full p-8 animate-slide-up border-red-500/30">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-500/20 border border-red-500/30 mb-4"><AlertTriangle className="w-8 h-8 text-red-400" /></div>
              <h2 className="text-2xl font-black uppercase italic tracking-wider text-white">Confirm Purge</h2>
              <p className="text-gray-400 mt-2">This will permanently delete all votes and reset all student voting status.<span className="text-red-400 block mt-2 font-bold">This action cannot be undone.</span></p>
            </div>
            <div className="bg-dark-700/50 rounded-xl p-4 mb-6 border border-dark-500/30">
              <p className="text-sm text-gray-300">This will:</p>
              <ul className="text-sm text-gray-400 mt-2 space-y-1 list-disc list-inside">
                <li>Delete all vote records</li><li>Reset all student 'has_voted' flags to false</li><li>Clear all session data</li>
              </ul>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setShowPurgeConfirm(false)} className="btn-neon flex-1" disabled={purging}><X className="w-5 h-5" /> Cancel</button>
              <button onClick={handlePurge} disabled={purging} className="btn-danger flex-1 flex items-center justify-center gap-2 disabled:opacity-50">
                {purging ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}{purging ? 'Purging...' : 'Confirm Purge'}
              </button>
            </div>
          </div>
        </div>
      )}

      <AddCandidateModal open={showAddModal} onClose={() => setShowAddModal(false)} onAdded={fetchData} />
      <RemoveConfirmModal open={!!removeCandidate} candidate={removeCandidate} onClose={() => setRemoveCandidate(null)} onRemoved={fetchData} />

      {/* Marquee animation style */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(100vw); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  )
}