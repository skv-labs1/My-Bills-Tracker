import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { mockBills, mockProviders, mockSettings } from '../__mocks__/mockData.js'
import { getAllBills, getProviders, addBillToSheet, addProviderToSheet, initSheet } from '../services/sheetsService.js'
import { syncEmails } from '../services/syncService.js'
import { useAuth } from './AuthContext.jsx'

const BillsContext = createContext(null)

export function BillsProvider({ children }) {
  const { token } = useAuth()

  const [bills, setBills] = useState([])
  const [providers, setProviders] = useState(mockProviders)
  const [settings, setSettings] = useState(mockSettings)
  const [activeView, setActiveView] = useState('dashboard')
  const [selectedProvider, setSelectedProvider] = useState(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState(null)
  const [error, setError] = useState(null)

  // Load real data from Sheets on mount
  useEffect(() => {
    if (!token || !import.meta.env.VITE_GOOGLE_SHEET_ID) {
      setBills(mockBills)
      setProviders(mockProviders)
      setLoading(false)
      return
    }

    async function loadData() {
      try {
        setLoading(true)
        await initSheet(token)
        const [sheetBills, sheetProviders] = await Promise.all([
          getAllBills(token),
          getProviders(token),
        ])
        setBills(sheetBills.length ? sheetBills : mockBills)
        setProviders(sheetProviders.length ? sheetProviders : mockProviders)
      } catch (err) {
        console.error('Failed to load from Sheets:', err)
        setError(err.message)
        // Fall back to mock data so the UI still works
        setBills(mockBills)
        setProviders(mockProviders)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [token])

  const syncGmail = useCallback(async () => {
    if (!token) return
    setSyncing(true)
    setSyncResult(null)
    setError(null)
    try {
      const result = await syncEmails(token)
      setSyncResult(result)
      if (result.added > 0) {
        // Reload bills from sheet to get the full updated list
        const sheetBills = await getAllBills(token)
        setBills(sheetBills)
      }
    } catch (err) {
      console.error('Sync failed:', err)
      setError(err.message)
    } finally {
      setSyncing(false)
    }
  }, [token])

  async function addBill(bill) {
    const newBill = { ...bill, id: Date.now().toString(), synced_at: new Date().toISOString() }
    setBills(prev => [...prev, newBill])
    if (token && import.meta.env.VITE_GOOGLE_SHEET_ID) {
      await addBillToSheet(token, newBill).catch(console.error)
    }
  }

  async function addProvider(provider) {
    const newProvider = { ...provider, id: Date.now().toString() }
    setProviders(prev => [...prev, newProvider])
    if (token && import.meta.env.VITE_GOOGLE_SHEET_ID) {
      await addProviderToSheet(token, newProvider).catch(console.error)
    }
  }

  function updateSetting(key, value) {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  return (
    <BillsContext.Provider value={{
      bills, setBills,
      providers, setProviders,
      settings, updateSetting,
      activeView, setActiveView,
      selectedProvider, setSelectedProvider,
      addBill, addProvider,
      loading, syncing, syncResult, error,
      syncGmail,
    }}>
      {children}
    </BillsContext.Provider>
  )
}

export function useBills() {
  return useContext(BillsContext)
}
