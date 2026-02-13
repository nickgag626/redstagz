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

## One-time keepers import (no scraping)

Since Yahoo’s pre-draft keepers view doesn’t map cleanly to the roster API, the MVP importer is a **one-time seed** based on the keeper page paste.

### 1) Add env var
Add to Vercel (or `.env.local`):
- `IMPORT_SECRET` = a long random string

### 2) Run the import (once)
Send a POST to:
- `/api/admin/import-keepers`

with header:
- `x-import-secret: <IMPORT_SECRET>`

Example:
```bash
curl -X POST \
  -H "x-import-secret: $IMPORT_SECRET" \
  https://<your-domain>/api/admin/import-keepers
```

This will upsert 28 players into `players` and add them to `my_roster_players` with `is_available=true`.

## Enrichment: FantasyPros ECR

### 1) Run migration in Supabase
Run:
- `supabase/migrations/0002_fantasypros.sql`

### 2) Call the enrichment endpoint (protected)
```bash
curl -X POST \
  -H "x-import-secret: $IMPORT_SECRET" \
  https://redstagz.vercel.app/api/admin/enrich-fantasypros
```

This fetches FantasyPros overall rankings and updates `players.fantasypros_ecr` for any matched players.

## Next steps
- Show ECR + statlines in UI
- Admin dashboard to toggle keeper status + availability
- Offer inbox for admin
