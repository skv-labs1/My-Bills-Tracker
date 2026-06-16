import React from 'react'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { mockCategorySpend } from '../../__mocks__/mockData.js'
import { getCategoryColor } from '../../utils/categoryMapper.js'

export default function CategoryPieChart() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Spend by Category</h3>
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie data={mockCategorySpend} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
            {mockCategorySpend.map(entry => (
              <Cell key={entry.name} fill={getCategoryColor(entry.name)} />
            ))}
          </Pie>
          <Tooltip formatter={v => [`$${v.toFixed(2)}`]} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
