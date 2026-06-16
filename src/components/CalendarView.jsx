import React, { useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useBills } from '../context/BillsContext.jsx'
import { getDaysUntilDue, formatCurrency } from '../utils/dateHelpers.js'

export default function CalendarView() {
  const { bills } = useBills()
  const [viewDate, setViewDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState(null)

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const billsByDay = {}
  bills.forEach(b => {
    const d = new Date(b.due_date)
    if (d.getMonth() === month && d.getFullYear() === year) {
      const day = d.getDate()
      if (!billsByDay[day]) billsByDay[day] = []
      billsByDay[day].push(b)
    }
  })

  function dayColor(bill) {
    if (bill.flagged) return 'bg-red-500'
    const days = getDaysUntilDue(bill.due_date)
    if (days <= 3) return 'bg-amber-400'
    return 'bg-blue-500'
  }

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1))
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1))

  const selectedBills = selectedDay ? (billsByDay[selectedDay] || []) : []

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          {viewDate.toLocaleDateString('en-CA', { month: 'long', year: 'numeric' })}
        </h2>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-gray-100"><ChevronLeft className="w-4 h-4" /></button>
          <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-gray-100"><ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
          <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
          const dayBills = billsByDay[day] || []
          const isToday = new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year
          return (
            <button
              key={day}
              onClick={() => setSelectedDay(dayBills.length ? day : null)}
              className={`relative p-2 rounded-lg text-sm text-center transition-colors
                ${isToday ? 'ring-2 ring-blue-400' : ''}
                ${dayBills.length ? 'cursor-pointer hover:bg-gray-50' : 'cursor-default'}
              `}
            >
              <span className={`font-medium ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>{day}</span>
              {dayBills.length > 0 && (
                <div className="flex flex-wrap gap-0.5 mt-0.5 justify-center">
                  {dayBills.map(b => (
                    <span key={b.id} className={`w-1.5 h-1.5 rounded-full ${dayColor(b)}`} />
                  ))}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-4 text-xs text-gray-500">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> Normal</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> Due soon</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Spike</span>
      </div>

      {/* Day detail popover */}
      {selectedDay && selectedBills.length > 0 && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium text-gray-700">Bills on {viewDate.toLocaleDateString('en-CA', { month: 'short' })} {selectedDay}</span>
            <button onClick={() => setSelectedDay(null)}><X className="w-4 h-4 text-gray-400" /></button>
          </div>
          {selectedBills.map(b => (
            <div key={b.id} className="flex justify-between py-1 text-sm">
              <span className={b.flagged ? 'text-red-600 font-medium' : 'text-gray-700'}>{b.provider}</span>
              <span className="text-gray-600">{formatCurrency(b.amount)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
