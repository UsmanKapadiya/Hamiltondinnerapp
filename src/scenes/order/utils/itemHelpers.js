import _ from "lodash";

/**
 * Reset item options to default state (first option selected)
 */
export const resetItemOptions = (options) => {
  if (!_.isArray(options) || _.isEmpty(options)) return options;
  return options.map((opt, idx) => ({ ...opt, is_selected: idx === 0 ? 1 : 0 }));
};

/**
 * Reset item preferences to default state (none selected)
 */
export const resetItemPreferences = (preferences) => {
  if (!_.isArray(preferences) || _.isEmpty(preferences)) return preferences;
  return preferences.map((p) => ({ ...p, is_selected: 0 }));
};

/**
 * Decrease item quantity and reset options/preferences if qty reaches 0
 */
export const decreaseItemQuantity = (item) => {
  const newQty = Math.max((item.qty || 0) - 1, 0);
  
  return {
    ...item,
    qty: newQty,
    options:
      _.size(item.options) > 0 && newQty === 0
        ? resetItemOptions(item.options)
        : item.options,
    preference:
      _.size(item.preference) > 0 && newQty === 0
        ? resetItemPreferences(item.preference)
        : item.preference,
  };
};

/**
 * Increase item quantity and set default options/preferences if qty was 0
 */
export const increaseItemQuantity = (item, maxQty) => {
  if (item.qty >= maxQty) return item;

  const wasZero = (item.qty || 0) === 0;
  
  return {
    ...item,
    qty: (item.qty || 0) + 1,
    options: wasZero && _.size(item.options) > 0
      ? resetItemOptions(item.options)
      : item.options,
    preference: wasZero && _.size(item.preference) > 0
      ? resetItemPreferences(item.preference)
      : item.preference,
  };
};

/**
 * Update item option selection (radio button logic)
 */
export const updateItemOption = (item, optionId) => {
  return {
    ...item,
    options: _.map(item.options, (opt) => ({
      ...opt,
      is_selected: opt.id === optionId ? 1 : 0,
    })),
  };
};

/**
 * Update item preference selection (checkbox logic)
 */
export const updateItemPreference = (item, preferenceId) => {
  return {
    ...item,
    preference: _.map(item.preference, (pref) => ({
      ...pref,
      is_selected: pref.id === preferenceId ? (pref.is_selected ? 0 : 1) : pref.is_selected,
    })),
  };
};

/**
 * Check if any items in a meal type have quantity > 0
 */
export const hasItemsWithQuantity = (categories) => {
  if (!_.isArray(categories)) return false;
  
  return _.some(categories, (cat) =>
    _.some(cat.entreeItems, (item) => item.qty > 0) ||
    _.some(cat.alternativeItems, (item) => item.qty > 0)
  );
};

/**
 * Update categories with item modification
 */
export const updateCategoryItems = (
  categories,
  categoryIndex,
  itemType,
  itemId,
  updateFn
) => {
  return _.map(categories, (cat, idx) => {
    if (idx !== categoryIndex) return cat;

    return {
      ...cat,
      [itemType]: _.map(cat[itemType], (item) =>
        item.id === itemId ? updateFn(item) : item
      ),
    };
  });
};

/**
 * Toggle service flag (0 <-> 1)
 */
export const toggleServiceFlag = (currentValue) => {
  return currentValue === 1 ? 0 : 1;
};
