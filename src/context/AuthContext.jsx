import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Failed to parse user data:', error);
        clearAuth();
      }
    }
    setLoading(false);
  }, []);

  const clearAuth = useCallback(() => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    Cookies.remove('authToken');
    Cookies.remove('userToken');
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  const login = useCallback((token, userData) => {
    try {
      localStorage.setItem('authToken', token);
      localStorage.setItem('userData', JSON.stringify(userData));
      
      // Optionally set cookie for additional security
      Cookies.set('authToken', JSON.stringify({ token }), { 
        expires: 7, 
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
      
      setIsAuthenticated(true);
      setUser(userData);
    } catch (error) {
      console.error('Failed to set auth data:', error);
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    clearAuth();
    navigate('/', { replace: true });
  }, [navigate, clearAuth]);

  const updateUser = useCallback((updatedData) => {
    if (!user) return;
    
    const newUserData = { ...user, ...updatedData };
    localStorage.setItem('userData', JSON.stringify(newUserData));
    setUser(newUserData);
  }, [user]);

  const getToken = useCallback(() => {
    return localStorage.getItem('authToken');
  }, []);

  const hasRole = useCallback((role) => {
    return user?.role === role;
  }, [user]);

  const hasAnyRole = useCallback((roles = []) => {
    return roles.includes(user?.role);
  }, [user]);

  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
    updateUser,
    getToken,
    hasRole,
    hasAnyRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
