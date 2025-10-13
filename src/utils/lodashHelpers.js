import _ from 'lodash';

/**
 * Project-specific utility functions using Lodash
 * These helpers are tailored for the Hamilton Dinner App
 */

/**
 * Transform API meal items to app format
 * @param {Array} items - API items array
 * @param {string} type - Item type to filter
 * @returns {Array} Transformed items
 */
export const transformMealItems = (items, type) => {
  return _.chain(items)
    .filter({ type })
    .map(item => ({
      id: _.get(item, 'item_id'),
      name: _.get(item, 'item_name', ''),
      chinese_name: _.get(item, 'chinese_name', ''),
      qty: _.get(item, 'qty', 0),
      options: _.get(item, 'options', []),
      preference: _.get(item, 'preference', ''),
      order_id: _.get(item, 'order_id'),
      image: _.get(item, 'item_image')
    }))
    .value();
};

/**
 * Select first option if none selected
 * @param {Array} options - Options array
 * @returns {Array} Options with first selected if none were
 */
export const selectFirstOption = (options) => {
  if (_.isEmpty(options)) return [];
  
  const hasSelected = _.some(options, { is_selected: 1 });
  if (hasSelected) return options;
  
  return _.map(options, (opt, idx) => ({
    ...opt,
    is_selected: idx === 0 ? 1 : 0
  }));
};

/**
 * Group items by category
 * @param {Array} items - Items array
 * @returns {Object} Items grouped by cat_id
 */
export const groupItemsByCategory = (items) => {
  return _.groupBy(items, 'cat_id');
};

/**
 * Calculate meal totals for report
 * @param {Array} reportList - Report data list
 * @param {number} index - Quantity index
 * @returns {number} Total quantity
 */
export const calculateReportTotal = (reportList, index) => {
  return _.sumBy(_.get(reportList, [], []), row => 
    _.get(row, ['quantity', index], 0)
  );
};

/**
 * Find matching meal row by room number
 * @param {Array} list - List of meal rows
 * @param {string} roomNo - Room number to match
 * @returns {Object} Matching row or empty object with quantity array
 */
export const findMealRowByRoom = (list, roomNo) => {
  return _.find(list, { room_no: roomNo }) || { quantity: [] };
};

/**
 * Validate quantity against max allowed
 * @param {number} currentQty - Current quantity
 * @param {number} newQty - New quantity to set
 * @param {number} maxQty - Maximum allowed quantity
 * @returns {Object} { isValid: boolean, message: string, quantity: number }
 */
export const validateQuantity = (currentQty, newQty, maxQty) => {
  if (newQty < 0) {
    return { isValid: false, message: 'Quantity cannot be negative', quantity: currentQty };
  }
  
  if (newQty > maxQty) {
    return { 
      isValid: false, 
      message: `Quantity cannot exceed ${maxQty}`, 
      quantity: maxQty 
    };
  }
  
  return { isValid: true, message: '', quantity: newQty };
};

/**
 * Extract unique item names from categories
 * @param {Array} categories - Categories array
 * @returns {Array} Unique item names
 */
export const extractUniqueItemNames = (categories) => {
  const allItems = _.flatMap(categories, cat => [
    ..._.get(cat, 'entreeItems', []),
    ..._.get(cat, 'alternativeItems', [])
  ]);
  
  return _.uniqBy(allItems, 'name');
};

/**
 * Filter items by search term
 * @param {Array} items - Items array
 * @param {string} searchTerm - Search term
 * @returns {Array} Filtered items
 */
export const filterItemsBySearch = (items, searchTerm) => {
  if (_.isEmpty(_.trim(searchTerm))) return items;
  
  const term = _.toLower(searchTerm);
  
  return _.filter(items, item => {
    const name = _.toLower(_.get(item, 'name', ''));
    const chineseName = _.toLower(_.get(item, 'chinese_name', ''));
    return _.includes(name, term) || _.includes(chineseName, term);
  });
};

/**
 * Sort items by preference
 * @param {Array} items - Items array
 * @param {string} order - 'asc' or 'desc'
 * @returns {Array} Sorted items
 */
export const sortItemsByPreference = (items, order = 'asc') => {
  return _.orderBy(items, ['preference', 'name'], [order, 'asc']);
};

/**
 * Create meal order payload
 * @param {Object} data - Meal data
 * @param {string} date - Order date
 * @param {number} roomId - Room ID
 * @returns {Object} Order payload
 */
export const createOrderPayload = (data, date, roomId) => {
  const extractOrders = (categories) => {
    return _.flatMap(categories, cat => {
      const items = [
        ..._.get(cat, 'entreeItems', []),
        ..._.get(cat, 'alternativeItems', [])
      ];
      
      return _.chain(items)
        .filter(item => _.get(item, 'qty', 0) > 0)
        .map(item => ({
          item_id: _.get(item, 'id'),
          quantity: _.get(item, 'qty'),
          order_id: _.get(item, 'order_id'),
          options: _.chain(item.options)
            .filter({ is_selected: 1 })
            .map('option_id')
            .value(),
          preference: _.get(item, 'preference', '')
        }))
        .value();
    });
  };
  
  return {
    date,
    room_id: roomId,
    breakfast: extractOrders(_.get(data, 'breakfastCategories', [])),
    lunch: extractOrders(_.get(data, 'lunchCategories', [])),
    dinner: extractOrders(_.get(data, 'dinnerCategories', []))
  };
};

/**
 * Check if any items have been ordered
 * @param {Object} data - Meal data
 * @returns {boolean} True if any items ordered
 */
export const hasAnyOrders = (data) => {
  const allItems = _.flattenDeep([
    _.flatMap(_.get(data, 'breakfastCategories', []), cat => [
      ..._.get(cat, 'entreeItems', []),
      ..._.get(cat, 'alternativeItems', [])
    ]),
    _.flatMap(_.get(data, 'lunchCategories', []), cat => [
      ..._.get(cat, 'entreeItems', []),
      ..._.get(cat, 'alternativeItems', [])
    ]),
    _.flatMap(_.get(data, 'dinnerCategories', []), cat => [
      ..._.get(cat, 'entreeItems', []),
      ..._.get(cat, 'alternativeItems', [])
    ])
  ]);
  
  return _.some(allItems, item => _.get(item, 'qty', 0) > 0);
};

/**
 * Merge user preferences into menu items
 * @param {Array} menuItems - Menu items from API
 * @param {Array} userPreferences - User's saved preferences
 * @returns {Array} Items with preferences merged
 */
export const mergeUserPreferences = (menuItems, userPreferences) => {
  return _.map(menuItems, item => {
    const preference = _.find(userPreferences, { item_id: item.id });
    return preference ? _.merge({}, item, preference) : item;
  });
};

export default {
  transformMealItems,
  selectFirstOption,
  groupItemsByCategory,
  calculateReportTotal,
  findMealRowByRoom,
  validateQuantity,
  extractUniqueItemNames,
  filterItemsBySearch,
  sortItemsByPreference,
  createOrderPayload,
  hasAnyOrders,
  mergeUserPreferences
};
