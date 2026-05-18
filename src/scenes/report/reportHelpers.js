// reportHelpers.js

import dayjs from "dayjs";

/**
 * Safely get table columns
 */
export const getColumnsByIndex = (
    data,
    index
) => {
    return Array.isArray(data?.columns) &&
        Array.isArray(data.columns[index])
        ? data.columns[index]
        : [];
};

/**
 * Get dynamic column keys
 */
export const getColumnKeys = (data) => {
    return data?.columns?.[1] &&
        typeof data.columns[1] === "object" &&
        !Array.isArray(data.columns[1])
        ? Object.keys(data.columns[1])
        : [];
};

/**
 * Convert rows object into array
 */
export const getRowsArray = (response) => {
    return Object.values(
        response?.result?.rows || {}
    );
};

/**
 * Check empty report
 */
export const isEmptyReport = (
    rowsArray
) => {
    return (
        !rowsArray ||
        rowsArray.length === 0
    );
};

/**
 * Validate date range
 */
export const isValidDateRange = (
    startDate,
    endDate
) => {
    if (
        !startDate ||
        !endDate ||
        !dayjs(startDate).isValid() ||
        !dayjs(endDate).isValid()
    ) {
        return false;
    }

    return !dayjs(endDate).isBefore(
        dayjs(startDate),
        "day"
    );
};

/**
 * Format API date
 */
export const formatApiDate = (
    date
) => {
    return dayjs(date).format(
        "YYYY-MM-DD"
    );
};

/**
 * Get room name safely
 */
export const getRoomName = (
    room
) => {
    return (
        room?.room_name ||
        room?.room_id ||
        "-"
    );
};

/**
 * Get cell value safely
 */
export const getCellValue = (
    room,
    key
) => {
    return room?.[key] !== undefined
        ? room[key]
        : "";
};
