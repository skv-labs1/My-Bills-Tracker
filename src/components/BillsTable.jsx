import React, { useState } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { useBills } from '../context/BillsContext.jsx'
import { formatCurrency, formatDate } from '../utils/dateHelpers.js'

const STATUS_COLORS = {
  paid: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
  upcoming: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
  overdue: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
}

// Sheets stores booleans as strings — treat 'true'/'TRUE' as truthy too.
function isTruthy(v) {
  return v === true || v === 'true' || v === 'TRUE'
}

export default function BillsTable() {
  const { bills, providers, setActiveView, setSelectedProvider } = useBills()
  const [sortKey, setSortKey] = useState('due_date')
  const [sortDir, setSortDir] = useState('asc')
  const [filterCat, setFilterCat] = useState('All')
  const [filterStatus, setFilterStatus] = useState('All')

  const categories = ['All', ...new Set(bills.map(b => b.category))]
  const statuses = ['All', 'upcoming', 'paid', 'overdue']

  function toggleSort(key) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const filtered = bills
    .filter(b => filterCat === 'All' || b.category === filterCat)
    .filter(b => filterStatus === 'All' || b.status === filterStatus)
    .sort((a, b) => {
      let av = a[sortKey], bv = b[sortKey]
      if (typeof av === 'string') av = av.toLowerCase(), bv = bv.toLowerCase()
      return sortDir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1)
    })

  function openProvider(bill) {
    const provider = providers.find(p => p.provider_name === bill.provider)
    setSelectedProvider(provider)
    setActiveView('provider')
  }

  function SortIcon({ col }) {
    if (sortKey !== col) return null
    return sortDir === 'asc' ? <ChevronUp className="w-3 h-3 inline" /> : <ChevronDown className="w-3 h-3 inline" />
  }

  const selectClass = 'text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200'

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
      <div className="p-3 sm:p-4 flex gap-2 sm:gap-3 flex-wrap border-b border-gray-100 dark:border-gray-700">
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className={selectClass}>
          {categories.map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className={`${selectClass} capitalize`}>
          {statuses.map(s => <option key={s}>{s}</option>)}
        </select>
        <span className="ml-auto text-sm text-gray-400 dark:text-gray-500 self-center">{filtered.length} bills</span>
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-700 text-left text-gray-500 dark:text-gray-400">
              {[['provider','Provider'],['category','Category'],['expected','Expected'],['amount','Actual'],['variance_pct','Variance'],['due_date','Due Date'],['status','Status']].map(([key, label]) => (
                <th key={key} onClick={() => toggleSort(key)} className="px-4 py-3 font-medium cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 whitespace-nowrap">
                  {label} <SortIcon col={key} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(bill => (
              <tr key={bill.id} onClick={() => openProvider(bill)} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors">
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                  <span className="inline-flex items-center gap-1.5 flex-wrap">
                    {bill.provider}
                    {bill.parsed_by === 'gemini' && (
                      <span title="Parsed by AI" className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">AI</span>
                    )}
                    {isTruthy(bill.needs_review) && (
                      <span title="Low confidence — please verify" className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">Review</span>
                    )}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{bill.category}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{formatCurrency(bill.expected)}</td>
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{formatCurrency(bill.amount)}</td>
                <td className={`px-4 py-3 font-medium ${bill.variance_pct > 0 ? 'text-red-600 dark:text-red-400' : bill.variance_pct < 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
                  {bill.variance_pct > 0 ? '+' : ''}{bill.variance_pct.toFixed(1)}%
                </td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{formatDate(bill.due_date)}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[bill.status] || 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}>{bill.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile card list */}
      <div className="sm:hidden divide-y divide-gray-100 dark:divide-gray-700">
        {filtered.map(bill => (
          <div key={bill.id} onClick={() => openProvider(bill)} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors">
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-medium text-gray-900 dark:text-white text-sm">{bill.provider}</span>
                {bill.parsed_by === 'gemini' && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">AI</span>
                )}
                {isTruthy(bill.needs_review) && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">Review</span>
                )}
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize shrink-0 ${STATUS_COLORS[bill.status] || 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}>{bill.status}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">{bill.category} · {formatDate(bill.due_date)}</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(bill.amount)}</span>
                {bill.variance_pct !== 0 && (
                  <span className={`text-xs font-medium ${bill.variance_pct > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                    {bill.variance_pct > 0 ? '+' : ''}{bill.variance_pct.toFixed(1)}%
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="p-6 text-center text-sm text-gray-400 dark:text-gray-500">No bills match the filters</p>
        )}
      </div>
    </div>
  )
}
