/**
 * Application Configuration
 * Centralized configuration for the application
 */

export const config = {
  // API Configuration
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://hamiltondinnerapp.staging.intelligrp.com/api/',
    timeout: 50000,
    retryAttempts: 2,
    retryDelay: 1000,
  },

  // App Information
  app: {
    name: import.meta.env.VITE_APP_NAME || 'Hamilton Dinner App',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  },

  // Feature Flags
  features: {
    analytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    errorLogging: import.meta.env.VITE_ENABLE_ERROR_LOGGING === 'true',
  },

  // Meal Time Configuration
  mealTimes: {
    breakfastEndHour: 10,
    lunchEndHour: 15,
    dinnerEndHour: 24,
  },

  // Storage Keys
  storage: {
    authToken: 'authToken',
    userData: 'userData',
  },

  // Language Configuration
  languages: {
    en: 'en',
    cn: 'cn',
  },

  // Default Values
  defaults: {
    language: 'en',
    maxMealQuantity: 1,
  },
};

// Export incident form configuration
export * from './incidentFormConfig';

export default config;
