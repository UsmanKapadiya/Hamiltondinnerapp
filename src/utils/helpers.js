import _ from 'lodash';

/**
 * Utility helper functions using Lodash
 */

/**
 * Capitalize first letter of text
 * @param {string} text - Text to capitalize
 * @returns {string} Capitalized text
 */
export const capitalize = (text) => {
  if (!text) return '';
  return _.capitalize(text);
};

/**
 * Deep clone an object or array
 * @param {*} value - Value to clone
 * @returns {*} Deep cloned value
 */
export const deepClone = (value) => {
  return _.cloneDeep(value);
};

/**
 * Check if value is empty (null, undefined, '', [], {})
 * @param {*} value - Value to check
 * @returns {boolean} True if empty
 */
export const isEmpty = (value) => {
  return _.isEmpty(value);
};

/**
 * Get nested object property safely
 * @param {Object} object - Source object
 * @param {string|Array} path - Path to property
 * @param {*} defaultValue - Default value if path doesn't exist
 * @returns {*} Value at path or default value
 */
export const get = (object, path, defaultValue) => {
  return _.get(object, path, defaultValue);
};

/**
 * Set nested object property safely
 * @param {Object} object - Target object
 * @param {string|Array} path - Path to property
 * @param {*} value - Value to set
 * @returns {Object} Modified object
 */
export const set = (object, path, value) => {
  return _.set(object, path, value);
};

/**
 * Debounce a function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Milliseconds to wait
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait = 300) => {
  return _.debounce(func, wait);
};

/**
 * Throttle a function
 * @param {Function} func - Function to throttle
 * @param {number} wait - Milliseconds to wait
 * @returns {Function} Throttled function
 */
export const throttle = (func, wait = 300) => {
  return _.throttle(func, wait);
};

/**
 * Remove duplicates from array
 * @param {Array} array - Array to process
 * @returns {Array} Array without duplicates
 */
export const unique = (array) => {
  return _.uniq(array);
};

/**
 * Remove duplicates from array by property
 * @param {Array} array - Array to process
 * @param {string|Function} iteratee - Property name or function
 * @returns {Array} Array without duplicates
 */
export const uniqueBy = (array, iteratee) => {
  return _.uniqBy(array, iteratee);
};

/**
 * Group array items by property
 * @param {Array} array - Array to group
 * @param {string|Function} iteratee - Property name or function
 * @returns {Object} Grouped object
 */
export const groupBy = (array, iteratee) => {
  return _.groupBy(array, iteratee);
};

/**
 * Sort array by property
 * @param {Array} array - Array to sort
 * @param {string|Function} iteratee - Property name or function
 * @param {string} order - 'asc' or 'desc'
 * @returns {Array} Sorted array
 */
export const sortBy = (array, iteratee, order = 'asc') => {
  return _.orderBy(array, iteratee, order);
};

/**
 * Find item in array by property
 * @param {Array} array - Array to search
 * @param {Object|Function} predicate - Search criteria
 * @returns {*} Found item or undefined
 */
export const findItem = (array, predicate) => {
  return _.find(array, predicate);
};

/**
 * Filter array by predicate
 * @param {Array} array - Array to filter
 * @param {Object|Function} predicate - Filter criteria
 * @returns {Array} Filtered array
 */
export const filterItems = (array, predicate) => {
  return _.filter(array, predicate);
};

/**
 * Merge objects deeply
 * @param {Object} target - Target object
 * @param {...Object} sources - Source objects
 * @returns {Object} Merged object
 */
export const merge = (target, ...sources) => {
  return _.merge(target, ...sources);
};

/**
 * Pick specific properties from object
 * @param {Object} object - Source object
 * @param {Array} props - Properties to pick
 * @returns {Object} Object with picked properties
 */
export const pick = (object, props) => {
  return _.pick(object, props);
};

/**
 * Omit specific properties from object
 * @param {Object} object - Source object
 * @param {Array} props - Properties to omit
 * @returns {Object} Object without omitted properties
 */
export const omit = (object, props) => {
  return _.omit(object, props);
};

/**
 * Chunk array into smaller arrays
 * @param {Array} array - Array to chunk
 * @param {number} size - Size of each chunk
 * @returns {Array} Array of chunks
 */
export const chunk = (array, size) => {
  return _.chunk(array, size);
};

/**
 * Sum array values
 * @param {Array} array - Array to sum
 * @returns {number} Sum of values
 */
export const sum = (array) => {
  return _.sum(array);
};

/**
 * Sum array values by property
 * @param {Array} array - Array to sum
 * @param {string|Function} iteratee - Property name or function
 * @returns {number} Sum of values
 */
export const sumBy = (array, iteratee) => {
  return _.sumBy(array, iteratee);
};

/**
 * Flatten nested array
 * @param {Array} array - Array to flatten
 * @returns {Array} Flattened array
 */
export const flatten = (array) => {
  return _.flatten(array);
};

/**
 * Flatten nested array deeply
 * @param {Array} array - Array to flatten
 * @returns {Array} Deeply flattened array
 */
export const flattenDeep = (array) => {
  return _.flattenDeep(array);
};

/**
 * Compact array (remove falsy values)
 * @param {Array} array - Array to compact
 * @returns {Array} Compacted array
 */
export const compact = (array) => {
  return _.compact(array);
};
