import { useState, useEffect, createContext, useContext } from 'react';
import { authService } from '../services/authService';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = authService.getToken();
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setCurrentUser(decoded);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Token decode error:', error);
        authService.logout();
        setIsAuthenticated(false);
        setCurrentUser(null);
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    const token = await authService.login(credentials);
    const decoded = jwtDecode(token);
    setCurrentUser(decoded);
    setIsAuthenticated(true);
    return token;
  };

  const logout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      currentUser,
      loading, 
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};