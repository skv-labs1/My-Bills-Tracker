// Derive chart datasets from the real bills list.
// Each bill is bucketed by its due_date, falling back to synced_at when absent.

function billDate(bill) {
  const raw = bill.due_date || bill.synced_at
  if (!raw) return null
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
    const [y, m, d] = raw.slice(0, 10).split('-').map(Number)
    return new Date(y, m - 1, d)
  }
  const d = new Date(raw)
  return isNaN(d) ? null : d
}

function inCurrentMonth(bill) {
  const d = billDate(bill)
  if (!d) return false
  const now = new Date()
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
}

/** Last 6 months of total spend → [{ month: 'Jan', total }] */
export function buildMonthlyTrend(bills) {
  const now = new Date()
  const buckets = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    buckets.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      month: d.toLocaleDateString('en-CA', { month: 'short' }),
      total: 0,
    })
  }
  const index = Object.fromEntries(buckets.map(b => [b.key, b]))
  bills.forEach(b => {
    const d = billDate(b)
    if (!d) return
    const bucket = index[`${d.getFullYear()}-${d.getMonth()}`]
    if (bucket) bucket.total += b.amount || 0
  })
  return buckets.map(({ month, total }) => ({ month, total: Number(total.toFixed(2)) }))
}

/** Current-month spend grouped by category → [{ name, value }] */
export function buildCategorySpend(bills) {
  const totals = {}
  bills.filter(inCurrentMonth).forEach(b => {
    const cat = b.category || 'Other'
    totals[cat] = (totals[cat] || 0) + (b.amount || 0)
  })
  return Object.entries(totals)
    .map(([name, value]) => ({ name, value: Number(value.toFixed(2)) }))
    .filter(c => c.value > 0)
}

/** Current-month actual vs expected per provider → [{ provider, expected, actual }] */
export function buildActualVsExpected(bills) {
  const byProvider = {}
  bills.filter(inCurrentMonth).forEach(b => {
    const name = b.provider || 'Unknown'
    if (!byProvider[name]) byProvider[name] = { provider: name, expected: 0, actual: 0 }
    byProvider[name].expected += b.expected || 0
    byProvider[name].actual += b.amount || 0
  })
  return Object.values(byProvider)
    .map(p => ({ provider: p.provider, expected: Number(p.expected.toFixed(2)), actual: Number(p.actual.toFixed(2)) }))
    .sort((a, b) => b.actual - a.actual)
    .slice(0, 8)
}
