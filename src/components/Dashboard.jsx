import React, { useState } from 'react'
import { LogOut, Sun, Moon } from 'lucide-react'
import { useBills } from '../context/BillsContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import SummaryStrip from './SummaryStrip.jsx'
import CalendarView from './CalendarView.jsx'
import MonthlyTrendChart from './Charts/MonthlyTrendChart.jsx'
import CategoryPieChart from './Charts/CategoryPieChart.jsx'
import ActualVsExpectedChart from './Charts/ActualVsExpectedChart.jsx'
import SpikeAlerts from './SpikeAlerts.jsx'
import BillsTable from './BillsTable.jsx'
import Settings from './Settings.jsx'
import ProviderProfile from './ProviderProfile.jsx'

export default function Dashboard() {
  const { activeView, loading } = useBills()
  const { user, logout } = useAuth()
  const { dark, toggle } = useTheme()
  const [activeTab, setActiveTab] = useState('overview')

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading your bills…</p>
        </div>
      </div>
    )
  }

  if (activeView === 'provider') {
    return <ProviderProfile />
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-7 h-7 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="18" rx="2"/>
              <path d="M8 10h8M8 14h5"/>
            </svg>
            <span className="text-xl font-semibold text-gray-900 dark:text-white">BillTracker</span>
          </div>
          <div className="flex items-center gap-3">
            <nav className="flex gap-1">
              {['overview', 'calendar', 'table', 'settings'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${
                    activeTab === tab
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
            <button
              onClick={toggle}
              title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-300 transition-colors"
            >
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            {user && (
              <div className="flex items-center gap-2 pl-3 border-l border-gray-200 dark:border-gray-600">
                {user.picture
                  ? <img src={user.picture} alt={user.name} className="w-7 h-7 rounded-full" />
                  : <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-medium">{user.name?.[0]}</div>
                }
                <span className="text-sm text-gray-600 dark:text-gray-300 hidden sm:block">{user.name}</span>
                <button onClick={logout} title="Logout" className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <SummaryStrip />

        {activeTab === 'overview' && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <MonthlyTrendChart />
              <CategoryPieChart />
              <ActualVsExpectedChart />
            </div>
            <SpikeAlerts />
          </>
        )}

        {activeTab === 'calendar' && <CalendarView />}
        {activeTab === 'table' && <BillsTable />}
        {activeTab === 'settings' && <Settings />}
      </main>
    </div>
  )
}
