import _ from "lodash";
import dayjs from "dayjs";

/**
 * Generic mapping function to transform comma-separated strings into arrays
 * Handles "Other" option with custom text input
 * @param {string} rawString - Comma-separated string from API
 * @param {Array} options - Array of option objects with key and label
 * @param {string} otherLabel - Label for the "Other" option
 * @param {string} otherTextKey - Key name for other text field
 * @param {string} arrKey - Key name for the array field
 * @returns {Object} Object with array of selected values and other text
 */
export const mapOptions = (rawString, options, otherLabel = "Other", otherTextKey = "other_text", arrKey = "arr") => {
  if (!rawString) {
    return {
      [arrKey]: [],
      [otherTextKey]: "",
    };
  }
  
  const values = rawString.split(",").map(v => v.trim());
  const labels = options.map(opt => opt.label);
  const resultArr = [];
  let otherText = "";

  values.forEach(val => {
    if (labels.includes(val)) {
      resultArr.push(val);
    } else if (val) {
      resultArr.push(otherLabel);
      otherText = val;
    }
  });

  return {
    [arrKey]: _.uniq(resultArr),
    [otherTextKey]: otherText,
  };
};

/**
 * Get user data from localStorage with error handling
 * @returns {Object|null} User data object or null
 */
export const getUserData = () => {
  try {
    const userDatas = localStorage.getItem("userData");
    return userDatas ? JSON.parse(userDatas) : null;
  } catch (error) {
    console.error("Error parsing user data:", error);
    return null;
  }
};

/**
 * Format current date and time for logged_at field
 * @returns {string} Formatted date and time
 */
export const getFormattedDateTime = () => {
  const now = new Date();
  const pad = n => n.toString().padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
};

/**
 * Get room ID from userData by room name
 * @param {string} roomNumber - Room number to find
 * @param {Object} userData - User data object
 * @returns {number|null} Room ID or null
 */
export const getRoomIdByNumber = (roomNumber, userData) => {
  if (!userData?.rooms || !Array.isArray(userData.rooms)) {
    return null;
  }
  
  const found = userData.rooms.find(room =>
    String(room.name).toLowerCase() === String(roomNumber).toLowerCase()
  );
  return found?.id || null;
};

/**
 * Get default follow-up user from userData
 * Prioritizes admin/superadmin users
 * @param {Object} userData - User data object
 * @returns {string|number} User ID
 */
export const getDefaultFollowUpUser = (userData) => {
  if (!userData?.user_list || !Array.isArray(userData.user_list)) {
    return '';
  }

  const adminUser = userData.user_list.find(
    user => user.role === 'admin' || user.role === 'superadmin' ||
      user.name?.toLowerCase() === 'admin'
  );

  if (adminUser) {
    return adminUser.id;
  }

  return userData.user_list.length > 0 ? userData.user_list[0].id : '';
};

/**
 * Process incident involved field for API submission
 * @param {Array} incidentArray - Array of incident involved values
 * @param {string} otherText - Other text if "Other" is selected
 * @returns {string} Comma-separated string
 */
export const processIncidentInvolved = (incidentArray, otherText) => {
  return _.compact([
    ..._.filter(incidentArray, val => val !== "Other"),
    ...(incidentArray?.includes("Other") && otherText ? [otherText] : [])
  ]).join(",");
};

/**
 * Process date and time fields into dayjs object
 * @param {string} date - Date string in YYYY-MM-DD format
 * @param {string} time - Time string in HH:mm format
 * @param {string} format - Date parsing format
 * @returns {Object|null} dayjs object or null
 */
export const processDateTime = (date, time, format = "YYYY-MM-DD HH:mm") => {
  if (!date || !time) return null;
  return dayjs(`${date} ${time}`, format);
};

/**
 * Format dayjs object to various date/time formats
 * @param {Object} dateObj - dayjs object
 * @returns {Object} Object with formatted date, date with time, and time
 */
export const formatDateTimeOutput = (dateObj) => {
  if (!dateObj) return { date: "", dateTime: "", time: "" };
  
  return {
    date: dateObj.format("DD MMM YYYY"),
    dateTime: dateObj.format("DD MMM YYYY hh:mm A"),
    time: dateObj.format("hh:mm A"),
  };
};
