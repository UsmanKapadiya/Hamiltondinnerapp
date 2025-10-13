import dayjs from 'dayjs';

/**
 * Date and time formatting utilities
 * Only contains actively used helper functions
 */

/**
 * Format date to YYYY-MM-DD
 * Used in: order/index.jsx
 */
export const formatDate = (date) => {
  if (!date) return '';
  return dayjs(date).format('YYYY-MM-DD');
};

/**
 * Check if date is today
 * Used in: order/index.jsx, guestOrder/index.jsx
 */
export const isToday = (date) => {
  return dayjs(date).isSame(dayjs(), 'day');
};

/**
 * Check if date is in the past
 * Used in: order/index.jsx, guestOrder/index.jsx
 */
export const isPast = (date) => {
  return dayjs(date).isBefore(dayjs(), 'day');
};

/**
 * Check if current time is after a specific hour
 * Used in: order/index.jsx, guestOrder/index.jsx
 */
export const isAfterHour = (hour) => {
  const now = dayjs();
  return now.hour() > hour || (now.hour() === hour && now.minute() > 0);
};
