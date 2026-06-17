# BillTracker

A React + Vite MVP for tracking monthly bills, detecting spending spikes, and visualising trends.

## Features

- **Dashboard** — 4-card summary strip (monthly spend, due this week, spikes, MoM change)
- **Calendar view** — bills plotted on a monthly calendar with colour-coded urgency dots
- **Charts** — 6-month trend line, spend-by-category pie, actual-vs-expected bar
- **Spike alerts** — bills that deviate from baseline by more than the configured threshold
- **Bills table** — sortable, filterable table with click-through to provider profile
- **Provider profile** — per-provider billing history chart + table
- **Historical matrix** — provider × month spend grid
- **Settings** — add bills/providers manually, export CSV, adjust spike threshold

## Quick Start

```bash
cp .env.example .env
npm install
npm run dev
```

## Tech Stack

- React 18 + Vite 5
- Tailwind CSS 3
- Recharts 2
- Lucide React icons

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_GEMINI_API_KEY` | Free Gemini API key from aistudio.google.com (AI email parsing, no credit card) |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID (for Gmail integration) |
| `VITE_GOOGLE_API_KEY` | Google API key |
| `VITE_GOOGLE_SHEET_ID` | Google Sheet ID (for cloud persistence) |
| `VITE_GMAIL_BILLS_LABEL` | Gmail label to scan for bills (default: Bills) |
| `VITE_DEFAULT_SPIKE_THRESHOLD` | Default spike detection threshold in % (default: 10) |
| `VITE_CURRENCY` | Currency code (default: CAD) |
| `VITE_TIMEZONE` | Timezone (default: America/Toronto) |

## Roadmap

See [docs/ROADMAP.md](docs/ROADMAP.md).
