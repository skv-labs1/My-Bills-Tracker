# Data Schema

## Bill

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique identifier |
| `provider` | string | Provider name |
| `category` | string | Telecom / Internet / Utilities / Streaming / Insurance / Other |
| `amount` | number | Actual billed amount |
| `expected` | number | Expected / baseline amount |
| `variance_pct` | number | `(amount - expected) / expected * 100` |
| `due_date` | string | ISO date (YYYY-MM-DD) |
| `billing_period_start` | string | ISO date |
| `billing_period_end` | string | ISO date |
| `account_number` | string | Account reference |
| `payment_method` | string | Credit Card / Bank Transfer / etc. |
| `flagged` | boolean | True if variance exceeds threshold |
| `flag_reason` | string | Human-readable spike reason |
| `status` | string | upcoming / paid / overdue |

## Provider

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique identifier |
| `provider_name` | string | Display name |
| `category` | string | Category |
| `baseline_amount` | number | Expected monthly amount |
| `spike_threshold_pct` | number | Alert threshold in % |
| `first_seen` | string | ISO date first bill was received |
| `active` | boolean | Whether provider is active |

## Settings

| Field | Type | Description |
|---|---|---|
| `default_threshold` | number | Global spike threshold % |
| `currency` | string | ISO currency code |
| `timezone` | string | IANA timezone |
