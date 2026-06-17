import React from 'react'
import { ArrowLeft } from 'lucide-react'
import { useBills } from '../context/BillsContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { formatCurrency, formatDate } from '../utils/dateHelpers.js'

export default function ProviderProfile() {
  const { bills, selectedProvider, setActiveView, setSelectedProvider } = useBills()
  const { dark } = useTheme()

  if (!selectedProvider) return null

  const providerBills = bills
    .filter(b => b.provider === selectedProvider.provider_name)
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))

  const trendData = providerBills.map(b => ({
    date: formatDate(b.due_date),
    amount: b.amount,
    expected: b.expected,
  }))

  function goBack() {
    setActiveView('dashboard')
    setSelectedProvider(null)
  }

  const gridColor = dark ? '#374151' : '#f0f0f0'
  const tickColor = dark ? '#9ca3af' : '#6b7280'
  const tooltipStyle = dark ? { backgroundColor: '#1f2937', border: '1px solid #374151', color: '#f9fafb' } : {}

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <button onClick={goBack} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">{selectedProvider.provider_name}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{selectedProvider.category} · Baseline {formatCurrency(selectedProvider.baseline_amount)}</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Baseline', value: formatCurrency(selectedProvider.baseline_amount) },
            { label: 'Spike Threshold', value: `${selectedProvider.spike_threshold_pct}%` },
            { label: 'Total Bills', value: providerBills.length },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{label}</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">{value}</p>
            </div>
          ))}
        </div>

        {trendData.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Billing History</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: tickColor }} />
                <YAxis tick={{ fontSize: 11, fill: tickColor }} tickFormatter={v => `$${v}`} />
                <Tooltip formatter={v => [`$${v.toFixed(2)}`]} contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="expected" stroke={dark ? '#4b5563' : '#cbd5e1'} strokeWidth={2} strokeDasharray="4 4" name="Expected" />
                <Line type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} name="Actual" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">All Bills</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                <th className="px-4 py-2 font-medium">Due Date</th>
                <th className="px-4 py-2 font-medium">Expected</th>
                <th className="px-4 py-2 font-medium">Actual</th>
                <th className="px-4 py-2 font-medium">Variance</th>
                <th className="px-4 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {providerBills.map(b => (
                <tr key={b.id} className="border-b border-gray-50 dark:border-gray-700/50">
                  <td className="px-4 py-2 text-gray-600 dark:text-gray-400">{formatDate(b.due_date)}</td>
                  <td className="px-4 py-2 text-gray-600 dark:text-gray-400">{formatCurrency(b.expected)}</td>
                  <td className="px-4 py-2 font-medium text-gray-900 dark:text-white">{formatCurrency(b.amount)}</td>
                  <td className={`px-4 py-2 font-medium ${b.variance_pct > 0 ? 'text-red-600 dark:text-red-400' : b.variance_pct < 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
                    {b.variance_pct > 0 ? '+' : ''}{b.variance_pct.toFixed(1)}%
                  </td>
                  <td className="px-4 py-2 capitalize text-gray-500 dark:text-gray-400">{b.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
