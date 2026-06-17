import React from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { useBills } from '../../context/BillsContext.jsx'
import { useTheme } from '../../context/ThemeContext.jsx'
import { buildMonthlyTrend } from '../../utils/chartData.js'

export default function MonthlyTrendChart() {
  const { bills } = useBills()
  const { dark } = useTheme()
  const gridColor = dark ? '#374151' : '#f0f0f0'
  const tickColor = dark ? '#9ca3af' : '#6b7280'
  const tooltipStyle = { backgroundColor: dark ? '#1f2937' : '#ffffff', border: `1px solid ${dark ? '#374151' : '#e5e7eb'}`, borderRadius: 8 }
  const tooltipText = { color: dark ? '#f9fafb' : '#111827' }

  const data = buildMonthlyTrend(bills)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">6-Month Trend</h3>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: tickColor }} />
          <YAxis tick={{ fontSize: 11, fill: tickColor }} tickFormatter={v => `$${v}`} />
          <Tooltip
            formatter={v => [`$${v.toFixed(2)}`, 'Total']}
            contentStyle={tooltipStyle}
            itemStyle={tooltipText}
            labelStyle={tooltipText}
          />
          <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
