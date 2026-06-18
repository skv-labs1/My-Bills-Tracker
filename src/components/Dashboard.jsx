import React, { useState } from 'react'
import { LogOut, Sun, Moon, Plus, Menu, X, LayoutDashboard, Calendar, Table, Settings as SettingsIcon } from 'lucide-react'
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
import AddBillModal from './AddBillModal.jsx'

const TABS = [
  { id: 'overview',  label: 'Overview',  Icon: LayoutDashboard },
  { id: 'calendar',  label: 'Calendar',  Icon: Calendar },
  { id: 'table',     label: 'Table',     Icon: Table },
  { id: 'settings',  label: 'Settings',  Icon: SettingsIcon },
]

export default function Dashboard() {
  const { activeView, loading } = useBills()
  const { user, logout } = useAuth()
  const { dark, toggle } = useTheme()
  const [activeTab, setActiveTab] = useState('overview')
  const [showAddBill, setShowAddBill] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  function switchTab(tab) {
    setActiveTab(tab)
    setMobileMenuOpen(false)
  }

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
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">

          {/* Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <svg className="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="18" rx="2"/>
              <path d="M8 10h8M8 14h5"/>
            </svg>
            <span className="text-base font-semibold text-gray-900 dark:text-white">BillTracker</span>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex gap-1">
            {TABS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => switchTab(id)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  activeTab === id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {label}
              </button>
            ))}
          </nav>

          {/* Right-side actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Add Bill */}
            <button
              onClick={() => setShowAddBill(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors"
              title="Add bill manually"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Bill</span>
            </button>

            {/* Theme toggle */}
            <button
              onClick={toggle}
              title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-300 transition-colors"
            >
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Avatar + logout (desktop) */}
            {user && (
              <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-gray-200 dark:border-gray-600">
                {user.picture
                  ? <img src={user.picture} alt={user.name} className="w-7 h-7 rounded-full" />
                  : <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-medium">{user.name?.[0]}</div>
                }
                <span className="text-sm text-gray-600 dark:text-gray-300 hidden lg:block max-w-[100px] truncate">{user.name}</span>
                <button onClick={logout} title="Logout" className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Hamburger (mobile only) */}
            <button
              onClick={() => setMobileMenuOpen(o => !o)}
              className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-300 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-2 pb-2 border-t border-gray-100 dark:border-gray-700">
            <nav className="flex flex-col gap-1 pt-2">
              {TABS.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  onClick={() => switchTab(id)}
                  className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </nav>
            {/* User info + logout in mobile menu */}
            {user && (
              <div className="flex items-center gap-3 px-4 pt-3 mt-2 border-t border-gray-100 dark:border-gray-700">
                {user.picture
                  ? <img src={user.picture} alt={user.name} className="w-7 h-7 rounded-full" />
                  : <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-medium">{user.name?.[0]}</div>
                }
                <span className="text-sm text-gray-700 dark:text-gray-200 flex-1 truncate">{user.name}</span>
                <button onClick={logout} title="Logout" className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* ── Main content ────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
        <SummaryStrip />

        {activeTab === 'overview' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <MonthlyTrendChart />
              <CategoryPieChart />
              <div className="md:col-span-2 lg:col-span-1">
                <ActualVsExpectedChart />
              </div>
            </div>
            <SpikeAlerts />
          </>
        )}

        {activeTab === 'calendar' && <CalendarView />}
        {activeTab === 'table'    && <BillsTable />}
        {activeTab === 'settings' && <Settings />}
      </main>

      {/* ── Bottom nav bar (mobile) ──────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors ${
              activeTab === id
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            <Icon className="w-5 h-5" />
            {label}
          </button>
        ))}
      </nav>

      {/* Bottom nav spacer so content isn't hidden behind it */}
      <div className="md:hidden h-16" />

      {showAddBill && <AddBillModal onClose={() => setShowAddBill(false)} />}
    </div>
  )
}
