import React from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { mockMonthlyTrend } from '../../__mocks__/mockData.js'
import { useTheme } from '../../context/ThemeContext.jsx'

export default function MonthlyTrendChart() {
  const { dark } = useTheme()
  const gridColor = dark ? '#374151' : '#f0f0f0'
  const tickColor = dark ? '#9ca3af' : '#6b7280'
  const tooltipStyle = dark ? { backgroundColor: '#1f2937', border: '1px solid #374151', color: '#f9fafb' } : {}

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">6-Month Trend</h3>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={mockMonthlyTrend}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: tickColor }} />
          <YAxis tick={{ fontSize: 11, fill: tickColor }} tickFormatter={v => `$${v}`} />
          <Tooltip formatter={v => [`$${v.toFixed(2)}`, 'Total']} contentStyle={tooltipStyle} />
          <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
