const SHEET_ID = import.meta.env.VITE_GOOGLE_SHEET_ID
const SHEETS_BASE = 'https://sheets.googleapis.com/v4/spreadsheets'

function authHeader(token) {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
}

async function sheetsGet(path, token) {
  const res = await fetch(`${SHEETS_BASE}${path}`, { headers: authHeader(token) })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`Sheets API ${res.status}: ${err?.error?.message || res.statusText}`)
  }
  return res.json()
}

async function sheetsPost(path, token, body) {
  const res = await fetch(`${SHEETS_BASE}${path}`, {
    method: 'POST',
    headers: authHeader(token),
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`Sheets API ${res.status}: ${err?.error?.message || res.statusText}`)
  }
  return res.json()
}

async function sheetsPut(path, token, body) {
  const res = await fetch(`${SHEETS_BASE}${path}`, {
    method: 'PUT',
    headers: authHeader(token),
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`Sheets API ${res.status}: ${err?.error?.message || res.statusText}`)
  }
  return res.json()
}

// ── Bills sheet columns (0-indexed) ──────────────────────────────────────────
// id | provider | category | amount | expected | variance_pct | due_date | status | flagged | flag_reason | parsed_by | confidence | needs_review | email_id | synced_at
const BILLS_COLS = ['id','provider','category','amount','expected','variance_pct','due_date','status','flagged','flag_reason','parsed_by','confidence','needs_review','email_id','synced_at']
const PROVIDERS_COLS = ['provider_name','category','baseline_amount','spike_threshold_pct','first_seen','active']

function rowToObject(headers, row) {
  const obj = {}
  headers.forEach((h, i) => {
    let v = row[i] ?? ''
    if (h === 'amount' || h === 'expected' || h === 'variance_pct' || h === 'baseline_amount' || h === 'spike_threshold_pct') v = parseFloat(v) || 0
    if (h === 'flagged' || h === 'needs_review' || h === 'active') v = v === 'true' || v === true
    obj[h] = v
  })
  return obj
}

export async function getAllBills(token) {
  if (!SHEET_ID) throw new Error('VITE_GOOGLE_SHEET_ID not set')
  const data = await sheetsGet(`/${SHEET_ID}/values/bills!A1:Z`, token)
  const rows = data.values || []
  if (rows.length < 2) return []
  const [, ...dataRows] = rows
  return dataRows.map(row => rowToObject(BILLS_COLS, row))
}

export async function addBillToSheet(token, bill) {
  if (!SHEET_ID) throw new Error('VITE_GOOGLE_SHEET_ID not set')
  const row = BILLS_COLS.map(col => bill[col] ?? '')
  await sheetsPost(`/${SHEET_ID}/values/bills!A1:Z:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`, token, {
    values: [row],
  })
}

export async function addBillsToSheet(token, bills) {
  if (!SHEET_ID) throw new Error('VITE_GOOGLE_SHEET_ID not set')
  if (!bills.length) return
  const rows = bills.map(bill => BILLS_COLS.map(col => bill[col] ?? ''))
  await sheetsPost(`/${SHEET_ID}/values/bills!A1:Z:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`, token, {
    values: rows,
  })
}

export async function getProviders(token) {
  if (!SHEET_ID) throw new Error('VITE_GOOGLE_SHEET_ID not set')
  const data = await sheetsGet(`/${SHEET_ID}/values/providers!A1:Z`, token)
  const rows = data.values || []
  if (rows.length < 2) return []
  const [, ...dataRows] = rows
  return dataRows.map(row => rowToObject(PROVIDERS_COLS, row))
}

export async function addProviderToSheet(token, provider) {
  if (!SHEET_ID) throw new Error('VITE_GOOGLE_SHEET_ID not set')
  const row = PROVIDERS_COLS.map(col => provider[col] ?? '')
  await sheetsPost(`/${SHEET_ID}/values/providers!A1:Z:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`, token, {
    values: [row],
  })
}

/**
 * Ensure both sheets exist with header rows.
 * Call once after the user first logs in.
 */
export async function initSheet(token) {
  if (!SHEET_ID) throw new Error('VITE_GOOGLE_SHEET_ID not set')

  // Check existing sheet names
  const meta = await sheetsGet(`/${SHEET_ID}?fields=sheets.properties.title`, token)
  const existingNames = (meta.sheets || []).map(s => s.properties.title)

  const requests = []
  if (!existingNames.includes('bills')) {
    requests.push({ addSheet: { properties: { title: 'bills' } } })
  }
  if (!existingNames.includes('providers')) {
    requests.push({ addSheet: { properties: { title: 'providers' } } })
  }

  if (requests.length) {
    await sheetsPost(`/${SHEET_ID}:batchUpdate`, token, { requests })
  }

  // Write headers if rows are empty
  const billsData = await sheetsGet(`/${SHEET_ID}/values/bills!A1:A1`, token)
  if (!billsData.values) {
    await sheetsPut(`/${SHEET_ID}/values/bills!A1:Z1?valueInputOption=RAW`, token, {
      values: [BILLS_COLS],
    })
  }

  const providersData = await sheetsGet(`/${SHEET_ID}/values/providers!A1:A1`, token)
  if (!providersData.values) {
    await sheetsPut(`/${SHEET_ID}/values/providers!A1:Z1?valueInputOption=RAW`, token, {
      values: [PROVIDERS_COLS],
    })
  }
}
