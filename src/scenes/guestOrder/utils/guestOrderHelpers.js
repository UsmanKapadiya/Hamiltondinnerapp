import _ from "lodash";
import {
  selectFirstOption,
  flattenMealItems,
} from "../../order/utils/mealHelpers";

/**
 * Transform API meal data to component-friendly format
 * @param {Object} mealData - Raw meal data from API
 * @returns {Object} Transformed meal data
 */
export const transformMealData = (mealData) => {
  /**
   * Transform category items to component format
   */
  const transformCategory = (cat) => {
    const items = _.get(cat, "items", []);

    // Extract entree items
    const entreeItems = _.chain(items)
      .filter((item) => item.type === "item")
      .map((item) => ({
        id: item.item_id,
        name: item.item_name,
        chinese_name: item.chinese_name,
        qty: item.qty,
        options: selectFirstOption(item.options),
        preference: item.preference,
        order_id: _.get(item, "order_id"),
        image: _.get(item, "item_image"),
      }))
      .value();

    // Extract alternative category info
    const alternativeCat = _.find(items, { type: "sub_cat" });
    const alternativeCatName = _.get(alternativeCat, "item_name", "");
    const alternativeCatName_cn = _.get(alternativeCat, "chinese_name", "");

    // Extract alternative items
    const alternativeItems = _.chain(items)
      .filter((item) => item.type === "sub_cat_item")
      .map((item) => ({
        id: item.item_id,
        name: item.item_name,
        chinese_name: item.chinese_name,
        qty: item.qty,
        options: selectFirstOption(item.options),
        preference: item.preference,
        order_id: _.get(item, "order_id"),
        image: _.get(item, "item_image"),
      }))
      .value();

    return {
      cat_id: cat.cat_id,
      cat_name: cat.cat_name,
      cat_name_cn: cat.chinese_name,
      entreeItems,
      alternativeCatName,
      alternativeCatName_cn,
      alternativeItems,
    };
  };

  // Transform all meal categories
  const breakfastCategories = _.map(
    _.get(mealData, "breakfast", []),
    transformCategory,
  );
  const lunchCategories = _.map(
    _.get(mealData, "lunch", []),
    transformCategory,
  );
  const dinnerCategories = _.map(
    _.get(mealData, "dinner", []),
    transformCategory,
  );

  return {
    breakfastCategories,
    lunchCategories,
    dinnerCategories,
    is_brk_tray_service: _.get(mealData, "is_brk_tray_service"),
    is_lunch_tray_service: _.get(mealData, "is_lunch_tray_service"),
    is_dinner_tray_service: _.get(mealData, "is_dinner_tray_service"),
  };
};

/**
 * Get changed items from specific meal type
 * @param {Object} currentData - Current meal data
 * @param {Object} originalData - Original meal data
 * @param {string} mealType - Type of meal (breakfastCategories, lunchCategories, dinnerCategories)
 * @returns {Array} Changed items
 */
const getChangedItemsForMealType = (currentData, originalData, mealType) => {
  const flattenCategory = (categories) =>
    _.flatMap(categories, (cat) => [
      ...cat.entreeItems,
      ...cat.alternativeItems,
    ]);

  const currentItems = flattenMealItems(
    flattenCategory(_.get(currentData, mealType, [])),
  );

  const originalItems = flattenMealItems(
    flattenCategory(_.get(originalData, mealType, [])),
  );

  // Create maps for efficient lookup
  const originalMap = _.keyBy(
    originalItems,
    (item) => `${item.item_id}_${item.order_id}`,
  );

  const currentMap = _.keyBy(
    currentItems,
    (item) => `${item.item_id}_${item.order_id}`,
  );

  const changedItems = [];

  // Check for new or changed items
  _.forEach(currentItems, (item) => {
    const key = `${item.item_id}_${item.order_id}`;
    const original = originalMap[key];

    if (!original) {
      // New item
      if (item.qty > 0) changedItems.push(item);
    } else if (
      item.qty !== original.qty ||
      item.preference !== original.preference ||
      item.item_options !== original.item_options
    ) {
      // Changed item
      changedItems.push(item);
    }
  });

  // Check for removed items
  _.forEach(originalItems, (original) => {
    const key = `${original.item_id}_${original.order_id}`;
    if (!currentMap[key] && original.qty > 0) {
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
 * Build guest order payload
 * @param {Object} data - Current meal data
 * @param {Object} originalData - Original meal data
 * @param {Object} params - Additional parameters (date, roomId, guestCount, userData, roomNo)
 * @returns {Object} Order payload
 */
export const buildGuestOrderPayload = (data, originalData, params) => {
  const { date, guestCount, userData, roomNo } = params;

  // Get changed items for each meal type
  const breakfastChanges = getChangedItemsForMealType(
    data,
    originalData,
    "breakfastCategories",
  );
  const lunchChanges = getChangedItemsForMealType(
    data,
    originalData,
    "lunchCategories",
  );
  const dinnerChanges = getChangedItemsForMealType(
    data,
    originalData,
    "dinnerCategories",
  );

  // Find selected room
  const selectedRoom = _.find(
    _.get(userData, "rooms", []),
    (room) => room.name === roomNo,
  );

  return {
    date: date.format("YYYY-MM-DD"),
    room_id: _.get(selectedRoom, "id"),
    orders_to_change: JSON.stringify([
      ...breakfastChanges,
      ...lunchChanges,
      ...dinnerChanges,
    ]),
    occupancy: guestCount,
    is_for_guest: 1,
    is_brk_tray_service: _.get(data, "is_brk_tray_service"),
    is_lunch_tray_service: _.get(data, "is_lunch_tray_service"),
    is_dinner_tray_service: _.get(data, "is_dinner_tray_service"),
  };
};

/**
 * Update order IDs in data after submission
 * @param {Object} data - Current meal data
 * @param {Array} itemIds - Array of item IDs
 * @param {Array} orderIds - Array of order IDs
 * @returns {Object} Updated data with new order IDs
 */
export const updateGuestOrderIds = (data, itemIds, orderIds) => {
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
