/**
 * Input validation and sanitization utilities
 */

/**
 * Sanitize string input to prevent XSS attacks
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
 * Validate email format
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 */
export const validatePassword = (password) => {
  if (!password || password.length < 6) {
    return { isValid: false, message: 'Password must be at least 6 characters' };
  }
  return { isValid: true, message: '' };
};

/**
 * Validate room number format
 */
export const validateRoomNumber = (roomNo) => {
  if (!roomNo || roomNo.trim().length === 0) {
    return { isValid: false, message: 'Room number is required' };
  }
  return { isValid: true, message: '' };
};

/**
 * Validate required field
 */
export const validateRequired = (value, fieldName = 'Field') => {
  if (!value || (typeof value === 'string' && value.trim().length === 0)) {
    return { isValid: false, message: `${fieldName} is required` };
  }
  return { isValid: true, message: '' };
};

/**
 * Validate number within range
 */
export const validateNumberRange = (value, min, max, fieldName = 'Value') => {
  const num = Number(value);
  if (isNaN(num)) {
    return { isValid: false, message: `${fieldName} must be a number` };
  }
  if (num < min || num > max) {
    return { isValid: false, message: `${fieldName} must be between ${min} and ${max}` };
  }
  return { isValid: true, message: '' };
};

/**
 * Sanitize and validate form data
 */
export const sanitizeFormData = (formData) => {
  const sanitized = {};
  for (const [key, value] of Object.entries(formData)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
};

/**
 * Validate login form
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
