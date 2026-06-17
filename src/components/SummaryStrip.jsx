import React from 'react'
import { TrendingUp, TrendingDown, AlertTriangle, Calendar, DollarSign } from 'lucide-react'
import { useBills } from '../context/BillsContext.jsx'
import { isDueThisWeek, formatCurrency } from '../utils/dateHelpers.js'

export default function SummaryStrip() {
  const { bills } = useBills()

  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()

  // Include bills with no due_date (synced_at this month) alongside normally dated bills
  const currentBills = bills.filter(b => {
    if (b.due_date) {
      const d = new Date(b.due_date)
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear
    }
    // No due date — include if synced this month
    if (b.synced_at) {
      const s = new Date(b.synced_at)
      return s.getMonth() === currentMonth && s.getFullYear() === currentYear
    }
    return true
  })

  const totalMonthly = currentBills.reduce((s, b) => s + b.amount, 0)
  const dueThisWeek = currentBills.filter(b => isDueThisWeek(b.due_date))
  const dueThisWeekTotal = dueThisWeek.reduce((s, b) => s + b.amount, 0)
  const spikes = currentBills.filter(b => b.flagged)
  const momChange = 9.8

  const cards = [
    {
      label: 'Monthly Spend',
      value: formatCurrency(totalMonthly),
      icon: <DollarSign className="w-5 h-5" />,
      color: 'text-blue-600',
      bg: 'bg-blue-50 dark:bg-blue-900/30',
    },
    {
      label: 'Due This Week',
      value: `${dueThisWeek.length} bills · ${formatCurrency(dueThisWeekTotal)}`,
      icon: <Calendar className="w-5 h-5" />,
      color: 'text-amber-600',
      bg: 'bg-amber-50 dark:bg-amber-900/30',
    },
    {
      label: 'Spikes Detected',
      value: `${spikes.length} bill${spikes.length !== 1 ? 's' : ''}`,
      icon: <AlertTriangle className="w-5 h-5" />,
      color: 'text-red-600',
      bg: 'bg-red-50 dark:bg-red-900/30',
    },
    {
      label: 'vs Last Month',
      value: `+${momChange}%`,
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'text-red-600',
      bg: 'bg-red-50 dark:bg-red-900/30',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(card => (
        <div key={card.label} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className={`p-1.5 rounded-lg ${card.bg} ${card.color}`}>{card.icon}</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">{card.label}</span>
          </div>
          <p className={`text-xl font-semibold ${card.color}`}>{card.value}</p>
        </div>
      ))}
    </div>
  )
}
