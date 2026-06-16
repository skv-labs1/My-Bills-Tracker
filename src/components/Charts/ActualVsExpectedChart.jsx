import React from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts'
import { mockActualVsExpected } from '../../__mocks__/mockData.js'

export default function ActualVsExpectedChart() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Actual vs Expected</h3>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={mockActualVsExpected} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={v => `$${v}`} />
          <YAxis dataKey="provider" type="category" tick={{ fontSize: 9 }} width={55} />
          <Tooltip formatter={v => [`$${v.toFixed(2)}`]} />
          <Legend iconSize={10} />
          <Bar dataKey="expected" fill="#cbd5e1" name="Expected" />
          <Bar dataKey="actual" fill="#3b82f6" name="Actual" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
