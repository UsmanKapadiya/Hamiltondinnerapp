/**
 * Meal Service Configuration
 * Contains service option configurations for different meal types
 */

/**
 * Get breakfast service configuration
 * @param {Object} langObj - Language object containing translations
 * @returns {Array} Array of service configurations
 */
export const getBreakfastServiceKeys = (langObj) => [
  { key: "is_brk_tray_service", label: langObj.trayService },
  { key: "is_brk_escort_service", label: langObj.escortService },
  { key: "is_brk_takeout_service", label: langObj.Takeout },
];

/**
 * Get lunch service configuration
 * @param {Object} langObj - Language object containing translations
 * @returns {Array} Array of service configurations
 */
export const getLunchServiceKeys = (langObj) => [
  { key: "is_lunch_tray_service", label: langObj.trayService },
  { key: "is_lunch_escort_service", label: langObj.escortService },
  { key: "is_lunch_takeout_service", label: langObj.Takeout },
];

/**
 * Get dinner service configuration
 * @param {Object} langObj - Language object containing translations
 * @returns {Array} Array of service configurations
 */
export const getDinnerServiceKeys = (langObj) => [
  { key: "is_dinner_tray_service", label: langObj.trayService },
  { key: "is_dinner_escort_service", label: langObj.escortService },
  { key: "is_dinner_takeout_service", label: langObj.Takeout },
];

/**
 * Get served with text configurations
 */
export const SERVED_WITH_CONFIG = {
  lunch: { catName: "LUNCH ENTREE", textKey: "servedWithSoup" },
  dinner: { catName: "DINNER ENTREE", textKey: "servedWithDessert" },
};
