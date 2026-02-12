import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'

const BodySchema = z.object({
  displayName: z.string().min(1).max(80),
  email: z.string().email().max(254).optional().or(z.literal('')),
  offerText: z.string().min(3).max(5000),
  message: z.string().max(5000).optional().or(z.literal('')),
})

export async function POST(req: Request) {
  const leagueKey = process.env.YAHOO_LEAGUE_KEY
  const teamKey = process.env.YAHOO_TEAM_KEY
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!leagueKey || !teamKey) {
    return new NextResponse('Missing YAHOO_LEAGUE_KEY/YAHOO_TEAM_KEY', { status: 500 })
  }
  if (!supabaseUrl || !supabaseAnonKey) {
    return new NextResponse('Missing Supabase env', { status: 500 })
  }

  const json = await req.json().catch(() => null)
  const parsed = BodySchema.safeParse(json)
  if (!parsed.success) {
    return new NextResponse(parsed.error.message, { status: 400 })
  }

  const { displayName, email, offerText, message } = parsed.data

  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  // Create manager
  const { data: manager, error: managerErr } = await supabase
    .from('managers')
    .insert({
      display_name: displayName,
      email: email || null,
    })
    .select('id')
    .single()

  if (managerErr) {
    return new NextResponse(managerErr.message, { status: 500 })
  }

  const { error: offerErr } = await supabase.from('trade_offers').insert({
    yahoo_league_key: leagueKey,
    yahoo_team_key: teamKey,
    from_manager_id: manager.id,
    offer_text: offerText,
    message: message || null,
    status: 'submitted',
  })

  if (offerErr) {
    return new NextResponse(offerErr.message, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
