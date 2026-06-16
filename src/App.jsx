import React from 'react'
import { BillsProvider } from './context/BillsContext.jsx'
import Dashboard from './components/Dashboard.jsx'

export default function App() {
  return (
    <BillsProvider>
      <Dashboard />
    </BillsProvider>
  )
}
