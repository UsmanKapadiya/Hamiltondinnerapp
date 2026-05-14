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
import en from "../../../locales/Localizable_en";
import cn from "../../../locales/Localizable_cn";

const { breakfastEndHour, lunchEndHour, dinnerEndHour } = config.mealTimes;

export const useOrderManagement = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const roomNo = location.state?.roomNo;

  // State
  const [langObj, setLangObj] = useState(en);
  const [date, setDate] = useState(dayjs());
  const [data, setData] = useState({});
  const [mealData, setMealData] = useState([]);
  const [mealSelections, setMealSelections] = useState([]);
  const [MAX_MEAL_QTY, setMAX_MEAL_QTY] = useState(1);
  const [kitchenSummery, setKitchenSummery] = useState(false);
  const [userData] = useLocalStorage("userData", null);

  // Memoized user checks
  const kitchenUser = useMemo(() => isKitchenUser(userData), [userData]);
  const maxMealQty = useMemo(() => {
    if (kitchenUser) return config.defaults.maxMenuQuantityForKitchenUser;
    return getRoomOccupancy(userData, roomNo, config.defaults.maxMealQuantity);
  }, [userData, roomNo, kitchenUser]);

  // Date checks
  const isTodayDate = useMemo(() => isToday(date), [date]);
  const isPastDate = useMemo(() => isPast(date), [date]);
  const isAfter10AM = useMemo(() => isTodayDate && isAfterHour(breakfastEndHour), [isTodayDate]);
  const isAfter3PM = useMemo(() => isTodayDate && isAfterHour(lunchEndHour), [isTodayDate]);
  const isAfter12PM = useMemo(() => isTodayDate && isAfterHour(dinnerEndHour), [isTodayDate]);

  // Guidelines checks
  const showBreakFastGuideline = useMemo(
    () =>
      userData?.breakfast_guideline &&
      data.breakfastCategories &&
      data.breakfastCategories.length > 0,
    [userData, data.breakfastCategories]
  );

  const showLunchGuideline = useMemo(
    () =>
      userData?.lunch_guideline &&
      data.lunchCategories &&
      data.lunchCategories.length > 0,
    [userData, data.lunchCategories]
  );

  const showDinnerGuideline = useMemo(
    () =>
      userData?.dinner_guideline &&
      data.dinnerCategories &&
      data.dinnerCategories.length > 0,
    [userData, data.dinnerCategories]
  );

  // API for menu fetching
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
    }
  );

  // Default tab index based on time
  const getDefaultTabIndex = useCallback(() => {
    const now = dayjs();
    if (now.hour() > lunchEndHour || (now.hour() === lunchEndHour && now.minute() > 0)) {
      return 2; // Dinner
    } else if (now.hour() >= breakfastEndHour) {
      return 1; // Lunch
    }
    return 0; // Breakfast
  }, []);

  const [tabIndex, setTabIndex] = useState(getDefaultTabIndex());

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
    const existingMeal = _.find(mealSelections, { date: formatDate(date) });
    if (!existingMeal) {
      fetchMenuDetails(formatDate(date));
    }
  }, [date, mealSelections]);

  // Handle kitchen summary state
  useEffect(() => {
    const summaryFlag = _.get(location, "state.Kitchen_summery", false);
    setKitchenSummery(summaryFlag);
  }, [location.state]);

  // Fetch menu details
  const fetchMenuDetails = useCallback(
    async (dateStr) => {
      const roomId = getApiRoomId(userData, roomNo);
      await fetchMenu(roomId, dateStr);
    },
    [userData, roomNo, fetchMenu]
  );

  // Build order payload
  const buildOrderPayload = useCallback(
    (dataArray) => {
      const flatten = (arr) =>
        (arr || []).map((item) => ({
          item_id: item.id,
          qty: item.qty,
          order_id: item.order_id || 0,
          preference: (item.preference || [])
            .filter((p) => p.is_selected)
            .map((p) => p.id)
            .join(","),
          item_options: (item.options || [])
            .filter((o) => o.is_selected)
            .map((o) => o.id)
            .join(","),
        }));

      const getItems = (d) => [
        ...(d.breakfastCategories || []).flatMap((cat) => [
          ...flatten(cat.entreeItems),
          ...flatten(cat.alternativeItems),
        ]),
        ...(d.lunchCategories || []).flatMap((cat) => [
          ...flatten(cat.entreeItems),
          ...flatten(cat.alternativeItems),
        ]),
        ...(d.dinnerCategories || []).flatMap((cat) => [
          ...flatten(cat.entreeItems),
          ...flatten(cat.alternativeItems),
        ]),
      ];

      const selectedRoom = _.find(userData.rooms, { name: roomNo });
      const room_id = selectedRoom?.id || 0;

      const orders = dataArray.map((data) => {
        const items = getItems(data);
        const hasItems = items.some((item) => item.qty > 0);

        if (!hasItems) return null;

        return {
          date: data.date,
          breakfast: items.filter((item) => item.qty > 0),
          is_brk_tray_service: data.is_brk_tray_service || 0,
          is_brk_escort_service: data.is_brk_escort_service || 0,
          is_brk_takeout_service: data.is_brk_takeout_service || 0,
          is_lunch_tray_service: data.is_lunch_tray_service || 0,
          is_lunch_escort_service: data.is_lunch_escort_service || 0,
          is_lunch_takeout_service: data.is_lunch_takeout_service || 0,
          is_dinner_tray_service: data.is_dinner_tray_service || 0,
          is_dinner_escort_service: data.is_dinner_escort_service || 0,
          is_dinner_takeout_service: data.is_dinner_takeout_service || 0,
        };
      }).filter(Boolean);

      return {
        current_date: dataArray.length ? dataArray[dataArray.length - 1].date : "",
        room_id,
        orders_to_change: JSON.stringify(orders),
      };
    },
    [userData, roomNo]
  );

  // Get updated meal selections
  const getUpdatedMealSelections = useCallback((prev, data, date) => {
    const dateStr = date;
    const foundIndex = _.findIndex(prev, { date: dateStr });

    if (foundIndex !== -1) {
      const updated = [...prev];
      updated[foundIndex] = { ...data, date: dateStr };
      return updated;
    } else {
      return [...prev, { ...data, date: dateStr }];
    }
  }, []);

  // Submit data
  const submitData = useCallback(
    async (data, date) => {
      try {
        const newMealSelections = getUpdatedMealSelections(mealSelections, data, date);
        setMealSelections(newMealSelections);

        const payload = buildOrderPayload(newMealSelections);

        const response = await OrderServices.changeOrder(payload);

        if (response?.message === "success") {
          toast.success(langObj.orderSuccess);

          const allCategories = [
            ...(data.breakfastCategories || []),
            ...(data.lunchCategories || []),
            ...(data.dinnerCategories || []),
          ];

          const allItems = allCategories.flatMap((cat) => [
            ...(cat.entreeItems || []),
            ...(cat.alternativeItems || []),
          ]);

          const updatedData = { ...data };
          allItems.forEach((item) => {
            if (item.qty > 0 && response.order_id) {
              item.order_id = response.order_id;
            }
          });

          setData(updatedData);
          setMealSelections((prev) => getUpdatedMealSelections(prev, updatedData, date));
        } else {
          toast.error(langObj.orderFailed);
        }
      } catch (error) {
        console.error("Error submitting order:", error);
        toast.error(langObj.orderFailed);
      }
    },
    [mealSelections, buildOrderPayload, langObj, getUpdatedMealSelections]
  );

  // Room update handler
  const roomUpdate = useCallback(
    async (data) => {
      if (data?.selectedUser?.id) {
        try {
          const response = await OrderServices.updateRoomDetails({
            room_id: data.selectedUser.id,
            ..._.pick(data, ["breakfast_time", "lunch_time", "dinner_time"]),
          });

          if (response?.message === "success") {
            const updatedUserData = {
              ...userData,
              breakfast_time: data.breakfast_time,
              lunch_time: data.lunch_time,
              dinner_time: data.dinner_time,
            };
            localStorage.setItem("userData", JSON.stringify(updatedUserData));
            toast.success("Room details updated successfully");
          } else {
            toast.error("Failed to update room details");
          }
        } catch (error) {
          console.error("Error updating room details:", error);
          toast.error("Failed to update room details");
        }
      } else {
        toast.error("Please select a room");
      }
    },
    [userData]
  );

  // Handle guest order click
  const handleGuestOrderClick = useCallback(() => {
    const formattedDate = date.format("YYYY-MM-DD");
    const room = roomNo ? roomNo : userData?.room_id;

    navigate("/guestOrder", {
      state: { roomNo: room, selectedDate: formattedDate },
    });
  }, [date, roomNo, userData, navigate]);

  // Get tab index by time
  const getTabIndexByTime = useCallback((dateObj) => {
    const now = dateObj;
    if (now.hour() > lunchEndHour || (now.hour() === lunchEndHour && now.minute() > 0)) {
      return 2; // Dinner
    } else if (now.hour() >= breakfastEndHour) {
      return 1; // Lunch
    }
    return 0; // Breakfast
  }, []);

  // Handle date change
  const handleDateChange = useCallback(
    (newDate) => {
      const previousDate = date.format("YYYY-MM-DD");
      const obj = _.find(mealSelections, { date: newDate.format("YYYY-MM-DD") });

      if (obj !== undefined) {
        const updatedMealSelections = getUpdatedMealSelections(
          mealSelections,
          data,
          previousDate
        );
        setMealSelections(updatedMealSelections);
        setDate(newDate);
        setData(obj);

        const currentHour = dayjs().hour();
        const currentMinute = dayjs().minute();
        const newDateTabIndex = getTabIndexByTime(dayjs().hour(currentHour).minute(currentMinute));
        setTabIndex(newDateTabIndex);
      } else {
        const updatedMealSelections = getUpdatedMealSelections(
          mealSelections,
          data,
          previousDate
        );
        setMealSelections(updatedMealSelections);
        setDate(newDate);
      }
    },
    [date, mealSelections, data, getUpdatedMealSelections, getTabIndexByTime]
  );

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
