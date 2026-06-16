# Architecture — BillTracker

## Six Dashboard Zones

| Zone | Component | Purpose |
|---|---|---|
| 1 | SummaryStrip | 4 metric cards: monthly total, due this week, spikes, MoM change |
| 2 | CalendarView | Monthly calendar with colour-coded bill due dates |
| 3 | Charts (3×) | Line trend / Category pie / Actual vs Expected bar |
| 4 | SpikeAlerts | Cards for bills exceeding the spike threshold |
| 5 | BillsTable | Sortable, filterable ledger of all bills |
| 6 | Settings | Add provider/bill, sync Gmail, export CSV, historical matrix |

## Data Flow (Stage 1)

```
Gmail API → gmailService → claudeService → sheetsService → React Context → UI
```

Currently the UI runs on mock data from `src/__mocks__/mockData.js`. Replacing the context's initial state with live Sheets data wires up the backend.

## Service Layer

| File | Responsibility |
|---|---|
| `gmailService.js` | OAuth, label filtering, attachment fetch |
| `claudeService.js` | AI extraction of amount, due date, provider, account number |
| `sheetsService.js` | CRUD on the BillTracker_Data Google Sheet |
| `pdfService.js` | pdf.js text extraction from email PDF attachments |

## Spike Detection

```
variance = (actual − baseline) / baseline × 100
```

Bills where `|variance| ≥ threshold` (default 10%) are flagged and surfaced in Zone 4 (SpikeAlerts). Threshold is configurable per-provider and globally via Settings.

## State Management

React Context (`BillsContext`) holds bills, providers, settings, and UI navigation state. No external state library needed at this scale.

## Future DB Migration (Stage 2)

The Google Sheets column names map 1:1 to the planned PostgreSQL schema. The only additions will be `user_id` for multi-tenancy and a `created_at` audit timestamp.
