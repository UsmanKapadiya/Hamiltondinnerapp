import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ROUTES } from '../config/routes';

/**
 * Custom hook for route protection based on authentication
 * @returns {Object} - Authentication status and user data
 */
export const useRouteProtection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isAuthenticated = !!localStorage.getItem('authToken');
  const userData = localStorage.getItem('userData') 
    ? JSON.parse(localStorage.getItem('userData')) 
    : null;

  return {
    isAuthenticated,
    userData,
    redirectToLogin: (from = location) => {
      navigate(ROUTES.LOGIN, { state: { from }, replace: true });
    },
    redirectToHome: () => {
      navigate(ROUTES.HOME, { replace: true });
    }
  };
};

/**
 * Custom hook to check if user has required role
 * @param {string|Array} requiredRoles - Required role(s) for access
 * @returns {boolean} - Whether user has required role
 */
export const useRequireRole = (requiredRoles) => {
  const { userData } = useRouteProtection();
  
  if (!userData) return false;
  
  if (Array.isArray(requiredRoles)) {
    return requiredRoles.includes(userData.role);
  }
  
  return userData.role === requiredRoles;
};

/**
 * Custom hook to protect routes based on role
 * Redirects if user doesn't have required role
 * @param {string|Array} requiredRoles - Required role(s) for access
 */
export const useRoleProtection = (requiredRoles) => {
  const navigate = useNavigate();
  const hasRole = useRequireRole(requiredRoles);
  const { isAuthenticated } = useRouteProtection();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN, { replace: true });
      return;
    }

    if (!hasRole) {
      navigate(ROUTES.HOME, { replace: true });
    }
  }, [isAuthenticated, hasRole, navigate]);

  return hasRole;
};

export default useRouteProtection;
