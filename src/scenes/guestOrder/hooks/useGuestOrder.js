import { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation } from "react-router-dom";
import dayjs from "dayjs";
import _ from "lodash";
import { toast } from "react-toastify";
import { useLocalStorage } from "../../../hooks";
import OrderServices from "../../../services/orderServices";
import config from "../../../config";
import {
  isToday,
  isPast,
  isAfterHour,
  getLanguageObject,
  getRoomId,
} from "../../../utils";
import {
  calculateTotalMealQuantity,
  resetAllMealQuantities,
} from "../../order/utils/mealHelpers";
import {
  transformMealData,
  buildGuestOrderPayload,
  updateGuestOrderIds,
} from "../utils/guestOrderHelpers";
import en from "../../../locales/Localizable_en";
import cn from "../../../locales/Localizable_cn";

const { breakfastEndHour, lunchEndHour, dinnerEndHour } = config.mealTimes;

/**
 * useGuestOrder - Custom hook for guest order management business logic
 * Handles all state management, API calls, and business logic for guest order component
 */
export const useGuestOrder = () => {
  const location = useLocation();
  const roomNo = _.get(location, "state.roomNo");
  const selectedDate = _.get(location, "state.selectedDate");

  // ==================== State Management ====================
  const [date, setDate] = useState(
    selectedDate ? dayjs(selectedDate) : dayjs(),
  );
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({});
  const [mealData, setMealData] = useState({});
  const [guestCount, setGuestCount] = useState(1);
  const [alertOpen, setAlertOpen] = useState(false);
  const [langObj, setLangObj] = useState(en);
  const [userData] = useLocalStorage("userData", null);

  // ==================== Memoized Values ====================
  const getDefaultTabIndex = useCallback(() => {
    const now = dayjs();
    const hour = now.hour();
    const minute = now.minute();

    if (hour > lunchEndHour || (hour === lunchEndHour && minute > 0)) {
      return 2; // Dinner
    } else if (
      hour > breakfastEndHour ||
      (hour === breakfastEndHour && minute > 0)
    ) {
      return 1; // Lunch
    }
    return 0; // Breakfast
  }, []);

  const [tabIndex, setTabIndex] = useState(getDefaultTabIndex());

  // Date checks
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

  // Guidelines checks
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

  // ==================== Effects ====================
  useEffect(() => {
    setLangObj(getLanguageObject(userData, en, cn));
  }, [userData]);

  useEffect(() => {
    fetchMenuDetails();
  }, [date]);

  // ==================== API Functions ====================
  /**
   * Fetch guest order menu details
   */
  const fetchMenuDetails = async () => {
    try {
      setLoading(true);
      const roomId = getRoomId(userData, roomNo);
      const payload = {
        date: date.format("YYYY-MM-DD"),
        room_id: roomId,
      };

      const response = await OrderServices.getGuestOrderList(payload);
      const transformedData = transformMealData(response);

      setGuestCount(_.get(response, "occupancy", 1));
      setMealData(transformedData);
      setData(transformedData);
    } catch (error) {
      console.error("Error fetching menu list:", error);
      toast.error("Failed to load guest order data");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Submit guest order
   */
  const submitData = async (data, date) => {
    try {
      const payload = buildGuestOrderPayload(data, mealData, {
        date,
        guestCount,
        userData,
        roomNo,
      });

      const response = await OrderServices.updateGuestOrder(payload);

      if (_.get(response, "ResponseText") === "success") {
        const itemIds = _.get(response, "item_id");
        const orderIds = _.get(response, "order_id");

        if (itemIds && orderIds) {
          setData((prevData) =>
            updateGuestOrderIds(prevData, itemIds, orderIds),
          );
          await fetchMenuDetails();
        }

        toast.success("Guest Order submitted successfully!");
      } else {
        toast.error(
          _.get(response, "ResponseText", "Guest Order submission failed."),
        );
      }
    } catch (error) {
      toast.error("An error occurred while submitting the order.");
      console.error(error);
    }
  };

  // ==================== Event Handlers ====================
  /**
   * Handle guest count increment
   */
  const handleIncrement = () => {
    setGuestCount((prev) => {
      if (prev >= 10) {
        toast.warn(langObj.maximumGuestWarn);
        return prev;
      }
      return prev + 1;
    });
  };

  /**
   * Handle guest count decrement
   */
  const handleDecrement = () => {
    const totalQty = calculateTotalMealQuantity(data);

    setGuestCount((prev) => {
      if (prev > 1) {
        if (prev - 1 < totalQty) {
          setAlertOpen(true);
          return prev;
        }
        return prev - 1;
      }
      return 1;
    });
  };

  /**
   * Handle alert dialog continue
   */
  const handleAlertContinue = () => {
    setAlertOpen(false);
    setData(resetAllMealQuantities(data));
    setGuestCount((prev) => (prev > 1 ? prev - 1 : 1));
  };

  /**
   * Handle alert dialog cancel
   */
  const handleAlertCancel = () => {
    setAlertOpen(false);
  };

  /**
   * Handle date change
   */
  const handleDateChange = (newDate) => {
    setDate(newDate);
    setData((data) => resetAllMealQuantities(data));
    setGuestCount((prev) => (prev > 1 ? prev - 1 : 1));
  };

  // ==================== Return Values ====================
  return {
    // State
    langObj,
    date,
    data,
    setData,
    mealData,
    userData,
    roomNo,
    tabIndex,
    setTabIndex,
    loading,
    guestCount,
    alertOpen,

    // Computed values
    isPastDate,
    isAfter10AM,
    isAfter3PM,
    isAfter12PM,
    showBreakFastGuideline,
    showLunchGuideline,
    showDinnerGuideline,

    // Methods
    submitData,
    handleIncrement,
    handleDecrement,
    handleAlertContinue,
    handleAlertCancel,
    handleDateChange,
    fetchMenuDetails,
  };
};
