import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'

const UserContext = createContext()

export const useUser = () => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within UserProvider')
  }
  return context
}

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Skip API call if no auth cookie exists (anonymous visitors)
    const hasCookie = document.cookie.split(';').some(c => c.trim().startsWith('token=') || c.trim().startsWith('jwt=') || c.trim().startsWith('connect.sid='))
    if (!hasCookie) {
      setLoading(false)
      return
    }
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await authAPI.getMe()
      setUser(response.data.user)
    } catch (error) {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (credentials) => {
    const response = await authAPI.login(credentials)
    setUser(response.data.user)
    return response
  }

  const signup = async (data) => {
    const response = await authAPI.signup(data)
    setUser(response.data.user)
    return response
  }

  const logout = async () => {
    await authAPI.logout()
    setUser(null)
  }

  const updateUser = (userData) => {
    setUser(userData)
  }

  return (
    <UserContext.Provider value={{ user, loading, login, signup, logout, updateUser, checkAuth }}>
      {children}
    </UserContext.Provider>
  )
}
