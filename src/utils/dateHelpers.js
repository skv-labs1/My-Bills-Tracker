export function getDaysUntilDue(dueDate) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dueDate)
  due.setHours(0, 0, 0, 0)
  return Math.ceil((due - today) / (1000 * 60 * 60 * 24))
}

export function isDueThisWeek(dueDate) {
  const days = getDaysUntilDue(dueDate)
  return days >= 0 && days <= 7
}

export function formatCurrency(amount, currency = 'CAD') {
  return new Intl.NumberFormat('en-CA', { style: 'currency', currency }).format(amount)
}

export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })
}

export function getMonthLabel(date) {
  return new Date(date).toLocaleDateString('en-CA', { month: 'short', year: '2-digit' })
}
