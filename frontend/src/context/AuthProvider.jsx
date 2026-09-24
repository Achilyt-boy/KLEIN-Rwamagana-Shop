import { useEffect, useState } from 'react'
import api from '../api/client'
import { AuthContext } from './authContext'

// Keeps the logged-in user in one place. The JWT lives in
// localStorage; on first load we ask the API who we are so a
// refresh doesn't log the user out.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [booting, setBooting] = useState(!!localStorage.getItem('klein_token'))

  useEffect(() => {
    const token = localStorage.getItem('klein_token')
    if (!token) return

    api
      .get('/auth/me')
      .then((res) => setUser(res.data.user))
      .catch(() => localStorage.removeItem('klein_token'))
      .finally(() => setBooting(false))
  }, [])

  async function login(email, password) {
    const res = await api.post('/auth/login', { email, password })
    localStorage.setItem('klein_token', res.data.token)
    setUser(res.data.user)
    return res.data.user
  }

  async function register(fullName, email, password) {
    const res = await api.post('/auth/register', { fullName, email, password })
    localStorage.setItem('klein_token', res.data.token)
    setUser(res.data.user)
    return res.data.user
  }

  function logout() {
    localStorage.removeItem('klein_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, booting, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
