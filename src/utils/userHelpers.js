import _ from 'lodash';

/**
 * User and Room Data Utilities
 * Professional helper functions for user and room data operations
 */

/**
 * Check if user has kitchen role
 * @param {Object} userData - User data object
 * @returns {boolean} True if user is kitchen staff
 */
export const isKitchenUser = (userData) => {
  return _.get(userData, 'role') === 'kitchen';
};

/**
 * Get user's language preference
 * @param {Object} userData - User data object
 * @returns {number} Language code (0 for English, 1 for Chinese)
 */
export const getUserLanguage = (userData) => {
  return _.get(userData, 'language', 0);
};

/**
 * Get language object based on user preference
 * @param {Object} userData - User data object
 * @param {Object} englishLocale - English locale object
 * @param {Object} chineseLocale - Chinese locale object
 * @returns {Object} Selected language object
 */
export const getLanguageObject = (userData, englishLocale, chineseLocale) => {
  const language = getUserLanguage(userData);
  return language === 1 ? chineseLocale : englishLocale;
};

/**
 * Find room by name in user's room list
 * @param {Object} userData - User data object
 * @param {string} roomName - Room name to find
 * @returns {Object|undefined} Room object or undefined
 */
export const findRoomByName = (userData, roomName) => {
  const rooms = _.get(userData, 'rooms', []);
  return _.find(rooms, { name: roomName });
};

/**
 * Get room ID for a user
 * Priority: specific room name > user's default room_id
 * @param {Object} userData - User data object
 * @param {string} roomName - Optional room name
 * @returns {number|null} Room ID or null
 */
export const getRoomId = (userData, roomName = null) => {
  if (roomName) {
    const room = findRoomByName(userData, roomName);
    if (room) return _.get(room, 'id');
  }
  return _.get(userData, 'room_id', null);
};

/**
 * Get room occupancy for determining max meal quantity
 * @param {Object} userData - User data object
 * @param {string} roomName - Room name
 * @param {number} defaultMax - Default maximum if not found
 * @returns {number} Maximum meal quantity
 */
export const getRoomOccupancy = (userData, roomName, defaultMax = 1) => {
  const room = findRoomByName(userData, roomName);
  return _.get(room, 'occupancy', defaultMax);
};

/**
 * Determine room ID for API request
 * Kitchen users get 0, regular users get their room ID
 * @param {Object} userData - User data object
 * @param {string} roomName - Room name
 * @returns {number} Room ID for API request
 */
export const getApiRoomId = (userData, roomName) => {
  if (isKitchenUser(userData)) return 0;
  return getRoomId(userData, roomName);
};

/**
 * Get all room names for a user
 * @param {Object} userData - User data object
 * @returns {Array<string>} Array of room names
 */
export const getUserRoomNames = (userData) => {
  const rooms = _.get(userData, 'rooms', []);
  return _.map(rooms, 'name');
};

/**
 * Check if user has access to a specific room
 * @param {Object} userData - User data object
 * @param {string} roomName - Room name to check
 * @returns {boolean} True if user has access
 */
export const hasRoomAccess = (userData, roomName) => {
  // Kitchen users have access to all rooms
  if (isKitchenUser(userData)) return true;
  
  const room = findRoomByName(userData, roomName);
  return !_.isUndefined(room);
};

/**
 * Get user's default room
 * @param {Object} userData - User data object
 * @returns {Object|null} Default room object or null
 */
export const getDefaultRoom = (userData) => {
  const rooms = _.get(userData, 'rooms', []);
  return _.first(rooms) || null;
};
