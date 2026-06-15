import { Navigate } from 'react-router-dom';
import { useHostelManager } from '../contexts/HostelManagerContext';
import LoadingSpinner from './common/LoadingSpinner';

const HostelManagerProtectedRoute = ({ children }) => {
  const { manager, loading } = useHostelManager();

  if (loading) {
    return <LoadingSpinner fullScreen message="Checking authentication..." />;
  }

  if (!manager) {
    // Not logged in - redirect to auth page
    return <Navigate to="/hostel-manager/auth" replace />;
  }

  return children;
};

export default HostelManagerProtectedRoute;
