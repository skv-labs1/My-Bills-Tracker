import React, { useState } from 'react'
import { Plus, Download, RefreshCw, CheckCircle, AlertCircle, Bug } from 'lucide-react'
import { useBills } from '../context/BillsContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { CATEGORIES } from '../utils/categoryMapper.js'
import HistoricalMatrix from './HistoricalMatrix.jsx'

export default function Settings() {
  const { settings, updateSetting, addProvider, addBill, bills, syncing, syncResult, error, syncGmail } = useBills()
  const { token } = useAuth()
  const [showAddProvider, setShowAddProvider] = useState(false)
  const [showAddBill, setShowAddBill] = useState(false)
  const [showMatrix, setShowMatrix] = useState(false)
  const [debugLog, setDebugLog] = useState([])
  const [debugging, setDebugging] = useState(false)

  const [providerForm, setProviderForm] = useState({ provider_name: '', category: 'Utilities', baseline_amount: '', spike_threshold_pct: 10 })
  const [billForm, setBillForm] = useState({ provider: '', category: 'Utilities', amount: '', expected: '', due_date: '', status: 'upcoming' })

  async function runDiagnostics() {
    setDebugging(true)
    const log = []
    const add = (msg, ok) => { log.push({ msg, ok }); setDebugLog([...log]) }

    // 1. Token
    add(token ? `Token present (${token.slice(0,20)}…)` : 'No token found — log out and back in', !!token)
    if (!token) { setDebugging(false); return }

    // 2. Token info — check which scopes were granted
    try {
      const r = await fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${token}`)
      const d = await r.json()
      const scopes = d.scope || ''
      const hasSheets = scopes.includes('spreadsheets')
      const hasGmail = scopes.includes('gmail')
      add(`Token scopes: ${scopes}`, true)
      add(`Sheets scope granted: ${hasSheets}`, hasSheets)
      add(`Gmail scope granted: ${hasGmail}`, hasGmail)
    } catch (e) {
      add(`Token info failed: ${e.message}`, false)
    }

    // 3. Sheet ID
    const sheetId = import.meta.env.VITE_GOOGLE_SHEET_ID
    add(sheetId ? `Sheet ID: ${sheetId}` : 'VITE_GOOGLE_SHEET_ID not set!', !!sheetId)
    if (!sheetId) { setDebugging(false); return }

    // 4. Sheets API — read spreadsheet metadata
    try {
      const r = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}?fields=spreadsheetId,properties.title`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const d = await r.json()
      if (r.ok) add(`Sheets API OK — Sheet title: "${d.properties?.title}"`, true)
      else add(`Sheets API failed ${r.status}: ${d?.error?.message}`, false)
    } catch (e) {
      add(`Sheets API fetch error: ${e.message}`, false)
    }

    // 5. Gmail API — list 1 message from virkar
    try {
      const r = await fetch(`https://gmail.googleapis.com/gmail/v1/users/virkar.bills@gmail.com/messages?maxResults=1`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const d = await r.json()
      if (r.ok) add(`Gmail API OK — ${d.resultSizeEstimate ?? 0} messages found`, true)
      else add(`Gmail API failed ${r.status}: ${d?.error?.message}`, false)
    } catch (e) {
      add(`Gmail API fetch error: ${e.message}`, false)
    }

    setDebugging(false)
  }


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
    addBill({ ...billForm, amount: amt, expected: exp, variance_pct, flagged: Math.abs(variance_pct) >= (settings.default_threshold || 10), flag_reason: '' })
    setBillForm({ provider: '', category: 'Utilities', amount: '', expected: '', due_date: '', status: 'upcoming' })
    setShowAddBill(false)
  }

  function exportCSV() {
    const headers = ['provider','category','amount','expected','variance_pct','due_date','status']
    const rows = bills.map(b => headers.map(h => b[h]).join(','))
    const csv = [headers.join(','), ...rows].join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = 'bills_export.csv'
    a.click()
  }

  const cardClass = 'bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6'
  const inputClass = 'border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500'
  const grayBtn = 'flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors'

  return (
    <div className="space-y-6">
      <div className={cardClass}>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Actions</h2>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => setShowAddBill(v => !v)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" /> Add Bill
          </button>
          <button onClick={() => setShowAddProvider(v => !v)} className={grayBtn}>
            <Plus className="w-4 h-4" /> Add Provider
          </button>
          <button onClick={exportCSV} className={grayBtn}>
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button onClick={syncGmail} disabled={syncing} className={`${grayBtn} disabled:opacity-50 disabled:cursor-not-allowed`}>
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing…' : 'Sync Gmail'}
          </button>
          <button onClick={() => setShowMatrix(v => !v)} className={grayBtn}>
            Historical Matrix
          </button>
          <button onClick={runDiagnostics} disabled={debugging} className={`${grayBtn} disabled:opacity-50`}>
            <Bug className="w-4 h-4" />
            {debugging ? 'Diagnosing…' : 'Diagnose'}
          </button>
        </div>
      </div>

      {debugLog.length > 0 && (
        <div className={`${cardClass} font-mono text-xs space-y-1`}>
          <p className="font-semibold text-gray-700 dark:text-gray-200 mb-2 font-sans">Diagnostics</p>
          {debugLog.map((entry, i) => (
            <div key={i} className={`flex items-start gap-2 ${entry.ok ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
              <span>{entry.ok ? '✓' : '✗'}</span>
              <span className="break-all">{entry.msg}</span>
            </div>
          ))}
        </div>
      )}

      {/* Sync result / error banner */}
      {syncResult && !syncing && (
        <div className="flex items-start gap-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900/50 rounded-xl p-4 text-sm">
          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
          <div className="text-green-800 dark:text-green-300">
            <p className="font-medium">Sync complete</p>
            <p>{syncResult.added} new bill{syncResult.added !== 1 ? 's' : ''} added · {syncResult.skipped} already saved
              {syncResult.needsReview > 0 && ` · ${syncResult.needsReview} need manual review`}
            </p>
          </div>
        </div>
      )}
      {error && !syncing && (
        <div className="flex items-start gap-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl p-4 text-sm">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <div className="text-red-800 dark:text-red-300">
            <p className="font-medium">Sync failed</p>
            <p className="font-mono text-xs mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {showAddBill && (
        <div className={cardClass}>
          <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">Add Bill Manually</h3>
          <form onSubmit={handleAddBill} className="grid grid-cols-2 gap-4">
            <input required placeholder="Provider" value={billForm.provider} onChange={e => setBillForm(f => ({ ...f, provider: e.target.value }))} className={inputClass} />
            <select value={billForm.category} onChange={e => setBillForm(f => ({ ...f, category: e.target.value }))} className={inputClass}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
            <input required type="number" step="0.01" placeholder="Actual Amount" value={billForm.amount} onChange={e => setBillForm(f => ({ ...f, amount: e.target.value }))} className={inputClass} />
            <input type="number" step="0.01" placeholder="Expected Amount (optional)" value={billForm.expected} onChange={e => setBillForm(f => ({ ...f, expected: e.target.value }))} className={inputClass} />
            <input required type="date" value={billForm.due_date} onChange={e => setBillForm(f => ({ ...f, due_date: e.target.value }))} className={inputClass} />
            <select value={billForm.status} onChange={e => setBillForm(f => ({ ...f, status: e.target.value }))} className={inputClass}>
              {['upcoming','paid','overdue'].map(s => <option key={s}>{s}</option>)}
            </select>
            <div className="col-span-2 flex gap-3">
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Save Bill</button>
              <button type="button" onClick={() => setShowAddBill(false)} className={grayBtn}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {showAddProvider && (
        <div className={cardClass}>
          <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">Add Provider</h3>
          <form onSubmit={handleAddProvider} className="grid grid-cols-2 gap-4">
            <input required placeholder="Provider Name" value={providerForm.provider_name} onChange={e => setProviderForm(f => ({ ...f, provider_name: e.target.value }))} className={inputClass} />
            <select value={providerForm.category} onChange={e => setProviderForm(f => ({ ...f, category: e.target.value }))} className={inputClass}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
            <input required type="number" step="0.01" placeholder="Baseline Amount" value={providerForm.baseline_amount} onChange={e => setProviderForm(f => ({ ...f, baseline_amount: e.target.value }))} className={inputClass} />
            <input type="number" placeholder="Spike Threshold %" value={providerForm.spike_threshold_pct} onChange={e => setProviderForm(f => ({ ...f, spike_threshold_pct: parseInt(e.target.value) }))} className={inputClass} />
            <div className="col-span-2 flex gap-3">
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Save Provider</button>
              <button type="button" onClick={() => setShowAddProvider(false)} className={grayBtn}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className={cardClass}>
        <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-3">Global Settings</h3>
        <div className="flex items-center gap-4">
          <label className="text-sm text-gray-600 dark:text-gray-400">Default Spike Threshold</label>
          <input
            type="number"
            min="1" max="100"
            value={settings.default_threshold}
            onChange={e => updateSetting('default_threshold', parseInt(e.target.value))}
            className={`w-20 ${inputClass}`}
          />
          <span className="text-sm text-gray-500 dark:text-gray-400">%</span>
        </div>
      </div>

      {showMatrix && (
        <div>
          <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-3">Historical Matrix (Provider x Month)</h3>
          <HistoricalMatrix />
        </div>
      )}
    </div>
  )
}
