import { createContext, useContext, useState, useEffect } from 'react'

// Auth context — currently uses simple password auth.
// To migrate to Clerk: wrap <ClerkProvider> in main.jsx, replace this
// hook with useUser() from @clerk/clerk-react, and remove APP_PASSWORD.
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const stored = localStorage.getItem('pitchiq_auth')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setIsAuthenticated(true)
        setUser(parsed.user)
      } catch {}
    }
    setLoading(false)
  }, [])

  const login = async (password) => {
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    })
    if (!res.ok) throw new Error('Invalid password')
    const data = await res.json()
    const user = data.user || { email: 'user@pitchiq.app', name: 'Sales Rep', role: 'rep' }
    localStorage.setItem('pitchiq_auth', JSON.stringify({ user }))
    setIsAuthenticated(true)
    setUser(user)
    return user
  }

  const logout = () => {
    localStorage.removeItem('pitchiq_auth')
    setIsAuthenticated(false)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
