import React from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { useBills } from '../../context/BillsContext.jsx'
import { getCategoryColor } from '../../utils/categoryMapper.js'
import { useTheme } from '../../context/ThemeContext.jsx'
import { buildCategorySpend } from '../../utils/chartData.js'

export default function CategoryPieChart() {
  const { bills } = useBills()
  const { dark } = useTheme()
  const tooltipStyle = { backgroundColor: dark ? '#1f2937' : '#ffffff', border: `1px solid ${dark ? '#374151' : '#e5e7eb'}`, borderRadius: 8 }
  const tooltipText = { color: dark ? '#f9fafb' : '#111827' }
  const labelColor = dark ? '#9ca3af' : '#374151'

  const data = buildCategorySpend(bills)

  if (!data.length) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Spend by Category</h3>
        <div className="h-[180px] flex items-center justify-center text-sm text-gray-400 dark:text-gray-500">No bills this month</div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Spend by Category</h3>
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={data}
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
            {data.map(entry => (
              <Cell key={entry.name} fill={getCategoryColor(entry.name)} />
            ))}
          </Pie>
          <Tooltip
            formatter={v => [`$${v.toFixed(2)}`]}
            contentStyle={tooltipStyle}
            itemStyle={tooltipText}
            labelStyle={tooltipText}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
