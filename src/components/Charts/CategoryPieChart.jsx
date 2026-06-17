import React from 'react'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { mockCategorySpend } from '../../__mocks__/mockData.js'
import { getCategoryColor } from '../../utils/categoryMapper.js'
import { useTheme } from '../../context/ThemeContext.jsx'

export default function CategoryPieChart() {
  const { dark } = useTheme()
  const tooltipStyle = dark ? { backgroundColor: '#1f2937', border: '1px solid #374151', color: '#f9fafb' } : {}
  const labelColor = dark ? '#9ca3af' : '#374151'

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Spend by Category</h3>
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={mockCategorySpend}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={60}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            labelLine={false}
            fontSize={10}
            style={{ fill: labelColor }}
          >
            {mockCategorySpend.map(entry => (
              <Cell key={entry.name} fill={getCategoryColor(entry.name)} />
            ))}
          </Pie>
          <Tooltip formatter={v => [`$${v.toFixed(2)}`]} contentStyle={tooltipStyle} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
