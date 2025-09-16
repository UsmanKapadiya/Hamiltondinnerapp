import {
    Box, useTheme, Typography, Tabs, Tab
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { Header } from "../../components";
import { tokens } from "../../theme";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import CustomLoadingOverlay from "../../components/CustomLoadingOverlay";
import OrderServices from "../../services/orderServices";
import { toast, ToastContainer } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import CustomButton from "../../components/CustomButton";
import { ArrowForwardIosOutlined, EditOutlined, EmojiPeopleOutlined } from "@mui/icons-material";
import en from "../../locales/Localizable_en"
import cn from "../../locales/Localizable_cn"
import 'dayjs/locale/zh-cn';

let breakFastEndTime = 10;
let lunchEndTime = 15;
let dinnerEndTime = 24;
// const MAX_MEAL_QTY = 2;


const Order = () => {

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const location = useLocation();
    const navigate = useNavigate();
    const roomNo = location.state?.roomNo;
    const [langObj, setLangObj] = useState(en);
    const [date, setDate] = useState(dayjs());
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState({});
    const [mealData, setMealData] = useState([]);
    const isToday = date.isSame(dayjs(), 'day');
    const isPast = date.isBefore(dayjs(), 'day');
    const isAfter10AM = isToday && (dayjs().hour() > breakFastEndTime || (dayjs().hour() === breakFastEndTime && dayjs().minute() > 0));
    const isAfter3PM = isToday && (dayjs().hour() > lunchEndTime || (dayjs().hour() === lunchEndTime && dayjs().minute() > 0));
    const isAfter12PM = isToday && (dayjs().hour() > dinnerEndTime || (dayjs().hour() === dinnerEndTime && dayjs().minute() > 0));
    const [mealSelections, setMealSelections] = useState([]);
    const [MAX_MEAL_QTY, setMAX_MEAL_QTY] = useState(1)
    const [kitchenSummery, setKitchenSummery] = useState(false);
    const [userData] = useState(() => {
        const userDatas = localStorage.getItem("userData");
        return userDatas ? JSON.parse(userDatas) : null;
    });

    useEffect(() => {
        const userData = localStorage.getItem("userData");
        if (userData) {
            const { language } = JSON.parse(userData);
            if (language === 1) {
                setLangObj(cn);
            } else {
                setLangObj(en);
            }
        } else {
            setLangObj(en);
        }
    }, []);

    const getDefaultTabIndex = () => {
        const now = dayjs();
        if (now.hour() > lunchEndTime || (now.hour() === lunchEndTime && now.minute() > 0)) {
            return 2; // Dinner
        } else if (now.hour() > breakFastEndTime || (now.hour() === breakFastEndTime && now.minute() > 0)) {
            return 1; // Lunch
        }
        return 0; // Breakfast
    };

    const [tabIndex, setTabIndex] = useState(getDefaultTabIndex());

    useEffect(() => {
        let selectedData = userData?.rooms.find((x) => x.name === roomNo);
        setMAX_MEAL_QTY(selectedData?.occupancy)
    }, [roomNo])

    useEffect(() => {

        //console.log(mealSelections)
        let obj = mealSelections?.find((x) => x.date === date.format("YYYY-MM-DD"));
        //console.log(obj)
        if (obj === undefined) {
            fetchMenuDetails(date.format("YYYY-MM-DD"));
        }
    }, [date]);


    useEffect(() => {
        if (location.state?.Kitchen_summery) {
            setKitchenSummery(location.state.Kitchen_summery);
        }
    }, [location.state]);

    const fetchMenuDetails = async (date) => {
        try {
            setLoading(true);
            let selectedObj = userData?.rooms.find((x) => x.name === roomNo);
            const response = await OrderServices.getMenuData(selectedObj ? selectedObj?.id : userData?.room_id, date);
            let data = {
                breakfast: response.breakfast,
                lunch: response?.lunch,
                dinner: response?.dinner,
                is_brk_escort_service: response?.is_brk_escort_service,
                is_brk_tray_service: response?.is_brk_tray_service,
                is_lunch_escort_service: response?.is_lunch_escort_service,
                is_lunch_tray_service: response?.is_lunch_tray_service,
                is_dinner_escort_service: response?.is_dinner_escort_service,
                is_dinner_tray_service: response?.is_dinner_tray_service,
            };
            let meal = { ...data, date }; // Add date as a property
            // console.log("meal", meal);
            setMealData(prev => {
                const foundIndex = prev.findIndex(item => dayjs(item.date).isSame(dayjs(meal.date), 'day'));
                let updated;
                if (foundIndex !== -1) {
                    updated = [...prev];
                    updated[foundIndex] = transformMealData(meal);
                } else {
                    updated = [...prev, transformMealData(meal)];
                }
                return updated;
            });
            setData(transformMealData(data));
        } catch (error) {
            console.error("Error fetching menu list:", error);
        } finally {
            setLoading(false);
        }
    };


    function selectFirstOption(options) {
        if (!options || options.length === 0) return [];
        const anySelected = options.some(opt => opt.is_selected === 1);
        if (anySelected) {
            return options;
        }
        return options.map((opt, idx) => ({
            ...opt,
            is_selected: idx === 0 ? 1 : 0
        }));
    }

    function transformMealData(mealData) {
        // Breakfast
        const breakfastCategories = (mealData.breakfast || []).map(cat => {
            // Entree items
            const entreeItems = (cat.items || [])
                .filter(item => item.type === "item")
                .map(item => ({
                    id: item.item_id,
                    name: item.item_name,
                    chinese_name: item.chinese_name,
                    qty: item.qty,
                    options: selectFirstOption(item.options),
                    preference: item.preference,
                    order_id: item?.order_id,
                    image: item?.item_image
                }));

            // Subcategory (e.g., alternatives)
            const alternativeCat = (cat.items || []).find(item => item.type === "sub_cat");
            const alternativeCatName = alternativeCat?.item_name || "";
            const alternativeCatName_cn = alternativeCat?.chinese_name || "";

            // Subcategory items
            const alternativeItems = (cat.items || [])
                .filter(item => item.type === "sub_cat_item")
                .map(item => ({
                    id: item.item_id,
                    name: item.item_name,
                    chinese_name: item.chinese_name,
                    qty: item.qty,
                    options: selectFirstOption(item.options),
                    preference: item.preference,
                    order_id: item?.order_id,
                    image: item?.item_image
                }));

            return {
                cat_id: cat.cat_id,
                cat_name: cat.cat_name,
                cat_name_cn: cat.chinese_name,
                entreeItems,
                alternativeCatName,
                alternativeCatName_cn,
                alternativeItems
            };
        });
        const is_brk_escort_service = mealData?.is_brk_escort_service
        const is_brk_tray_service = mealData?.is_brk_tray_service

        // Lunch
        const lunchCategories = (mealData.lunch || []).map(cat => {
            // Entree items
            const entreeItems = (cat.items || [])
                .filter(item => item.type === "item")
                .map(item => ({
                    id: item.item_id,
                    name: item.item_name,
                    chinese_name: item.chinese_name,
                    qty: item.qty,
                    options: selectFirstOption(item.options),
                    preference: item.preference,
                    order_id: item?.order_id,
                    image: item?.item_image
                }));

            // Subcategory (e.g., alternatives)
            const alternativeCat = (cat.items || []).find(item => item.type === "sub_cat");
            const alternativeCatName = alternativeCat?.item_name || "";
            const alternativeCatName_cn = alternativeCat?.chinese_name || "";

            // Subcategory items
            const alternativeItems = (cat.items || [])
                .filter(item => item.type === "sub_cat_item")
                .map(item => ({
                    id: item.item_id,
                    name: item.item_name,
                    chinese_name: item.chinese_name,
                    qty: item.qty,
                    options: selectFirstOption(item.options),
                    preference: item.preference,
                    order_id: item?.order_id,
                    image: item?.item_image
                }));

            return {
                cat_id: cat.cat_id,
                cat_name: cat.cat_name,
                cat_name_cn: cat.chinese_name,
                entreeItems,
                alternativeCatName,
                alternativeCatName_cn,
                alternativeItems
            };
        });
        const is_lunch_escort_service = mealData?.is_lunch_escort_service
        const is_lunch_tray_service = mealData?.is_lunch_tray_service

        // Dinner
        const dinnerCategories = (mealData.dinner || []).map(cat => {
            // Entree items
            const entreeItems = (cat.items || [])
                .filter(item => item.type === "item")
                .map(item => ({
                    id: item.item_id,
                    name: item.item_name,
                    chinese_name: item.chinese_name,
                    qty: item.qty,
                    options: selectFirstOption(item.options),
                    preference: item.preference,
                    order_id: item?.order_id,
                    image: item?.item_image
                }));

            // Subcategory (e.g., alternatives)
            const alternativeCat = (cat.items || []).find(item => item.type === "sub_cat");
            const alternativeCatName = alternativeCat?.item_name || "";
            const alternativeCatName_cn = alternativeCat?.chinese_name || "";

            // Subcategory items
            const alternativeItems = (cat.items || [])
                .filter(item => item.type === "sub_cat_item")
                .map(item => ({
                    id: item.item_id,
                    name: item.item_name,
                    chinese_name: item.chinese_name,
                    qty: item.qty,
                    options: selectFirstOption(item.options),
                    preference: item.preference,
                    order_id: item?.order_id,
                    image: item?.item_image
                }));

            return {
                cat_id: cat.cat_id,
                cat_name: cat.cat_name,
                cat_name_cn: cat.chinese_name,
                entreeItems,
                alternativeCatName,
                alternativeCatName_cn,
                alternativeItems
            };
        });
        const is_dinner_escort_service = mealData?.is_dinner_escort_service
        const is_dinner_tray_service = mealData?.is_dinner_tray_service

        return {
            date: mealData.date,
            breakfastCategories,
            lunchCategories,
            dinnerCategories,
            is_brk_escort_service,
            is_brk_tray_service,
            is_lunch_escort_service,
            is_lunch_tray_service,
            is_dinner_escort_service,
            is_dinner_tray_service,
        };
    }

    function buildOrderPayload(dataArray) {
        // console.log("dataArray", dataArray)
        // console.log("mealData", mealData)
        const flatten = arr => (arr || []).map(item => ({
            item_id: item.id,
            qty: item.qty,
            order_id: item.order_id || 0,
            preference: (item.preference || [])
                .filter(p => p.is_selected)
                .map(p => p.id).join(","),
            item_options: (item.options || [])
                .filter(o => o.is_selected)
                .map(o => o.id).join(",")
        }));

        const getItems = d => [
            ...(d.breakfastCategories || []).flatMap(cat => [
                ...flatten(cat.entreeItems),
                ...flatten(cat.alternativeItems)
            ]),
            ...(d.lunchCategories || []).flatMap(cat => [
                ...flatten(cat.entreeItems),
                ...flatten(cat.alternativeItems)
            ]),
            ...(d.dinnerCategories || []).flatMap(cat => [
                ...flatten(cat.entreeItems),
                ...flatten(cat.alternativeItems)
            ])
        ];

        const selectedRoom = userData.rooms.find(x => x.name === roomNo);
        const room_id = selectedRoom?.id || 0;

        const orders = dataArray.map(data => {
            const updated = getItems(data);
            const origDay = Array.isArray(mealData)
                ? mealData.find(m => m.date === data.date)
                : mealData.date === data.date
                    ? mealData
                    : null;
            const original = origDay ? getItems(origDay) : [];
            const origMap = new Map(original.map(o => [`${o.item_id}_${o.order_id}`, o]));
            const updMap = new Map(updated.map(u => [`${u.item_id}_${u.order_id}`, u]));

            const items = [];

            // 1. New or changed items
            updated.forEach(u => {
                const key = `${u.item_id}_${u.order_id}`;
                const o = origMap.get(key);
                if (!o) {
                    // New item — include only if qty > 0
                    if (u.qty > 0) items.push(u);
                } else {
                    // Existing — include only if any field changed
                    if (
                        u.qty !== o.qty ||
                        u.preference !== o.preference ||
                        u.item_options !== o.item_options
                    ) {
                        // If qty changed from >0 to 0, include with qty: 0
                        if (o.qty > 0 && u.qty === 0) {
                            items.push({ ...u, qty: 0, preference: "", item_options: "" });
                        } else {
                            items.push(u);
                        }
                    }
                }
            });

            // 2. Removed items (present in original, missing in updated, and qty > 0)
            original.forEach(o => {
                const key = `${o.item_id}_${o.order_id}`;
                if (!updMap.has(key) && o.qty > 0) {
                    items.push({ ...o, qty: 0, preference: "", item_options: "" });
                }
            });

            const additionalServicesChanged =
                data.is_dinner_tray_service !== origDay?.is_dinner_tray_service ||
                data.is_dinner_escort_service !== origDay?.is_dinner_escort_service ||
                data.is_brk_tray_service !== origDay?.is_brk_tray_service ||
                data.is_brk_escort_service !== origDay?.is_brk_escort_service ||
                data.is_lunch_tray_service !== origDay?.is_lunch_tray_service ||
                data.is_lunch_escort_service !== origDay?.is_lunch_escort_service;

            if (items.length === 0 && !additionalServicesChanged) return null;

            return {
                date: data.date,
                room_id,
                is_for_guest: 1,
                is_brk_tray_service: data.is_brk_tray_service,
                is_lunch_tray_service: data.is_lunch_tray_service,
                is_dinner_tray_service: data.is_dinner_tray_service,
                is_brk_escort_service: data.is_brk_escort_service,
                is_lunch_escort_service: data.is_lunch_escort_service,
                is_dinner_escort_service: data.is_dinner_escort_service,
                items
                // ...(items.length > 0 ? { items } : {}) // Only include items if changed
            };
        }).filter(Boolean);

        return {
            current_date: dataArray.length
                ? dataArray[dataArray.length - 1].date
                : "",
            room_id,
            orders_to_change: JSON.stringify(orders)
        };
    }

    function getUpdatedMealSelections(prev, data, date) {
        const dateStr = date;
        const foundIndex = prev.findIndex(item => item?.date === dateStr);
        if (foundIndex !== -1) {
            const updated = [...prev];
            updated[foundIndex] = { ...data };
            return updated;
        } else {
            return [...prev, data];
        }
    }

    const submitData = async (data, date) => {
        // console.log("newMEalSelections", mealSelections)
        // console.log("data", data)

        try {
            const dataCopy = { ...data, date: date.format("YYYY-MM-DD") };
            setMealSelections(prev => {
                // Get updated meal selections
                const updated = getUpdatedMealSelections(prev, dataCopy, date);
                // Remove duplicate dates, keeping the last occurrence
                const uniqueByDate = [];
                const seen = new Set();
                for (let i = updated.length - 1; i >= 0; i--) {
                    const d = updated[i].date;
                    if (!seen.has(d)) {
                        uniqueByDate.unshift(updated[i]);
                        seen.add(d);
                    }
                }
                return uniqueByDate;
            });
            const newMealSelections = getUpdatedMealSelections(mealSelections, dataCopy, date.format("YYYY-MM-DD"));
            const payload = buildOrderPayload(newMealSelections, date);
            // console.log("payload", payload);
            let response = await OrderServices.submitOrder(payload);
            if (response.ResponseText === "success") {
                setMealSelections([])
                // console.log("date",date.format("YYYY-MM-DD"))
                fetchMenuDetails(date.format("YYYY-MM-DD"));
                toast.success("Order submitted successfully!");
            } else {
                toast.error(response.ResponseText || "Order submission failed.");
            }
        } catch (error) {
            toast.error("An error occurred while submitting the order.");
            console.error(error);
        }
    };

    const roomUpdate = async (data) => {
        if (data?.selectedUser?.id) {
            try {
                // Ensure both fields are strings and trimmed
                const specialInstruction = (data?.specialInstruction ?? "").toString().trim();
                const foodTexture = (data?.foodTexture ?? "").toString().trim();

                const response = await OrderServices.updateRoomDetails(
                    data.selectedUser.id,
                    specialInstruction,
                    foodTexture
                );

                if (response.ResponseCode === "1") {
                    toast.success(response?.ResponseText || "Room Details Updated Successfully");
                } else {
                    toast.error(response.ResponseText || "Room Details Update failed. Please try again.");
                }
            } catch (error) {
                console.error("Error processing Room Details Update failed:", error);
                const errorMessage =
                    error?.response?.data?.error || "An unexpected error occurred. Please try again.";
                toast.error(errorMessage);
            }
        } else {
            toast.error("No user selected for room update.");
        }
    };

    const handleGuestOrderClick = () => {
        const formattedDate = date.format("YYYY-MM-DD");
        const room = roomNo ? roomNo : userData?.room_id;

        navigate("/guestOrder", {
            state: { roomNo: room, selectedDate: formattedDate }
        });
    };

    function getTabIndexByTime(dateObj) {

        const now = dateObj;
        if (now.hour() > lunchEndTime || (now.hour() === lunchEndTime && now.minute() > 0)) {
            return 2; // Dinner
        } else if (now.hour() > breakFastEndTime || (now.hour() === breakFastEndTime && now.minute() > 0)) {
            return 1; // Lunch
        }
        return 0; // Breakfast
    }


    const handleDateChange = (newDate) => {

        const previousDate = date.format("YYYY-MM-DD");
        let obj = mealSelections?.find((x) => x.date === newDate.format("YYYY-MM-DD"));

        if (obj !== undefined) {
            //console.log("mealSelections1 =>", mealSelections)
            setTabIndex(getTabIndexByTime(newDate))
            data['date'] = previousDate

            setMealSelections(prev => {
                const foundIndex = prev.findIndex(item => item?.date === previousDate);
                //console.log(foundIndex)
                if (foundIndex !== -1) {
                    // Update existing object
                    const updated = [...prev];
                    updated[foundIndex] = { ...data };
                    return updated;
                } else {
                    // Add new object
                    return [...prev, data];
                }
            });
            setData(obj)
            setDate(newDate);

        } else {
            //console.log("mealSelections2 =>", mealSelections)
            setTabIndex(0)
            setDate(newDate);
            data['date'] = previousDate
            setMealSelections(prev => [...prev, data])
        }
    }

    const showBreakFastGuideline =
        userData?.breakfast_guideline &&
        data.breakfastCategories &&
        data.breakfastCategories.length > 0;

    const showLunchGuideline =
        userData?.lunch_guideline &&
        data.lunchCategories &&
        data.lunchCategories.length > 0;

    const showDinnerGuideline =
        userData?.dinner_guideline &&
        data.dinnerCategories &&
        data.dinnerCategories.length > 0;


    return (
        <Box m="20px">
            <Header
                title={kitchenSummery ? "Kitchen Summary " : roomNo ? roomNo : userData?.room_id}
                icon={""}
                editRoomsDetails={userData?.role !== "kitchen" ? true : false}
                editIcon={<EditOutlined />}
                isGuest={kitchenSummery ? false : true}
                handleGuestClick={handleGuestOrderClick}
                isGuestIcon={<EmojiPeopleOutlined />}
                handleRoomUpdate={roomUpdate}
                profileScreen={true}
            />
            <ToastContainer />
            <Box
                mt="40px"
                height="75vh"
                flex={1}
                sx={{
                    "& .MuiDataGrid-root": { border: "none" },
                    "& .MuiDataGrid-cell": { border: "none" },
                    "& .name-column--cell": { color: colors.greenAccent[300] },
                    "& .MuiDataGrid-columnHeaders": {
                        backgroundColor: colors.blueAccent[700],
                        borderBottom: "none",
                    },
                    "& .MuiDataGrid-virtualScroller": {
                        backgroundColor: colors.primary[400],
                    },
                    "& .MuiDataGrid-footerContainer": {
                        borderTop: "none",
                        backgroundColor: colors.blueAccent[700],
                    },
                    "& .MuiCheckbox-root": {
                        color: `${colors.greenAccent[200]} !important`,
                    },
                    "& .MuiDataGrid-iconSeparator": {
                        color: colors.primary[100],
                    },
                }}
            >
                {/* Calendar opens automatically on mount */}
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                    <LocalizationProvider
                        dateAdapter={AdapterDayjs}
                        adapterLocale={userData?.langCode === "cn" ? "zh-cn" : "en"}>
                        <DatePicker
                            label="Date"
                            value={date}
                            onChange={handleDateChange}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    fullWidth
                                    variant="filled"
                                    sx={{ gridColumn: "span 1" }}
                                />
                            )}
                        />
                    </LocalizationProvider>
                </Box>
                {/* Table Section */}
                {loading ? (
                    <CustomLoadingOverlay />
                ) : (
                    <>
                        <Tabs
                            value={tabIndex}
                            onChange={(_, newValue) => setTabIndex(newValue)}
                            indicatorColor="primary"
                            textColor="primary"
                            sx={{ mb: 2 }}
                        >
                            <Tab label={langObj.brk} />
                            <Tab label={langObj.lunch} />
                            <Tab label={langObj.dnr} />
                        </Tabs>
                        {tabIndex === 0 && (
                            <Box>
                                {Array.isArray(data.breakfastCategories) && data.breakfastCategories.map((cat, catIdx) => (
                                    <Box key={cat.cat_id} mb={3}>
                                        <Typography
                                            variant="h6"
                                            sx={{
                                                mb: 2,
                                                fontWeight: 600,
                                                backgroundColor: "#f5f5f5",
                                                px: 2,
                                                py: 1,
                                                borderRadius: 1,
                                                textAlign: "center"
                                            }}
                                        >
                                            {userData?.langCode === "cn" && cat.cat_name_cn && cat.cat_name_cn.trim() !== ""
                                                ? cat.cat_name_cn
                                                : cat.cat_name}
                                        </Typography>

                                        {/* Entree Items */}
                                        {cat.entreeItems.map(item => (
                                            <Box key={item.id} mb={1}>
                                                <Box display="flex" alignItems="center" justifyContent="space-between">
                                                    <Box display="flex" alignItems="center">
                                                        {item.image && (
                                                            <img
                                                                src={item.image}
                                                                alt={userData?.langCode === "cn" && item.chinese_name ? item.chinese_name : item.name}
                                                                style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 8, marginRight: 12 }}
                                                            />
                                                        )}
                                                        <Typography>
                                                            {userData?.langCode === "cn" && item.chinese_name ? item.chinese_name : item.name}
                                                        </Typography>
                                                    </Box>
                                                    <Box display="flex" alignItems="center">
                                                        {!kitchenSummery && (
                                                            <button
                                                                onClick={() =>
                                                                    setData(prev => ({
                                                                        ...prev,
                                                                        breakfastCategories: prev.breakfastCategories.map((c, idx) =>
                                                                            idx === catIdx
                                                                                ? {
                                                                                    ...c,
                                                                                    entreeItems: c.entreeItems.map(i => {
                                                                                        if (i.id === item.id) {
                                                                                            const newQty = Math.max((i.qty || 0) - 1, 0);
                                                                                            return {
                                                                                                ...i,
                                                                                                qty: newQty,
                                                                                                options: (i.options || []).length > 0 && newQty === 0
                                                                                                    ? i.options.map((opt, idx) => ({ ...opt, is_selected: idx === 0 ? 1 : 0 }))
                                                                                                    : i.options,
                                                                                                preference: (i.preference || []).length > 0 && newQty === 0
                                                                                                    ? i.preference.map((p) => ({ ...p, is_selected: 0 }))
                                                                                                    : i.preference,
                                                                                            };
                                                                                        }
                                                                                        if ((i.qty || 0) === 0) {
                                                                                            return {
                                                                                                ...i,
                                                                                                options: (i.options || []).length > 0
                                                                                                    ? i.options.map((opt, idx) => ({ ...opt, is_selected: idx === 0 ? 1 : 0 }))
                                                                                                    : i.options,
                                                                                                preference: (i.preference || []).length > 0
                                                                                                    ? i.preference.map((p) => ({ ...p, is_selected: 0 }))
                                                                                                    : i.preference,
                                                                                            };
                                                                                        }
                                                                                        return i;
                                                                                    }),
                                                                                }
                                                                                : c
                                                                        )
                                                                    }))
                                                                }
                                                                style={{ marginRight: 8 }}
                                                                disabled={item.qty === 0 || isAfter10AM || isPast}
                                                            >
                                                                -
                                                            </button>
                                                        )}
                                                        <Typography sx={kitchenSummery ? { fontSize: 24, fontWeight: 700 } : {}}>
                                                            {item.qty || 0}
                                                        </Typography>
                                                        {!kitchenSummery && (
                                                            <button
                                                                onClick={() => {
                                                                    setData(prev => {
                                                                        const totalQty =
                                                                            (prev.breakfastCategories[catIdx]?.entreeItems?.reduce((sum, i) => sum + (i.qty || 0), 0) || 0) +
                                                                            (prev.breakfastCategories[catIdx]?.alternativeItems?.reduce((sum, i) => sum + (i.qty || 0), 0) || 0);
                                                                        let newEntree = [...prev.breakfastCategories[catIdx].entreeItems];
                                                                        let newAlternative = [...(prev.breakfastCategories[catIdx].alternativeItems || [])];
                                                                        if (totalQty >= MAX_MEAL_QTY) {
                                                                            let removed = false;
                                                                            newAlternative = newAlternative.map((alt) => {
                                                                                if (!removed && alt.qty > 0) {
                                                                                    removed = true;
                                                                                    const newQty = alt.qty - 1;
                                                                                    return {
                                                                                        ...alt,
                                                                                        qty: newQty,
                                                                                        options: (alt.options || []).length > 0 && alt.qty > 0 && newQty === 0
                                                                                            ? alt.options.map((opt, idx) => ({ ...opt, is_selected: idx === 0 ? 1 : 0 }))
                                                                                            : alt.options,
                                                                                        preference: (alt.preference || []).length > 0 && alt.qty > 0 && newQty === 0
                                                                                            ? alt.preference.map((p) => ({ ...p, is_selected: 0 }))
                                                                                            : alt.preference,
                                                                                    };
                                                                                }
                                                                                return alt;
                                                                            });
                                                                            if (!removed) {
                                                                                newEntree = newEntree.map((en) => {
                                                                                    if (!removed && en.id !== item.id && en.qty > 0) {
                                                                                        removed = true;
                                                                                        const newQty = en.qty - 1;
                                                                                        return {
                                                                                            ...en,
                                                                                            qty: newQty,
                                                                                            options: (en.options || []).length > 0 && en.qty > 0 && newQty === 0
                                                                                                ? en.options.map((opt, idx) => ({ ...opt, is_selected: idx === 0 ? 1 : 0 }))
                                                                                                : en.options,
                                                                                            preference: (en.preference || []).length > 0 && en.qty > 0 && newQty === 0
                                                                                                ? en.preference.map((p) => ({ ...p, is_selected: 0 }))
                                                                                                : en.preference,
                                                                                        };
                                                                                    }
                                                                                    return en;
                                                                                });
                                                                            }
                                                                        }
                                                                        newEntree = newEntree.map((i) =>
                                                                            i.id === item.id
                                                                                ? {
                                                                                    ...i,
                                                                                    qty: (i.qty || 0) + 1,
                                                                                    options: (i.options || []).length > 0 && (i.qty || 0) === 0
                                                                                        ? i.options.map((opt, idx) => ({ ...opt, is_selected: idx === 0 ? 1 : 0 }))
                                                                                        : i.options,
                                                                                    preference: (i.preference || []).length > 0 && (i.qty || 0) === 0
                                                                                        ? i.preference.map((p) => ({ ...p, is_selected: 0 }))
                                                                                        : i.preference,
                                                                                }
                                                                                : i
                                                                        );
                                                                        return {
                                                                            ...prev,
                                                                            breakfastCategories: prev.breakfastCategories.map((c, idx) =>
                                                                                idx === catIdx
                                                                                    ? {
                                                                                        ...c,
                                                                                        entreeItems: newEntree,
                                                                                        alternativeItems: newAlternative,
                                                                                    }
                                                                                    : c
                                                                            )
                                                                        };
                                                                    });
                                                                }}
                                                                style={{ marginLeft: 8 }}
                                                                disabled={item.qty >= MAX_MEAL_QTY || isAfter10AM || isPast}
                                                            >
                                                                +
                                                            </button>
                                                        )}
                                                    </Box>
                                                </Box>
                                                {/* Options and Preference */}
                                                <Box mt={2} ml={1} sx={{ width: "100%", minHeight: item.qty > 0 ? "auto" : 0 }}>
                                                    {(item.qty > 0) && (
                                                        <Box mt={2} ml={1} sx={{ width: "100%" }}>
                                                            {item.options && item.options.length > 0 && (
                                                                <Box mb={1}>
                                                                    {item.options.map((opt) => (
                                                                        <label key={opt.id} style={{ marginRight: 12 }}>
                                                                            <input
                                                                                type="radio"
                                                                                name={`breakfast-entree-option-${cat.cat_id}-${item.id}`}
                                                                                checked={!!opt.is_selected}
                                                                                onChange={() => {
                                                                                    setData(prev => ({
                                                                                        ...prev,
                                                                                        breakfastCategories: prev.breakfastCategories.map((c, idx) =>
                                                                                            idx === catIdx
                                                                                                ? {
                                                                                                    ...c,
                                                                                                    entreeItems: c.entreeItems.map(i =>
                                                                                                        i.id === item.id
                                                                                                            ? {
                                                                                                                ...i,
                                                                                                                options: i.options.map(o =>
                                                                                                                    o.id === opt.id
                                                                                                                        ? { ...o, is_selected: 1 }
                                                                                                                        : { ...o, is_selected: 0 }
                                                                                                                ),
                                                                                                            }
                                                                                                            : i
                                                                                                    ),
                                                                                                }
                                                                                                : c
                                                                                        )
                                                                                    }));
                                                                                }}
                                                                            />
                                                                            <span style={{ marginLeft: 5 }}>{opt.name}</span>
                                                                        </label>
                                                                    ))}
                                                                </Box>
                                                            )}
                                                            {item.preference && item.preference.length > 0 && (
                                                                <Box>
                                                                    <Typography sx={{ fontWeight: 700, fontSize: 18 }}>
                                                                        * Preference
                                                                    </Typography>
                                                                    {item.preference.map((pref) => (
                                                                        <label key={pref.id} style={{ marginRight: 12 }}>
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={!!pref.is_selected}
                                                                                onChange={() => {
                                                                                    setData(prev => ({
                                                                                        ...prev,
                                                                                        breakfastCategories: prev.breakfastCategories.map((c, idx) =>
                                                                                            idx === catIdx
                                                                                                ? {
                                                                                                    ...c,
                                                                                                    entreeItems: c.entreeItems.map(i =>
                                                                                                        i.id === item.id
                                                                                                            ? {
                                                                                                                ...i,
                                                                                                                preference: i.preference.map(p =>
                                                                                                                    p.id === pref.id
                                                                                                                        ? { ...p, is_selected: p.is_selected ? 0 : 1 }
                                                                                                                        : p
                                                                                                                ),
                                                                                                            }
                                                                                                            : i
                                                                                                    ),
                                                                                                }
                                                                                                : c
                                                                                        )
                                                                                    }));
                                                                                }}
                                                                            />
                                                                            <span style={{ marginLeft: 5 }}>{pref.name}</span>
                                                                        </label>
                                                                    ))}
                                                                </Box>
                                                            )}
                                                        </Box>
                                                    )}
                                                </Box>
                                            </Box>
                                        ))}

                                        {/* Alternative Subcategory Title */}
                                        {cat.alternativeCatName && (
                                            <Typography variant="subtitle1" sx={{ mt: 3, mb: 2, fontWeight: 700 }}>
                                                {userData?.langCode === "cn" && cat.alternativeCatName_cn && cat.alternativeCatName_cn.trim() !== ""
                                                    ? cat.alternativeCatName_cn
                                                    : cat.alternativeCatName}
                                            </Typography>
                                        )}

                                        {/* Alternative Items */}
                                        {cat.alternativeItems.map(item => (
                                            <Box key={item.id} mb={1} ml={2}>
                                                <Box display="flex" alignItems="center" justifyContent="space-between">
                                                    <Box display="flex" alignItems="center">
                                                        {item.image && (
                                                            <img
                                                                src={item.image}
                                                                alt={userData?.langCode === "cn" && item.chinese_name ? item.chinese_name : item.name}
                                                                style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 8, marginRight: 12 }}
                                                            />
                                                        )}
                                                        <Typography>
                                                            {userData?.langCode === "cn" && item.chinese_name ? item.chinese_name : item.name}
                                                        </Typography>
                                                    </Box>
                                                    <Box display="flex" alignItems="center">
                                                        {!kitchenSummery && (
                                                            <button
                                                                onClick={() =>
                                                                    setData(prev => ({
                                                                        ...prev,
                                                                        breakfastCategories: prev.breakfastCategories.map((c, idx) =>
                                                                            idx === catIdx
                                                                                ? {
                                                                                    ...c,
                                                                                    alternativeItems: c.alternativeItems.map(i =>
                                                                                        i.id === item.id
                                                                                            ? {
                                                                                                ...i,
                                                                                                qty: Math.max((i.qty || 0) - 1, 0),
                                                                                                options: (i.options || []).length > 0 && Math.max((i.qty || 0) - 1, 0) === 0
                                                                                                    ? i.options.map((opt, idx) => ({ ...opt, is_selected: idx === 0 ? 1 : 0 }))
                                                                                                    : i.options,
                                                                                                preference: (i.preference || []).length > 0 && Math.max((i.qty || 0) - 1, 0) === 0
                                                                                                    ? i.preference.map((p) => ({ ...p, is_selected: 0 }))
                                                                                                    : i.preference,
                                                                                            }
                                                                                            : i
                                                                                    )
                                                                                }
                                                                                : c
                                                                        )
                                                                    }))
                                                                }
                                                                style={{ marginRight: 8 }}
                                                                disabled={item.qty === 0 || isAfter10AM || isPast}
                                                            >
                                                                -
                                                            </button>
                                                        )}
                                                        <Typography sx={kitchenSummery ? { fontSize: 24, fontWeight: 700 } : {}}>
                                                            {item.qty || 0}
                                                        </Typography>
                                                        {!kitchenSummery && (
                                                            <button
                                                                onClick={() => {
                                                                    setData(prev => {
                                                                        const totalQty =
                                                                            (prev.breakfastCategories[catIdx]?.entreeItems?.reduce((sum, i) => sum + (i.qty || 0), 0) || 0) +
                                                                            (prev.breakfastCategories[catIdx]?.alternativeItems?.reduce((sum, i) => sum + (i.qty || 0), 0) || 0);
                                                                        let newAlternative = [...prev.breakfastCategories[catIdx].alternativeItems];
                                                                        let newEntree = [...(prev.breakfastCategories[catIdx].entreeItems || [])];
                                                                        if (totalQty >= MAX_MEAL_QTY) {
                                                                            let removed = false;
                                                                            newEntree = newEntree.map((en) => {
                                                                                if (!removed && en.qty > 0) {
                                                                                    removed = true;
                                                                                    const newQty = en.qty - 1;
                                                                                    return {
                                                                                        ...en,
                                                                                        qty: newQty,
                                                                                        options: (en.options || []).length > 0 && en.qty > 0 && newQty === 0
                                                                                            ? en.options.map((opt, idx) => ({ ...opt, is_selected: idx === 0 ? 1 : 0 }))
                                                                                            : en.options,
                                                                                        preference: (en.preference || []).length > 0 && en.qty > 0 && newQty === 0
                                                                                            ? en.preference.map((p) => ({ ...p, is_selected: 0 }))
                                                                                            : en.preference,
                                                                                    };
                                                                                }
                                                                                return en;
                                                                            });
                                                                            if (!removed) {
                                                                                newAlternative = newAlternative.map((alt) => {
                                                                                    if (!removed && alt.id !== item.id && alt.qty > 0) {
                                                                                        removed = true;
                                                                                        const newQty = alt.qty - 1;
                                                                                        return {
                                                                                            ...alt,
                                                                                            qty: newQty,
                                                                                            options: (alt.options || []).length > 0 && alt.qty > 0 && newQty === 0
                                                                                                ? alt.options.map((opt, idx) => ({ ...opt, is_selected: idx === 0 ? 1 : 0 }))
                                                                                                : alt.options,
                                                                                            preference: (alt.preference || []).length > 0 && alt.qty > 0 && newQty === 0
                                                                                                ? alt.preference.map((p) => ({ ...p, is_selected: 0 }))
                                                                                                : alt.preference,
                                                                                        };
                                                                                    }
                                                                                    return alt;
                                                                                });
                                                                            }
                                                                        }
                                                                        newAlternative = newAlternative.map((i) =>
                                                                            i.id === item.id
                                                                                ? {
                                                                                    ...i,
                                                                                    qty: (i.qty || 0) + 1,
                                                                                    options: (i.options || []).length > 0 && (i.qty || 0) === 0
                                                                                        ? i.options.map((opt, idx) => ({ ...opt, is_selected: idx === 0 ? 1 : 0 }))
                                                                                        : i.options,
                                                                                    preference: (i.preference || []).length > 0 && (i.qty || 0) === 0
                                                                                        ? i.preference.map((p) => ({ ...p, is_selected: 0 }))
                                                                                        : i.preference,
                                                                                }
                                                                                : i
                                                                        );
                                                                        return {
                                                                            ...prev,
                                                                            breakfastCategories: prev.breakfastCategories.map((c, idx) =>
                                                                                idx === catIdx
                                                                                    ? {
                                                                                        ...c,
                                                                                        entreeItems: newEntree,
                                                                                        alternativeItems: newAlternative,
                                                                                    }
                                                                                    : c
                                                                            )
                                                                        };
                                                                    });
                                                                }}
                                                                style={{ marginLeft: 8 }}
                                                                disabled={item.qty >= MAX_MEAL_QTY || isAfter10AM || isPast}
                                                            >
                                                                +
                                                            </button>
                                                        )}
                                                    </Box>
                                                </Box>
                                                {/* Options and Preference */}
                                                <Box mt={2} ml={1} sx={{ width: "100%", minHeight: item.qty > 0 ? "auto" : 0 }}>
                                                    {(item.qty > 0) && (
                                                        <Box mt={2} ml={1}>
                                                            {item.options && item.options.length > 0 && (
                                                                <Box mb={1}>
                                                                    {item.options.map((opt) => (
                                                                        <label key={opt.id} style={{ marginRight: 12 }}>
                                                                            <input
                                                                                type="radio"
                                                                                name={`breakfast-alt-option-${cat.cat_id}-${item.id}`}
                                                                                checked={!!opt.is_selected}
                                                                                onChange={() => {
                                                                                    setData(prev => ({
                                                                                        ...prev,
                                                                                        breakfastCategories: prev.breakfastCategories.map((c, idx) =>
                                                                                            idx === catIdx
                                                                                                ? {
                                                                                                    ...c,
                                                                                                    alternativeItems: c.alternativeItems.map(i =>
                                                                                                        i.id === item.id
                                                                                                            ? {
                                                                                                                ...i,
                                                                                                                options: i.options.map(o =>
                                                                                                                    o.id === opt.id
                                                                                                                        ? { ...o, is_selected: 1 }
                                                                                                                        : { ...o, is_selected: 0 }
                                                                                                                ),
                                                                                                            }
                                                                                                            : i
                                                                                                    ),
                                                                                                }
                                                                                                : c
                                                                                        )
                                                                                    }));
                                                                                }}
                                                                            />
                                                                            <span style={{ marginLeft: 5 }}>{opt.name}</span>
                                                                        </label>
                                                                    ))}
                                                                </Box>
                                                            )}
                                                            {item.preference && item.preference.length > 0 && (
                                                                <Box>
                                                                    <Typography sx={{ fontWeight: 700, fontSize: 18 }}>
                                                                        * Preference
                                                                    </Typography>
                                                                    {item.preference.map((pref) => (
                                                                        <label key={pref.id} style={{ marginRight: 12 }}>
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={!!pref.is_selected}
                                                                                onChange={() => {
                                                                                    setData(prev => ({
                                                                                        ...prev,
                                                                                        breakfastCategories: prev.breakfastCategories.map((c, idx) =>
                                                                                            idx === catIdx
                                                                                                ? {
                                                                                                    ...c,
                                                                                                    alternativeItems: c.alternativeItems.map(i =>
                                                                                                        i.id === item.id
                                                                                                            ? {
                                                                                                                ...i,
                                                                                                                preference: i.preference.map(p =>
                                                                                                                    p.id === pref.id
                                                                                                                        ? { ...p, is_selected: p.is_selected ? 0 : 1 }
                                                                                                                        : p
                                                                                                                ),
                                                                                                            }
                                                                                                            : i
                                                                                                    ),
                                                                                                }
                                                                                                : c
                                                                                        )
                                                                                    }));
                                                                                }}
                                                                            />
                                                                            <span style={{ marginLeft: 5 }}>{pref.name}</span>
                                                                        </label>
                                                                    ))}
                                                                </Box>
                                                            )}
                                                        </Box>
                                                    )}
                                                </Box>
                                            </Box>
                                        ))}
                                    </Box>
                                ))}
                                {(
                                    Array.isArray(data.breakfastCategories) &&
                                    data.breakfastCategories.some(cat =>
                                        (cat.entreeItems && cat.entreeItems.some(item => item.qty > 0)) ||
                                        (cat.alternativeItems && cat.alternativeItems.some(item => item.qty > 0))
                                    ) &&
                                    !kitchenSummery
                                ) && (
                                        <Box mt={3} display="flex" gap={2}>
                                            <label style={{ display: "flex", alignItems: "center" }}>
                                                <input
                                                    type="checkbox"
                                                    checked={data.is_brk_tray_service === 1}
                                                    onChange={e => {
                                                        setData(prev => ({
                                                            ...prev,
                                                            is_brk_tray_service: e.target.checked ? 1 : 0
                                                        }));
                                                    }}
                                                />
                                                <span style={{ marginLeft: 5 }}>{langObj.trayService}</span>
                                            </label>
                                            <label style={{ display: "flex", alignItems: "center" }}>
                                                <input
                                                    type="checkbox"
                                                    checked={data.is_brk_escort_service === 1}
                                                    onChange={e => {
                                                        setData(prev => ({
                                                            ...prev,
                                                            is_brk_escort_service: e.target.checked ? 1 : 0
                                                        }));
                                                    }}
                                                />
                                                <span style={{ marginLeft: 5 }}>{langObj.escortService}</span>
                                            </label>
                                            <label style={{ display: "flex", alignItems: "center" }}>
                                                <input type="checkbox" />
                                                <span style={{ marginLeft: 5 }}>{langObj.Takeout}</span>
                                            </label>
                                        </Box>
                                    )}
                                {showBreakFastGuideline && (
                                    <>
                                        <hr />
                                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                                            {userData?.langCode === "cn" && userData?.breakfast_guideline_cn && userData?.breakfast_guideline_cn.trim() !== ""
                                                ? userData?.breakfast_guideline_cn
                                                : userData?.breakfast_guideline}
                                        </Typography>
                                    </>
                                )}

                                {Array.isArray(data.breakfastCategories) && data.breakfastCategories.length === 0 && (
                                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                                        {langObj.breakFasrMenuWarn}
                                    </Typography>
                                )}

                                {kitchenSummery && (
                                    <Box mt={3} display="flex" justifyContent="center">
                                        <CustomButton
                                            onClick={() => navigate('/report')}
                                            endIcon={<ArrowForwardIosOutlined />}
                                            sx={{
                                                bgcolor: colors.blueAccent[50],
                                                color: colors.blueAccent[700],
                                                "&:hover": {
                                                    bgcolor: colors.blueAccent[100],
                                                    color: colors.blueAccent[800],
                                                },
                                                padding: "10px 32px",
                                                boxShadow: "none",
                                                borderRadius: "30px",
                                                border: "none",
                                                borderRadius: 4,
                                                fontWeight: 600,
                                                fontSize: 16,
                                                cursor: "pointer",
                                                width: 'auto'
                                            }}
                                        >
                                            {langObj.viewReport}
                                        </CustomButton>
                                    </Box>
                                )}

                                {tabIndex === 0 &&
                                    Array.isArray(data.breakfastCategories) &&
                                    data.breakfastCategories.some(cat =>
                                        (cat.entreeItems && cat.entreeItems.some(item => item.qty > 0)) ||
                                        (cat.alternativeItems && cat.alternativeItems.some(item => item.qty > 0))
                                    ) &&
                                    !kitchenSummery && (
                                        <Box mt={3} display="flex" justifyContent="center">
                                            <CustomButton
                                                sx={{
                                                    padding: "10px 32px",
                                                    bgcolor: colors.blueAccent[700],
                                                    color: "#fcfcfc",
                                                    border: "none",
                                                    borderRadius: 4,
                                                    fontWeight: 600,
                                                    fontSize: 16,
                                                    cursor: "pointer",
                                                    width: 'auto'
                                                }}
                                                disabled={isAfter10AM || isPast}
                                                onClick={() => {
                                                    submitData(data, date)
                                                }}
                                            >
                                                {langObj.submit}
                                            </CustomButton>
                                        </Box>
                                    )
                                }
                            </Box>
                        )}
                        {tabIndex === 1 && (
                            <Box>
                                {Array.isArray(data.lunchCategories) && data.lunchCategories.map((cat, catIdx) => (
                                    <Box key={cat.cat_id} mb={3}>
                                        <Typography variant="h6" sx={{
                                            mb: 2,
                                            fontWeight: 600,
                                            backgroundColor: "#f5f5f5",
                                            px: 2,
                                            py: 1,
                                            borderRadius: 1,
                                            textAlign: "center"
                                        }}>
                                            {userData?.langCode === "cn" && cat.cat_name_cn && cat.cat_name_cn.trim() !== ""
                                                ? cat.cat_name_cn
                                                : cat.cat_name}
                                            {cat.cat_name === "LUNCH ENTREE" && ` (${langObj.servedWithSoup})`}
                                        </Typography>

                                        {/* Entree Items */}
                                        {cat.entreeItems.map(item => (
                                            <Box key={item.id} mb={1}>
                                                <Box display="flex" alignItems="center" justifyContent="space-between">
                                                    <Box display="flex" alignItems="center">
                                                        {item.image && (
                                                            <img
                                                                src={item.image}
                                                                alt={userData?.langCode === "cn" && item.chinese_name ? item.chinese_name : item.name}
                                                                style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 8, marginRight: 12 }}
                                                            />
                                                        )}
                                                        <Typography>
                                                            {userData?.langCode === "cn" && item.chinese_name ? item.chinese_name : item.name}
                                                        </Typography>
                                                    </Box>
                                                    <Box display="flex" alignItems="center">
                                                        {!kitchenSummery && (
                                                            <button
                                                                onClick={() =>
                                                                    setData(prev => ({
                                                                        ...prev,
                                                                        lunchCategories: prev.lunchCategories.map((c, idx) =>
                                                                            idx === catIdx
                                                                                ? {
                                                                                    ...c,
                                                                                    entreeItems: c.entreeItems.map(i => {
                                                                                        if (i.id === item.id) {
                                                                                            const newQty = Math.max((i.qty || 0) - 1, 0);
                                                                                            return {
                                                                                                ...i,
                                                                                                qty: newQty,
                                                                                                options: (i.options || []).length > 0 && newQty === 0
                                                                                                    ? i.options.map((opt, idx) => ({ ...opt, is_selected: idx === 0 ? 1 : 0 }))
                                                                                                    : i.options,
                                                                                                preference: (i.preference || []).length > 0 && newQty === 0
                                                                                                    ? i.preference.map((p) => ({ ...p, is_selected: 0 }))
                                                                                                    : i.preference,
                                                                                            };
                                                                                        }
                                                                                        if ((i.qty || 0) === 0) {
                                                                                            return {
                                                                                                ...i,
                                                                                                options: (i.options || []).length > 0
                                                                                                    ? i.options.map((opt, idx) => ({ ...opt, is_selected: idx === 0 ? 1 : 0 }))
                                                                                                    : i.options,
                                                                                                preference: (i.preference || []).length > 0
                                                                                                    ? i.preference.map((p) => ({ ...p, is_selected: 0 }))
                                                                                                    : i.preference,
                                                                                            };
                                                                                        }
                                                                                        return i;
                                                                                    }),
                                                                                }
                                                                                : c
                                                                        )
                                                                    }))
                                                                }
                                                                style={{ marginRight: 8 }}
                                                                disabled={item.qty === 0 || isAfter3PM || isPast}
                                                            >
                                                                -
                                                            </button>
                                                        )}
                                                        <Typography sx={kitchenSummery ? { fontSize: 24, fontWeight: 700 } : {}}>
                                                            {item.qty || 0}
                                                        </Typography>
                                                        {!kitchenSummery && (
                                                            <button
                                                                onClick={() => {
                                                                    setData(prev => {
                                                                        const totalQty =
                                                                            (prev.lunchCategories[catIdx]?.entreeItems?.reduce((sum, i) => sum + (i.qty || 0), 0) || 0) +
                                                                            (prev.lunchCategories[catIdx]?.alternativeItems?.reduce((sum, i) => sum + (i.qty || 0), 0) || 0);
                                                                        let newEntree = [...prev.lunchCategories[catIdx].entreeItems];
                                                                        let newAlternative = [...(prev.lunchCategories[catIdx].alternativeItems || [])];
                                                                        if (totalQty >= MAX_MEAL_QTY) {
                                                                            let removed = false;
                                                                            newAlternative = newAlternative.map((alt) => {
                                                                                if (!removed && alt.qty > 0) {
                                                                                    removed = true;
                                                                                    const newQty = alt.qty - 1;
                                                                                    return {
                                                                                        ...alt,
                                                                                        qty: newQty,
                                                                                        options: (alt.options || []).length > 0 && alt.qty > 0 && newQty === 0
                                                                                            ? alt.options.map((opt, idx) => ({ ...opt, is_selected: idx === 0 ? 1 : 0 }))
                                                                                            : alt.options,
                                                                                        preference: (alt.preference || []).length > 0 && alt.qty > 0 && newQty === 0
                                                                                            ? alt.preference.map((p) => ({ ...p, is_selected: 0 }))
                                                                                            : alt.preference,
                                                                                    };
                                                                                }
                                                                                return alt;
                                                                            });
                                                                            if (!removed) {
                                                                                newEntree = newEntree.map((en) => {
                                                                                    if (!removed && en.id !== item.id && en.qty > 0) {
                                                                                        removed = true;
                                                                                        const newQty = en.qty - 1;
                                                                                        return {
                                                                                            ...en,
                                                                                            qty: newQty,
                                                                                            options: (en.options || []).length > 0 && en.qty > 0 && newQty === 0
                                                                                                ? en.options.map((opt, idx) => ({ ...opt, is_selected: idx === 0 ? 1 : 0 }))
                                                                                                : en.options,
                                                                                            preference: (en.preference || []).length > 0 && en.qty > 0 && newQty === 0
                                                                                                ? en.preference.map((p) => ({ ...p, is_selected: 0 }))
                                                                                                : en.preference,
                                                                                        };
                                                                                    }
                                                                                    return en;
                                                                                });
                                                                            }
                                                                        }
                                                                        newEntree = newEntree.map((i) =>
                                                                            i.id === item.id
                                                                                ? {
                                                                                    ...i,
                                                                                    qty: (i.qty || 0) + 1,
                                                                                    options: (i.options || []).length > 0 && (i.qty || 0) === 0
                                                                                        ? i.options.map((opt, idx) => ({ ...opt, is_selected: idx === 0 ? 1 : 0 }))
                                                                                        : i.options,
                                                                                    preference: (i.preference || []).length > 0 && (i.qty || 0) === 0
                                                                                        ? i.preference.map((p) => ({ ...p, is_selected: 0 }))
                                                                                        : i.preference,
                                                                                }
                                                                                : i
                                                                        );
                                                                        return {
                                                                            ...prev,
                                                                            lunchCategories: prev.lunchCategories.map((c, idx) =>
                                                                                idx === catIdx
                                                                                    ? {
                                                                                        ...c,
                                                                                        entreeItems: newEntree,
                                                                                        alternativeItems: newAlternative,
                                                                                    }
                                                                                    : c
                                                                            )
                                                                        };
                                                                    });
                                                                }}
                                                                style={{ marginLeft: 8 }}
                                                                disabled={item.qty >= MAX_MEAL_QTY || isAfter3PM || isPast}
                                                            >
                                                                +
                                                            </button>
                                                        )}
                                                    </Box>
                                                </Box>
                                                {/* Options and Preference */}
                                                <Box mt={2} ml={1} sx={{ width: "100%", minHeight: item.qty > 0 ? "auto" : 0 }} >
                                                    {(item.qty > 0) && (
                                                        <Box mt={2} ml={1} /* sx={{ width: "100%", minHeight: item.qty > 0 ? "auto" : 0 }} */ sx={{ width: "100%" }}>
                                                            {item.options && item.options.length > 0 && (
                                                                <Box mb={1}>
                                                                    {item.options.map((opt) => (
                                                                        <label key={opt.id} style={{ marginRight: 12 }}>
                                                                            <input
                                                                                type="radio"
                                                                                name={`lunch-entree-option-${cat.cat_id}-${item.id}`}
                                                                                checked={!!opt.is_selected}
                                                                                onChange={() => {
                                                                                    setData(prev => ({
                                                                                        ...prev,
                                                                                        lunchCategories: prev.lunchCategories.map((c, idx) =>
                                                                                            idx === catIdx
                                                                                                ? {
                                                                                                    ...c,
                                                                                                    entreeItems: c.entreeItems.map(i =>
                                                                                                        i.id === item.id
                                                                                                            ? {
                                                                                                                ...i,
                                                                                                                options: i.options.map(o =>
                                                                                                                    o.id === opt.id
                                                                                                                        ? { ...o, is_selected: 1 }
                                                                                                                        : { ...o, is_selected: 0 }
                                                                                                                ),
                                                                                                            }
                                                                                                            : i
                                                                                                    ),
                                                                                                }
                                                                                                : c
                                                                                        )
                                                                                    }));
                                                                                }}
                                                                            />
                                                                            <span style={{ marginLeft: 5 }}>{opt.name}</span>
                                                                        </label>
                                                                    ))}
                                                                </Box>
                                                            )}
                                                            {item.preference && item.preference.length > 0 && (
                                                                <Box>
                                                                    <Typography sx={{ fontWeight: 700, fontSize: 18 }}>
                                                                        * Preference
                                                                    </Typography>
                                                                    {item.preference.map((pref) => (
                                                                        <label key={pref.id} style={{ marginRight: 12 }}>
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={!!pref.is_selected}
                                                                                onChange={() => {
                                                                                    setData(prev => ({
                                                                                        ...prev,
                                                                                        lunchCategories: prev.lunchCategories.map((c, idx) =>
                                                                                            idx === catIdx
                                                                                                ? {
                                                                                                    ...c,
                                                                                                    entreeItems: c.entreeItems.map(i =>
                                                                                                        i.id === item.id
                                                                                                            ? {
                                                                                                                ...i,
                                                                                                                preference: i.preference.map(p =>
                                                                                                                    p.id === pref.id
                                                                                                                        ? { ...p, is_selected: p.is_selected ? 0 : 1 }
                                                                                                                        : p
                                                                                                                ),
                                                                                                            }
                                                                                                            : i
                                                                                                    ),
                                                                                                }
                                                                                                : c
                                                                                        )
                                                                                    }));
                                                                                }}
                                                                            />
                                                                            <span style={{ marginLeft: 5 }}>{pref.name}</span>
                                                                        </label>
                                                                    ))}
                                                                </Box>
                                                            )}
                                                        </Box>
                                                    )}
                                                </Box>
                                            </Box>
                                        ))}

                                        {/* Alternative Subcategory Title */}
                                        {cat.alternativeCatName && (
                                            <Typography variant="subtitle1" sx={{ mt: 3, mb: 2, fontWeight: 700 }}>
                                                {userData?.langCode === "cn" && cat.alternativeCatName_cn && cat.alternativeCatName_cn.trim() !== ""
                                                    ? cat.alternativeCatName_cn
                                                    : cat.alternativeCatName}
                                            </Typography>
                                        )}

                                        {/* Alternative Items */}
                                        {cat.alternativeItems.map(item => (
                                            <Box key={item.id} mb={1} ml={2}>
                                                <Box display="flex" alignItems="center" justifyContent="space-between">
                                                    <Box display="flex" alignItems="center">
                                                        {item.image && (
                                                            <img
                                                                src={item.image}
                                                                alt={userData?.langCode === "cn" && item.chinese_name ? item.chinese_name : item.name}
                                                                style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 8, marginRight: 12 }}
                                                            />
                                                        )}
                                                        <Typography>
                                                            {userData?.langCode === "cn" && item.chinese_name ? item.chinese_name : item.name}
                                                        </Typography>
                                                    </Box>
                                                    <Box display="flex" alignItems="center">
                                                        {!kitchenSummery && (
                                                            <button
                                                                onClick={() =>
                                                                    setData(prev => ({
                                                                        ...prev,
                                                                        lunchCategories: prev.lunchCategories.map((c, idx) =>
                                                                            idx === catIdx
                                                                                ? {
                                                                                    ...c,
                                                                                    alternativeItems: c.alternativeItems.map(i =>
                                                                                        i.id === item.id
                                                                                            ? {
                                                                                                ...i,
                                                                                                qty: Math.max((i.qty || 0) - 1, 0),
                                                                                                options: (i.options || []).length > 0 && Math.max((i.qty || 0) - 1, 0) === 0
                                                                                                    ? i.options.map((opt, idx) => ({ ...opt, is_selected: idx === 0 ? 1 : 0 }))
                                                                                                    : i.options,
                                                                                                preference: (i.preference || []).length > 0 && Math.max((i.qty || 0) - 1, 0) === 0
                                                                                                    ? i.preference.map((p) => ({ ...p, is_selected: 0 }))
                                                                                                    : i.preference,
                                                                                            }
                                                                                            : i
                                                                                    )
                                                                                }
                                                                                : c
                                                                        )
                                                                    }))
                                                                }
                                                                style={{ marginRight: 8 }}
                                                                disabled={item.qty === 0 || isAfter3PM || isPast}
                                                            >
                                                                -
                                                            </button>
                                                        )}
                                                        <Typography sx={kitchenSummery ? { fontSize: 24, fontWeight: 700 } : {}}>
                                                            {item.qty || 0}
                                                        </Typography>
                                                        {!kitchenSummery && (
                                                            <button
                                                                onClick={() => {
                                                                    setData(prev => {
                                                                        const totalQty =
                                                                            (prev.lunchCategories[catIdx]?.entreeItems?.reduce((sum, i) => sum + (i.qty || 0), 0) || 0) +
                                                                            (prev.lunchCategories[catIdx]?.alternativeItems?.reduce((sum, i) => sum + (i.qty || 0), 0) || 0);
                                                                        let newAlternative = [...prev.lunchCategories[catIdx].alternativeItems];
                                                                        let newEntree = [...(prev.lunchCategories[catIdx].entreeItems || [])];
                                                                        if (totalQty >= MAX_MEAL_QTY) {
                                                                            let removed = false;
                                                                            newEntree = newEntree.map((en) => {
                                                                                if (!removed && en.qty > 0) {
                                                                                    removed = true;
                                                                                    const newQty = en.qty - 1;
                                                                                    return {
                                                                                        ...en,
                                                                                        qty: newQty,
                                                                                        options: (en.options || []).length > 0 && en.qty > 0 && newQty === 0
                                                                                            ? en.options.map((opt, idx) => ({ ...opt, is_selected: idx === 0 ? 1 : 0 }))
                                                                                            : en.options,
                                                                                        preference: (en.preference || []).length > 0 && en.qty > 0 && newQty === 0
                                                                                            ? en.preference.map((p) => ({ ...p, is_selected: 0 }))
                                                                                            : en.preference,
                                                                                    };
                                                                                }
                                                                                return en;
                                                                            });
                                                                            if (!removed) {
                                                                                newAlternative = newAlternative.map((alt) => {
                                                                                    if (!removed && alt.id !== item.id && alt.qty > 0) {
                                                                                        removed = true;
                                                                                        const newQty = alt.qty - 1;
                                                                                        return {
                                                                                            ...alt,
                                                                                            qty: newQty,
                                                                                            options: (alt.options || []).length > 0 && alt.qty > 0 && newQty === 0
                                                                                                ? alt.options.map((opt, idx) => ({ ...opt, is_selected: idx === 0 ? 1 : 0 }))
                                                                                                : alt.options,
                                                                                            preference: (alt.preference || []).length > 0 && alt.qty > 0 && newQty === 0
                                                                                                ? alt.preference.map((p) => ({ ...p, is_selected: 0 }))
                                                                                                : alt.preference,
                                                                                        };
                                                                                    }
                                                                                    return alt;
                                                                                });
                                                                            }
                                                                        }
                                                                        newAlternative = newAlternative.map((i) =>
                                                                            i.id === item.id
                                                                                ? {
                                                                                    ...i,
                                                                                    qty: (i.qty || 0) + 1,
                                                                                    options: (i.options || []).length > 0 && (i.qty || 0) === 0
                                                                                        ? i.options.map((opt, idx) => ({ ...opt, is_selected: idx === 0 ? 1 : 0 }))
                                                                                        : i.options,
                                                                                    preference: (i.preference || []).length > 0 && (i.qty || 0) === 0
                                                                                        ? i.preference.map((p) => ({ ...p, is_selected: 0 }))
                                                                                        : i.preference,
                                                                                }
                                                                                : i
                                                                        );
                                                                        return {
                                                                            ...prev,
                                                                            lunchCategories: prev.lunchCategories.map((c, idx) =>
                                                                                idx === catIdx
                                                                                    ? {
                                                                                        ...c,
                                                                                        entreeItems: newEntree,
                                                                                        alternativeItems: newAlternative,
                                                                                    }
                                                                                    : c
                                                                            )
                                                                        };
                                                                    });
                                                                }}
                                                                style={{ marginLeft: 8 }}
                                                                disabled={item.qty >= MAX_MEAL_QTY || isAfter3PM || isPast}
                                                            >
                                                                +
                                                            </button>
                                                        )}
                                                    </Box>
                                                </Box>
                                                {/* Options and Preference */}
                                                <Box mt={2} ml={1} sx={{ width: "100%", minHeight: item.qty > 0 ? "auto" : 0 }} >

                                                    {(item.qty > 0) && (
                                                        <Box mt={2} ml={1} >
                                                            {item.options && item.options.length > 0 && (
                                                                <Box mb={1}>
                                                                    {item.options.map((opt) => (
                                                                        <label key={opt.id} style={{ marginRight: 12 }}>
                                                                            <input
                                                                                type="radio"
                                                                                name={`lunch-alt-option-${cat.cat_id}-${item.id}`}
                                                                                checked={!!opt.is_selected}
                                                                                onChange={() => {
                                                                                    setData(prev => ({
                                                                                        ...prev,
                                                                                        lunchCategories: prev.lunchCategories.map((c, idx) =>
                                                                                            idx === catIdx
                                                                                                ? {
                                                                                                    ...c,
                                                                                                    alternativeItems: c.alternativeItems.map(i =>
                                                                                                        i.id === item.id
                                                                                                            ? {
                                                                                                                ...i,
                                                                                                                options: i.options.map(o =>
                                                                                                                    o.id === opt.id
                                                                                                                        ? { ...o, is_selected: 1 }
                                                                                                                        : { ...o, is_selected: 0 }
                                                                                                                ),
                                                                                                            }
                                                                                                            : i
                                                                                                    ),
                                                                                                }
                                                                                                : c
                                                                                        )
                                                                                    }));
                                                                                }}
                                                                            />
                                                                            <span style={{ marginLeft: 5 }}>{opt.name}</span>
                                                                        </label>
                                                                    ))}
                                                                </Box>
                                                            )}
                                                            {item.preference && item.preference.length > 0 && (
                                                                <Box>
                                                                    <Typography sx={{ fontWeight: 700, fontSize: 18 }}>
                                                                        * Preference
                                                                    </Typography>
                                                                    {item.preference.map((pref) => (
                                                                        <label key={pref.id} style={{ marginRight: 12 }}>
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={!!pref.is_selected}
                                                                                onChange={() => {
                                                                                    setData(prev => ({
                                                                                        ...prev,
                                                                                        lunchCategories: prev.lunchCategories.map((c, idx) =>
                                                                                            idx === catIdx
                                                                                                ? {
                                                                                                    ...c,
                                                                                                    alternativeItems: c.alternativeItems.map(i =>
                                                                                                        i.id === item.id
                                                                                                            ? {
                                                                                                                ...i,
                                                                                                                preference: i.preference.map(p =>
                                                                                                                    p.id === pref.id
                                                                                                                        ? { ...p, is_selected: p.is_selected ? 0 : 1 }
                                                                                                                        : p
                                                                                                                ),
                                                                                                            }
                                                                                                            : i
                                                                                                    ),
                                                                                                }
                                                                                                : c
                                                                                        )
                                                                                    }));
                                                                                }}
                                                                            />
                                                                            <span style={{ marginLeft: 5 }}>{pref.name}</span>
                                                                        </label>
                                                                    ))}
                                                                </Box>
                                                            )}
                                                        </Box>
                                                    )}
                                                </Box>
                                            </Box>
                                        ))}
                                    </Box>
                                ))}
                                {/* Lunch Services */}
                                {(
                                    Array.isArray(data.lunchCategories) &&
                                    data.lunchCategories.some(cat =>
                                        (cat.entreeItems && cat.entreeItems.some(item => item.qty > 0)) ||
                                        (cat.alternativeItems && cat.alternativeItems.some(item => item.qty > 0))
                                    ) &&
                                    !kitchenSummery
                                ) && (
                                        <Box mt={3} display="flex" gap={3}>
                                            <label style={{ display: "flex", alignItems: "center" }}>
                                                <input
                                                    type="checkbox"
                                                    checked={data.is_lunch_tray_service === 1}
                                                    onChange={e => {
                                                        setData(prev => ({
                                                            ...prev,
                                                            is_lunch_tray_service: e.target.checked ? 1 : 0
                                                        }));
                                                    }}
                                                />
                                                <span style={{ marginLeft: 5 }}>{langObj.trayService}</span>
                                            </label>
                                            <label style={{ display: "flex", alignItems: "center" }}>
                                                <input
                                                    type="checkbox"
                                                    checked={data.is_lunch_escort_service === 1}
                                                    onChange={e => {
                                                        setData(prev => ({
                                                            ...prev,
                                                            is_lunch_escort_service: e.target.checked ? 1 : 0
                                                        }));
                                                    }}
                                                />
                                                <span style={{ marginLeft: 5 }}>{langObj.escortService}</span>
                                            </label>
                                            <label style={{ display: "flex", alignItems: "center" }}>
                                                <input type="checkbox" />
                                                <span style={{ marginLeft: 5 }}>{langObj.Takeout}</span>
                                            </label>
                                        </Box>
                                    )}
                                {showLunchGuideline && (
                                    <>
                                        <hr />
                                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                                            {userData?.langCode === "cn" && userData?.lunch_guideline_cn && userData?.lunch_guideline_cn.trim() !== ""
                                                ? userData?.lunch_guideline_cn
                                                : userData?.lunch_guideline}
                                        </Typography>
                                    </>
                                )}

                                {Array.isArray(data.lunchCategories) && data.lunchCategories.length === 0 && (
                                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                                        {langObj.lunchMenuWarn}
                                    </Typography>
                                )}
                                {kitchenSummery && (
                                    <Box mt={3} display="flex" justifyContent="center">
                                        <CustomButton
                                            onClick={() => navigate('/report')}
                                            endIcon={<ArrowForwardIosOutlined />}
                                            sx={{
                                                bgcolor: colors.blueAccent[50],
                                                color: colors.blueAccent[700],
                                                "&:hover": {
                                                    bgcolor: colors.blueAccent[100],
                                                    color: colors.blueAccent[800],
                                                },
                                                padding: "10px 32px",
                                                boxShadow: "none",
                                                borderRadius: "30px",
                                                border: "none",
                                                borderRadius: 4,
                                                fontWeight: 600,
                                                fontSize: 16,
                                                cursor: "pointer",
                                                width: 'auto'
                                            }}
                                        >
                                            {langObj.viewReport}
                                        </CustomButton>
                                    </Box>
                                )}
                                {tabIndex === 1 &&
                                    Array.isArray(data.lunchCategories) &&
                                    data.lunchCategories.some(cat =>
                                        (cat.entreeItems && cat.entreeItems.some(item => item.qty > 0)) ||
                                        (cat.alternativeItems && cat.alternativeItems.some(item => item.qty > 0))
                                    ) &&
                                    !kitchenSummery && (
                                        <Box mt={3} display="flex" justifyContent="center">
                                            <CustomButton
                                                sx={{
                                                    padding: "10px 32px",
                                                    bgcolor: colors.blueAccent[700],
                                                    color: "#fcfcfc",
                                                    border: "none",
                                                    borderRadius: 4,
                                                    fontWeight: 600,
                                                    fontSize: 16,
                                                    cursor: "pointer",
                                                    width: 'auto'
                                                }}
                                                disabled={isAfter3PM || isPast}
                                                onClick={() => {
                                                    submitData(data, date)
                                                }}
                                            >
                                                {langObj.submit}
                                            </CustomButton>
                                        </Box>
                                    )}
                            </Box>
                        )}
                        {tabIndex === 2 && (
                            <Box>
                                {Array.isArray(data.dinnerCategories) && data.dinnerCategories.map((cat, catIdx) => (
                                    <Box key={cat.cat_id} mb={3}>
                                        <Typography variant="h6" sx={{
                                            mb: 2,
                                            fontWeight: 600,
                                            backgroundColor: "#f5f5f5",
                                            px: 2,
                                            py: 1,
                                            borderRadius: 1,
                                            textAlign: "center"
                                        }}>
                                            {userData?.langCode === "cn" && cat.cat_name_cn && cat.cat_name_cn.trim() !== ""
                                                ? cat.cat_name_cn
                                                : cat.cat_name}
                                            {cat.cat_name === "DINNER ENTREE" && ` (${langObj.servedWithDessert})`}
                                        </Typography>

                                        {/* Entree Items */}
                                        {cat.entreeItems.map(item => (
                                            <Box key={item.id} mb={1}>
                                                <Box display="flex" alignItems="center" justifyContent="space-between">
                                                    <Box display="flex" alignItems="center">
                                                        {item.image && (
                                                            <img
                                                                src={item.image}
                                                                alt={userData?.langCode === "cn" && item.chinese_name ? item.chinese_name : item.name}
                                                                style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 8, marginRight: 12 }}
                                                            />
                                                        )}
                                                        <Typography>
                                                            {userData?.langCode === "cn" && item.chinese_name ? item.chinese_name : item.name}
                                                        </Typography>
                                                    </Box>
                                                    <Box display="flex" alignItems="center">
                                                        {!kitchenSummery && (
                                                            <button
                                                                onClick={() =>
                                                                    setData(prev => ({
                                                                        ...prev,
                                                                        dinnerCategories: prev.dinnerCategories.map((c, idx) =>
                                                                            idx === catIdx
                                                                                ? {
                                                                                    ...c,
                                                                                    entreeItems: c.entreeItems.map(i => {
                                                                                        if (i.id === item.id) {
                                                                                            const newQty = Math.max((i.qty || 0) - 1, 0);
                                                                                            return {
                                                                                                ...i,
                                                                                                qty: newQty,
                                                                                                options: (i.options || []).length > 0 && newQty === 0
                                                                                                    ? i.options.map((opt, idx) => ({ ...opt, is_selected: idx === 0 ? 1 : 0 }))
                                                                                                    : i.options,
                                                                                                preference: (i.preference || []).length > 0 && newQty === 0
                                                                                                    ? i.preference.map((p) => ({ ...p, is_selected: 0 }))
                                                                                                    : i.preference,
                                                                                            };
                                                                                        }
                                                                                        if ((i.qty || 0) === 0) {
                                                                                            return {
                                                                                                ...i,
                                                                                                options: (i.options || []).length > 0
                                                                                                    ? i.options.map((opt, idx) => ({ ...opt, is_selected: idx === 0 ? 1 : 0 }))
                                                                                                    : i.options,
                                                                                                preference: (i.preference || []).length > 0
                                                                                                    ? i.preference.map((p) => ({ ...p, is_selected: 0 }))
                                                                                                    : i.preference,
                                                                                            };
                                                                                        }
                                                                                        return i;
                                                                                    }),
                                                                                }
                                                                                : c
                                                                        )
                                                                    }))
                                                                }
                                                                style={{ marginRight: 8 }}
                                                                disabled={item.qty === 0 || isAfter12PM || isPast}
                                                            >
                                                                -
                                                            </button>
                                                        )}
                                                        <Typography sx={kitchenSummery ? { fontSize: 24, fontWeight: 700 } : {}}>
                                                            {item.qty || 0}
                                                        </Typography>
                                                        {!kitchenSummery && (
                                                            <button
                                                                onClick={() => {
                                                                    setData(prev => {
                                                                        const totalQty =
                                                                            (prev.dinnerCategories[catIdx]?.entreeItems?.reduce((sum, i) => sum + (i.qty || 0), 0) || 0) +
                                                                            (prev.dinnerCategories[catIdx]?.alternativeItems?.reduce((sum, i) => sum + (i.qty || 0), 0) || 0);
                                                                        let newEntree = [...prev.dinnerCategories[catIdx].entreeItems];
                                                                        let newAlternative = [...(prev.dinnerCategories[catIdx].alternativeItems || [])];
                                                                        if (totalQty >= MAX_MEAL_QTY) {
                                                                            let removed = false;
                                                                            newAlternative = newAlternative.map((alt) => {
                                                                                if (!removed && alt.qty > 0) {
                                                                                    removed = true;
                                                                                    const newQty = alt.qty - 1;
                                                                                    return {
                                                                                        ...alt,
                                                                                        qty: newQty,
                                                                                        options: (alt.options || []).length > 0 && alt.qty > 0 && newQty === 0
                                                                                            ? alt.options.map((opt, idx) => ({ ...opt, is_selected: idx === 0 ? 1 : 0 }))
                                                                                            : alt.options,
                                                                                        preference: (alt.preference || []).length > 0 && alt.qty > 0 && newQty === 0
                                                                                            ? alt.preference.map((p) => ({ ...p, is_selected: 0 }))
                                                                                            : alt.preference,
                                                                                    };
                                                                                }
                                                                                return alt;
                                                                            });
                                                                            if (!removed) {
                                                                                newEntree = newEntree.map((en) => {
                                                                                    if (!removed && en.id !== item.id && en.qty > 0) {
                                                                                        removed = true;
                                                                                        const newQty = en.qty - 1;
                                                                                        return {
                                                                                            ...en,
                                                                                            qty: newQty,
                                                                                            options: (en.options || []).length > 0 && en.qty > 0 && newQty === 0
                                                                                                ? en.options.map((opt, idx) => ({ ...opt, is_selected: idx === 0 ? 1 : 0 }))
                                                                                                : en.options,
                                                                                            preference: (en.preference || []).length > 0 && en.qty > 0 && newQty === 0
                                                                                                ? en.preference.map((p) => ({ ...p, is_selected: 0 }))
                                                                                                : en.preference,
                                                                                        };
                                                                                    }
                                                                                    return en;
                                                                                });
                                                                            }
                                                                        }
                                                                        newEntree = newEntree.map((i) =>
                                                                            i.id === item.id
                                                                                ? {
                                                                                    ...i,
                                                                                    qty: (i.qty || 0) + 1,
                                                                                    options: (i.options || []).length > 0 && (i.qty || 0) === 0
                                                                                        ? i.options.map((opt, idx) => ({ ...opt, is_selected: idx === 0 ? 1 : 0 }))
                                                                                        : i.options,
                                                                                    preference: (i.preference || []).length > 0 && (i.qty || 0) === 0
                                                                                        ? i.preference.map((p) => ({ ...p, is_selected: 0 }))
                                                                                        : i.preference,
                                                                                }
                                                                                : i
                                                                        );
                                                                        return {
                                                                            ...prev,
                                                                            dinnerCategories: prev.dinnerCategories.map((c, idx) =>
                                                                                idx === catIdx
                                                                                    ? {
                                                                                        ...c,
                                                                                        entreeItems: newEntree,
                                                                                        alternativeItems: newAlternative,
                                                                                    }
                                                                                    : c
                                                                            )
                                                                        };
                                                                    });
                                                                }}
                                                                style={{ marginLeft: 8 }}
                                                                disabled={item.qty >= MAX_MEAL_QTY || isAfter12PM || isPast}
                                                            >
                                                                +
                                                            </button>
                                                        )}
                                                    </Box>
                                                </Box>
                                                {/* Options and Preference always at the bottom */}
                                                <Box mt={2} ml={1} sx={{ width: "100%", minHeight: item.qty > 0 ? "auto" : 0 }}>
                                                    {(item.qty > 0) && (
                                                        <Box mt={2} ml={1} >
                                                            {item.options && item.options.length > 0 && (
                                                                <Box mb={1}>
                                                                    {item.options.map((opt) => (
                                                                        <label key={opt.id} style={{ marginRight: 12 }}>
                                                                            <input
                                                                                type="radio"
                                                                                name={`dinner-entree-option-${cat.cat_id}-${item.id}`}
                                                                                checked={!!opt.is_selected}
                                                                                onChange={() => {
                                                                                    setData(prev => ({
                                                                                        ...prev,
                                                                                        dinnerCategories: prev.dinnerCategories.map((c, idx) =>
                                                                                            idx === catIdx
                                                                                                ? {
                                                                                                    ...c,
                                                                                                    entreeItems: c.entreeItems.map(i =>
                                                                                                        i.id === item.id
                                                                                                            ? {
                                                                                                                ...i,
                                                                                                                options: i.options.map(o =>
                                                                                                                    o.id === opt.id
                                                                                                                        ? { ...o, is_selected: 1 }
                                                                                                                        : { ...o, is_selected: 0 }
                                                                                                                ),
                                                                                                            }
                                                                                                            : i
                                                                                                    ),
                                                                                                }
                                                                                                : c
                                                                                        )
                                                                                    }));
                                                                                }}
                                                                            />
                                                                            <span style={{ marginLeft: 5 }}>{opt.name}</span>
                                                                        </label>
                                                                    ))}
                                                                </Box>
                                                            )}
                                                            {item.preference && item.preference.length > 0 && (
                                                                <Box>
                                                                    <Typography sx={{ fontWeight: 700, fontSize: 18 }}>
                                                                        * Preference
                                                                    </Typography>
                                                                    {item.preference.map((pref) => (
                                                                        <label key={pref.id} style={{ marginRight: 12 }}>
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={!!pref.is_selected}
                                                                                onChange={() => {
                                                                                    setData(prev => ({
                                                                                        ...prev,
                                                                                        dinnerCategories: prev.dinnerCategories.map((c, idx) =>
                                                                                            idx === catIdx
                                                                                                ? {
                                                                                                    ...c,
                                                                                                    entreeItems: c.entreeItems.map(i =>
                                                                                                        i.id === item.id
                                                                                                            ? {
                                                                                                                ...i,
                                                                                                                preference: i.preference.map(p =>
                                                                                                                    p.id === pref.id
                                                                                                                        ? { ...p, is_selected: p.is_selected ? 0 : 1 }
                                                                                                                        : p
                                                                                                                ),
                                                                                                            }
                                                                                                            : i
                                                                                                    ),
                                                                                                }
                                                                                                : c
                                                                                        )
                                                                                    }));
                                                                                }}
                                                                            />
                                                                            <span style={{ marginLeft: 5 }}>{pref.name}</span>
                                                                        </label>
                                                                    ))}
                                                                </Box>
                                                            )}
                                                        </Box>
                                                    )}
                                                </Box>
                                            </Box>
                                        ))}

                                        {/* Alternative Subcategory Title */}
                                        {cat.alternativeCatName && (
                                            <Typography variant="subtitle1" sx={{ mt: 3, mb: 2, fontWeight: 700 }}>
                                                {userData?.langCode === "cn" && cat.alternativeCatName_cn && cat.alternativeCatName_cn.trim() !== ""
                                                    ? cat.alternativeCatName_cn
                                                    : cat.alternativeCatName}
                                            </Typography>
                                        )}

                                        {/* Alternative Items */}
                                        {cat.alternativeItems.map(item => (
                                            <Box key={item.id} mb={1} ml={2}>
                                                <Box display="flex" alignItems="center" justifyContent="space-between">
                                                    <Box display="flex" alignItems="center">
                                                        {item.image && (
                                                            <img
                                                                src={item.image}
                                                                alt={userData?.langCode === "cn" && item.chinese_name ? item.chinese_name : item.name}
                                                                style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 8, marginRight: 12 }}
                                                            />
                                                        )}
                                                        <Typography>
                                                            {userData?.langCode === "cn" && item.chinese_name ? item.chinese_name : item.name}
                                                        </Typography>
                                                    </Box>
                                                    <Box display="flex" alignItems="center">
                                                        {!kitchenSummery && (
                                                            <button
                                                                onClick={() =>
                                                                    setData(prev => ({
                                                                        ...prev,
                                                                        dinnerCategories: prev.dinnerCategories.map((c, idx) =>
                                                                            idx === catIdx
                                                                                ? {
                                                                                    ...c,
                                                                                    alternativeItems: c.alternativeItems.map(i =>
                                                                                        i.id === item.id
                                                                                            ? {
                                                                                                ...i,
                                                                                                qty: Math.max((i.qty || 0) - 1, 0),
                                                                                                options: (i.options || []).length > 0 && Math.max((i.qty || 0) - 1, 0) === 0
                                                                                                    ? i.options.map((opt, idx) => ({ ...opt, is_selected: idx === 0 ? 1 : 0 }))
                                                                                                    : i.options,
                                                                                                preference: (i.preference || []).length > 0 && Math.max((i.qty || 0) - 1, 0) === 0
                                                                                                    ? i.preference.map((p) => ({ ...p, is_selected: 0 }))
                                                                                                    : i.preference,
                                                                                            }
                                                                                            : i
                                                                                    )
                                                                                }
                                                                                : c
                                                                        )
                                                                    }))
                                                                }
                                                                style={{ marginRight: 8 }}
                                                                disabled={item.qty === 0 || isAfter12PM || isPast}
                                                            >
                                                                -
                                                            </button>
                                                        )}
                                                        <Typography sx={kitchenSummery ? { fontSize: 24, fontWeight: 700 } : {}}>
                                                            {item.qty || 0}
                                                        </Typography>
                                                        {!kitchenSummery && (
                                                            <button
                                                                onClick={() => {
                                                                    setData(prev => {
                                                                        const totalQty =
                                                                            (prev.dinnerCategories[catIdx]?.entreeItems?.reduce((sum, i) => sum + (i.qty || 0), 0) || 0) +
                                                                            (prev.dinnerCategories[catIdx]?.alternativeItems?.reduce((sum, i) => sum + (i.qty || 0), 0) || 0);
                                                                        let newAlternative = [...prev.dinnerCategories[catIdx].alternativeItems];
                                                                        let newEntree = [...(prev.dinnerCategories[catIdx].entreeItems || [])];
                                                                        if (totalQty >= MAX_MEAL_QTY) {
                                                                            let removed = false;
                                                                            newEntree = newEntree.map((en) => {
                                                                                if (!removed && en.qty > 0) {
                                                                                    removed = true;
                                                                                    const newQty = en.qty - 1;
                                                                                    return {
                                                                                        ...en,
                                                                                        qty: newQty,
                                                                                        options: (en.options || []).length > 0 && en.qty > 0 && newQty === 0
                                                                                            ? en.options.map((opt, idx) => ({ ...opt, is_selected: idx === 0 ? 1 : 0 }))
                                                                                            : en.options,
                                                                                        preference: (en.preference || []).length > 0 && en.qty > 0 && newQty === 0
                                                                                            ? en.preference.map((p) => ({ ...p, is_selected: 0 }))
                                                                                            : en.preference,
                                                                                    };
                                                                                }
                                                                                return en;
                                                                            });
                                                                            if (!removed) {
                                                                                newAlternative = newAlternative.map((alt) => {
                                                                                    if (!removed && alt.id !== item.id && alt.qty > 0) {
                                                                                        removed = true;
                                                                                        const newQty = alt.qty - 1;
                                                                                        return {
                                                                                            ...alt,
                                                                                            qty: newQty,
                                                                                            options: (alt.options || []).length > 0 && alt.qty > 0 && newQty === 0
                                                                                                ? alt.options.map((opt, idx) => ({ ...opt, is_selected: idx === 0 ? 1 : 0 }))
                                                                                                : alt.options,
                                                                                            preference: (alt.preference || []).length > 0 && alt.qty > 0 && newQty === 0
                                                                                                ? alt.preference.map((p) => ({ ...p, is_selected: 0 }))
                                                                                                : alt.preference,
                                                                                        };
                                                                                    }
                                                                                    return alt;
                                                                                });
                                                                            }
                                                                        }
                                                                        newAlternative = newAlternative.map((i) =>
                                                                            i.id === item.id
                                                                                ? {
                                                                                    ...i,
                                                                                    qty: (i.qty || 0) + 1,
                                                                                    options: (i.options || []).length > 0 && (i.qty || 0) === 0
                                                                                        ? i.options.map((opt, idx) => ({ ...opt, is_selected: idx === 0 ? 1 : 0 }))
                                                                                        : i.options,
                                                                                    preference: (i.preference || []).length > 0 && (i.qty || 0) === 0
                                                                                        ? i.preference.map((p) => ({ ...p, is_selected: 0 }))
                                                                                        : i.preference,
                                                                                }
                                                                                : i
                                                                        );
                                                                        return {
                                                                            ...prev,
                                                                            dinnerCategories: prev.dinnerCategories.map((c, idx) =>
                                                                                idx === catIdx
                                                                                    ? {
                                                                                        ...c,
                                                                                        entreeItems: newEntree,
                                                                                        alternativeItems: newAlternative,
                                                                                    }
                                                                                    : c
                                                                            )
                                                                        };
                                                                    });
                                                                }}
                                                                style={{ marginLeft: 8 }}
                                                                disabled={item.qty >= MAX_MEAL_QTY || isAfter12PM || isPast}
                                                            >
                                                                +
                                                            </button>
                                                        )}
                                                    </Box>
                                                </Box>
                                                {/* Options and Preference always at the bottom */}
                                                <Box mt={2} ml={1} sx={{ width: "100%", minHeight: item.qty > 0 ? "auto" : 0 }}>
                                                    {(item.qty > 0) && (
                                                        <Box mt={2} ml={3}>
                                                            {item.options && item.options.length > 0 && (
                                                                <Box mb={1}>
                                                                    {item.options.map((opt) => (
                                                                        <label key={opt.id} style={{ marginRight: 12 }}>
                                                                            <input
                                                                                type="radio"
                                                                                name={`dinner-alt-option-${cat.cat_id}-${item.id}`}
                                                                                checked={!!opt.is_selected}
                                                                                onChange={() => {
                                                                                    setData(prev => ({
                                                                                        ...prev,
                                                                                        dinnerCategories: prev.dinnerCategories.map((c, idx) =>
                                                                                            idx === catIdx
                                                                                                ? {
                                                                                                    ...c,
                                                                                                    alternativeItems: c.alternativeItems.map(i =>
                                                                                                        i.id === item.id
                                                                                                            ? {
                                                                                                                ...i,
                                                                                                                options: i.options.map(o =>
                                                                                                                    o.id === opt.id
                                                                                                                        ? { ...o, is_selected: 1 }
                                                                                                                        : { ...o, is_selected: 0 }
                                                                                                                ),
                                                                                                            }
                                                                                                            : i
                                                                                                    ),
                                                                                                }
                                                                                                : c
                                                                                        )
                                                                                    }));
                                                                                }}
                                                                            />
                                                                            <span style={{ marginLeft: 5 }}>{opt.name}</span>
                                                                        </label>
                                                                    ))}
                                                                </Box>
                                                            )}
                                                            {item.preference && item.preference.length > 0 && (
                                                                <Box>
                                                                    <Typography sx={{ fontWeight: 700, fontSize: 18 }}>
                                                                        * Preference
                                                                    </Typography>
                                                                    {item.preference.map((pref) => (
                                                                        <label key={pref.id} style={{ marginRight: 12 }}>
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={!!pref.is_selected}
                                                                                onChange={() => {
                                                                                    setData(prev => ({
                                                                                        ...prev,
                                                                                        dinnerCategories: prev.dinnerCategories.map((c, idx) =>
                                                                                            idx === catIdx
                                                                                                ? {
                                                                                                    ...c,
                                                                                                    alternativeItems: c.alternativeItems.map(i =>
                                                                                                        i.id === item.id
                                                                                                            ? {
                                                                                                                ...i,
                                                                                                                preference: i.preference.map(p =>
                                                                                                                    p.id === pref.id
                                                                                                                        ? { ...p, is_selected: p.is_selected ? 0 : 1 }
                                                                                                                        : p
                                                                                                                ),
                                                                                                            }
                                                                                                            : i
                                                                                                    ),
                                                                                                }
                                                                                                : c
                                                                                        )
                                                                                    }));
                                                                                }}
                                                                            />
                                                                            <span style={{ marginLeft: 5 }}>{pref.name}</span>
                                                                        </label>
                                                                    ))}
                                                                </Box>
                                                            )}
                                                        </Box>
                                                    )}
                                                </Box>
                                            </Box>
                                        ))}

                                    </Box>
                                ))}
                                {/* Dinner Services */}
                                {(
                                    Array.isArray(data.dinnerCategories) &&
                                    data.dinnerCategories.some(cat =>
                                        (cat.entreeItems && cat.entreeItems.some(item => item.qty > 0)) ||
                                        (cat.alternativeItems && cat.alternativeItems.some(item => item.qty > 0))
                                    ) &&
                                    !kitchenSummery
                                ) && (
                                        <Box mt={3} display="flex" gap={3}>
                                            <label style={{ display: "flex", alignItems: "center" }}>
                                                <input
                                                    type="checkbox"
                                                    checked={data.is_dinner_tray_service === 1}
                                                    onChange={e => {
                                                        setData(prev => ({
                                                            ...prev,
                                                            is_dinner_tray_service: e.target.checked ? 1 : 0
                                                        }));
                                                    }}
                                                />
                                                <span style={{ marginLeft: 5 }}>{langObj.trayService}</span>
                                            </label>
                                            <label style={{ display: "flex", alignItems: "center" }}>
                                                <input
                                                    type="checkbox"
                                                    checked={data.is_dinner_escort_service === 1}
                                                    onChange={e => {
                                                        setData(prev => ({
                                                            ...prev,
                                                            is_dinner_escort_service: e.target.checked ? 1 : 0
                                                        }));
                                                    }}
                                                />
                                                <span style={{ marginLeft: 5 }}>{langObj.escortService}</span>
                                            </label>
                                            <label style={{ display: "flex", alignItems: "center" }}>
                                                <input type="checkbox" />
                                                <span style={{ marginLeft: 5 }}>{langObj.Takeout}</span>
                                            </label>
                                        </Box>
                                    )}

                                {showDinnerGuideline && (
                                    <>
                                        <hr />
                                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                                            {userData?.langCode === "cn" && userData?.dinner_guideline_cn && userData?.dinner_guideline_cn.trim() !== ""
                                                ? userData?.dinner_guideline_cn
                                                : userData?.dinner_guideline}
                                        </Typography>
                                    </>
                                )}

                                {Array.isArray(data.dinnerCategories) && data.dinnerCategories.length === 0 && (
                                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                                        {langObj.dinnerMenuWarn}
                                    </Typography>
                                )}

                                {kitchenSummery && (
                                    <Box mt={3} display="flex" justifyContent="center">
                                        <CustomButton
                                            onClick={() => navigate('/report')}
                                            endIcon={<ArrowForwardIosOutlined />}
                                            sx={{
                                                bgcolor: colors.blueAccent[50],
                                                color: colors.blueAccent[700],
                                                "&:hover": {
                                                    bgcolor: colors.blueAccent[100],
                                                    color: colors.blueAccent[800],
                                                },
                                                padding: "10px 32px",
                                                boxShadow: "none",
                                                borderRadius: "30px",
                                                border: "none",
                                                borderRadius: 4,
                                                fontWeight: 600,
                                                fontSize: 16,
                                                cursor: "pointer",
                                                width: 'auto'
                                            }}
                                        >
                                            {langObj.viewReport}
                                        </CustomButton>
                                    </Box>
                                )}

                                {tabIndex === 2 &&
                                    Array.isArray(data.dinnerCategories) &&
                                    data.dinnerCategories.some(cat =>
                                        (cat.entreeItems && cat.entreeItems.some(item => item.qty > 0)) ||
                                        (cat.alternativeItems && cat.alternativeItems.some(item => item.qty > 0))
                                    ) &&
                                    !kitchenSummery && (
                                        <Box mt={3} display="flex" justifyContent="center">
                                            <CustomButton
                                                sx={{
                                                    padding: "10px 32px",
                                                    bgcolor: colors.blueAccent[700],
                                                    color: "#fcfcfc",
                                                    border: "none",
                                                    borderRadius: 4,
                                                    fontWeight: 600,
                                                    fontSize: 16,
                                                    cursor: "pointer",
                                                    width: 'auto'
                                                }}
                                                disabled={isAfter12PM || isPast}
                                                onClick={() => {
                                                    submitData(data, date)
                                                }}
                                            >
                                                {langObj.submit}
                                            </CustomButton>
                                        </Box>
                                    )}
                            </Box>
                        )}
                    </>
                )}
            </Box>
        </Box>
    );
};

export default Order;
