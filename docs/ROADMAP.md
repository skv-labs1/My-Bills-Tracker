# Roadmap

## Stage 1 — Personal MVP (current)
- React + Vite dashboard with mock data
- Google Sheets as backend storage
- Manual bill entry via Settings
- Spike alert detection and visualization
- CSV export
- Sortable bills table with provider drill-down
- Due-date calendar

## Stage 2 — Multi-user
- Supabase PostgreSQL backend (schema maps cleanly from Stage 1 Sheets)
- Auth (email + Google OAuth) via Supabase Auth
- Hosted email inbox per user (dedicated bills@ address)
- Automated Gmail → Claude → DB pipeline running on a schedule
- Email/push notifications for spike alerts
- PR preview deployments via Vercel

## Stage 3 — Commercial
- Plaid bank transaction integration (reconcile bills against actual charges)
- Mobile app (React Native)
- Subscription billing (Stripe)
- AI insights engine: spending forecasts, anomaly explanations, contract renewal alerts
- White-label option for financial advisors
