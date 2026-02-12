import Link from 'next/link'
import { getSupabaseClient } from '@/lib/supabase'

export const revalidate = 60 // ISR: refresh trade block every minute

type TradeBlockRow = {
  id: string
  notes: string | null
  keeper_status: string
  players: {
    id: string
    full_name: string
    mlb_team: string | null
    primary_position: string | null
  } | null
}

export default async function Home() {
  const leagueKey = process.env.YAHOO_LEAGUE_KEY
  const teamKey = process.env.YAHOO_TEAM_KEY

  // If env not set, show setup instructions.
  if (!leagueKey || !teamKey) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <h1 className="text-2xl font-bold">Red Stagz — Trade Portal</h1>
        <p className="mt-4">
          Missing <code>YAHOO_LEAGUE_KEY</code> / <code>YAHOO_TEAM_KEY</code> env vars.
          Copy <code>.env.example</code> → <code>.env.local</code> and set them.
        </p>
      </main>
    )
  }

  const supabase = getSupabaseClient()
  if (!supabase) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <h1 className="text-2xl font-bold">Red Stagz — Trade Portal</h1>
        <p className="mt-4">
          Missing Supabase env vars. Copy <code>.env.example</code> → <code>.env.local</code> and set:
          <code> NEXT_PUBLIC_SUPABASE_URL</code> and <code> NEXT_PUBLIC_SUPABASE_ANON_KEY</code>.
        </p>
      </main>
    )
  }

  const { data, error } = await supabase
    .from('my_roster_players')
    .select('id, notes, keeper_status, players:player_id(id, full_name, mlb_team, primary_position)')
    .eq('yahoo_league_key', leagueKey)
    .eq('yahoo_team_key', teamKey)
    .eq('is_available', true)
    .order('keeper_status', { ascending: true })

  if (error) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <h1 className="text-2xl font-bold">Red Stagz — Trade Portal</h1>
        <p className="mt-4 text-red-600">Failed to load trade block: {error.message}</p>
      </main>
    )
  }

  const rows = (data ?? []) as unknown as TradeBlockRow[]

  return (
    <main className="mx-auto max-w-4xl p-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Red Stagz — Trade Portal</h1>
          <p className="mt-1 text-sm text-gray-600">Players currently available for trade.</p>
        </div>
        <Link
          href="/offer"
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white"
        >
          Propose a trade
        </Link>
      </header>

      <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {rows.map((r) => (
          <li key={r.id} className="rounded-lg border bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-semibold">
                  {r.players?.full_name ?? 'Unknown player'}
                </div>
                <div className="text-sm text-gray-600">
                  {(r.players?.primary_position ?? '—')}
                  {r.players?.mlb_team ? ` · ${r.players.mlb_team}` : ''}
                </div>
              </div>
              <div className="text-xs text-gray-500">{r.keeper_status}</div>
            </div>
            {r.notes ? <p className="mt-3 text-sm">{r.notes}</p> : null}
          </li>
        ))}
      </ul>

      {rows.length === 0 ? (
        <p className="mt-8 text-gray-600">
          Nothing listed yet. (Once we import your keepers, they’ll show here.)
        </p>
      ) : null}
    </main>
  )
}
