import _ from 'lodash';
import dayjs from 'dayjs';

/**
 * Data Processing Utilities
 * Professional helper functions for data manipulation and aggregation
 */

/**
 * Update or add meal data to list
 * @param {Array} mealList - Existing meal list
 * @param {Object} newMeal - New meal data to add/update
 * @returns {Array} Updated meal list
 */
export const updateMealDataList = (mealList, newMeal) => {
  const mealDate = _.get(newMeal, 'date');
  const existingIndex = _.findIndex(mealList, item => 
    dayjs(item.date).isSame(dayjs(mealDate), 'day')
  );
  
  if (existingIndex !== -1) {
    // Update existing meal
    return _.map(mealList, (item, index) => 
      index === existingIndex ? newMeal : item
    );
  }
  
  // Add new meal
  return [...mealList, newMeal];
};

/**
 * Find meal data by date
 * @param {Array} mealList - List of meal data
 * @param {string|Object} date - Date to find (string or dayjs object)
 * @returns {Object|undefined} Found meal data or undefined
 */
export const findMealByDate = (mealList, date) => {
  return _.find(mealList, item => 
    dayjs(item.date).isSame(dayjs(date), 'day')
  );
};

/**
 * Calculate totals for report data
 * @param {Array} reportList - List of report items with data object
 * @param {string} itemKey - Item key from the data object (e.g., 'T', 'E', 'TO', etc.)
 * @returns {number} Total for the column
 */
export const calculateReportColumnTotal = (reportList = [], itemKey) => {
  return _.sumBy(reportList, row => 
    _.get(row, ['data', itemKey], 0)
  );
};

/**
 * Find matching room data across meal types
 * @param {Object} reportData - Report data object
 * @param {string} roomNo - Room number to find
 * @returns {Object} Matched data for all meal types
 */
export const findRoomReportData = (reportData, roomNo) => {
  const breakfast = _.find(
    _.get(reportData, 'report_breakfast_list', []), 
    { room_no: roomNo }
  ) || { data: {}, option: {} };
  
  const lunch = _.find(
    _.get(reportData, 'report_lunch_list', []), 
    { room_no: roomNo }
  ) || { data: {}, option: {} };
  
  const dinner = _.find(
    _.get(reportData, 'report_dinner_list', []), 
    { room_no: roomNo }
  ) || { data: {}, option: {} };
  
  return { breakfast, lunch, dinner };
};

/**
 * Check if all report lists are empty
 * @param {Object} reportData - Report data object
 * @returns {boolean} True if all lists are empty
 */
export const isReportEmpty = (reportData) => {
  return (
    _.isEmpty(_.get(reportData, 'report_breakfast_list')) &&
    _.isEmpty(_.get(reportData, 'report_lunch_list')) &&
    _.isEmpty(_.get(reportData, 'report_dinner_list'))
  );
};

/**
 * Get unique room numbers from breakfast list
 * Used for rendering rows in reports
 * @param {Object} reportData - Report data object
 * @returns {Array<string>} Array of unique room numbers
 */
export const getReportRoomNumbers = (reportData) => {
  const breakfastList = _.get(reportData, 'report_breakfast_list', []);
  return _.map(breakfastList, 'room_no');
};

/**
 * Aggregate item quantities by category
 * @param {Array} items - Array of items
 * @param {string} categoryKey - Key to group by
 * @returns {Object} Grouped quantities
 */
export const aggregateByCategory = (items, categoryKey = 'category') => {
  return _.chain(items)
    .groupBy(categoryKey)
    .mapValues(groupItems => _.sumBy(groupItems, 'qty'))
    .value();
};

/**
 * Sort items by property with null safety
 * @param {Array} items - Array to sort
 * @param {string} property - Property to sort by
 * @param {string} order - 'asc' or 'desc'
 * @returns {Array} Sorted array
 */
export const safeSortBy = (items = [], property, order = 'asc') => {
  return _.orderBy(items, [property], [order]);
};

/**
 * Filter items by multiple criteria
 * @param {Array} items - Array to filter
 * @param {Object} criteria - Filter criteria object
 * @returns {Array} Filtered array
 */
export const filterByCriteria = (items = [], criteria = {}) => {
  if (_.isEmpty(criteria)) return items;
  
  return _.filter(items, item => {
    return _.every(criteria, (value, key) => {
      const itemValue = _.get(item, key);
      return itemValue === value;
    });
  });
};

/**
 * Create payload for API request
 * @param {Object} params - Parameters object
 * @param {Array<string>} requiredFields - Required field names
 * @returns {Object} Sanitized payload
 */
export const createApiPayload = (params, requiredFields = []) => {
  const payload = _.pick(params, requiredFields);
  
  // Validate required fields
  const missingFields = _.filter(requiredFields, field => 
    _.isNil(_.get(payload, field))
  );
  
  if (!_.isEmpty(missingFields)) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }
  
  return payload;
};

/**
 * Extract and format service options
 * @param {Object} data - Data object with service flags
 * @param {string} mealPrefix - Meal prefix (brk, lunch, dinner)
 * @returns {Object} Service options
 */
export const extractServiceOptions = (data, mealPrefix) => ({
  escort: _.get(data, `is_${mealPrefix}_escort_service`, false),
  tray: _.get(data, `is_${mealPrefix}_tray_service`, false),
  takeout: _.get(data, `is_${mealPrefix}_takeout_service`, false)
});

/**
 * Merge multiple data sources safely
 * @param {...Object} sources - Source objects to merge
 * @returns {Object} Merged object
 */
export const safeMerge = (...sources) => {
  return _.merge({}, ...sources);
};
