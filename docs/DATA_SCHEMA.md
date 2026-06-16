# Data Schema

## Google Sheets (Stage 1)

### Sheet: `bills`
| Column | Type | Notes |
|---|---|---|
| id | string | UUID |
| provider | string | e.g. Rogers |
| category | string | Telecom / Utilities / Streaming / Insurance / Internet / Other |
| amount | number | Actual billed amount (CAD) |
| expected | number | Baseline / expected amount |
| variance_pct | number | (actual−expected)/expected×100 |
| due_date | date | YYYY-MM-DD |
| billing_period_start | date | |
| billing_period_end | date | |
| account_number | string | |
| payment_method | string | Credit Card / Bank Transfer / etc. |
| flagged | boolean | true if variance exceeds provider threshold |
| flag_reason | string | Human-readable spike explanation |
| email_id | string | Gmail message ID (for traceability) |
| parsed_at | datetime | When Claude extracted this bill |

### Sheet: `providers`
| Column | Type | Notes |
|---|---|---|
| provider_name | string | Unique key |
| category | string | |
| baseline_amount | number | Initial / rolling-average billed amount |
| spike_threshold_pct | number | Per-provider override (default 10) |
| first_seen | date | |
| notes | string | |
| active | boolean | |

### Sheet: `settings`
| Column | Notes |
|---|---|
| key | Setting name |
| value | Setting value (serialized as string) |

Default settings: `default_threshold=10`, `currency=CAD`, `timezone=America/Toronto`

## Future PostgreSQL Schema (Stage 2)

Column names above map 1:1. Additional tables:

```sql
-- Multi-tenancy
users (id, email, google_oauth_token, created_at)

-- Raw email log before parsing
email_queue (id, user_id, gmail_message_id, received_at, processed_at, status)

-- Audit history
audit_log (id, table_name, row_id, changed_by, changed_at, diff_json)
```
