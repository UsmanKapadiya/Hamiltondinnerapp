import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

/**
 * Custom hook for authentication management
 * Centralizes auth logic and token management
 */
export const useAuth = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');

    if (token && userData) {
      setIsAuthenticated(true);
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error('Failed to parse user data:', e);
        logout();
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback((token, userData) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('userData', JSON.stringify(userData));
    
    // Also set in cookies for better security (optional)
    Cookies.set('authToken', JSON.stringify({ token }), { expires: 7, secure: true });
    
    setIsAuthenticated(true);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    Cookies.remove('authToken');
    Cookies.remove('userToken');
    
    setIsAuthenticated(false);
    setUser(null);
    
    navigate('/', { replace: true });
  }, [navigate]);

  const updateUser = useCallback((updatedData) => {
    const newUserData = { ...user, ...updatedData };
    localStorage.setItem('userData', JSON.stringify(newUserData));
    setUser(newUserData);
  }, [user]);

  const getToken = useCallback(() => {
    return localStorage.getItem('authToken');
  }, []);

  const getUserData = useCallback(() => {
    const userData = localStorage.getItem('userData');
    if (!userData) return null;
    try {
      return JSON.parse(userData);
    } catch (e) {
      console.error('Failed to parse user data:', e);
      return null;
    }
  }, []);

  return {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
    updateUser,
    getToken,
    getUserData
  };
};

/**
 * Hook to check if user has specific role
 */
export const useRole = (requiredRole) => {
  const { user } = useAuth();
  return user?.role === requiredRole;
};

/**
 * Hook to check if user has any of the specified roles
 */
export const useHasRole = (roles = []) => {
  const { user } = useAuth();
  return roles.includes(user?.role);
};
