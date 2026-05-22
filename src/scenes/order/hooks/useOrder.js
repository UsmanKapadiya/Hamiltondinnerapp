import { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import _ from "lodash";
import { toast } from "react-toastify";
import { useLazyApi, useLocalStorage } from "../../../hooks";
import OrderServices from "../../../services/orderServices";
import config from "../../../config";
import {
  transformCompleteMealData,
  formatDate,
  isToday,
  isPast,
  isAfterHour,
  getLanguageObject,
  isKitchenUser,
  getRoomOccupancy,
  getApiRoomId,
  updateMealDataList,
} from "../../../utils";
import {
  getAllItemsFromMealData,
  getChangedItems,
  hasServiceFlagsChanged,
} from "../utils/mealHelpers";
import en from "../../../locales/Localizable_en";
import cn from "../../../locales/Localizable_cn";

const { breakfastEndHour, lunchEndHour, dinnerEndHour } = config.mealTimes;

/**
 * useOrder - Custom hook for order management business logic
 * Handles all state management, API calls, and business logic for order component
 */
export const useOrder = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const roomNo = _.get(location, "state.roomNo");

  // ==================== State Management ====================
  const [langObj, setLangObj] = useState(en);
  const [date, setDate] = useState(dayjs());
  const [data, setData] = useState({});
  const [mealData, setMealData] = useState([]);
  const [mealSelections, setMealSelections] = useState([]);
  const [MAX_MEAL_QTY, setMAX_MEAL_QTY] = useState(1);
  const [kitchenSummery, setKitchenSummery] = useState(false);
  const [userData] = useLocalStorage("userData", null);

  // ==================== Memoized User Checks ====================
  const kitchenUser = useMemo(() => isKitchenUser(userData), [userData]);

  const maxMealQty = useMemo(() => {
    if (kitchenUser) return config.defaults.maxMenuQuantityForKitchenUser;
    return getRoomOccupancy(userData, roomNo, config.defaults.maxMealQuantity);
  }, [userData, roomNo, kitchenUser]);

  // ==================== Date Checks ====================
  const isTodayDate = useMemo(() => isToday(date), [date]);
  const isPastDate = useMemo(() => isPast(date), [date]);
  const isAfter10AM = useMemo(
    () => isTodayDate && isAfterHour(breakfastEndHour),
    [isTodayDate],
  );
  const isAfter3PM = useMemo(
    () => isTodayDate && isAfterHour(lunchEndHour),
    [isTodayDate],
  );
  const isAfter12PM = useMemo(
    () => isTodayDate && isAfterHour(dinnerEndHour),
    [isTodayDate],
  );

  // ==================== Guidelines Checks ====================
  const showBreakFastGuideline = useMemo(
    () =>
      !_.isEmpty(_.get(userData, "breakfast_guideline")) &&
      !_.isEmpty(_.get(data, "breakfastCategories")),
    [userData, data.breakfastCategories],
  );

  const showLunchGuideline = useMemo(
    () =>
      !_.isEmpty(_.get(userData, "lunch_guideline")) &&
      !_.isEmpty(_.get(data, "lunchCategories")),
    [userData, data.lunchCategories],
  );

  const showDinnerGuideline = useMemo(
    () =>
      !_.isEmpty(_.get(userData, "dinner_guideline")) &&
      !_.isEmpty(_.get(data, "dinnerCategories")),
    [userData, data.dinnerCategories],
  );

  // ==================== API for Menu Fetching ====================
  const { execute: fetchMenu, loading } = useLazyApi(
    (roomId, date) => OrderServices.getMenuData(roomId, date),
    {
      onSuccess: (response) => {
        const transformedData = transformCompleteMealData(response);
        const mealWithDate = { ...transformedData, date: formatDate(date) };

        setMealData((prev) => updateMealDataList(prev, mealWithDate));
        setData(transformedData);
      },
      onError: (error) => {
        console.error("Error fetching menu list:", error);
        toast.error("Failed to load menu data");
      },
    },
  );

  // ==================== Default Tab Index ====================
  const getDefaultTabIndex = useCallback(() => {
    const now = dayjs();
    const hour = now.hour();
    const minute = now.minute();

    if (hour > lunchEndHour || (hour === lunchEndHour && minute > 0)) {
      return 2; // Dinner
    } else if (hour >= breakfastEndHour) {
      return 1; // Lunch
    }
    return 0; // Breakfast
  }, []);

  const [tabIndex, setTabIndex] = useState(getDefaultTabIndex());

  // ==================== Effects ====================
  // Set language based on user preference
  useEffect(() => {
    setLangObj(getLanguageObject(userData, en, cn));
  }, [userData]);

  // Set MAX_MEAL_QTY based on user type and room
  useEffect(() => {
    setMAX_MEAL_QTY(maxMealQty);
  }, [maxMealQty]);

  // Fetch menu when date changes
  useEffect(() => {
    const dateStr = formatDate(date);
    const existingMeal = _.find(mealSelections, { date: dateStr });

    if (!existingMeal) {
      fetchMenuDetails(dateStr);
    }
  }, [date, mealSelections]);

  // Handle kitchen summary state
  useEffect(() => {
    const summaryFlag = _.get(location, "state.Kitchen_summery", false);
    setKitchenSummery(summaryFlag);
  }, [location.state]);

  // ==================== Helper Functions ====================
  /**
   * Fetch menu details for a given date
   */
  const fetchMenuDetails = useCallback(
    async (dateStr) => {
      const roomId = getApiRoomId(userData, roomNo);
      await fetchMenu(roomId, dateStr);
    },
    [userData, roomNo, fetchMenu],
  );

  /**
   * Build order payload from meal selections
   */
  const buildOrderPayload = useCallback(
    (dataArray) => {
      const roomId = getApiRoomId(userData, roomNo);

      const orders = _.chain(dataArray)
        .map((data) => {
          const updatedItems = getAllItemsFromMealData(data);

          // Find original data for this date
          const originalMeal = _.isArray(mealData)
            ? _.find(mealData, { date: data.date })
            : _.get(mealData, "date") === data.date
              ? mealData
              : null;

          const originalItems = originalMeal
            ? getAllItemsFromMealData(originalMeal)
            : [];

          // Get changed items
          const changedItems = getChangedItems(updatedItems, originalItems);

          // Check if service flags changed
          const servicesChanged = hasServiceFlagsChanged(data, originalMeal);

          // Only include this order if there are changes
          if (_.isEmpty(changedItems) && !servicesChanged) return null;

          return {
            date: data.date,
            is_brk_tray_service: _.get(data, "is_brk_tray_service", 0),
            is_brk_escort_service: _.get(data, "is_brk_escort_service", 0),
            is_brk_takeout_service: _.get(data, "is_brk_takeout_service", 0),
            is_lunch_tray_service: _.get(data, "is_lunch_tray_service", 0),
            is_lunch_escort_service: _.get(data, "is_lunch_escort_service", 0),
            is_lunch_takeout_service: _.get(
              data,
              "is_lunch_takeout_service",
              0,
            ),
            is_dinner_tray_service: _.get(data, "is_dinner_tray_service", 0),
            is_dinner_escort_service: _.get(
              data,
              "is_dinner_escort_service",
              0,
            ),
            is_dinner_takeout_service: _.get(
              data,
              "is_dinner_takeout_service",
              0,
            ),
            items: changedItems,
          };
        })
        .compact()
        .value();

      return {
        current_date: _.get(_.last(dataArray), "date", ""),
        room_id: roomId,
        orders_to_change: JSON.stringify(orders),
      };
    },
    [userData, roomNo, mealData],
  );

  /**
   * Get updated meal selections
   */
  const getUpdatedMealSelections = useCallback((prev, data, dateStr) => {
    const foundIndex = _.findIndex(prev, { date: dateStr });

    if (foundIndex !== -1) {
      return _.map(prev, (item, idx) =>
        idx === foundIndex ? { ...data, date: dateStr } : item,
      );
    }

    return [...prev, { ...data, date: dateStr }];
  }, []);

  /**
   * Submit order data
   */
  const submitData = useCallback(
    async (data, date) => {
      try {
        const newMealSelections = getUpdatedMealSelections(
          mealSelections,
          data,
          date,
        );
        setMealSelections(newMealSelections);

        const payload = buildOrderPayload(newMealSelections);
        const response = await OrderServices.submitOrder(payload);

        if (_.get(response, "ResponseText") === "success") {
          toast.success(
            langObj.orderSuccess || "Order submitted successfully!",
          );

          // Clear meal selections and refetch menu
          setMealSelections([]);
          await fetchMenuDetails(date);
        } else {
          toast.error(_.get(response, "ResponseText", langObj.orderFailed));
        }
      } catch (error) {
        console.error("Error submitting order:", error);
        toast.error(
          langObj.orderFailed ||
            "An error occurred while submitting the order.",
        );
      }
    },
    [
      mealSelections,
      buildOrderPayload,
      langObj,
      getUpdatedMealSelections,
      fetchMenuDetails,
    ],
  );

  /**
   * Room update handler
   */
  const roomUpdate = useCallback(async (data) => {
    const userId = _.get(data, "selectedUser.id");

    if (!userId) {
      toast.error("No user selected for room update.");
      return;
    }

    try {
      const specialInstruction = _.trim(
        _.toString(_.get(data, "specialInstruction", "")),
      );
      const foodTexture = _.trim(_.toString(_.get(data, "foodTexture", "")));
      const allergy_Info = _.trim(_.toString(_.get(data, "allergy_Info", "")));

      const response = await OrderServices.updateRoomDetails(
        userId,
        specialInstruction,
        foodTexture,
        allergy_Info,
      );

      if (_.get(response, "ResponseCode") === "1") {
        toast.success(
          _.get(response, "ResponseText", "Room Details Updated Successfully"),
        );
      } else {
        toast.error(
          _.get(
            response,
            "ResponseText",
            "Room Details Update failed. Please try again.",
          ),
        );
      }
    } catch (error) {
      console.error("Error updating room details:", error);
      const errorMessage = _.get(
        error,
        "response.data.error",
        "An unexpected error occurred. Please try again.",
      );
      toast.error(errorMessage);
    }
  }, []);

  /**
   * Handle guest order click
   */
  const handleGuestOrderClick = useCallback(() => {
    const formattedDate = date.format("YYYY-MM-DD");
    const room = roomNo || _.get(userData, "room_id");

    navigate("/guestOrder", {
      state: { roomNo: room, selectedDate: formattedDate },
    });
  }, [date, roomNo, userData, navigate]);

  /**
   * Get tab index by time
   */
  const getTabIndexByTime = useCallback((dateObj) => {
    const hour = dateObj.hour();
    const minute = dateObj.minute();

    if (hour > lunchEndHour || (hour === lunchEndHour && minute > 0)) {
      return 2; // Dinner
    } else if (hour >= breakfastEndHour) {
      return 1; // Lunch
    }
    return 0; // Breakfast
  }, []);

  /**
   * Handle date change
   */
  const handleDateChange = useCallback(
    (newDate) => {
      const previousDate = date.format("YYYY-MM-DD");
      const newDateStr = newDate.format("YYYY-MM-DD");
      const existingMeal = _.find(mealSelections, { date: newDateStr });

      if (existingMeal) {
        // Save current selections and load existing meal
        const updatedSelections = getUpdatedMealSelections(
          mealSelections,
          data,
          previousDate,
        );
        setMealSelections(updatedSelections);
        setDate(newDate);
        setData(existingMeal);

        // Update tab index based on current time
        const currentTime = dayjs();
        const newTabIndex = getTabIndexByTime(currentTime);
        setTabIndex(newTabIndex);
      } else {
        // Save current selections and fetch new date
        const updatedSelections = getUpdatedMealSelections(
          mealSelections,
          data,
          previousDate,
        );
        setMealSelections(updatedSelections);
        setDate(newDate);
      }
    },
    [date, mealSelections, data, getUpdatedMealSelections, getTabIndexByTime],
  );

  // ==================== Return Values ====================
  return {
    // State
    langObj,
    date,
    data,
    setData,
    mealData,
    mealSelections,
    MAX_MEAL_QTY,
    kitchenSummery,
    userData,
    roomNo,
    tabIndex,
    setTabIndex,
    loading,

    // Computed values
    kitchenUser,
    isTodayDate,
    isPastDate,
    isAfter10AM,
    isAfter3PM,
    isAfter12PM,
    showBreakFastGuideline,
    showLunchGuideline,
    showDinnerGuideline,

    // Methods
    submitData,
    roomUpdate,
    handleGuestOrderClick,
    handleDateChange,
  };
};
