import _ from 'lodash';

/**
 * Input validation and sanitization utilities
 * Only contains actively used helper functions
 */

/**
 * Sanitize string input to prevent XSS attacks
 * Used in: login/index.jsx, roomLogin/index.jsx
 */
export const sanitizeInput = (input) => {
  if (!_.isString(input)) return input;
  
  // Remove script tags and common XSS patterns
  return _.chain(input)
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim()
    .value();
};

/**
 * Validate room number format
 * Used internally by validateLoginForm
 */
export const validateRoomNumber = (roomNo) => {
  if (_.isEmpty(_.trim(roomNo))) {
    return { isValid: false, message: 'Room number is required' };
  }
  return { isValid: true, message: '' };
};

/**
 * Validate required field
 * Used internally by validateLoginForm
 */
export const validateRequired = (value, fieldName = 'Field') => {
  if (_.isEmpty(_.trim(value))) {
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
  
  const roomNoValidation = validateRoomNumber(_.get(formData, 'roomNo', ''));
  if (!roomNoValidation.isValid) {
    errors.roomNo = roomNoValidation.message;
  }
  
  const passwordValidation = validateRequired(_.get(formData, 'password', ''), 'Password');
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.message;
  }
  
  return {
    isValid: _.isEmpty(errors),
    errors
  };
};

/**
 * Validate email format
 */
export const validateEmail = (email) => {
  if (_.isEmpty(_.trim(email))) {
    return { isValid: false, message: 'Email is required' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, message: 'Invalid email format' };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validate phone number format
 */
export const validatePhone = (phone) => {
  if (_.isEmpty(_.trim(phone))) {
    return { isValid: false, message: 'Phone number is required' };
  }
  
  const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
  if (!phoneRegex.test(phone)) {
    return { isValid: false, message: 'Invalid phone number format' };
  }
  
  return { isValid: true, message: '' };
};

