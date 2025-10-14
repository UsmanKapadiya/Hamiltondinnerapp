import _ from 'lodash';

/**
 * Meal Data Transformation Utilities
 * Professional, readable helper functions for transforming meal data
 */

/**
 * Select first option if none are selected
 * @param {Array} options - Array of option objects
 * @returns {Array} Options with first one selected if none were selected
 */
export const selectFirstOptionIfNeeded = (options = []) => {
  if (_.isEmpty(options)) return [];
  
  const hasSelection = _.some(options, { is_selected: 1 });
  if (hasSelection) return options;
  
  return _.map(options, (option, index) => ({
    ...option,
    is_selected: index === 0 ? 1 : 0
  }));
};

/**
 * Transform menu item to standardized format
 * @param {Object} item - Raw menu item
 * @returns {Object} Transformed item
 */
export const transformMenuItem = (item) => ({
  id: _.get(item, 'item_id'),
  name: _.get(item, 'item_name', ''),
  chinese_name: _.get(item, 'chinese_name', ''),
  qty: _.get(item, 'qty', 0),
  options: selectFirstOptionIfNeeded(_.get(item, 'options', [])),
  preference: _.get(item, 'preference', ''),
  order_id: _.get(item, 'order_id'),
  image: _.get(item, 'item_image')
});

/**
 * Extract items by type from category
 * @param {Object} category - Category object with items
 * @param {string} itemType - Type of items to extract
 * @returns {Array} Filtered and transformed items
 */
export const extractItemsByType = (category, itemType) => {
  return _.chain(category)
    .get('items', [])
    .filter({ type: itemType })
    .map(transformMenuItem)
    .value();
};

/**
 * Extract subcategory information
 * @param {Object} category - Category object
 * @returns {Object} Subcategory name and Chinese name
 */
export const extractSubcategoryInfo = (category) => {
  const subcat = _.find(_.get(category, 'items', []), { type: 'sub_cat' });
  return {
    name: _.get(subcat, 'item_name', ''),
    chinese_name: _.get(subcat, 'chinese_name', '')
  };
};

/**
 * Transform category with all its items
 * @param {Object} category - Raw category data
 * @returns {Object} Transformed category
 */
export const transformCategory = (category) => {
  const subcategory = extractSubcategoryInfo(category);
  
  return {
    cat_id: _.get(category, 'cat_id'),
    cat_name: _.get(category, 'cat_name', ''),
    cat_name_cn: _.get(category, 'chinese_name', ''),
    entreeItems: extractItemsByType(category, 'item'),
    alternativeCatName: subcategory.name,
    alternativeCatName_cn: subcategory.chinese_name,
    alternativeItems: extractItemsByType(category, 'sub_cat_item')
  };
};

/**
 * Transform meal type (breakfast, lunch, dinner)
 * @param {Array} mealCategories - Array of categories for a meal
 * @returns {Array} Transformed categories
 */
export const transformMealCategories = (mealCategories = []) => {
  return _.map(mealCategories, transformCategory);
};

/**
 * Extract service flags for a meal type
 * @param {Object} mealData - Meal data object
 * @param {string} mealType - Type of meal (brk, lunch, dinner)
 * @returns {Object} Service flags
 */
export const extractServiceFlags = (mealData, mealType) => ({
  escort: _.get(mealData, `is_${mealType}_escort_service`, false),
  tray: _.get(mealData, `is_${mealType}_tray_service`, false),
  takeout: _.get(mealData, `is_${mealType}_takeout_service`, false)
});

/**
 * Transform complete meal data including all meal types
 * @param {Object} mealData - Raw meal data from API
 * @returns {Object} Fully transformed meal data
 */
export const transformCompleteMealData = (mealData) => {
  const breakfast = transformMealCategories(_.get(mealData, 'breakfast', []));
  const lunch = transformMealCategories(_.get(mealData, 'lunch', []));
  const dinner = transformMealCategories(_.get(mealData, 'dinner', []));
  
  return {
    breakfastCategories: breakfast,
    lunchCategories: lunch,
    dinnerCategories: dinner,
    breakfastServices: extractServiceFlags(mealData, 'brk'),
    lunchServices: extractServiceFlags(mealData, 'lunch'),
    dinnerServices: extractServiceFlags(mealData, 'dinner')
  };
};

/**
 * Reset quantities for all items in categories
 * @param {Array} categories - Array of categories
 * @returns {Array} Categories with all quantities set to 0
 */
export const resetCategoryQuantities = (categories = []) => {
  return _.map(categories, category => ({
    ...category,
    entreeItems: _.map(_.get(category, 'entreeItems', []), item => ({ 
      ...item, 
      qty: 0 
    })),
    alternativeItems: _.map(_.get(category, 'alternativeItems', []), item => ({ 
      ...item, 
      qty: 0 
    }))
  }));
};

/**
 * Calculate total quantity from all items in categories
 * @param {Array} categories - Array of categories
 * @returns {number} Total quantity
 */
export const calculateCategoryTotalQuantity = (categories = []) => {
  const allItems = _.flatMap(categories, category => [
    ..._.get(category, 'entreeItems', []),
    ..._.get(category, 'alternativeItems', [])
  ]);
  
  return _.sumBy(allItems, item => _.get(item, 'qty', 0));
};

/**
 * Calculate total quantity from all meal types
 * @param {Object} mealData - Meal data with breakfast, lunch, dinner
 * @returns {number} Total quantity across all meals
 */
export const calculateTotalMealQuantity = (mealData) => {
  const breakfastQty = calculateCategoryTotalQuantity(
    _.get(mealData, 'breakfastCategories', [])
  );
  const lunchQty = calculateCategoryTotalQuantity(
    _.get(mealData, 'lunchCategories', [])
  );
  const dinnerQty = calculateCategoryTotalQuantity(
    _.get(mealData, 'dinnerCategories', [])
  );
  
  return breakfastQty + lunchQty + dinnerQty;
};

/**
 * Reset all meal quantities
 * @param {Object} mealData - Meal data object
 * @returns {Object} Meal data with all quantities reset to 0
 */
export const resetAllMealQuantities = (mealData) => ({
  ...mealData,
  breakfastCategories: resetCategoryQuantities(_.get(mealData, 'breakfastCategories', [])),
  lunchCategories: resetCategoryQuantities(_.get(mealData, 'lunchCategories', [])),
  dinnerCategories: resetCategoryQuantities(_.get(mealData, 'dinnerCategories', []))
});
