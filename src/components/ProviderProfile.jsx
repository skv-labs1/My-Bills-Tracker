import React from 'react'
import { ArrowLeft } from 'lucide-react'
import { useBills } from '../context/BillsContext.jsx'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { formatCurrency, formatDate } from '../utils/dateHelpers.js'

export default function ProviderProfile() {
  const { bills, selectedProvider, setActiveView, setSelectedProvider } = useBills()

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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <button onClick={goBack} className="p-1.5 rounded-lg hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">{selectedProvider.provider_name}</h1>
            <p className="text-sm text-gray-500">{selectedProvider.category} · Baseline {formatCurrency(selectedProvider.baseline_amount)}</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500 mb-1">Baseline</p>
            <p className="text-xl font-semibold text-gray-900">{formatCurrency(selectedProvider.baseline_amount)}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500 mb-1">Spike Threshold</p>
            <p className="text-xl font-semibold text-gray-900">{selectedProvider.spike_threshold_pct}%</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500 mb-1">Total Bills</p>
            <p className="text-xl font-semibold text-gray-900">{providerBills.length}</p>
          </div>
        </div>

        {/* Trend chart */}
        {trendData.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Billing History</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${v}`} />
                <Tooltip formatter={v => [`$${v.toFixed(2)}`]} />
                <Line type="monotone" dataKey="expected" stroke="#cbd5e1" strokeWidth={2} strokeDasharray="4 4" name="Expected" />
                <Line type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} name="Actual" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Bills history table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700">All Bills</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="px-4 py-2 font-medium">Due Date</th>
                <th className="px-4 py-2 font-medium">Expected</th>
                <th className="px-4 py-2 font-medium">Actual</th>
                <th className="px-4 py-2 font-medium">Variance</th>
                <th className="px-4 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {providerBills.map(b => (
                <tr key={b.id} className="border-b border-gray-50">
                  <td className="px-4 py-2 text-gray-600">{formatDate(b.due_date)}</td>
                  <td className="px-4 py-2 text-gray-600">{formatCurrency(b.expected)}</td>
                  <td className="px-4 py-2 font-medium">{formatCurrency(b.amount)}</td>
                  <td className={`px-4 py-2 font-medium ${b.variance_pct > 0 ? 'text-red-600' : b.variance_pct < 0 ? 'text-green-600' : 'text-gray-400'}`}>
                    {b.variance_pct > 0 ? '+' : ''}{b.variance_pct.toFixed(1)}%
                  </td>
                  <td className="px-4 py-2 capitalize text-gray-500">{b.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
