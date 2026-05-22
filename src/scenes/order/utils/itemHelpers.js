import _ from "lodash";

/**
 * Reset item options to default state (first option selected)
 */
export const resetItemOptions = (options) => {
  if (!_.isArray(options) || _.isEmpty(options)) return options;
  return options.map((opt, idx) => ({
    ...opt,
    is_selected: idx === 0 ? 1 : 0,
  }));
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
    options:
      wasZero && _.size(item.options) > 0
        ? resetItemOptions(item.options)
        : item.options,
    preference:
      wasZero && _.size(item.preference) > 0
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
      is_selected:
        pref.id === preferenceId
          ? pref.is_selected
            ? 0
            : 1
          : pref.is_selected,
    })),
  };
};

/**
 * Check if any items in a meal type have quantity > 0
 */
export const hasItemsWithQuantity = (categories) => {
  if (!_.isArray(categories)) return false;

  return _.some(
    categories,
    (cat) =>
      _.some(cat.entreeItems, (item) => item.qty > 0) ||
      _.some(cat.alternativeItems, (item) => item.qty > 0),
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
  updateFn,
) => {
  return _.map(categories, (cat, idx) => {
    if (idx !== categoryIndex) return cat;

    return {
      ...cat,
      [itemType]: _.map(cat[itemType], (item) =>
        item.id === itemId ? updateFn(item) : item,
      ),
    };
  });
};

/**
 * Increase item quantity with automatic decrement of other items when limit is reached
 * This enforces mutual exclusivity when MAX_MEAL_QTY is reached
 */
export const increaseItemQuantityWithLimit = (
  item,
  maxQty,
  allEntreeItems,
  allAlternativeItems,
  isKitchenUser,
) => {
  if (item.qty >= maxQty)
    return {
      entreeItems: allEntreeItems,
      alternativeItems: allAlternativeItems,
    };

  // Calculate total quantity
  const totalQty =
    (allEntreeItems?.reduce((sum, i) => sum + (i.qty || 0), 0) || 0) +
    (allAlternativeItems?.reduce((sum, i) => sum + (i.qty || 0), 0) || 0);

  let newEntreeItems = [...allEntreeItems];
  let newAlternativeItems = [...(allAlternativeItems || [])];

  // For non-kitchen users, enforce the MAX_MEAL_QTY limit by removing from others
  if (!isKitchenUser && totalQty >= maxQty) {
    let removed = false;

    // First try to remove from alternative items
    newAlternativeItems = newAlternativeItems.map((alt) => {
      if (!removed && alt.qty > 0) {
        removed = true;
        const newQty = alt.qty - 1;
        return {
          ...alt,
          qty: newQty,
          options:
            _.size(alt.options) > 0 && alt.qty > 0 && newQty === 0
              ? resetItemOptions(alt.options)
              : alt.options,
          preference:
            _.size(alt.preference) > 0 && alt.qty > 0 && newQty === 0
              ? resetItemPreferences(alt.preference)
              : alt.preference,
        };
      }
      return alt;
    });

    // If no alternative item was removed, remove from another entree item
    if (!removed) {
      newEntreeItems = newEntreeItems.map((en) => {
        if (!removed && en.id !== item.id && en.qty > 0) {
          removed = true;
          const newQty = en.qty - 1;
          return {
            ...en,
            qty: newQty,
            options:
              _.size(en.options) > 0 && en.qty > 0 && newQty === 0
                ? resetItemOptions(en.options)
                : en.options,
            preference:
              _.size(en.preference) > 0 && en.qty > 0 && newQty === 0
                ? resetItemPreferences(en.preference)
                : en.preference,
          };
        }
        return en;
      });
    }
  }

  // Now increment the current item
  newEntreeItems = newEntreeItems.map((i) =>
    i.id === item.id
      ? {
          ...i,
          qty: (i.qty || 0) + 1,
          options:
            _.size(i.options) > 0 && (i.qty || 0) === 0
              ? resetItemOptions(i.options)
              : i.options,
          preference:
            _.size(i.preference) > 0 && (i.qty || 0) === 0
              ? resetItemPreferences(i.preference)
              : i.preference,
        }
      : i,
  );

  return { entreeItems: newEntreeItems, alternativeItems: newAlternativeItems };
};

/**
 * Increase alternative item quantity with automatic decrement of other items when limit is reached
 */
export const increaseAlternativeItemQuantityWithLimit = (
  item,
  maxQty,
  allEntreeItems,
  allAlternativeItems,
  isKitchenUser,
) => {
  if (item.qty >= maxQty)
    return {
      entreeItems: allEntreeItems,
      alternativeItems: allAlternativeItems,
    };

  // Calculate total quantity
  const totalQty =
    (allEntreeItems?.reduce((sum, i) => sum + (i.qty || 0), 0) || 0) +
    (allAlternativeItems?.reduce((sum, i) => sum + (i.qty || 0), 0) || 0);

  let newEntreeItems = [...(allEntreeItems || [])];
  let newAlternativeItems = [...allAlternativeItems];

  // For non-kitchen users, enforce the MAX_MEAL_QTY limit by removing from others
  if (!isKitchenUser && totalQty >= maxQty) {
    let removed = false;

    // First try to remove from entree items
    newEntreeItems = newEntreeItems.map((en) => {
      if (!removed && en.qty > 0) {
        removed = true;
        const newQty = en.qty - 1;
        return {
          ...en,
          qty: newQty,
          options:
            _.size(en.options) > 0 && en.qty > 0 && newQty === 0
              ? resetItemOptions(en.options)
              : en.options,
          preference:
            _.size(en.preference) > 0 && en.qty > 0 && newQty === 0
              ? resetItemPreferences(en.preference)
              : en.preference,
        };
      }
      return en;
    });

    // If no entree item was removed, remove from another alternative item
    if (!removed) {
      newAlternativeItems = newAlternativeItems.map((alt) => {
        if (!removed && alt.id !== item.id && alt.qty > 0) {
          removed = true;
          const newQty = alt.qty - 1;
          return {
            ...alt,
            qty: newQty,
            options:
              _.size(alt.options) > 0 && alt.qty > 0 && newQty === 0
                ? resetItemOptions(alt.options)
                : alt.options,
            preference:
              _.size(alt.preference) > 0 && alt.qty > 0 && newQty === 0
                ? resetItemPreferences(alt.preference)
                : alt.preference,
          };
        }
        return alt;
      });
    }
  }

  // Now increment the current alternative item
  newAlternativeItems = newAlternativeItems.map((i) =>
    i.id === item.id
      ? {
          ...i,
          qty: (i.qty || 0) + 1,
          options:
            _.size(i.options) > 0 && (i.qty || 0) === 0
              ? resetItemOptions(i.options)
              : i.options,
          preference:
            _.size(i.preference) > 0 && (i.qty || 0) === 0
              ? resetItemPreferences(i.preference)
              : i.preference,
        }
      : i,
  );

  return { entreeItems: newEntreeItems, alternativeItems: newAlternativeItems };
};

/**
 * Toggle service flag (0 <-> 1)
 */
export const toggleServiceFlag = (currentValue) => {
  return currentValue === 1 ? 0 : 1;
};
