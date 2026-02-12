# Red Stagz — Yahoo Fantasy Baseball Trade Portal (MVP)

Goal: publish a simple public page listing Nick’s available players and let other managers submit trade proposals (free text).

## Setup

### 1) Create Supabase project
- Create a project
- In SQL Editor, run: `supabase/schema.sql`

### 2) Configure env vars
Copy:
```bash
cp .env.example .env.local
```
Fill:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `YAHOO_LEAGUE_KEY` (default: `469.l.24701`)
- `YAHOO_TEAM_KEY` (default: `469.l.24701.t.8`)

### 3) Run locally
```bash
npm run dev
```

## Pages
- `/` public trade block
- `/offer` public trade proposal form

## Next steps
- One-time keepers import (Playwright scrape of `/keepers` + Yahoo API enrichment)
- Admin dashboard to toggle keeper status + availability
- Offer inbox for admin
