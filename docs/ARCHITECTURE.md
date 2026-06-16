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

## Future Integrations

- **Gmail** (`gmailService.js`): OAuth → fetch emails with Bills label → parse attachments
- **Claude API** (`claudeService.js`): Extract structured billing data from email/PDF text
- **Google Sheets** (`sheetsService.js`): Persist bills and providers to a shared spreadsheet
- **pdf.js** (`pdfService.js`): Extract text from PDF bill attachments
