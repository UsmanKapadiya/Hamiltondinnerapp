import dayjs from 'dayjs';

/**
 * Date and time formatting utilities
 */

/**
 * Format date to YYYY-MM-DD
 */
export const formatDate = (date) => {
  if (!date) return '';
  return dayjs(date).format('YYYY-MM-DD');
};

/**
 * Format date to readable format (e.g., "January 1, 2024")
 */
export const formatDateReadable = (date) => {
  if (!date) return '';
  return dayjs(date).format('MMMM D, YYYY');
};

/**
 * Format time to HH:mm
 */
export const formatTime = (date) => {
  if (!date) return '';
  return dayjs(date).format('HH:mm');
};

/**
 * Format datetime to readable format
 */
export const formatDateTime = (date) => {
  if (!date) return '';
  return dayjs(date).format('MMMM D, YYYY h:mm A');
};

/**
 * Check if date is today
 */
export const isToday = (date) => {
  return dayjs(date).isSame(dayjs(), 'day');
};

/**
 * Check if date is in the past
 */
export const isPast = (date) => {
  return dayjs(date).isBefore(dayjs(), 'day');
};

/**
 * Check if date is in the future
 */
export const isFuture = (date) => {
  return dayjs(date).isAfter(dayjs(), 'day');
};

/**
 * Check if current time is after a specific hour
 */
export const isAfterHour = (hour) => {
  const now = dayjs();
  return now.hour() > hour || (now.hour() === hour && now.minute() > 0);
};

/**
 * Get time difference in hours
 */
export const getHoursDifference = (date1, date2) => {
  return dayjs(date1).diff(dayjs(date2), 'hour');
};

/**
 * Get relative time (e.g., "2 hours ago")
 */
export const getRelativeTime = (date) => {
  if (!date) return '';
  return dayjs(date).fromNow();
};

/**
 * Check if date is between two dates
 */
export const isBetween = (date, startDate, endDate) => {
  const d = dayjs(date);
  return d.isAfter(startDate) && d.isBefore(endDate);
};

/**
 * Add days to date
 */
export const addDays = (date, days) => {
  return dayjs(date).add(days, 'day');
};

/**
 * Subtract days from date
 */
export const subtractDays = (date, days) => {
  return dayjs(date).subtract(days, 'day');
};
