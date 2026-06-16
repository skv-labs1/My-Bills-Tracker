import React, { useState } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { useBills } from '../context/BillsContext.jsx'
import { formatCurrency, formatDate } from '../utils/dateHelpers.js'

const STATUS_COLORS = {
  paid: 'bg-green-100 text-green-700',
  upcoming: 'bg-blue-100 text-blue-700',
  overdue: 'bg-red-100 text-red-700',
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

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="p-4 flex gap-3 flex-wrap border-b border-gray-100">
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400">
          {categories.map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400 capitalize">
          {statuses.map(s => <option key={s}>{s}</option>)}
        </select>
        <span className="ml-auto text-sm text-gray-400 self-center">{filtered.length} bills</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-gray-500">
              {[['provider','Provider'],['category','Category'],['expected','Expected'],['amount','Actual'],['variance_pct','Variance'],['due_date','Due Date'],['status','Status']].map(([key, label]) => (
                <th key={key} onClick={() => toggleSort(key)} className="px-4 py-3 font-medium cursor-pointer hover:text-gray-700 whitespace-nowrap">
                  {label} <SortIcon col={key} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(bill => (
              <tr key={bill.id} onClick={() => openProvider(bill)} className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors">
                <td className="px-4 py-3 font-medium text-gray-900">{bill.provider}</td>
                <td className="px-4 py-3 text-gray-500">{bill.category}</td>
                <td className="px-4 py-3 text-gray-600">{formatCurrency(bill.expected)}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{formatCurrency(bill.amount)}</td>
                <td className={`px-4 py-3 font-medium ${bill.variance_pct > 0 ? 'text-red-600' : bill.variance_pct < 0 ? 'text-green-600' : 'text-gray-400'}`}>
                  {bill.variance_pct > 0 ? '+' : ''}{bill.variance_pct.toFixed(1)}%
                </td>
                <td className="px-4 py-3 text-gray-600">{formatDate(bill.due_date)}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[bill.status] || 'bg-gray-100 text-gray-600'}`}>{bill.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
