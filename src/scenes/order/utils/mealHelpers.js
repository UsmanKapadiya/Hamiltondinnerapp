import _ from "lodash";

/**
 * Select first option by default if no option is selected
 * @param {Array} options - Array of options
 * @returns {Array} Options with first one selected if none selected
 */
export const selectFirstOption = (options) => {
  if (_.isEmpty(options)) return [];
  
  const hasSelected = _.some(options, (opt) => opt.is_selected === 1);
  if (hasSelected) return options;
  
  return _.map(options, (opt, idx) => ({
    ...opt,
    is_selected: idx === 0 ? 1 : 0,
  }));
};

/**
 * Flatten meal items for API payload
 * @param {Array} items - Array of meal items
 * @returns {Array} Flattened items for API
 */
export const flattenMealItems = (items = []) => {
  return _.map(items, (item) => ({
    item_id: item.id,
    qty: item.qty,
    order_id: item.order_id || 0,
    preference: _.chain(item.preference)
      .filter((p) => p.is_selected)
      .map((p) => p.id)
      .join(",")
      .value(),
    item_options: _.chain(item.options)
      .filter((o) => o.is_selected)
      .map((o) => o.id)
      .join(",")
      .value(),
  }));
};

/**
 * Get all items from categories
 * @param {Array} categories - Array of categories
 * @returns {Array} All items from categories
 */
export const getAllItemsFromCategories = (categories) => {
  if (!_.isArray(categories)) return [];
  
  return _.flatMap(categories, (cat) => [
    ..._.get(cat, "entreeItems", []),
    ..._.get(cat, "alternativeItems", []),
  ]);
};

/**
 * Get all items from meal data
 * @param {Object} data - Meal data object
 * @returns {Array} All flattened items
 */
export const getAllItemsFromMealData = (data) => {
  const breakfast = getAllItemsFromCategories(_.get(data, "breakfastCategories", []));
  const lunch = getAllItemsFromCategories(_.get(data, "lunchCategories", []));
  const dinner = getAllItemsFromCategories(_.get(data, "dinnerCategories", []));
  
  return flattenMealItems([...breakfast, ...lunch, ...dinner]);
};

/**
 * Compare two items to check if they changed
 * @param {Object} updated - Updated item
 * @param {Object} original - Original item
 * @returns {boolean} True if item changed
 */
export const hasItemChanged = (updated, original) => {
  if (!original) return updated.qty > 0;
  
  return (
    updated.qty !== original.qty ||
    updated.preference !== original.preference ||
    updated.item_options !== original.item_options
  );
};

/**
 * Get changed items by comparing updated and original arrays
 * @param {Array} updatedItems - Updated items array
 * @param {Array} originalItems - Original items array
 * @returns {Array} Changed items
 */
export const getChangedItems = (updatedItems, originalItems) => {
  const originalMap = _.keyBy(
    originalItems,
    (o) => `${o.item_id}_${o.order_id}`
  );
  
  const updatedMap = _.keyBy(
    updatedItems,
    (u) => `${u.item_id}_${u.order_id}`
  );
  
  const changedItems = [];
  
  // Check updated items for new or changed items
  _.forEach(updatedItems, (updated) => {
    const key = `${updated.item_id}_${updated.order_id}`;
    const original = originalMap[key];
    
    if (hasItemChanged(updated, original)) {
      changedItems.push(updated);
    }
  });
  
  // Check original items for removed items
  _.forEach(originalItems, (original) => {
    const key = `${original.item_id}_${original.order_id}`;
    if (!updatedMap[key] && original.qty > 0) {
      changedItems.push({
        ...original,
        qty: 0,
        preference: "",
        item_options: "",
      });
    }
  });
  
  return changedItems;
};

/**
 * Check if service flags have changed
 * @param {Object} current - Current data
 * @param {Object} original - Original data
 * @returns {boolean} True if any service flag changed
 */
export const hasServiceFlagsChanged = (current, original) => {
  const serviceKeys = [
    "is_dinner_takeout_service",
    "is_dinner_tray_service",
    "is_dinner_escort_service",
    "is_brk_tray_service",
    "is_brk_escort_service",
    "is_brk_takeout_service",
    "is_lunch_tray_service",
    "is_lunch_escort_service",
    "is_lunch_takeout_service",
  ];
  
  return _.some(serviceKeys, (key) => 
    _.get(current, key, 0) !== _.get(original, key, 0)
  );
};

/**
 * Reset all meal quantities to 0
 * @param {Object} data - Meal data
 * @returns {Object} Data with all quantities reset
 */
export const resetAllMealQuantities = (data) => {
  const resetCategory = (category) => ({
    ...category,
    entreeItems: _.map(category.entreeItems || [], (item) => ({ ...item, qty: 0 })),
    alternativeItems: _.map(category.alternativeItems || [], (item) => ({ ...item, qty: 0 })),
  });
  
  return {
    ...data,
    breakfastCategories: _.map(data.breakfastCategories || [], resetCategory),
    lunchCategories: _.map(data.lunchCategories || [], resetCategory),
    dinnerCategories: _.map(data.dinnerCategories || [], resetCategory),
  };
};

/**
 * Calculate total meal quantity across all categories
 * @param {Object} data - Meal data
 * @returns {number} Total quantity
 */
export const calculateTotalMealQuantity = (data) => {
  const sumCategoryQuantities = (categories) =>
    _.sumBy(categories, (cat) => {
      const entreeSum = _.sumBy(cat.entreeItems || [], "qty");
      const altSum = _.sumBy(cat.alternativeItems || [], "qty");
      return entreeSum + altSum;
    });
  
  return (
    sumCategoryQuantities(data.breakfastCategories || []) +
    sumCategoryQuantities(data.lunchCategories || []) +
    sumCategoryQuantities(data.dinnerCategories || [])
  );
};

/**
 * Update order IDs in data after submission
 * @param {Object} data - Meal data
 * @param {Array} itemIds - Array of item IDs
 * @param {Array} orderIds - Array of order IDs
 * @returns {Object} Updated data with new order IDs
 */
export const updateOrderIdsInData = (data, itemIds, orderIds) => {
  const updateItems = (items) => {
    if (!_.isArray(items)) return items;
    
    return _.map(items, (item) => {
      const idx = _.findIndex(itemIds, (id) => id === item.id);
      return idx !== -1 ? { ...item, order_id: orderIds[idx] } : item;
    });
  };
  
  const updateCategories = (categories) => {
    if (!_.isArray(categories)) return categories;
    
    return _.map(categories, (cat) => ({
      ...cat,
      entreeItems: updateItems(cat.entreeItems),
      alternativeItems: updateItems(cat.alternativeItems),
    }));
  };
  
  return {
    ...data,
    breakfastCategories: updateCategories(data.breakfastCategories),
    lunchCategories: updateCategories(data.lunchCategories),
    dinnerCategories: updateCategories(data.dinnerCategories),
  };
};

/**
 * Get category name based on language
 * @param {Object} category - Category object
 * @param {string} langCode - Language code
 * @returns {string} Category name
 */
export const getCategoryName = (category, langCode) => {
  if (langCode === "cn" && _.trim(_.get(category, "cat_name_cn", ""))) {
    return category.cat_name_cn;
  }
  return category.cat_name || "";
};

/**
 * Get alternative category name based on language
 * @param {Object} category - Category object
 * @param {string} langCode - Language code
 * @returns {string} Alternative category name
 */
export const getAlternativeCategoryName = (category, langCode) => {
  if (langCode === "cn" && _.trim(_.get(category, "alternativeCatName_cn", ""))) {
    return category.alternativeCatName_cn;
  }
  return category.alternativeCatName || "";
};
