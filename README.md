# BillTracker

A personal bill tracking dashboard for Canadian utilities, telecom, streaming, and insurance bills. Reads forwarded billing emails from Gmail, extracts data using Claude AI, stores it in Google Sheets, and visualizes spending patterns, due dates, and unusual spikes.

## Features

- 6-zone dashboard: summary strip, due-date calendar, trend charts, spike alerts, bills table, settings
- Automatic spike detection (configurable threshold, default 10%)
- Provider history and billing trends
- Manual bill and provider entry
- CSV export
- Historical matrix view (provider × month)

## Quick Start

```bash
git clone https://github.com/your-username/my-bills-tracker
cd my-bills-tracker
npm install
cp .env.example .env
# Fill in .env values (see setup below)
npm run dev
```

Open http://localhost:5173 — the dashboard loads with mock data immediately. No API keys needed to explore the UI.

## Environment Variables

Copy `.env.example` to `.env` and fill in:

| Variable | Description |
|---|---|
| `VITE_CLAUDE_API_KEY` | Anthropic API key |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth 2.0 Client ID |
| `VITE_GOOGLE_API_KEY` | Google API key |
| `VITE_GOOGLE_SHEET_ID` | ID from your Google Sheet URL |
| `VITE_GMAIL_BILLS_LABEL` | Gmail label (default: `Bills`) |
| `VITE_DEFAULT_SPIKE_THRESHOLD` | Spike alert threshold % (default: `10`) |
| `VITE_CURRENCY` | Currency code (default: `CAD`) |
| `VITE_TIMEZONE` | Timezone (default: `America/Toronto`) |

## External Service Setup

### A — Gmail

1. Open Gmail → Settings → Filters and Blocked Addresses
2. Create filter: `from:(*@rogers.com OR *@bell.ca OR *@enbridge.com OR *@netflix.com OR *@spotify.com OR *@hydroone.com OR *@torontohydro.com OR *@telus.com OR *@freedommobile.ca OR *@intact.net OR *@teksavvy.com OR *@beanfield.com)`
3. Action: Apply label `Bills` (optionally skip inbox)
4. Check "Also apply to matching conversations" to backfill

### B — Google Sheet

1. Create a new Google Sheet named `BillTracker_Data`
2. Create 3 tabs: `bills`, `providers`, `settings`
3. `bills` columns: `id | provider | category | amount | expected | variance_pct | due_date | billing_period_start | billing_period_end | account_number | payment_method | flagged | flag_reason | email_id | parsed_at`
4. `providers` columns: `provider_name | category | baseline_amount | spike_threshold_pct | first_seen | notes | active`
5. `settings` columns: `key | value`
6. Copy the Sheet ID from the URL (string between `/d/` and `/edit`)

### C — Google Cloud

1. Go to https://console.cloud.google.com → New project `billtracker`
2. Enable Gmail API and Google Sheets API
3. Create OAuth 2.0 credentials → Web application
4. Add `http://localhost:5173` and your Vercel URL as authorized origins
5. Copy Client ID and API Key to `.env`

### D — Claude API

1. Go to https://console.anthropic.com → Settings → API Keys
2. Create key named `billtracker-prod`
3. Copy to `VITE_CLAUDE_API_KEY`

## Deploy to Vercel

1. Push this repo to GitHub
2. Go to https://vercel.com → Add New Project → import the repo
3. Framework preset: **Vite** · Build: `npm run build` · Output: `dist`
4. Add all environment variables from `.env`
5. Click Deploy — live in ~60 seconds

Every push to `main` auto-deploys. Pull requests get preview URLs automatically.

## Roadmap

See [docs/ROADMAP.md](docs/ROADMAP.md) for Stage 1 → 2 → 3 plan.

## Privacy

All your data stays in your own Google account. No third-party servers store your billing information.
