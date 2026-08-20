// src/components/ProtectedRoute.jsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, initializing } = useAuth();
  const location = useLocation();

  if (initializing) return null; // AuthProvider is still attempting a silent refresh
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  return children;
}
