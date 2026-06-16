import React, { useState } from 'react'
import { Plus, Download, RefreshCw } from 'lucide-react'
import { useBills } from '../context/BillsContext.jsx'
import { CATEGORIES } from '../utils/categoryMapper.js'
import HistoricalMatrix from './HistoricalMatrix.jsx'

export default function Settings() {
  const { settings, updateSetting, addProvider, addBill, bills } = useBills()
  const [showAddProvider, setShowAddProvider] = useState(false)
  const [showAddBill, setShowAddBill] = useState(false)
  const [showMatrix, setShowMatrix] = useState(false)

  const [providerForm, setProviderForm] = useState({ provider_name: '', category: 'Utilities', baseline_amount: '', spike_threshold_pct: 10 })
  const [billForm, setBillForm] = useState({ provider: '', category: 'Utilities', amount: '', expected: '', due_date: '', status: 'upcoming' })

  function handleAddProvider(e) {
    e.preventDefault()
    addProvider({ ...providerForm, baseline_amount: parseFloat(providerForm.baseline_amount), first_seen: new Date().toISOString().split('T')[0], active: true })
    setProviderForm({ provider_name: '', category: 'Utilities', baseline_amount: '', spike_threshold_pct: 10 })
    setShowAddProvider(false)
  }

  function handleAddBill(e) {
    e.preventDefault()
    const amt = parseFloat(billForm.amount)
    const exp = parseFloat(billForm.expected || billForm.amount)
    const variance_pct = exp ? ((amt - exp) / exp * 100) : 0
    const flagged = Math.abs(variance_pct) >= (settings.default_threshold || 10)
    addBill({ ...billForm, amount: amt, expected: exp, variance_pct, flagged, flag_reason: flagged ? `Variance ${variance_pct.toFixed(1)}%` : '' })
    setBillForm({ provider: '', category: 'Utilities', amount: '', expected: '', due_date: '', status: 'upcoming' })
    setShowAddBill(false)
  }

  function exportCSV() {
    const headers = ['provider', 'category', 'amount', 'expected', 'variance_pct', 'due_date', 'status']
    const rows = bills.map(b => headers.map(h => b[h]).join(','))
    const csv = [headers.join(','), ...rows].join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = 'bills_export.csv'
    a.click()
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => setShowAddBill(v => !v)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" /> Add Bill
          </button>
          <button onClick={() => setShowAddProvider(v => !v)} className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
            <Plus className="w-4 h-4" /> Add Provider
          </button>
          <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors" title="Connect Gmail (coming soon)">
            <RefreshCw className="w-4 h-4" /> Sync Gmail
          </button>
          <button onClick={() => setShowMatrix(v => !v)} className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
            Historical Matrix
          </button>
        </div>
      </div>

      {showAddBill && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Add Bill Manually</h3>
          <form onSubmit={handleAddBill} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input required placeholder="Provider" value={billForm.provider} onChange={e => setBillForm(f => ({ ...f, provider: e.target.value }))} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            <select value={billForm.category} onChange={e => setBillForm(f => ({ ...f, category: e.target.value }))} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
            <input required type="number" step="0.01" placeholder="Actual Amount" value={billForm.amount} onChange={e => setBillForm(f => ({ ...f, amount: e.target.value }))} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            <input type="number" step="0.01" placeholder="Expected Amount (optional)" value={billForm.expected} onChange={e => setBillForm(f => ({ ...f, expected: e.target.value }))} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            <input required type="date" value={billForm.due_date} onChange={e => setBillForm(f => ({ ...f, due_date: e.target.value }))} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            <select value={billForm.status} onChange={e => setBillForm(f => ({ ...f, status: e.target.value }))} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
              {['upcoming', 'paid', 'overdue'].map(s => <option key={s}>{s}</option>)}
            </select>
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Save Bill</button>
              <button type="button" onClick={() => setShowAddBill(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {showAddProvider && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Add Provider</h3>
          <form onSubmit={handleAddProvider} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input required placeholder="Provider Name" value={providerForm.provider_name} onChange={e => setProviderForm(f => ({ ...f, provider_name: e.target.value }))} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            <select value={providerForm.category} onChange={e => setProviderForm(f => ({ ...f, category: e.target.value }))} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
            <input required type="number" step="0.01" placeholder="Baseline Amount" value={providerForm.baseline_amount} onChange={e => setProviderForm(f => ({ ...f, baseline_amount: e.target.value }))} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            <input type="number" placeholder="Spike Threshold %" value={providerForm.spike_threshold_pct} onChange={e => setProviderForm(f => ({ ...f, spike_threshold_pct: parseInt(e.target.value) }))} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Save Provider</button>
              <button type="button" onClick={() => setShowAddProvider(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-800 mb-3">Global Settings</h3>
        <div className="flex items-center gap-4">
          <label className="text-sm text-gray-600">Default Spike Threshold</label>
          <input
            type="number" min="1" max="100"
            value={settings.default_threshold}
            onChange={e => updateSetting('default_threshold', parseInt(e.target.value))}
            className="w-20 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <span className="text-sm text-gray-500">%</span>
        </div>
      </div>

      {showMatrix && (
        <div>
          <h3 className="font-semibold text-gray-800 mb-3">Historical Matrix (Provider × Month)</h3>
          <HistoricalMatrix />
        </div>
      )}
    </div>
  )
}
