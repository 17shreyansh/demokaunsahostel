import { Navigate } from 'react-router-dom'
import { Spin } from 'antd'
import { useAuth } from '../contexts/AuthContext'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    )
  }

  return isAuthenticated ? children : <Navigate to="/admin" replace />
}

export default ProtectedRoute