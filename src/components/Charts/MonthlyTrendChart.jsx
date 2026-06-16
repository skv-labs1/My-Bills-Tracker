import React from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { mockMonthlyTrend } from '../../__mocks__/mockData.js'

export default function MonthlyTrendChart() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">6-Month Trend</h3>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={mockMonthlyTrend}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${v}`} />
          <Tooltip formatter={v => [`$${v.toFixed(2)}`, 'Total']} />
          <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
