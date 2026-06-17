import React from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts'
import { mockActualVsExpected } from '../../__mocks__/mockData.js'
import { useTheme } from '../../context/ThemeContext.jsx'

export default function ActualVsExpectedChart() {
  const { dark } = useTheme()
  const gridColor = dark ? '#374151' : '#f0f0f0'
  const tickColor = dark ? '#9ca3af' : '#6b7280'
  const tooltipStyle = dark ? { backgroundColor: '#1f2937', border: '1px solid #374151', color: '#f9fafb' } : {}
  const legendStyle = dark ? { color: '#9ca3af' } : {}

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Actual vs Expected</h3>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={mockActualVsExpected} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis type="number" tick={{ fontSize: 10, fill: tickColor }} tickFormatter={v => `$${v}`} />
          <YAxis dataKey="provider" type="category" tick={{ fontSize: 9, fill: tickColor }} width={55} />
          <Tooltip formatter={v => [`$${v.toFixed(2)}`]} contentStyle={tooltipStyle} />
          <Legend iconSize={10} wrapperStyle={legendStyle} />
          <Bar dataKey="expected" fill={dark ? '#4b5563' : '#cbd5e1'} name="Expected" />
          <Bar dataKey="actual" fill="#3b82f6" name="Actual" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
