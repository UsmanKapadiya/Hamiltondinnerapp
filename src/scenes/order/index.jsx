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
import { EditOutlined, EmojiPeopleOutlined } from "@mui/icons-material";

let breakFastEndTime = 10;
let lunchEndTime = 15;
let dinnerEndTime = 24;
const MAX_MEAL_QTY = 2;


const Order = () => {

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const location = useLocation();
    const navigate = useNavigate();
    const roomNo = location.state?.roomNo;
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

    const [userData] = useState(() => {
        const userDatas = localStorage.getItem("userData");
        return userDatas ? JSON.parse(userDatas) : null;
    });

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
                console.log("meal", meal);
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
        //console.log(mealSelections)
        let obj = mealSelections?.find((x) => x.date === date.format("YYYY-MM-DD"));
        //console.log(obj)
        if (obj === undefined) {
            fetchMenuDetails(date.format("YYYY-MM-DD"));
        }
    }, [date]);


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
        const breakfastCat = mealData.breakfast?.[0];
        const breakfast = breakfastCat?.items || [];
        const breakFastDailySpecialCatName = breakfastCat?.cat_name || "";
        const breakFastAlternativeCat = breakfast.find(item => item.type === "sub_cat");
        const breakFastAlternativeCatName = breakFastAlternativeCat?.item_name || "";
        const breakFastDailySpecial = breakfast
            .filter(item => item.type === "item")
            .map(item => ({
                id: item.item_id,
                name: item.item_name,
                chinese_name: item.chinese_name,
                qty: item.qty,
                options: selectFirstOption(item.options),
                preference: item.preference,
                order_id: item?.order_id
            }));
        const breakFastAlternative = breakfast
            .filter(item => item.type === "sub_cat_item")
            .map(item => ({
                id: item.item_id,
                name: item.item_name,
                chinese_name: item.chinese_name,
                qty: item.qty,
                options: selectFirstOption(item.options),
                preference: item.preference,
                order_id: item?.order_id
            }));
        const is_brk_escort_service = mealData?.is_brk_escort_service
        const is_brk_tray_service = mealData?.is_brk_tray_service

        const lunchSoupCatName = mealData.lunch?.[0]?.cat_name || "";
        const lunchEntreeCatName = mealData.lunch?.[1]?.cat_name || "";
        const lunchAlternativeCat = mealData.lunch?.[1]?.items?.find(item => item.type === "sub_cat");
        const lunchAlternativeCatName = lunchAlternativeCat?.item_name || "";
        const lunchSoup = mealData.lunch?.[0]?.items?.map(item => ({
            id: item.item_id,
            name: item.item_name,
            chinese_name: item.chinese_name,
            qty: item.qty,
            options: selectFirstOption(item.options),
            preference: item.preference,
            order_id: item?.order_id
        })) || [];
        const lunchEntree = mealData.lunch?.[1]?.items
            ?.filter(item => item.type === "item")
            .map(item => ({
                id: item.item_id,
                name: item.item_name,
                chinese_name: item.chinese_name,
                qty: item.qty,
                options: selectFirstOption(item.options),
                preference: item.preference,
                order_id: item?.order_id
            })) || [];
        const lunchAlternative = mealData.lunch?.[1]?.items
            ?.filter(item => item.type === "sub_cat_item")
            .map(item => ({
                id: item.item_id,
                name: item.item_name,
                chinese_name: item.chinese_name,
                qty: item.qty,
                options: selectFirstOption(item.options),
                preference: item.preference,
                order_id: item?.order_id
            })) || [];
        const is_lunch_escort_service = mealData?.is_lunch_escort_service
        const is_lunch_tray_service = mealData?.is_lunch_tray_service


        // Dinner
        const dinnerCat = mealData.dinner?.[0];
        const dinnerEntreeCatName = dinnerCat?.cat_name || "";
        const dinnerAlternativeCat = dinnerCat?.items?.find(item => item.type === "sub_cat");
        const dinnerAlternativeCatName = dinnerAlternativeCat?.item_name || "";
        const dinnerSoup = []; // If you have soup in dinner, extract it here
        const dinnerEntree = dinnerCat?.items
            ?.filter(item => item.type === "item")
            .map(item => ({
                id: item.item_id,
                name: item.item_name,
                chinese_name: item.chinese_name,
                qty: item.qty,
                options: selectFirstOption(item.options),
                preference: item.preference,
                order_id: item?.order_id
            })) || [];
        const dinnerAlternative = dinnerCat?.items
            ?.filter(item => item.type === "sub_cat_item")
            .map(item => ({
                id: item.item_id,
                name: item.item_name,
                chinese_name: item.chinese_name,
                qty: item.qty,
                options: selectFirstOption(item.options),
                preference: item.preference,
                order_id: item?.order_id
            })) || [];
        const is_dinner_escort_service = mealData?.is_dinner_escort_service
        const is_dinner_tray_service = mealData?.is_dinner_tray_service

        return {
            date: mealData.date,
            breakFastDailySpecialCatName,
            breakFastAlternativeCatName,
            breakFastDailySpecial,
            breakFastAlternative,
            lunchSoup,
            lunchSoupCatName,
            lunchEntree,
            lunchEntreeCatName,
            lunchAlternative,
            lunchAlternativeCatName,
            dinnerEntree,
            dinnerEntreeCatName,
            dinnerAlternative,
            dinnerAlternativeCatName,
            dinnerSoup,
            is_brk_escort_service,
            is_brk_tray_service,
            is_lunch_escort_service,
            is_lunch_tray_service,
            is_dinner_escort_service,
            is_dinner_tray_service,
        };
    }

    function buildOrderPayload(dataArray) {
        console.log("dataArray", dataArray)
        console.log("mealData", mealData)
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
            ...flatten(d.breakFastDailySpecial),
            ...flatten(d.breakFastAlternative),
            ...flatten(d.lunchSoup),
            ...flatten(d.lunchEntree),
            ...flatten(d.lunchAlternative),
            ...flatten(d.dinnerSoup),
            ...flatten(d.dinnerEntree),
            ...flatten(d.dinnerAlternative)
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

            if (items.length === 0) return null;

            return {
                date: data.date,
                room_id,
                is_for_guest: 1,
                is_brk_tray_service: data.is_brk_tray_service,
                is_lunch_tray_service: data.is_lunch_tray_service,
                is_dinner_tray_service: data.is_dinner_tray_service,
                items
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

    function updateOrderIdsInMealSelections(mealSelections, itemIds, orderIds) {
        return mealSelections.map(selection => {
            // Update all meal arrays inside each selection
            const updateItems = arr => (arr || []).map(item => {
                const idx = itemIds.indexOf(item.id);
                if (idx !== -1) {
                    return { ...item, order_id: orderIds[idx] };
                }
                return item;
            });

            return {
                ...selection,
                breakFastDailySpecial: updateItems(selection.breakFastDailySpecial),
                breakFastAlternative: updateItems(selection.breakFastAlternative),
                lunchSoup: updateItems(selection.lunchSoup),
                lunchEntree: updateItems(selection.lunchEntree),
                lunchAlternative: updateItems(selection.lunchAlternative),
                dinnerSoup: updateItems(selection.dinnerSoup),
                dinnerEntree: updateItems(selection.dinnerEntree),
                dinnerAlternative: updateItems(selection.dinnerAlternative),
            };
        });
    }

    const submitData = async (data, date) => {
        console.log("newMEalSelections", mealSelections)
        console.log("data", data)

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
            console.log("payload", payload);
            let response = await OrderServices.submitOrder(payload);
            if (response.ResponseText === "success") {
                toast.success("Order submitted successfully!");
                if (response?.item_id && response?.order_id) {
                    setMealSelections(prev => {
                        const updated = updateOrderIdsInMealSelections(prev, response.item_id, response.order_id);
                        // Remove duplicate dates, keeping the last occurrence
                        const uniqueByDate = [];
                        const seen = new Set();
                        for (let i = updated.length - 1; i >= 0; i--) {
                            const date = updated[i].date;
                            if (!seen.has(date)) {
                                uniqueByDate.unshift(updated[i]);
                                seen.add(date);
                            }
                        }
                        return uniqueByDate;
                    });
                }
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


    const totalBreakfastQty =
        (data.breakFastDailySpecial || []).reduce((sum, i) => sum + (i.qty || 0), 0) +
        (data.breakFastAlternative || []).reduce((sum, i) => sum + (i.qty || 0), 0);
    const totalLunchSoupQty = (data.lunchSoup || []).reduce((sum, i) => sum + (i.qty || 0), 0);
    const totalLunchQty =
        (data.lunchEntree || []).reduce((sum, i) => sum + (i.qty || 0), 0) +
        (data.lunchAlternative || []).reduce((sum, i) => sum + (i.qty || 0), 0);
    const totalDinnerSoupQty = (data.dinnerSoup || []).reduce((sum, i) => sum + (i.qty || 0), 0);
    const totalDinnerQty =
        (data.dinnerEntree || []).reduce((sum, i) => sum + (i.qty || 0), 0) +
        (data.dinnerAlternative || []).reduce((sum, i) => sum + (i.qty || 0), 0);

    console.log(mealData)
    return (
        <Box m="20px">
            <Header
                title={roomNo ? roomNo : userData?.room_id}
                icon={""}
                editRoomsDetails={userData?.role !== "kitchen" ? true : false}
                editIcon={<EditOutlined />}
                isGuest={true}
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
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                            label="Date"
                            value={date}
                            // onChange={(newValue) => setDate(newValue)}
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
                            <Tab label="Breakfast" />
                            <Tab label="Lunch" />
                            <Tab label="Dinner" />
                        </Tabs>
                        {tabIndex === 0 && (
                            <Box>

                                {/* Daily Special */}
                                {data.breakFastDailySpecial && data.breakFastDailySpecial.length > 0 && (
                                    <>
                                        <Typography
                                            variant="h6"
                                            sx={{
                                                mb: 2,
                                                fontWeight: 600,
                                                backgroundColor: "#f5f5f5",
                                                px: 2,
                                                py: 1,
                                                borderRadius: 1,
                                                display: "block",
                                                textAlign: "center"
                                            }}
                                        >
                                            {data.breakFastDailySpecialCatName}
                                        </Typography>
                                        {data.breakFastDailySpecial.map((item, idx) => (
                                            <Box key={item.id} mb={1}>
                                                <Box display="flex" alignItems="center" justifyContent="space-between">
                                                    <Typography>{item.name}</Typography>
                                                    <Box display="flex" alignItems="center">
                                                        <button
                                                            onClick={() =>
                                                                setData((prev) => ({
                                                                    ...prev,
                                                                    breakFastDailySpecial: prev.breakFastDailySpecial.map((i) =>
                                                                        i.id === item.id
                                                                            ? {
                                                                                ...i,
                                                                                qty: 0,
                                                                                options: (i.options || []).length > 0
                                                                                    ? i.options.map((opt, idx) => ({
                                                                                        ...opt,
                                                                                        is_selected: idx === 0 ? 1 : 0,
                                                                                    }))
                                                                                    : i.options,
                                                                                preference: (i.preference || []).map((p) => ({
                                                                                    ...p,
                                                                                    is_selected: 0,
                                                                                })),
                                                                            }
                                                                            : i
                                                                    ),
                                                                }))
                                                            }
                                                            style={{ marginRight: 8 }}
                                                            disabled={item.qty === 0 || isAfter10AM || isPast}
                                                        >
                                                            -
                                                        </button>
                                                        <Typography>{item.qty || 0}</Typography>
                                                        {/* <button
                                                            onClick={() =>
                                                                setData((prev) => ({
                                                                    ...prev,
                                                                    breakFastDailySpecial: prev.breakFastDailySpecial.map((i) =>
                                                                        i.id === item.id
                                                                            ? { ...i, qty: 1 }
                                                                            : { ...i, qty: 0 } // only single items selected 
                                                                    ),
                                                                }))
                                                            }
                                                            style={{ marginLeft: 8 }}
                                                            disabled={item.qty >= 1 || isAfter10AM || isPast}
                                                        >
                                                            +
                                                        </button> */}
                                                        <button
                                                            onClick={() =>
                                                                setData((prev) => ({
                                                                    ...prev,
                                                                    breakFastDailySpecial: prev.breakFastDailySpecial.map((i) =>
                                                                        i.id === item.id ? { ...i, qty: (i.qty || 0) + 1 } : i
                                                                    ),
                                                                }))
                                                            }
                                                            style={{ marginLeft: 8 }}
                                                            disabled={
                                                                item.qty >= MAX_MEAL_QTY ||
                                                                totalBreakfastQty >= MAX_MEAL_QTY ||
                                                                isAfter10AM ||
                                                                isPast
                                                            }
                                                        >
                                                            +
                                                        </button>
                                                    </Box>
                                                </Box>
                                                {/* Show options and preference if qty > 0 and available */}
                                                {(item.qty > 0) && ((item.options && item.options.length > 0) || (item.preference && item.preference.length > 0)) && (
                                                    <Box mt={1} ml={3}>
                                                        {item.options && item.options.length > 0 && (
                                                            <Box mb={1}>
                                                                {item.options.map((opt) => (
                                                                    <label key={opt.id} style={{ marginRight: 12 }}>
                                                                        <input
                                                                            type="radio"
                                                                            name={`option-${item.id}`}
                                                                            checked={!!opt.is_selected}
                                                                            onChange={() => {
                                                                                setData((prev) => ({
                                                                                    ...prev,
                                                                                    breakFastDailySpecial: prev.breakFastDailySpecial.map((i) =>
                                                                                        i.id === item.id
                                                                                            ? {
                                                                                                ...i,
                                                                                                options: i.options.map((o) =>
                                                                                                    o.id === opt.id
                                                                                                        ? { ...o, is_selected: 1 }
                                                                                                        : { ...o, is_selected: 0 }
                                                                                                ),
                                                                                            }
                                                                                            : i
                                                                                    ),
                                                                                }));
                                                                            }}
                                                                        />
                                                                        {opt.name}
                                                                    </label>
                                                                ))}
                                                            </Box>
                                                        )}
                                                        {/* Display Preference as checkboxes */}
                                                        {item.preference && item.preference.length > 0 && (
                                                            <Box>
                                                                {item.preference.map((pref) => (
                                                                    <label key={pref.id} style={{ marginRight: 12 }}>
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={!!pref.is_selected}
                                                                            onChange={() => {
                                                                                setData((prev) => ({
                                                                                    ...prev,
                                                                                    breakFastDailySpecial: prev.breakFastDailySpecial.map((i) =>
                                                                                        i.id === item.id
                                                                                            ? {
                                                                                                ...i,
                                                                                                preference: i.preference.map((p) =>
                                                                                                    p.id === pref.id
                                                                                                        ? { ...p, is_selected: p.is_selected ? 0 : 1 }
                                                                                                        : p
                                                                                                ),
                                                                                            }
                                                                                            : i
                                                                                    ),
                                                                                }));
                                                                            }}
                                                                        />
                                                                        {pref.name}
                                                                    </label>
                                                                ))}
                                                            </Box>
                                                        )}
                                                    </Box>
                                                )}
                                            </Box>
                                        ))}
                                    </>
                                )}

                                {/* Alternatives  */}
                                {data.breakFastAlternative && data.breakFastAlternative.length > 0 && (
                                    <>
                                        <Typography variant="h6" sx={{ mt: 3, mb: 2, fontWeight: 600 }}>
                                            {data.breakFastAlternativeCatName}
                                        </Typography>
                                        {data.breakFastAlternative.map((item) => (
                                            <Box key={item.id} mb={1}>
                                                <Box display="flex" alignItems="center" justifyContent="space-between">
                                                    <Typography>{item.name}</Typography>
                                                    <Box display="flex" alignItems="center">
                                                        <button
                                                            onClick={() =>
                                                                setData((prev) => ({
                                                                    ...prev,
                                                                    breakFastAlternative: prev.breakFastAlternative.map((i) =>
                                                                        i.id === item.id
                                                                            ? {
                                                                                ...i,
                                                                                qty: Math.max((i.qty || 0) - 1, 0),
                                                                                options: (i.options || []).length > 0
                                                                                    ? i.options.map((opt, idx) => ({
                                                                                        ...opt,
                                                                                        is_selected: idx === 0 ? 1 : 0,
                                                                                    }))
                                                                                    : i.options,
                                                                                preference: (i.preference || []).map((p) => ({
                                                                                    ...p,
                                                                                    is_selected: 0,
                                                                                })),
                                                                            }
                                                                            : i
                                                                    ),
                                                                }))
                                                            }
                                                            style={{ marginRight: 8 }}
                                                            disabled={item.qty === 0 || isAfter10AM || isPast}
                                                        >
                                                            -
                                                        </button>
                                                        <Typography>{item.qty || 0}</Typography>
                                                        {/* <button
                                                            onClick={() =>
                                                                setData((prev) => ({
                                                                    ...prev,
                                                                    breakFastAlternative: prev.breakFastAlternative.map((i) =>
                                                                        i.id === item.id
                                                                            ? { ...i, qty: 1 }
                                                                            : { ...i, qty: 0 } // only single items selected 
                                                                    ),
                                                                }))
                                                            }
                                                            style={{ marginLeft: 8 }}
                                                            disabled={item.qty >= 1 || isAfter10AM || isPast}
                                                        >
                                                            +
                                                        </button> */}
                                                        <button
                                                            onClick={() =>
                                                                setData((prev) => ({
                                                                    ...prev,
                                                                    breakFastAlternative: prev.breakFastAlternative.map((i) =>
                                                                        i.id === item.id ? { ...i, qty: (i.qty || 0) + 1 } : i
                                                                    ),
                                                                }))
                                                            }
                                                            style={{ marginLeft: 8 }}
                                                            disabled={
                                                                item.qty >= MAX_MEAL_QTY ||
                                                                totalBreakfastQty >= MAX_MEAL_QTY ||
                                                                isAfter10AM ||
                                                                isPast
                                                            }
                                                        >
                                                            +
                                                        </button>
                                                    </Box>
                                                </Box>
                                                {/* Show options and preference if qty > 0 and available */}
                                                {(item.qty > 0) && ((item.options && item.options.length > 0) || (item.preference && item.preference.length > 0)) && (
                                                    <Box mt={1} ml={3}>
                                                        {item.options && item.options.length > 0 && (
                                                            <Box mb={1}>
                                                                {item.options.map((opt) => (
                                                                    <label key={opt.id} style={{ marginRight: 12 }}>
                                                                        <input
                                                                            type="radio"
                                                                            name={`breakfast-alt-option-${item.id}`}
                                                                            checked={!!opt.is_selected}
                                                                            onChange={() => {
                                                                                setData((prev) => ({
                                                                                    ...prev,
                                                                                    breakFastAlternative: prev.breakFastAlternative.map((i) =>
                                                                                        i.id === item.id
                                                                                            ? {
                                                                                                ...i,
                                                                                                options: i.options.map((o) =>
                                                                                                    o.id === opt.id
                                                                                                        ? { ...o, is_selected: 1 }
                                                                                                        : { ...o, is_selected: 0 }
                                                                                                ),
                                                                                            }
                                                                                            : i
                                                                                    ),
                                                                                }));
                                                                            }}
                                                                        />
                                                                        {opt.name}
                                                                    </label>
                                                                ))}
                                                            </Box>
                                                        )}
                                                        {item.preference && item.preference.length > 0 && (
                                                            <Box>
                                                                {item.preference.map((pref) => (
                                                                    <label key={pref.id} style={{ marginRight: 12 }}>
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={!!pref.is_selected}
                                                                            onChange={() => {
                                                                                setData((prev) => ({
                                                                                    ...prev,
                                                                                    breakFastAlternative: prev.breakFastAlternative.map((i) =>
                                                                                        i.id === item.id
                                                                                            ? {
                                                                                                ...i,
                                                                                                preference: i.preference.map((p) =>
                                                                                                    p.id === pref.id
                                                                                                        ? { ...p, is_selected: p.is_selected ? 0 : 1 }
                                                                                                        : p
                                                                                                ),
                                                                                            }
                                                                                            : i
                                                                                    ),
                                                                                }));
                                                                            }}
                                                                        />
                                                                        {pref.name}
                                                                    </label>
                                                                ))}
                                                            </Box>
                                                        )}
                                                    </Box>
                                                )}
                                            </Box>
                                        ))}
                                    </>
                                )}
                                {/* Add Additional Services */}
                                {(
                                    (data.breakFastDailySpecial?.some(item => item.qty > 0) || data.breakFastAlternative?.some(item => item.qty > 0))
                                ) && (
                                        <Box mt={3}>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                                                Additional Services
                                            </Typography>
                                            <label>
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
                                                Escort Service
                                            </label>
                                            <label>
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
                                                Tray Service
                                            </label>
                                        </Box>
                                    )}
                                {/* Add Submit Button for BreakFast DataSubmit */}
                                {(
                                    (data.breakFastDailySpecial?.some(item => item.qty > 0) || data.breakFastAlternative?.some(item => item.qty > 0))
                                ) && (
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
                                                onClick={() => {
                                                    submitData(data, date)
                                                }}
                                                disabled={isAfter10AM || isPast}
                                            >
                                                Submit Order
                                            </CustomButton>
                                        </Box>
                                        // ...existing code...
                                    )}
                            </Box>
                        )}

                        {tabIndex === 1 && (
                            <Box>
                                {/* Soup */}
                                {data.lunchSoup && data.lunchSoup.length > 0 && (
                                    <>
                                        <Typography variant="h6"
                                            sx={{
                                                mb: 2,
                                                fontWeight: 600,
                                                backgroundColor: "#f5f5f5",
                                                px: 2,
                                                py: 1,
                                                borderRadius: 1,
                                                display: "block",
                                                textAlign: "center"
                                            }}>
                                            {data.lunchSoupCatName}
                                        </Typography>
                                        {data.lunchSoup.map((item) => (
                                            <Box key={item.id} mb={1}>
                                                <Box display="flex" alignItems="center" justifyContent="space-between">
                                                    <Typography>{item.name}</Typography>
                                                    <Box display="flex" alignItems="center">
                                                        <button
                                                            onClick={() =>
                                                                setData((prev) => ({
                                                                    ...prev,
                                                                    lunchSoup: prev.lunchSoup.map((i) =>
                                                                        i.id === item.id
                                                                            ? {
                                                                                ...i,
                                                                                qty: Math.max((i.qty || 0) - 1, 0),
                                                                                options: (i.options || []).length > 0
                                                                                    ? i.options.map((opt, idx) => ({
                                                                                        ...opt,
                                                                                        is_selected: idx === 0 ? 1 : 0,
                                                                                    }))
                                                                                    : i.options,
                                                                                preference: (i.preference || []).map((p) => ({
                                                                                    ...p,
                                                                                    is_selected: 0,
                                                                                })),
                                                                            }
                                                                            : i
                                                                    ),
                                                                }))
                                                            }
                                                            style={{ marginRight: 8 }}
                                                            disabled={item.qty === 0 || isAfter3PM || isPast}
                                                        >
                                                            -
                                                        </button>
                                                        <Typography>{item.qty || 0}</Typography>
                                                        <button
                                                            onClick={() =>
                                                                setData((prev) => ({
                                                                    ...prev,
                                                                    lunchSoup: prev.lunchSoup.map((i) =>
                                                                        i.id === item.id ? { ...i, qty: (i.qty || 0) + 1 } : i
                                                                    ),
                                                                }))
                                                            }
                                                            style={{ marginLeft: 8 }}
                                                            disabled={
                                                                item.qty >= MAX_MEAL_QTY ||
                                                                totalLunchSoupQty >= MAX_MEAL_QTY ||
                                                                isAfter3PM ||
                                                                isPast
                                                            }
                                                        >
                                                            +
                                                        </button>
                                                    </Box>
                                                </Box>
                                                {/* Show options and preference if qty > 0 and available */}
                                                {(item.qty > 0) && ((item.options && item.options.length > 0) || (item.preference && item.preference.length > 0)) && (
                                                    <Box mt={1} ml={3}>
                                                        {item.options && item.options.length > 0 && (
                                                            <Box mb={1}>
                                                                {item.options.map((opt) => (
                                                                    <label key={opt.id} style={{ marginRight: 12 }}>
                                                                        <input
                                                                            type="radio"
                                                                            name={`lunch-soup-option-${item.id}`}
                                                                            checked={!!opt.is_selected}
                                                                            onChange={() => {
                                                                                setData((prev) => ({
                                                                                    ...prev,
                                                                                    lunchSoup: prev.lunchSoup.map((i) =>
                                                                                        i.id === item.id
                                                                                            ? {
                                                                                                ...i,
                                                                                                options: i.options.map((o) =>
                                                                                                    o.id === opt.id
                                                                                                        ? { ...o, is_selected: 1 }
                                                                                                        : { ...o, is_selected: 0 }
                                                                                                ),
                                                                                            }
                                                                                            : i
                                                                                    ),
                                                                                }));
                                                                            }}
                                                                        />
                                                                        {opt.name}
                                                                    </label>
                                                                ))}
                                                            </Box>
                                                        )}
                                                        {item.preference && item.preference.length > 0 && (
                                                            <Box>
                                                                {item.preference.map((pref) => (
                                                                    <label key={pref.id} style={{ marginRight: 12 }}>
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={!!pref.is_selected}
                                                                            onChange={() => {
                                                                                setData((prev) => ({
                                                                                    ...prev,
                                                                                    lunchSoup: prev.lunchSoup.map((i) =>
                                                                                        i.id === item.id
                                                                                            ? {
                                                                                                ...i,
                                                                                                preference: i.preference.map((p) =>
                                                                                                    p.id === pref.id
                                                                                                        ? { ...p, is_selected: p.is_selected ? 0 : 1 }
                                                                                                        : p
                                                                                                ),
                                                                                            }
                                                                                            : i
                                                                                    ),
                                                                                }));
                                                                            }}
                                                                        />
                                                                        {pref.name}
                                                                    </label>
                                                                ))}
                                                            </Box>
                                                        )}
                                                    </Box>
                                                )}
                                            </Box>
                                        ))}
                                    </>
                                )}

                                {/* Entree  */}
                                {data.lunchEntree && data.lunchEntree.length > 0 && (
                                    <>
                                        <Typography variant="h6"
                                            sx={{
                                                mb: 2,
                                                fontWeight: 600,
                                                backgroundColor: "#f5f5f5",
                                                px: 2,
                                                py: 1,
                                                borderRadius: 1,
                                                display: "block",
                                                textAlign: "center"
                                            }}>
                                            {data.lunchEntreeCatName}
                                        </Typography>
                                        {data.lunchEntree.map((item) => (
                                            <Box key={item.id} mb={1}>
                                                <Box display="flex" alignItems="center" justifyContent="space-between">
                                                    <Typography>{item.name}</Typography>
                                                    <Box display="flex" alignItems="center">
                                                        <button
                                                            onClick={() =>
                                                                setData((prev) => ({
                                                                    ...prev,
                                                                    lunchEntree: prev.lunchEntree.map((i) =>
                                                                        i.id === item.id
                                                                            ? {
                                                                                ...i,
                                                                                qty: Math.max((i.qty || 0) - 1, 0),
                                                                                options: (i.options || []).length > 0
                                                                                    ? i.options.map((opt, idx) => ({
                                                                                        ...opt,
                                                                                        is_selected: idx === 0 ? 1 : 0,
                                                                                    }))
                                                                                    : i.options,
                                                                                preference: (i.preference || []).map((p) => ({
                                                                                    ...p,
                                                                                    is_selected: 0,
                                                                                })),
                                                                            }
                                                                            : i
                                                                    ),
                                                                }))
                                                            }
                                                            style={{ marginRight: 8 }}
                                                            disabled={item.qty === 0 || isAfter3PM || isPast}
                                                        >
                                                            -
                                                        </button>
                                                        <Typography>{item.qty || 0}</Typography>
                                                        {/* <button
                                                            onClick={() =>
                                                                setData((prev) => ({
                                                                    ...prev,
                                                                    lunchEntree: prev.lunchEntree.map((i) =>
                                                                        i.id === item.id ? { ...i, qty: 1 } : { ...i, qty: 0 }
                                                                    ),
                                                                    lunchAlternative: prev.lunchAlternative.map((i) => ({ ...i, qty: 0 })),
                                                                }))
                                                            }
                                                            style={{ marginLeft: 8 }}
                                                            disabled={item.qty >= 1 || isAfter3PM || isPast}
                                                        >
                                                            +
                                                        </button> */}
                                                        <button
                                                            onClick={() =>
                                                                setData((prev) => ({
                                                                    ...prev,
                                                                    lunchEntree: prev.lunchEntree.map((i) =>
                                                                        i.id === item.id ? { ...i, qty: (i.qty || 0) + 1 } : i
                                                                    ),
                                                                }))
                                                            }
                                                            style={{ marginLeft: 8 }}
                                                            disabled={
                                                                item.qty >= MAX_MEAL_QTY ||
                                                                totalLunchQty >= MAX_MEAL_QTY ||
                                                                isAfter3PM ||
                                                                isPast
                                                            }
                                                        >
                                                            +
                                                        </button>
                                                    </Box>
                                                </Box>
                                                {/* Show options and preference if qty > 0 and available */}
                                                {(item.qty > 0) && ((item.options && item.options.length > 0) || (item.preference && item.preference.length > 0)) && (
                                                    <Box mt={1} ml={3}>
                                                        {item.options && item.options.length > 0 && (
                                                            <Box mb={1}>
                                                                {item.options.map((opt) => (
                                                                    <label key={opt.id} style={{ marginRight: 12 }}>
                                                                        <input
                                                                            type="radio"
                                                                            name={`lunch-entree-option-${item.id}`}
                                                                            checked={!!opt.is_selected}
                                                                            onChange={() => {
                                                                                setData((prev) => ({
                                                                                    ...prev,
                                                                                    lunchEntree: prev.lunchEntree.map((i) =>
                                                                                        i.id === item.id
                                                                                            ? {
                                                                                                ...i,
                                                                                                options: i.options.map((o) =>
                                                                                                    o.id === opt.id
                                                                                                        ? { ...o, is_selected: 1 }
                                                                                                        : { ...o, is_selected: 0 }
                                                                                                ),
                                                                                            }
                                                                                            : i
                                                                                    ),
                                                                                }));
                                                                            }}
                                                                        />
                                                                        {opt.name}
                                                                    </label>
                                                                ))}
                                                            </Box>
                                                        )}
                                                        {item.preference && item.preference.length > 0 && (
                                                            <Box>
                                                                {item.preference.map((pref) => (
                                                                    <label key={pref.id} style={{ marginRight: 12 }}>
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={!!pref.is_selected}
                                                                            onChange={() => {
                                                                                setData((prev) => ({
                                                                                    ...prev,
                                                                                    lunchEntree: prev.lunchEntree.map((i) =>
                                                                                        i.id === item.id
                                                                                            ? {
                                                                                                ...i,
                                                                                                preference: i.preference.map((p) =>
                                                                                                    p.id === pref.id
                                                                                                        ? { ...p, is_selected: p.is_selected ? 0 : 1 }
                                                                                                        : p
                                                                                                ),
                                                                                            }
                                                                                            : i
                                                                                    ),
                                                                                }));
                                                                            }}
                                                                        />
                                                                        {pref.name}
                                                                    </label>
                                                                ))}
                                                            </Box>
                                                        )}
                                                    </Box>
                                                )}
                                            </Box>
                                        ))}
                                    </>
                                )}
                                {/* Alternatives  */}
                                {data.lunchAlternative && data.lunchAlternative.length > 0 && (
                                    <>
                                        <Typography variant="h6" sx={{ mt: 3, mb: 2, fontWeight: 600 }}>
                                            {data.lunchAlternativeCatName}
                                        </Typography>
                                        {data.lunchAlternative.map((item) => (
                                            <Box key={item.id} mb={1}>
                                                <Box display="flex" alignItems="center" justifyContent="space-between">
                                                    <Typography>{item.name}</Typography>
                                                    <Box display="flex" alignItems="center">
                                                        <button
                                                            onClick={() =>
                                                                setData((prev) => ({
                                                                    ...prev,
                                                                    lunchAlternative: prev.lunchAlternative.map((i) =>
                                                                        i.id === item.id
                                                                            ? {
                                                                                ...i,
                                                                                qty: Math.max((i.qty || 0) - 1, 0),
                                                                                options: (i.options || []).length > 0
                                                                                    ? i.options.map((opt, idx) => ({
                                                                                        ...opt,
                                                                                        is_selected: idx === 0 ? 1 : 0,
                                                                                    }))
                                                                                    : i.options,
                                                                                preference: (i.preference || []).map((p) => ({
                                                                                    ...p,
                                                                                    is_selected: 0,
                                                                                })),
                                                                            }
                                                                            : i
                                                                    ),
                                                                }))
                                                            }
                                                            style={{ marginRight: 8 }}
                                                            disabled={item.qty === 0 || isAfter3PM || isPast}
                                                        >
                                                            -
                                                        </button>
                                                        <Typography>{item.qty || 0}</Typography>
                                                        {/* <button
                                                            onClick={() =>
                                                                setData((prev) => ({
                                                                    ...prev,
                                                                    lunchAlternative: prev.lunchAlternative.map((i) =>
                                                                        i.id === item.id ? { ...i, qty: 1 } : { ...i, qty: 0 }
                                                                    ),
                                                                    lunchEntree: prev.lunchEntree.map((i) => ({ ...i, qty: 0 })),
                                                                }))
                                                            }
                                                            style={{ marginLeft: 8 }}
                                                            disabled={item.qty >= 1 || isAfter3PM || isPast}
                                                        >
                                                            +
                                                        </button> */}
                                                        <button
                                                            onClick={() =>
                                                                setData((prev) => ({
                                                                    ...prev,
                                                                    lunchAlternative: prev.lunchAlternative.map((i) =>
                                                                        i.id === item.id ? { ...i, qty: (i.qty || 0) + 1 } : i
                                                                    ),
                                                                }))
                                                            }
                                                            style={{ marginLeft: 8 }}
                                                            disabled={
                                                                item.qty >= MAX_MEAL_QTY ||
                                                                totalLunchQty >= MAX_MEAL_QTY ||
                                                                isAfter3PM ||
                                                                isPast
                                                            }
                                                        >
                                                            +
                                                        </button>
                                                    </Box>
                                                </Box>
                                                {/* Show options and preference if qty > 0 and available */}
                                                {(item.qty > 0) && ((item.options && item.options.length > 0) || (item.preference && item.preference.length > 0)) && (
                                                    <Box mt={1} ml={3}>
                                                        {item.options && item.options.length > 0 && (
                                                            <Box mb={1}>
                                                                {item.options.map((opt) => (
                                                                    <label key={opt.id} style={{ marginRight: 12 }}>
                                                                        <input
                                                                            type="radio"
                                                                            name={`lunch-alt-option-${item.id}`}
                                                                            checked={!!opt.is_selected}
                                                                            onChange={() => {
                                                                                setData((prev) => ({
                                                                                    ...prev,
                                                                                    lunchAlternative: prev.lunchAlternative.map((i) =>
                                                                                        i.id === item.id
                                                                                            ? {
                                                                                                ...i,
                                                                                                options: i.options.map((o) =>
                                                                                                    o.id === opt.id
                                                                                                        ? { ...o, is_selected: 1 }
                                                                                                        : { ...o, is_selected: 0 }
                                                                                                ),
                                                                                            }
                                                                                            : i
                                                                                    ),
                                                                                }));
                                                                            }}
                                                                        />
                                                                        {opt.name}
                                                                    </label>
                                                                ))}
                                                            </Box>
                                                        )}
                                                        {item.preference && item.preference.length > 0 && (
                                                            <Box>
                                                                {item.preference.map((pref) => (
                                                                    <label key={pref.id} style={{ marginRight: 12 }}>
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={!!pref.is_selected}
                                                                            onChange={() => {
                                                                                setData((prev) => ({
                                                                                    ...prev,
                                                                                    lunchAlternative: prev.lunchAlternative.map((i) =>
                                                                                        i.id === item.id
                                                                                            ? {
                                                                                                ...i,
                                                                                                preference: i.preference.map((p) =>
                                                                                                    p.id === pref.id
                                                                                                        ? { ...p, is_selected: p.is_selected ? 0 : 1 }
                                                                                                        : p
                                                                                                ),
                                                                                            }
                                                                                            : i
                                                                                    ),
                                                                                }));
                                                                            }}
                                                                        />
                                                                        {pref.name}
                                                                    </label>
                                                                ))}
                                                            </Box>
                                                        )}
                                                    </Box>
                                                )}
                                            </Box>
                                        ))}
                                    </>
                                )}
                                {/* Add Lunch Additional Services */}
                                {(
                                    (data.lunchSoup?.some(item => item.qty > 0) ||
                                        data.lunchEntree?.some(item => item.qty > 0) ||
                                        data.lunchAlternative?.some(item => item.qty > 0))
                                ) && (
                                        <Box mt={3}>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                                                Additional Services
                                            </Typography>
                                            <label>
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
                                                Escort Service
                                            </label>
                                            <label>
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
                                                Tray Service
                                            </label>
                                        </Box>
                                    )}
                                {/* Add lunch submit button,  if breakfast not submited then here breakfast and lunch submited */}
                                {(
                                    (data.lunchSoup?.some(item => item.qty > 0) ||
                                        data.lunchEntree?.some(item => item.qty > 0) ||
                                        data.lunchAlternative?.some(item => item.qty > 0))
                                ) && (
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
                                                disabled={isAfter3PM}
                                                onClick={() => {
                                                    submitData(data, date)
                                                }}
                                            >
                                                Submit Order
                                            </CustomButton>
                                        </Box>
                                    )}
                            </Box>
                        )}

                        {tabIndex === 2 && (
                            <Box>
                                {/* Dinner soup */}
                                {data.dinnerSoup && data.dinnerSoup.length > 0 && (
                                    <>
                                        <Typography variant="h6"
                                            sx={{
                                                mb: 2,
                                                fontWeight: 600,
                                                backgroundColor: "#f5f5f5",
                                                px: 2,
                                                py: 1,
                                                borderRadius: 1,
                                                display: "block",
                                                textAlign: "center"
                                            }}>
                                            {data.dinnerSoupCatName || "Soup"}
                                        </Typography>
                                        {data.dinnerSoup.map((item) => (
                                            <Box key={item.id} display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                                                <Typography>{item.name}</Typography>
                                                <Box display="flex" alignItems="center">
                                                    <button
                                                        onClick={() =>
                                                            setData((prev) => ({
                                                                ...prev,
                                                                dinnerSoup: prev.dinnerSoup.map((i) =>
                                                                    i.id === item.id
                                                                        ? { ...i, qty: Math.max((i.qty || 0) - 1, 0) }
                                                                        : i
                                                                ),
                                                            }))
                                                        }
                                                        style={{ marginRight: 8 }}
                                                        disabled={item.qty === 0 || isAfter12PM || isPast}
                                                    >
                                                        -
                                                    </button>
                                                    <Typography>{item.qty || 0}</Typography>
                                                    <button
                                                        onClick={() =>
                                                            setData((prev) => ({
                                                                ...prev,
                                                                dinnerSoup: prev.dinnerSoup.map((i) =>
                                                                    i.id === item.id ? { ...i, qty: (i.qty || 0) + 1 } : i
                                                                ),
                                                            }))
                                                        }
                                                        style={{ marginLeft: 8 }}
                                                        disabled={
                                                            item.qty >= MAX_MEAL_QTY ||
                                                            totalDinnerSoupQty >= MAX_MEAL_QTY ||
                                                            isAfter12PM ||
                                                            isPast
                                                        }
                                                    >
                                                        +
                                                    </button>
                                                </Box>
                                            </Box>
                                        ))}
                                    </>
                                )}

                                {/* Entree */}
                                {data.dinnerEntree && data.dinnerEntree.length > 0 && (
                                    <>
                                        <Typography variant="h6" sx={{
                                            mb: 2,
                                            fontWeight: 600,
                                            backgroundColor: "#f5f5f5",
                                            px: 2,
                                            py: 1,
                                            borderRadius: 1,
                                            display: "block",
                                            textAlign: "center"
                                        }}>
                                            {data.dinnerEntreeCatName}
                                        </Typography>
                                        {data.dinnerEntree.map((item) => (
                                            <Box key={item.id} mb={1}>
                                                <Box display="flex" alignItems="center" justifyContent="space-between">
                                                    <Typography>{item.name}</Typography>
                                                    <Box display="flex" alignItems="center">
                                                        <button
                                                            onClick={() =>
                                                                // setData((prev) => ({
                                                                //     ...prev,
                                                                //     dinnerEntree: prev.dinnerEntree.map((i) =>
                                                                //         i.id === item.id
                                                                //             ? { ...i, qty: Math.max((i.qty || 0) - 1, 0) }
                                                                //             : i
                                                                //     ),
                                                                // }))
                                                                setData((prev) => ({
                                                                    ...prev,
                                                                    dinnerEntree: prev.dinnerEntree.map((i) =>
                                                                        i.id === item.id
                                                                            ? {
                                                                                ...i,
                                                                                qty: Math.max((i.qty || 0) - 1, 0),
                                                                                options: (i.options || []).length > 0
                                                                                    ? i.options.map((opt, idx) => ({
                                                                                        ...opt,
                                                                                        is_selected: idx === 0 ? 1 : 0,
                                                                                    }))
                                                                                    : i.options,
                                                                                preference: (i.preference || []).map((p) => ({
                                                                                    ...p,
                                                                                    is_selected: 0,
                                                                                })),
                                                                            }
                                                                            : i
                                                                    ),
                                                                }))
                                                            }
                                                            style={{ marginRight: 8 }}
                                                            disabled={item.qty === 0 || isAfter12PM || isPast}
                                                        >
                                                            -
                                                        </button>
                                                        <Typography>{item.qty || 0}</Typography>
                                                        <button
                                                            onClick={() =>
                                                                setData((prev) => ({
                                                                    ...prev,
                                                                    dinnerEntree: prev.dinnerEntree.map((i) =>
                                                                        i.id === item.id ? { ...i, qty: (i.qty || 0) + 1 } : i
                                                                    ),
                                                                }))
                                                            }
                                                            style={{ marginLeft: 8 }}
                                                            disabled={
                                                                item.qty >= MAX_MEAL_QTY ||
                                                                totalDinnerQty >= MAX_MEAL_QTY ||
                                                                isAfter12PM ||
                                                                isPast
                                                            }
                                                        >
                                                            +
                                                        </button>
                                                    </Box>
                                                </Box>
                                                {/* Show options and preference if qty > 0 and available */}
                                                {(item.qty > 0) && ((item.options && item.options.length > 0) || (item.preference && item.preference.length > 0)) && (
                                                    <Box mt={1} ml={3}>
                                                        {item.options && item.options.length > 0 && (
                                                            <Box mb={1}>
                                                                {item.options.map((opt) => (
                                                                    <label key={opt.id} style={{ marginRight: 12 }}>
                                                                        <input
                                                                            type="radio"
                                                                            name={`dinner-entree-option-${item.id}`}
                                                                            checked={!!opt.is_selected}
                                                                            onChange={() => {
                                                                                setData((prev) => ({
                                                                                    ...prev,
                                                                                    dinnerEntree: prev.dinnerEntree.map((i) =>
                                                                                        i.id === item.id
                                                                                            ? {
                                                                                                ...i,
                                                                                                options: i.options.map((o) =>
                                                                                                    o.id === opt.id
                                                                                                        ? { ...o, is_selected: 1 }
                                                                                                        : { ...o, is_selected: 0 }
                                                                                                ),
                                                                                            }
                                                                                            : i
                                                                                    ),
                                                                                }));
                                                                            }}
                                                                        />
                                                                        {opt.name}
                                                                    </label>
                                                                ))}
                                                            </Box>
                                                        )}
                                                        {item.preference && item.preference.length > 0 && (
                                                            <Box>
                                                                {item.preference.map((pref) => (
                                                                    <label key={pref.id} style={{ marginRight: 12 }}>
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={!!pref.is_selected}
                                                                            onChange={() => {
                                                                                setData((prev) => ({
                                                                                    ...prev,
                                                                                    dinnerEntree: prev.dinnerEntree.map((i) =>
                                                                                        i.id === item.id
                                                                                            ? {
                                                                                                ...i,
                                                                                                preference: i.preference.map((p) =>
                                                                                                    p.id === pref.id
                                                                                                        ? { ...p, is_selected: p.is_selected ? 0 : 1 }
                                                                                                        : p
                                                                                                ),
                                                                                            }
                                                                                            : i
                                                                                    ),
                                                                                }));
                                                                            }}
                                                                        />
                                                                        {pref.name}
                                                                    </label>
                                                                ))}
                                                            </Box>
                                                        )}
                                                    </Box>
                                                )}
                                            </Box>
                                        ))}
                                    </>
                                )}

                                {/* Alternatives */}
                                {data.dinnerAlternative && data.dinnerAlternative.length > 0 && (
                                    <>
                                        <Typography variant="h6" sx={{ mt: 3, mb: 2, fontWeight: 600 }}>
                                            {data.dinnerAlternativeCatName}
                                        </Typography>
                                        {data.dinnerAlternative.map((item) => (
                                            <Box key={item.id} mb={1}>
                                                <Box display="flex" alignItems="center" justifyContent="space-between">
                                                    <Typography>{item.name}</Typography>
                                                    <Box display="flex" alignItems="center">
                                                        <button
                                                            onClick={() =>
                                                                // setData((prev) => ({
                                                                //     ...prev,
                                                                //     dinnerAlternative: prev.dinnerAlternative.map((i) =>
                                                                //         i.id === item.id
                                                                //             ? { ...i, qty: Math.max((i.qty || 0) - 1, 0) }
                                                                //             : i
                                                                //     ),
                                                                // }))
                                                                setData((prev) => ({
                                                                    ...prev,
                                                                    dinnerAlternative: prev.dinnerAlternative.map((i) =>
                                                                        i.id === item.id
                                                                            ? {
                                                                                ...i,
                                                                                qty: Math.max((i.qty || 0) - 1, 0),
                                                                                options: (i.options || []).length > 0
                                                                                    ? i.options.map((opt, idx) => ({
                                                                                        ...opt,
                                                                                        is_selected: idx === 0 ? 1 : 0,
                                                                                    }))
                                                                                    : i.options,
                                                                                preference: (i.preference || []).map((p) => ({
                                                                                    ...p,
                                                                                    is_selected: 0,
                                                                                })),
                                                                            }
                                                                            : i
                                                                    ),
                                                                }))
                                                            }
                                                            style={{ marginRight: 8 }}
                                                            disabled={item.qty === 0 || isAfter12PM || isPast}
                                                        >
                                                            -
                                                        </button>
                                                        <Typography>{item.qty || 0}</Typography>
                                                        {/* <button
                                                            onClick={() =>
                                                                setData((prev) => ({
                                                                    ...prev,
                                                                    dinnerAlternative: prev.dinnerAlternative.map((i) =>
                                                                        i.id === item.id ? { ...i, qty: 1 } : { ...i, qty: 0 }
                                                                    ),
                                                                    //  DinnerEntrese Items Remove
                                                                    dinnerEntree: prev.dinnerEntree.map((i) => ({ ...i, qty: 0 })),
                                                                }))
                                                            }
                                                            style={{ marginLeft: 8 }}
                                                            disabled={item.qty >= 1 || isAfter12PM || isPast}
                                                        >
                                                            +
                                                        </button> */}
                                                        <button
                                                            onClick={() =>
                                                                setData((prev) => ({
                                                                    ...prev,
                                                                    dinnerAlternative: prev.dinnerAlternative.map((i) =>
                                                                        i.id === item.id ? { ...i, qty: (i.qty || 0) + 1 } : i
                                                                    ),
                                                                }))
                                                            }
                                                            style={{ marginLeft: 8 }}
                                                            disabled={
                                                                item.qty >= MAX_MEAL_QTY ||
                                                                totalDinnerQty >= MAX_MEAL_QTY ||
                                                                isAfter12PM ||
                                                                isPast
                                                            }
                                                        >
                                                            +
                                                        </button>
                                                    </Box>
                                                </Box>
                                                {/* Show options and preference if qty > 0 and available */}
                                                {(item.qty > 0) && ((item.options && item.options.length > 0) || (item.preference && item.preference.length > 0)) && (
                                                    <Box mt={1} ml={3}>
                                                        {item.options && item.options.length > 0 && (
                                                            <Box mb={1}>
                                                                {item.options.map((opt) => (
                                                                    <label key={opt.id} style={{ marginRight: 12 }}>
                                                                        <input
                                                                            type="radio"
                                                                            name={`dinner-alt-option-${item.id}`}
                                                                            checked={!!opt.is_selected}
                                                                            onChange={() => {
                                                                                setData((prev) => ({
                                                                                    ...prev,
                                                                                    dinnerAlternative: prev.dinnerAlternative.map((i) =>
                                                                                        i.id === item.id
                                                                                            ? {
                                                                                                ...i,
                                                                                                options: i.options.map((o) =>
                                                                                                    o.id === opt.id
                                                                                                        ? { ...o, is_selected: 1 }
                                                                                                        : { ...o, is_selected: 0 }
                                                                                                ),
                                                                                            }
                                                                                            : i
                                                                                    ),
                                                                                }));
                                                                            }}
                                                                        />
                                                                        {opt.name}
                                                                    </label>
                                                                ))}
                                                            </Box>
                                                        )}
                                                        {item.preference && item.preference.length > 0 && (
                                                            <Box>
                                                                {item.preference.map((pref) => (
                                                                    <label key={pref.id} style={{ marginRight: 12 }}>
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={!!pref.is_selected}
                                                                            onChange={() => {
                                                                                setData((prev) => ({
                                                                                    ...prev,
                                                                                    dinnerAlternative: prev.dinnerAlternative.map((i) =>
                                                                                        i.id === item.id
                                                                                            ? {
                                                                                                ...i,
                                                                                                preference: i.preference.map((p) =>
                                                                                                    p.id === pref.id
                                                                                                        ? { ...p, is_selected: p.is_selected ? 0 : 1 }
                                                                                                        : p
                                                                                                ),
                                                                                            }
                                                                                            : i
                                                                                    ),
                                                                                }));
                                                                            }}
                                                                        />
                                                                        {pref.name}
                                                                    </label>
                                                                ))}
                                                            </Box>
                                                        )}
                                                    </Box>
                                                )}
                                            </Box>
                                        ))}
                                    </>
                                )}
                                {/* Add Dinner Additional Services */}
                                {(
                                    (data.dinnerSoup?.some(item => item.qty > 0) ||
                                        data.dinnerEntree?.some(item => item.qty > 0) ||
                                        data.dinnerAlternative?.some(item => item.qty > 0))
                                ) && (
                                        <Box mt={3}>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                                                Additional Services
                                            </Typography>
                                            <label>
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
                                                Escort Service
                                            </label>
                                            <label>
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
                                                Tray Service
                                            </label>
                                        </Box>
                                    )}
                                {/* Add Dinner Submit, if lunch and breakfast not submited then here all data submited like breakfast, lunch and dinner */}
                                {/* Add Dinner Submit, if lunch and breakfast not submited then here all data submited like breakfast, lunch and dinner */}
                                {(
                                    (data.dinnerSoup?.some(item => item.qty > 0) ||
                                        data.dinnerEntree?.some(item => item.qty > 0) ||
                                        data.dinnerAlternative?.some(item => item.qty > 0))
                                ) && (
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
                                                Submit Order
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
