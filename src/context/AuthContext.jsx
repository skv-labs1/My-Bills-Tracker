import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('bt_user')) } catch { return null }
  })
  const [token, setToken] = useState(() => localStorage.getItem('bt_token') || null)

  const isAuthenticated = !!token

  function login(tokenResponse, profile) {
    setToken(tokenResponse.access_token)
    setUser(profile)
    localStorage.setItem('bt_token', tokenResponse.access_token)
    localStorage.setItem('bt_user', JSON.stringify(profile))
  }

  function logout() {
    setToken(null)
    setUser(null)
    localStorage.removeItem('bt_token')
    localStorage.removeItem('bt_user')
    window.location.href = '/'
  }

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
