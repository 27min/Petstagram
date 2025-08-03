// utils/ProtectedRoute.js
import { useAuth } from '../hooks/useAuth';
import { LoginPage } from '../pages';

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated) {
    // Navigate 대신 LoginPage 컴포넌트를 직접 반환
    return <LoginPage />;
  }
  
  return children;
};