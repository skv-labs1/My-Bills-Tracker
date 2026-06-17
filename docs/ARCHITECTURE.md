# Architecture

## Overview

BillTracker is a client-side React SPA with no backend. All data lives in React state (seeded from mock data). Future integrations (Gmail, Google Sheets, Claude API) are stubbed in `src/services/`.

## Directory Structure

```
src/
  __mocks__/      Mock data for development
  components/     UI components
    Charts/       Recharts wrappers
  context/        React context (BillsContext)
  data/           Static seed data
  services/       External API stubs
  utils/          Pure helper functions
```

## Data Flow

```
mockData.js → BillsContext → Components
```

State is managed entirely in `BillsContext`. Components read from context via `useBills()`.

## Spike Detection

`spikeDetection.js` compares `bill.amount` against `provider.baseline_amount`. If the percentage deviation exceeds `provider.spike_threshold_pct`, the bill is flagged.

## Email Parsing Pipeline

When the user clicks **Sync Gmail**, `syncService.js` runs:

- **Gmail** (`gmailService.js`): OAuth → fetch emails from the bills inbox
- **Rule-based parser** (`ruleBasedParser.js`): regex rules for ~25 known Canadian providers — instant and free
- **Gemini AI** (`geminiService.js`): free-tier Gemini fallback that reads any email format the rules can't recognise
- **Google Sheets** (`sheetsService.js`): Persist parsed bills and providers to a shared spreadsheet
