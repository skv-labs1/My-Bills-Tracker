function parseDate(dateStr) {
  if (!dateStr) return null
  // Already ISO YYYY-MM-DD — parse as local date to avoid UTC offset shifting the day
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr.trim())) {
    const [y, m, d] = dateStr.split('-').map(Number)
    return new Date(y, m - 1, d)
  }
  const d = new Date(dateStr)
  return isNaN(d) ? null : d
}

export function getDaysUntilDue(dueDate) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = parseDate(dueDate)
  if (!due) return null
  due.setHours(0, 0, 0, 0)
  return Math.ceil((due - today) / (1000 * 60 * 60 * 24))
}

export function isDueThisWeek(dueDate) {
  const days = getDaysUntilDue(dueDate)
  return days !== null && days >= 0 && days <= 7
}

export function isPastDue(dueDate) {
  const days = getDaysUntilDue(dueDate)
  return days !== null && days < 0
}

export function formatCurrency(amount, currency = 'CAD') {
  return new Intl.NumberFormat('en-CA', { style: 'currency', currency }).format(amount || 0)
}

export function formatDate(dateStr) {
  const d = parseDate(dateStr)
  if (!d) return '—'
  return d.toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function getMonthLabel(date) {
  const d = parseDate(date) || new Date(date)
  return d.toLocaleDateString('en-CA', { month: 'short', year: '2-digit' })
}
