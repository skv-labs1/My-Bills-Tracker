import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { BillsProvider } from './context/BillsContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import ProtectedRoute from './components/auth/ProtectedRoute.jsx'
import LandingPage from './pages/LandingPage.jsx'
import Dashboard from './components/Dashboard.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <BillsProvider>
                  <Dashboard />
                </BillsProvider>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
