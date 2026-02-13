'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { Search, Users, ArrowRightLeft } from 'lucide-react'

export type TradePlayer = {
  rosterRowId: string
  playerId: string
  fullName: string
  mlbTeam?: string | null
  position?: string | null
  keeperStatus: string
  notes?: string | null
}

export function TradeDashboard({ players }: { players: TradePlayer[] }) {
  const [selected, setSelected] = useState<TradePlayer | null>(null)
  const [search, setSearch] = useState('')
  const [posFilter, setPosFilter] = useState('ALL')

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
                    <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">
                      {p.position ?? '—'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate">{p.fullName}</div>
                      <div className="text-xs text-muted-foreground">
                        {p.mlbTeam ?? '—'}
                        {p.notes ? ' · ' : ''}
                        {p.notes ? <span className="text-accent">{p.notes}</span> : null}
                      </div>
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
                Propose a Trade
              </h2>

              {!selected ? (
                <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
                    <ArrowRightLeft className="w-7 h-7 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground text-sm font-medium">
                    Select a player from the list to start a proposal.
                  </p>
                </div>
              ) : (
                <div className="flex-1 flex flex-col">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/10 border border-primary/30 mb-4">
                    <div className="w-11 h-11 rounded-xl bg-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                      {selected.position ?? '—'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm">{selected.fullName}</div>
                      <div className="text-xs text-muted-foreground">{selected.mlbTeam ?? '—'}</div>
                    </div>
                    <button
                      onClick={() => setSelected(null)}
                      className="px-2 py-1 rounded-lg hover:bg-secondary transition-colors text-xs text-muted-foreground"
                    >
                      Clear
                    </button>
                  </div>

                  {selected.notes ? (
                    <div className="mb-4 p-3 rounded-xl bg-accent/10 border border-accent/30">
                      <div className="text-xs text-muted-foreground mb-1">Notes</div>
                      <div className="text-sm font-semibold">{selected.notes}</div>
                    </div>
                  ) : null}

                  <Link
                    href={`/offer?player=${encodeURIComponent(selected.playerId)}`}
                    className="btn-trade w-full mt-auto text-center"
                  >
                    Write offer for {selected.fullName}
                  </Link>

                  <p className="mt-3 text-xs text-muted-foreground">
                    Offers are free-text (picks/players/cash—anything). I’ll respond if it’s a fit.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
