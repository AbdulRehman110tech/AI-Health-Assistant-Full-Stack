// ============================================================
// src/context/AuthContext.jsx
// Global Authentication State
// ============================================================

import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token,    setToken]    = useState(localStorage.getItem('access_token'))
  const [isAuth,   setIsAuth]   = useState(!!localStorage.getItem('access_token'))
  const [username, setUsername] = useState(localStorage.getItem('username') || '')

  const login = (accessToken, user) => {
    localStorage.setItem('access_token', accessToken)
    localStorage.setItem('username', user || '')
    setToken(accessToken)
    setIsAuth(true)
    setUsername(user || '')
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('username')
    setToken(null)
    setIsAuth(false)
    setUsername('')
  }

  return (
    <AuthContext.Provider value={{ token, isAuth, username, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)