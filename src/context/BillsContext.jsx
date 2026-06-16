import React, { createContext, useContext, useState } from 'react'
import { mockBills, mockProviders, mockSettings } from '../__mocks__/mockData.js'

const BillsContext = createContext(null)

export function BillsProvider({ children }) {
  const [bills, setBills] = useState(mockBills)
  const [providers, setProviders] = useState(mockProviders)
  const [settings, setSettings] = useState(mockSettings)
  const [activeView, setActiveView] = useState('dashboard')
  const [selectedProvider, setSelectedProvider] = useState(null)

  function addBill(bill) {
    setBills(prev => [...prev, { ...bill, id: Date.now().toString() }])
  }

  function addProvider(provider) {
    setProviders(prev => [...prev, { ...provider, id: Date.now().toString() }])
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
    }}>
      {children}
    </BillsContext.Provider>
  )
}

export function useBills() {
  return useContext(BillsContext)
}
