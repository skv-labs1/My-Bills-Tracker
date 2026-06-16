import React from 'react'
import { useBills } from '../context/BillsContext.jsx'
import { formatCurrency } from '../utils/dateHelpers.js'

export default function HistoricalMatrix() {
  const { bills } = useBills()

  const months = [...new Set(bills.map(b => b.due_date.slice(0, 7)))].sort()
  const providerNames = [...new Set(bills.map(b => b.provider))]

  const lookup = {}
  bills.forEach(b => {
    const key = `${b.provider}__${b.due_date.slice(0, 7)}`
    lookup[key] = b
  })

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
      <table className="text-xs">
        <thead>
          <tr>
            <th className="px-3 py-2 text-left font-medium text-gray-500 whitespace-nowrap">Provider</th>
            {months.map(m => <th key={m} className="px-3 py-2 font-medium text-gray-500 whitespace-nowrap">{m}</th>)}
          </tr>
        </thead>
        <tbody>
          {providerNames.map(name => (
            <tr key={name} className="border-t border-gray-50">
              <td className="px-3 py-2 font-medium text-gray-700 whitespace-nowrap">{name}</td>
              {months.map(m => {
                const b = lookup[`${name}__${m}`]
                return (
                  <td key={m} className={`px-3 py-2 text-center ${b?.flagged ? 'bg-red-50 text-red-700' : 'text-gray-600'}`}>
                    {b ? formatCurrency(b.amount) : <span className="text-gray-300">—</span>}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
