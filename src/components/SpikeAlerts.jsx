import React from 'react'
import { AlertTriangle, ArrowRight } from 'lucide-react'
import { useBills } from '../context/BillsContext.jsx'
import { formatCurrency, formatDate } from '../utils/dateHelpers.js'

export default function SpikeAlerts() {
  const { bills, setActiveView, setSelectedProvider, providers } = useBills()
  const spiked = bills.filter(b => b.flagged)

  if (spiked.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 text-center text-gray-400 dark:text-gray-500 text-sm">
        No spike alerts this month.
      </div>
    )
  }

  function openProvider(bill) {
    const provider = providers.find(p => p.provider_name === bill.provider)
    setSelectedProvider(provider)
    setActiveView('provider')
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-5 h-5 text-red-500" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Spike Alerts</h2>
        <span className="ml-auto text-xs bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 px-2 py-0.5 rounded-full">{spiked.length} detected</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {spiked.map(bill => (
          <div key={bill.id} className="border border-red-200 dark:border-red-900/50 rounded-lg p-4 bg-red-50 dark:bg-red-950/30">
            <div className="flex items-start justify-between mb-2">
              <span className="font-semibold text-gray-900 dark:text-white">{bill.provider}</span>
              <span className="text-red-600 dark:text-red-400 font-bold text-sm">+{bill.variance_pct.toFixed(1)}%</span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <div className="flex justify-between">
                <span>Expected</span><span>{formatCurrency(bill.expected)}</span>
              </div>
              <div className="flex justify-between">
                <span>Actual</span><span className="text-red-600 dark:text-red-400 font-medium">{formatCurrency(bill.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Due</span><span>{formatDate(bill.due_date)}</span>
              </div>
            </div>
            <button
              onClick={() => openProvider(bill)}
              className="mt-3 flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
            >
              Investigate <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
