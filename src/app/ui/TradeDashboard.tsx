'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { Search, Users, ArrowRightLeft, Check, X, Zap } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { getLabeledStat, isPitcher } from '@/app/ui/stats'

export type TradePlayer = {
  rosterRowId: string
  playerId: string
  fullName: string
  mlbTeam?: string | null
  position?: string | null
  keeperStatus: string
  notes?: string | null
  headshotUrl?: string | null
  ecr?: number | null
  stats2025?: any | null
}

const DRAFT_PICKS = Array.from({ length: 24 }, (_, i) => i + 1)

const LEAGUE_TEAMS = [
  'Tunnel Snakes',
  'Alex in Chains',
  'Bleacher Creatures',
  'ClutchHutch',
  "Goin' Yahdgoats",
  'Greasy Cap Advisors',
  'Lollygaggers',
  'Red Stagz',
  'Runs-N-Roses',
  'The Dirty Farm',
  'Lake Monsters',
  "Tyler's Slugfest",
]

export function TradeDashboard({ players }: { players: TradePlayer[] }) {
  const [selected, setSelected] = useState<TradePlayer | null>(null)
  const [search, setSearch] = useState('')
  const [posFilter, setPosFilter] = useState('ALL')

  const [selectedPicks, setSelectedPicks] = useState<number[]>([])
  const [fromTeam, setFromTeam] = useState('')
  const [notes, setNotes] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const togglePick = (pick: number) => {
    setSelectedPicks((prev) => (prev.includes(pick) ? prev.filter((p) => p !== pick) : [...prev, pick]))
  }

  const clearTrade = () => {
    setSelectedPicks([])
    setFromTeam('')
    setNotes('')
    setSelected(null)
  }

  const submitOffer = async () => {
    if (!selected || selectedPicks.length === 0 || !fromTeam) return

    // MVP: create a clear offer text from picks. Manager still writes details in notes.
    const offerText = `Offering picks #${selectedPicks
      .slice()
      .sort((a, b) => a - b)
      .join(', #')} for ${selected.fullName}`

    // lightweight identity for public users
    const payload = {
      teamName: fromTeam,
      displayName: '',
      email: '',
      requestedPlayerId: selected.playerId,
      offerText,
      message: notes,
    }

    const res = await fetch('/api/offers', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const t = await res.text().catch(() => '')
      toast.error(t || 'Failed to submit offer')
      return
    }

    setSubmitted(true)
    toast.success(`Trade offer sent! ${selectedPicks.length} pick(s) for ${selected.fullName}`, { duration: 4000 })
    setTimeout(() => {
      setSubmitted(false)
      clearTrade()
    }, 1500)
  }

  const positions = useMemo(() => {
    const set = new Set<string>()
    for (const p of players) if (p.position) set.add(p.position)
    return ['ALL', ...Array.from(set).sort()]
  }, [players])

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return players.filter((p) => {
      const matchSearch =
        !q || p.fullName.toLowerCase().includes(q) || (p.mlbTeam ?? '').toLowerCase().includes(q)
      const matchPos = posFilter === 'ALL' || p.position === posFilter
      return matchSearch && matchPos
    })
  }, [players, search, posFilter])

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto px-4">
        <header className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/red-stagz-logo.png" alt="Red Stagz" className="w-10 h-10 object-contain" />
            <div>
              <h1 className="text-xl font-extrabold tracking-tight leading-none">Red Stagz</h1>
              <p className="text-xs text-muted-foreground">Fantasy Baseball — Trade Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="stat-badge bg-success/15 text-success">
              <Users className="w-3 h-3" />
              Trade Block: {players.length}
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 pb-8">
          {/* Player list */}
          <div className="lg:col-span-3 min-h-[60vh]">
            <div className="dashboard-card flex flex-col h-full">
              <h2 className="text-lg font-extrabold tracking-tight mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Available Players
              </h2>

              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search players..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-secondary border border-border rounded-lg pl-9 pr-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
              </div>

              <div className="flex gap-1.5 mb-3 flex-wrap">
                {positions.map((pos) => (
                  <button
                    key={pos}
                    onClick={() => setPosFilter(pos)}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                      posFilter === pos
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {pos}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto space-y-1 -mx-1 px-1">
                {filtered.map((p) => (
                  <div
                    key={p.rosterRowId}
                    onClick={() => setSelected(p)}
                    className={`player-row ${selected?.rosterRowId === p.rosterRowId ? 'selected' : ''}`}
                  >
                    <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0 overflow-hidden">
                      {p.headshotUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.headshotUrl} alt={p.fullName} className="w-full h-full object-cover" />
                      ) : (
                        <span>{p.position ?? '—'}</span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate flex items-center gap-2">
                        <span>{p.fullName}</span>
                        {typeof p.ecr === 'number' ? (
                          <span className="stat-badge bg-accent/10 text-accent">ECR #{p.ecr}</span>
                        ) : null}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {p.position ?? '—'} · {p.mlbTeam ?? '—'}
                        {p.notes ? ' · ' : ''}
                        {p.notes ? <span className="text-accent">{p.notes}</span> : null}
                      </div>
                    </div>

                    {/* row stats */}
                    <div className="hidden md:flex items-center gap-3 text-xs font-mono text-muted-foreground">
                      {(isPitcher(p.position)
                        ? [
                            { label: 'W', value: getLabeledStat(p.stats2025, ['W']) },
                            { label: 'K', value: getLabeledStat(p.stats2025, ['K']) },
                            { label: 'ERA', value: getLabeledStat(p.stats2025, ['ERA']) },
                            { label: 'WHIP', value: getLabeledStat(p.stats2025, ['WHIP']) },
                            { label: 'SV+H', value: getLabeledStat(p.stats2025, ['SV+H', 'SV+HLD', 'SV+HOLD']) },
                          ]
                        : [
                            { label: 'R', value: getLabeledStat(p.stats2025, ['R']) },
                            { label: 'HR', value: getLabeledStat(p.stats2025, ['HR']) },
                            { label: 'RBI', value: getLabeledStat(p.stats2025, ['RBI']) },
                            { label: 'SB', value: getLabeledStat(p.stats2025, ['SB']) },
                            { label: 'OBP', value: getLabeledStat(p.stats2025, ['OBP']) },
                          ])
                        .map((s) => (
                          <span key={s.label}>
                            {s.label}:{' '}
                            <span className="text-foreground">{s.value ?? '—'}</span>
                          </span>
                        ))}
                    </div>

                    <div className="text-xs text-muted-foreground">{p.keeperStatus}</div>
                  </div>
                ))}

                {filtered.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">No players found</div>
                ) : null}
              </div>
            </div>
          </div>

          {/* Trade panel */}
          <div className="lg:col-span-2">
            <div className="dashboard-card flex flex-col">
              <h2 className="text-lg font-extrabold tracking-tight mb-3 flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-primary" />
                Make a Trade
              </h2>

              <AnimatePresence mode="wait">
                {!selected ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 flex flex-col items-center justify-center py-12 text-center"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
                      <Zap className="w-7 h-7 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground text-sm font-medium">
                      Select a player from the roster to start a trade
                    </p>
                  </motion.div>
                ) : submitted ? (
                  <motion.div
                    key="submitted"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 flex flex-col items-center justify-center py-12 text-center"
                  >
                    <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mb-4">
                      <Check className="w-8 h-8 text-success" />
                    </div>
                    <p className="text-foreground font-bold text-lg">Trade Submitted!</p>
                    <p className="text-muted-foreground text-sm mt-1">Awaiting review</p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="trade-form"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="flex-1 flex flex-col"
                  >
                    {/* Selected player */}
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/10 border border-primary/30 mb-4">
                      <div className="w-11 h-11 rounded-xl bg-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0 overflow-hidden">
                        {selected.headshotUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={selected.headshotUrl} alt={selected.fullName} className="w-full h-full object-cover" />
                        ) : (
                          <span>{selected.position ?? '—'}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm flex items-center gap-2">
                          <span>{selected.fullName}</span>
                          {typeof selected.ecr === 'number' ? (
                            <span className="stat-badge bg-accent/10 text-accent">ECR #{selected.ecr}</span>
                          ) : null}
                        </div>
                        <div className="text-xs text-muted-foreground">{selected.position ?? '—'} · {selected.mlbTeam ?? '—'}</div>
                      </div>
                      <button
                        onClick={clearTrade}
                        className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
                        aria-label="Clear"
                      >
                        <X className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>

                    {/* Statline */}
                    <div className="grid grid-cols-5 gap-2 mb-4">
                      {(isPitcher(selected.position)
                        ? [
                            { label: 'W', value: getLabeledStat(selected.stats2025, ['W']) },
                            { label: 'K', value: getLabeledStat(selected.stats2025, ['K']) },
                            { label: 'ERA', value: getLabeledStat(selected.stats2025, ['ERA']) },
                            { label: 'WHIP', value: getLabeledStat(selected.stats2025, ['WHIP']) },
                            { label: 'SV+H', value: getLabeledStat(selected.stats2025, ['SV+H', 'SV+HLD', 'SV+HOLD']) },
                          ]
                        : [
                            { label: 'R', value: getLabeledStat(selected.stats2025, ['R']) },
                            { label: 'HR', value: getLabeledStat(selected.stats2025, ['HR']) },
                            { label: 'RBI', value: getLabeledStat(selected.stats2025, ['RBI']) },
                            { label: 'SB', value: getLabeledStat(selected.stats2025, ['SB']) },
                            { label: 'OBP', value: getLabeledStat(selected.stats2025, ['OBP']) },
                          ])
                        .map((stat) => (
                          <div key={stat.label} className="text-center p-2 rounded-lg bg-secondary">
                            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{stat.label}</div>
                            <div className="text-sm font-bold font-mono">{stat.value ?? '—'}</div>
                          </div>
                        ))}
                    </div>

                    {/* Your team */}
                    <div className="mb-4">
                      <label className="block text-sm font-semibold mb-2">Your team</label>
                      <select
                        value={fromTeam}
                        onChange={(e) => setFromTeam(e.target.value)}
                        className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
                      >
                        <option value="">Select your team…</option>
                        {LEAGUE_TEAMS.filter((t) => t !== 'Red Stagz').map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Draft picks */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold">Offer Draft Picks</span>
                        {selectedPicks.length > 0 ? (
                          <span className="text-xs text-accent font-bold">{selectedPicks.length} selected</span>
                        ) : null}
                      </div>
                      <div className="grid grid-cols-8 sm:grid-cols-12 gap-1.5">
                        {DRAFT_PICKS.map((pick) => (
                          <button
                            key={pick}
                            onClick={() => togglePick(pick)}
                            className={`inline-flex items-center justify-center w-10 h-10 rounded-lg text-sm font-bold border border-border cursor-pointer transition-all duration-150 active:scale-95 ${
                              selectedPicks.includes(pick)
                                ? 'bg-accent text-accent-foreground border-accent shadow-[0_0_12px_hsl(var(--accent)/0.3)]'
                                : 'bg-secondary text-muted-foreground hover:border-accent hover:text-accent'
                            }`}
                          >
                            {pick}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Notes */}
                    <div className="mb-4">
                      <label className="block text-sm font-semibold mb-2">Notes (optional)</label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add any context (players you’re offering, positions you need, etc.)"
                        className="w-full min-h-[90px] rounded-lg border border-border bg-secondary px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                      />
                      <p className="mt-2 text-xs text-muted-foreground">
                        This submits a free-text offer + your selected picks. Add anything else here.
                      </p>
                    </div>

                    <button
                      onClick={submitOffer}
                      disabled={selectedPicks.length === 0 || !fromTeam}
                      className="btn-trade w-full mt-auto"
                    >
                      {!fromTeam
                        ? 'Select your team'
                        : selectedPicks.length === 0
                          ? 'Select picks to offer'
                          : `Submit Trade (${selectedPicks.length} pick${selectedPicks.length > 1 ? 's' : ''})`}
                    </button>

                    <div className="mt-3 text-xs text-muted-foreground">
                      Prefer writing a detailed offer?{' '}
                      <Link href={`/offer?player=${encodeURIComponent(selected.playerId)}`} className="underline">
                        Use the full form
                      </Link>
                      .
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
