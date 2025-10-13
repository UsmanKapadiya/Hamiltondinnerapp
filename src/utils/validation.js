/**
 * Input validation and sanitization utilities
 * Only contains actively used helper functions
 */

/**
 * Sanitize string input to prevent XSS attacks
 * Used in: login/index.jsx, roomLogin/index.jsx
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  // Remove script tags and common XSS patterns
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
};

/**
 * Validate room number format
 * Used internally by validateLoginForm
 */
export const validateRoomNumber = (roomNo) => {
  if (!roomNo || roomNo.trim().length === 0) {
    return { isValid: false, message: 'Room number is required' };
  }
  return { isValid: true, message: '' };
};

/**
 * Validate required field
 * Used internally by validateLoginForm
 */
export const validateRequired = (value, fieldName = 'Field') => {
  if (!value || (typeof value === 'string' && value.trim().length === 0)) {
    return { isValid: false, message: `${fieldName} is required` };
  }
  return { isValid: true, message: '' };
};

/**
 * Validate login form
 * Used in: login/index.jsx
 */
export const validateLoginForm = (formData) => {
  const errors = {};
  
  const roomNoValidation = validateRoomNumber(formData.roomNo);
  if (!roomNoValidation.isValid) {
    errors.roomNo = roomNoValidation.message;
  }
  
  const passwordValidation = validateRequired(formData.password, 'Password');
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.message;
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
