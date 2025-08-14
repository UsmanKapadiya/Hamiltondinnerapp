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
        const breakfastCat = mealData.breakfast?.[0];
        const breakfast = breakfastCat?.items || [];
        const breakFastDailySpecialCatName = breakfastCat?.cat_name || "";
        const breakFastDailySpecialCatName_cn = breakfastCat?.chinese_name || "";
        const breakFastAlternativeCat = breakfast.find(item => item.type === "sub_cat");
        const breakFastAlternativeCatName = breakFastAlternativeCat?.item_name || "";
        const breakFastAlternativeCatName_cn = breakFastAlternativeCat?.chinese_name || "";
        const breakFastDailySpecial = breakfast
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
        const breakFastAlternative = breakfast
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
        const is_brk_escort_service = mealData?.is_brk_escort_service
        const is_brk_tray_service = mealData?.is_brk_tray_service

        const lunchSoupCatName = mealData.lunch?.[0]?.cat_name || "";
        const lunchSoupCatName_cn = mealData.lunch?.[0]?.chinese_name || "";
        const lunchCat = mealData.lunch?.[0];
        const lunchEntreeCatName = lunchCat?.cat_name || "";
        const lunchEntreeCatName_cn = lunchCat?.chinese_name || "";
        const lunchAlternativeCat = lunchCat?.items?.find(item => item.type === "sub_cat");
        const lunchAlternativeCatName = lunchAlternativeCat?.item_name || "";
        const lunchAlternativeCatName_cn = lunchAlternativeCat?.chinese_name || "";
        const lunchSoup = []
        // Before 0 index on lunch Soup Category show, now lunch Soup Category is not get
        // = mealData.lunch?.[0]?.items?.map(item => ({
        //     id: item.item_id,
        //     name: item.item_name,
        //     chinese_name: item.chinese_name,
        //     qty: item.qty,
        //     options: selectFirstOption(item.options),
        //     preference: item.preference,
        //     order_id: item?.order_id,
        //     image: item?.item_image
        // })) || [];
        const lunchEntree = lunchCat?.items
            ?.filter(item => item.type === "item")
            .map(item => ({
                id: item.item_id,
                name: item.item_name,
                chinese_name: item.chinese_name,
                qty: item.qty,
                options: selectFirstOption(item.options),
                preference: item.preference,
                order_id: item?.order_id,
                image: item?.item_image
            })) || [];
        const lunchAlternative = lunchCat?.items
            ?.filter(item => item.type === "sub_cat_item")
            .map(item => ({
                id: item.item_id,
                name: item.item_name,
                chinese_name: item.chinese_name,
                qty: item.qty,
                options: selectFirstOption(item.options),
                preference: item.preference,
                order_id: item?.order_id,
                image: item?.item_image
            })) || [];
        const is_lunch_escort_service = mealData?.is_lunch_escort_service
        const is_lunch_tray_service = mealData?.is_lunch_tray_service


        // Dinner
        const dinnerSoupCatName = mealData.dinner?.[0]?.cat_name || "";
        const dinnerSoupCatName_cn = mealData.dinner?.[0]?.chinese_name || "";
        const dinnerCat = mealData.dinner?.[0];
        const dinnerEntreeCatName = dinnerCat?.cat_name || "";
        const dinnerEntreeCatName_cn = dinnerCat?.chinese_name || "";
        const dinnerAlternativeCat = dinnerCat?.items?.find(item => item.type === "sub_cat");
        const dinnerAlternativeCatName = dinnerAlternativeCat?.item_name || "";
        const dinnerAlternativeCatName_cn = dinnerAlternativeCat?.chinese_name || "";
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
                order_id: item?.order_id,
                image: item?.item_image
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
                order_id: item?.order_id,
                image: item?.item_image
            })) || [];
        const is_dinner_escort_service = mealData?.is_dinner_escort_service
        const is_dinner_tray_service = mealData?.is_dinner_tray_service

        return {
            date: mealData.date,
            breakFastDailySpecialCatName,
            breakFastDailySpecialCatName_cn,
            breakFastAlternativeCatName,
            breakFastAlternativeCatName_cn,
            breakFastDailySpecial,
            breakFastAlternative,
            lunchSoup,
            lunchSoupCatName,
            lunchSoupCatName_cn,
            lunchEntree,
            lunchEntreeCatName,
            lunchEntreeCatName_cn,
            lunchAlternative,
            lunchAlternativeCatName,
            lunchAlternativeCatName_cn,
            dinnerSoupCatName,
            dinnerSoupCatName_cn,
            dinnerEntree,
            dinnerEntreeCatName,
            dinnerEntreeCatName_cn,
            dinnerAlternative,
            dinnerAlternativeCatName,
            dinnerAlternativeCatName_cn,
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

    const totalLunchSoupQty = (data.lunchSoup || []).reduce((sum, i) => sum + (i.qty || 0), 0);
    const totalDinnerSoupQty = (data.dinnerSoup || []).reduce((sum, i) => sum + (i.qty || 0), 0);

    const showBreakFastGuideline =
        userData?.guideline &&
        data.breakFastDailySpecial &&
        data.breakFastDailySpecial.length > 0;

    const showLunchGuideline =
        userData?.guideline &&
        data.lunchSoup && data.lunchSoup.length > 0 &&
        data.lunchEntree && data.lunchEntree.length > 0 &&
        data.lunchAlternative && data.lunchAlternative.length > 0;


    return (
        <Box m="20px">
            <Header
                title={kitchenSummery ? "Kitchen Summery " : roomNo ? roomNo : userData?.room_id}
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
                                            {userData?.langCode === "cn" && data.breakFastDailySpecialCatName_cn && data.breakFastDailySpecialCatName_cn.trim() !== ""
                                                ? data.breakFastDailySpecialCatName_cn
                                                : data.breakFastDailySpecialCatName}
                                        </Typography>
                                        {data.breakFastDailySpecial.map((item, idx) => (
                                            <Box key={item.id} mb={1}>
                                                <Box display="flex" alignItems="center" justifyContent="space-between">
                                                    <Box display="flex" alignItems="center">
                                                        {item.image && (
                                                            <img
                                                                src={item.image}
                                                                alt={userData?.langCode === "cn" && item.chinese_name && item.chinese_name.trim() !== "" ? item.chinese_name : item.name}
                                                                style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 8, marginRight: 12 }}
                                                            />
                                                        )}
                                                        <Typography>
                                                            {userData?.langCode === "cn" && item.chinese_name && item.chinese_name.trim() !== ""
                                                                ? item.chinese_name
                                                                : item.name}
                                                        </Typography>
                                                    </Box>
                                                    <Box display="flex" alignItems="center">
                                                        {!kitchenSummery && (
                                                            <button
                                                                onClick={() =>
                                                                    setData((prev) => ({
                                                                        ...prev,
                                                                        breakFastDailySpecial: prev.breakFastDailySpecial.map((i) => {
                                                                            if (i.id === item.id) {
                                                                                return {
                                                                                    ...i,
                                                                                    qty: 0,
                                                                                    options: (i.options || []).length > 0
                                                                                        ? i.options.map((opt) => ({
                                                                                            ...opt,
                                                                                            is_selected: 0,
                                                                                        }))
                                                                                        : i.options,
                                                                                    preference: (i.preference || []).map((p) => ({
                                                                                        ...p,
                                                                                        is_selected: 0,
                                                                                    })),
                                                                                };
                                                                            }
                                                                            // If previous qty is 0, also reset options and preference
                                                                            if ((i.qty || 0) === 0) {
                                                                                return {
                                                                                    ...i,
                                                                                    options: (i.options || []).length > 0
                                                                                        ? i.options.map((opt) => ({
                                                                                            ...opt,
                                                                                            is_selected: 0,
                                                                                        }))
                                                                                        : i.options,
                                                                                    preference: (i.preference || []).map((p) => ({
                                                                                        ...p,
                                                                                        is_selected: 0,
                                                                                    })),
                                                                                };
                                                                            }
                                                                            return i;
                                                                        }),
                                                                    }))
                                                                }
                                                                style={{ marginRight: 8 }}
                                                                disabled={item.qty === 0 || isAfter10AM || isPast}
                                                            >
                                                                -
                                                            </button>
                                                        )}
                                                        <Typography
                                                            sx={kitchenSummery ? { fontSize: 24, fontWeight: 700 } : {}}
                                                        >
                                                            {item.qty || 0}
                                                        </Typography>
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
                                                        {!kitchenSummery && (
                                                            <button
                                                                onClick={() => {
                                                                    setData((prev) => {
                                                                        const totalQty = (prev.breakFastDailySpecial?.reduce((sum, i) => sum + (i.qty || 0), 0) || 0) +
                                                                            (prev.breakFastAlternative?.reduce((sum, i) => sum + (i.qty || 0), 0) || 0);
                                                                        let newSpecial = [...prev.breakFastDailySpecial];
                                                                        let newAlternative = [...(prev.breakFastAlternative || [])];
                                                                        if (totalQty >= MAX_MEAL_QTY) {
                                                                            let removed = false;
                                                                            newAlternative = newAlternative.map((alt) => {
                                                                                if (!removed && alt.qty > 0) {
                                                                                    removed = true;
                                                                                    return { ...alt, qty: alt.qty - 1 };
                                                                                }
                                                                                return alt;
                                                                            });
                                                                            if (!removed) {
                                                                                newSpecial = newSpecial.map((sp) => {
                                                                                    if (!removed && sp.id !== item.id && sp.qty > 0) {
                                                                                        removed = true;
                                                                                        return { ...sp, qty: sp.qty - 1 };
                                                                                    }
                                                                                    return sp;
                                                                                });
                                                                            }
                                                                        }
                                                                        newSpecial = newSpecial.map((i) =>
                                                                            i.id === item.id ? { ...i, qty: (i.qty || 0) + 1 } : i
                                                                        );
                                                                        return {
                                                                            ...prev,
                                                                            breakFastDailySpecial: newSpecial,
                                                                            breakFastAlternative: newAlternative,
                                                                        };
                                                                    });
                                                                }}
                                                                style={{ marginLeft: 8 }}
                                                                disabled={
                                                                    item.qty >= MAX_MEAL_QTY ||
                                                                    isAfter10AM ||
                                                                    isPast
                                                                }
                                                            >
                                                                +
                                                            </button>
                                                        )}
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
                                            {userData?.langCode === "cn" && data.breakFastAlternativeCatName_cn && data.breakFastAlternativeCatName_cn.trim() !== ""
                                                ? data.breakFastAlternativeCatName_cn
                                                : data.breakFastAlternativeCatName}
                                        </Typography>
                                        {data.breakFastAlternative.map((item) => (
                                            <Box key={item.id} mb={1}>
                                                <Box display="flex" alignItems="center" justifyContent="space-between">
                                                    <Box display="flex" alignItems="center">
                                                        {item.image && (
                                                            <img
                                                                src={item.image}
                                                                alt={userData?.langCode === "cn" && item.chinese_name && item.chinese_name.trim() !== "" ? item.chinese_name : item.name}
                                                                style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 8, marginRight: 12 }}
                                                            />
                                                        )}
                                                        <Typography>
                                                            {userData?.langCode === "cn" && item.chinese_name && item.chinese_name.trim() !== ""
                                                                ? item.chinese_name
                                                                : item.name}
                                                        </Typography>
                                                    </Box>
                                                    <Box display="flex" alignItems="center">
                                                        {!kitchenSummery && (
                                                            <button
                                                                onClick={() =>
                                                                    setData((prev) => ({
                                                                        ...prev,
                                                                        breakFastAlternative: prev.breakFastAlternative.map((i) => {
                                                                            const newQty = Math.max((i.qty || 0) - (i.id === item.id ? 1 : 0), 0);
                                                                            if (i.id === item.id) {
                                                                                return {
                                                                                    ...i,
                                                                                    qty: newQty,
                                                                                    options: (i.options || []).length > 0 && newQty === 0
                                                                                        ? i.options.map((opt) => ({
                                                                                            ...opt,
                                                                                            is_selected: 0,
                                                                                        }))
                                                                                        : i.options,
                                                                                    preference: (i.preference || []).length > 0 && newQty === 0
                                                                                        ? i.preference.map((p) => ({
                                                                                            ...p,
                                                                                            is_selected: 0,
                                                                                        }))
                                                                                        : i.preference,
                                                                                };
                                                                            }
                                                                            // If previous qty is 0, also reset options and preference
                                                                            if ((i.qty || 0) === 0) {
                                                                                return {
                                                                                    ...i,
                                                                                    options: (i.options || []).length > 0
                                                                                        ? i.options.map((opt) => ({
                                                                                            ...opt,
                                                                                            is_selected: 0,
                                                                                        }))
                                                                                        : i.options,
                                                                                    preference: (i.preference || []).map((p) => ({
                                                                                        ...p,
                                                                                        is_selected: 0,
                                                                                    })),
                                                                                };
                                                                            }
                                                                            return i;
                                                                        }),
                                                                    }))
                                                                }
                                                                style={{ marginRight: 8 }}
                                                                disabled={item.qty === 0 || isAfter10AM || isPast}
                                                            >
                                                                -
                                                            </button>
                                                        )}
                                                        <Typography
                                                            sx={kitchenSummery ? { fontSize: 24, fontWeight: 700 } : {}}
                                                        >
                                                            {item.qty || 0}
                                                        </Typography>                                                        {!kitchenSummery && (
                                                            <button
                                                                onClick={() => {
                                                                    setData((prev) => {
                                                                        const totalQty = (prev.breakFastDailySpecial?.reduce((sum, i) => sum + (i.qty || 0), 0) || 0) +
                                                                            (prev.breakFastAlternative?.reduce((sum, i) => sum + (i.qty || 0), 0) || 0);
                                                                        let newAlternative = [...prev.breakFastAlternative];
                                                                        let newSpecial = [...(prev.breakFastDailySpecial || [])];
                                                                        if (totalQty >= MAX_MEAL_QTY) {
                                                                            let removed = false;
                                                                            newSpecial = newSpecial.map((sp) => {
                                                                                if (!removed && sp.qty > 0) {
                                                                                    removed = true;
                                                                                    const newQty = sp.qty - 1;
                                                                                    return {
                                                                                        ...sp,
                                                                                        qty: newQty,
                                                                                        options: (sp.options || []).length > 0 && newQty === 0
                                                                                            ? sp.options.map((opt, idx) => ({ ...opt, is_selected: idx === 0 ? 1 : 0 }))
                                                                                            : sp.options,
                                                                                        preference: (sp.preference || []).length > 0 && newQty === 0
                                                                                            ? sp.preference.map((p) => ({ ...p, is_selected: 0 }))
                                                                                            : sp.preference,
                                                                                    };
                                                                                }
                                                                                if ((sp.qty || 0) === 0) {
                                                                                    return {
                                                                                        ...sp,
                                                                                        options: (sp.options || []).length > 0
                                                                                            ? sp.options.map((opt, idx) => ({ ...opt, is_selected: idx === 0 ? 1 : 0 }))
                                                                                            : sp.options,
                                                                                        preference: (sp.preference || []).map((p) => ({ ...p, is_selected: 0 })),
                                                                                    };
                                                                                }
                                                                                return sp;
                                                                            });
                                                                            if (!removed) {
                                                                                newAlternative = newAlternative.map((alt) => {
                                                                                    if (!removed && alt.id !== item.id && alt.qty > 0) {
                                                                                        removed = true;
                                                                                        const newQty = alt.qty - 1;
                                                                                        return {
                                                                                            ...alt,
                                                                                            qty: newQty,
                                                                                            options: (alt.options || []).length > 0 && newQty === 0
                                                                                                ? alt.options.map((opt) => ({ ...opt, is_selected: 0 }))
                                                                                                : alt.options,
                                                                                            preference: (alt.preference || []).length > 0 && newQty === 0
                                                                                                ? alt.preference.map((p) => ({ ...p, is_selected: 0 }))
                                                                                                : alt.preference,
                                                                                        };
                                                                                    }
                                                                                    if ((alt.qty || 0) === 0) {
                                                                                        return {
                                                                                            ...alt,
                                                                                            options: (alt.options || []).length > 0
                                                                                                ? alt.options.map((opt) => ({ ...opt, is_selected: 0 }))
                                                                                                : alt.options,
                                                                                            preference: (alt.preference || []).map((p) => ({ ...p, is_selected: 0 })),
                                                                                        };
                                                                                    }
                                                                                    return alt;
                                                                                });
                                                                            }
                                                                        }
                                                                        newAlternative = newAlternative.map((i) =>
                                                                            i.id === item.id ? { ...i, qty: (i.qty || 0) + 1 } : i
                                                                        );
                                                                        return {
                                                                            ...prev,
                                                                            breakFastDailySpecial: newSpecial,
                                                                            breakFastAlternative: newAlternative,
                                                                        };
                                                                    });
                                                                }}
                                                                style={{ marginLeft: 8 }}
                                                                disabled={
                                                                    item.qty >= MAX_MEAL_QTY ||
                                                                    isAfter10AM ||
                                                                    isPast
                                                                }
                                                            >
                                                                +
                                                            </button>
                                                        )}
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
                                    (data.breakFastDailySpecial?.some(item => item.qty > 0) ||
                                        data.breakFastAlternative?.some(item => item.qty > 0)) &&
                                    !kitchenSummery
                                ) && (
                                        <Box mt={3}>
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
                                                {langObj.escortService}
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
                                                {langObj.trayService}
                                            </label>
                                            <label>
                                                <input
                                                    type="checkbox"
                                                // checked={data.is_dinner_tray_service === 1}
                                                // onChange={e => {
                                                //     setData(prev => ({
                                                //         ...prev,
                                                //         is_dinner_tray_service: e.target.checked ? 1 : 0
                                                //     }));
                                                // }}
                                                />
                                                {langObj.Takeout}
                                            </label>
                                        </Box>
                                    )}
                                {showBreakFastGuideline && (
                                    <>
                                        <hr />
                                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                                            {userData?.langCode === "cn" && userData?.guideline_cn && userData?.guideline_cn.trim() !== ""
                                                ? userData?.guideline_cn
                                                : userData?.guideline}
                                        </Typography>
                                    </>
                                )}
                                {data.breakFastDailySpecial && data.breakFastAlternative &&
                                    data.breakFastDailySpecial.length === 0 &&
                                    data.breakFastAlternative.length === 0 && (
                                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                                            {langObj.breakFasrMenuWarn}
                                        </Typography>
                                    )}
                                {/* Add Submit Button for BreakFast DataSubmit */}
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
                                {(
                                    (
                                        (data.breakFastDailySpecial?.some(item => item.qty > 0) || data.breakFastAlternative?.some(item => item.qty > 0)) ||
                                        (data.lunchSoup?.some(item => item.qty > 0) || data.lunchEntree?.some(item => item.qty > 0) || data.lunchAlternative?.some(item => item.qty > 0)) ||
                                        (data.dinnerSoup?.some(item => item.qty > 0) || data.dinnerEntree?.some(item => item.qty > 0) || data.dinnerAlternative?.some(item => item.qty > 0))
                                    ) && !kitchenSummery
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
                                                {langObj.submit}
                                            </CustomButton>
                                        </Box>
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
                                            {userData?.langCode === "cn" && data.lunchSoupCatName_cn && data.lunchSoupCatName_cn.trim() !== ""
                                                ? data.lunchSoupCatName_cn
                                                : data.lunchSoupCatName}
                                        </Typography>
                                        {data.lunchSoup.map((item) => (
                                            <Box key={item.id} mb={1}>
                                                <Box display="flex" alignItems="center" justifyContent="space-between">
                                                    <Box display="flex" alignItems="center">
                                                        {item.image && (
                                                            <img
                                                                src={item.image}
                                                                alt={userData?.langCode === "cn" && item.chinese_name && item.chinese_name.trim() !== "" ? item.chinese_name : item.name}
                                                                style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 8, marginRight: 12 }}
                                                            />
                                                        )}
                                                        <Typography>
                                                            {userData?.langCode === "cn" && item.chinese_name && item.chinese_name.trim() !== ""
                                                                ? item.chinese_name
                                                                : item.name}
                                                        </Typography>
                                                    </Box>
                                                    <Box display="flex" alignItems="center">
                                                        {!kitchenSummery && (
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
                                                        )}
                                                        <Typography
                                                            sx={kitchenSummery ? { fontSize: 24, fontWeight: 700 } : {}}
                                                        >
                                                            {item.qty || 0}
                                                        </Typography>                                                        {!kitchenSummery && (
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
                                                        )}
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
                                            {userData?.langCode === "cn" && data.lunchEntreeCatName_cn && data.lunchEntreeCatName_cn.trim() !== ""
                                                ? data.lunchEntreeCatName_cn
                                                : data.lunchEntreeCatName} ({langObj.servedWithSoup})
                                        </Typography>
                                        {data.lunchEntree.map((item) => (
                                            <Box key={item.id} mb={1}>
                                                <Box display="flex" alignItems="center" justifyContent="space-between">
                                                    <Box display="flex" alignItems="center">
                                                        {item.image && (
                                                            <img
                                                                src={item.image}
                                                                alt={userData?.langCode === "cn" && item.chinese_name && item.chinese_name.trim() !== "" ? item.chinese_name : item.name}
                                                                style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 8, marginRight: 12 }}
                                                            />
                                                        )}
                                                        <Typography>
                                                            {userData?.langCode === "cn" && item.chinese_name && item.chinese_name.trim() !== ""
                                                                ? item.chinese_name
                                                                : item.name}
                                                        </Typography>
                                                    </Box>
                                                    <Box display="flex" alignItems="center">
                                                        {!kitchenSummery && (
                                                            <button
                                                                onClick={() =>
                                                                    setData((prev) => ({
                                                                        ...prev,
                                                                        lunchEntree: prev.lunchEntree.map((i) => {
                                                                            if (i.id === item.id) {
                                                                                const newQty = Math.max((i.qty || 0) - 1, 0);
                                                                                return {
                                                                                    ...i,
                                                                                    qty: newQty,
                                                                                    options: (i.options || []).length > 0 && newQty === 0
                                                                                        ? i.options.map((opt, idx) => ({ ...opt, is_selected: idx === 0 ? 1 : 0 }))
                                                                                        : i.options,
                                                                                    preference: (i.preference || []).map((p) => ({ ...p, is_selected: 0 })),
                                                                                };
                                                                            }
                                                                            // If qty is already 0, also reset options/preference
                                                                            if ((i.qty || 0) === 0) {
                                                                                return {
                                                                                    ...i,
                                                                                    options: (i.options || []).length > 0
                                                                                        ? i.options.map((opt, idx) => ({ ...opt, is_selected: idx === 0 ? 1 : 0 }))
                                                                                        : i.options,
                                                                                    preference: (i.preference || []).map((p) => ({ ...p, is_selected: 0 })),
                                                                                };
                                                                            }
                                                                            return i;
                                                                        }),
                                                                    }))
                                                                }
                                                                style={{ marginRight: 8 }}
                                                                disabled={item.qty === 0 || isAfter3PM || isPast}
                                                            >
                                                                -
                                                            </button>
                                                        )}
                                                        <Typography
                                                            sx={kitchenSummery ? { fontSize: 24, fontWeight: 700 } : {}}
                                                        >
                                                            {item.qty || 0}
                                                        </Typography>                                                        {/* <button
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
                                                        {!kitchenSummery && (
                                                            <button
                                                                onClick={() => {
                                                                    setData((prev) => {
                                                                        const totalQty = (prev.lunchEntree?.reduce((sum, i) => sum + (i.qty || 0), 0) || 0) +
                                                                            (prev.lunchAlternative?.reduce((sum, i) => sum + (i.qty || 0), 0) || 0);
                                                                        let newEntree = [...prev.lunchEntree];
                                                                        let newAlternative = [...(prev.lunchAlternative || [])];
                                                                        if (totalQty >= MAX_MEAL_QTY) {
                                                                            // Remove 1 qty from the other group if possible
                                                                            // Try to remove from lunchAlternative first
                                                                            let removed = false;
                                                                            newAlternative = newAlternative.map((alt) => {
                                                                                if (!removed && alt.qty > 0) {
                                                                                    removed = true;
                                                                                    return { ...alt, qty: alt.qty - 1 };
                                                                                }
                                                                                return alt;
                                                                            });
                                                                            if (!removed) {
                                                                                // Try to remove from another entree item (not the current one)
                                                                                newEntree = newEntree.map((en) => {
                                                                                    if (!removed && en.id !== item.id && en.qty > 0) {
                                                                                        removed = true;
                                                                                        return { ...en, qty: en.qty - 1 };
                                                                                    }
                                                                                    return en;
                                                                                });
                                                                            }
                                                                        }
                                                                        // Now add qty to the current item
                                                                        newEntree = newEntree.map((i) =>
                                                                            i.id === item.id ? { ...i, qty: (i.qty || 0) + 1 } : i
                                                                        );
                                                                        return {
                                                                            ...prev,
                                                                            lunchEntree: newEntree,
                                                                            lunchAlternative: newAlternative,
                                                                        };
                                                                    });
                                                                }}
                                                                style={{ marginLeft: 8 }}
                                                                disabled={
                                                                    item.qty >= MAX_MEAL_QTY ||
                                                                    isAfter3PM ||
                                                                    isPast
                                                                }
                                                            >
                                                                +
                                                            </button>
                                                        )}
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
                                            {/* {data.lunchAlternativeCatName} */}
                                            {userData?.langCode === "cn" && data.lunchAlternativeCatName_cn && data.lunchAlternativeCatName_cn.trim() !== ""
                                                ? data.lunchAlternativeCatName_cn
                                                : data.lunchAlternativeCatName}
                                        </Typography>
                                        {data.lunchAlternative.map((item) => (
                                            <Box key={item.id} mb={1}>
                                                <Box display="flex" alignItems="center" justifyContent="space-between">
                                                    <Box display="flex" alignItems="center">
                                                        {item.image && (
                                                            <img
                                                                src={item.image}
                                                                alt={userData?.langCode === "cn" && item.chinese_name && item.chinese_name.trim() !== "" ? item.chinese_name : item.name}
                                                                style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 8, marginRight: 12 }}
                                                            />
                                                        )}
                                                        <Typography>
                                                            {userData?.langCode === "cn" && item.chinese_name && item.chinese_name.trim() !== ""
                                                                ? item.chinese_name
                                                                : item.name}
                                                        </Typography>
                                                    </Box>
                                                    <Box display="flex" alignItems="center">
                                                        {!kitchenSummery && (
                                                            <button
                                                                onClick={() =>
                                                                    setData((prev) => ({
                                                                        ...prev,
                                                                        lunchAlternative: prev.lunchAlternative.map((i) => {
                                                                            if (i.id === item.id) {
                                                                                const newQty = Math.max((i.qty || 0) - 1, 0);
                                                                                return {
                                                                                    ...i,
                                                                                    qty: newQty,
                                                                                    options: (i.options || []).length > 0 && newQty === 0
                                                                                        ? i.options.map((opt, idx) => ({ ...opt, is_selected: idx === 0 ? 1 : 0 }))
                                                                                        : i.options,
                                                                                    preference: (i.preference || []).map((p) => ({ ...p, is_selected: 0 })),
                                                                                };
                                                                            }
                                                                            // If qty is already 0, also reset options/preference
                                                                            if ((i.qty || 0) === 0) {
                                                                                return {
                                                                                    ...i,
                                                                                    options: (i.options || []).length > 0
                                                                                        ? i.options.map((opt, idx) => ({ ...opt, is_selected: idx === 0 ? 1 : 0 }))
                                                                                        : i.options,
                                                                                    preference: (i.preference || []).map((p) => ({ ...p, is_selected: 0 })),
                                                                                };
                                                                            }
                                                                            return i;
                                                                        }),
                                                                    }))
                                                                }
                                                                style={{ marginRight: 8 }}
                                                                disabled={item.qty === 0 || isAfter3PM || isPast}
                                                            >
                                                                -
                                                            </button>
                                                        )}
                                                        <Typography
                                                            sx={kitchenSummery ? { fontSize: 24, fontWeight: 700 } : {}}
                                                        >
                                                            {item.qty || 0}
                                                        </Typography>                                                        {/* <button
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
                                                        {!kitchenSummery && (
                                                            <button
                                                                onClick={() => {
                                                                    setData((prev) => {
                                                                        const totalQty = (prev.lunchEntree?.reduce((sum, i) => sum + (i.qty || 0), 0) || 0) +
                                                                            (prev.lunchAlternative?.reduce((sum, i) => sum + (i.qty || 0), 0) || 0);
                                                                        let newAlternative = [...prev.lunchAlternative];
                                                                        let newEntree = [...(prev.lunchEntree || [])];
                                                                        if (totalQty >= MAX_MEAL_QTY) {
                                                                            // Remove 1 qty from the other group if possible
                                                                            // Try to remove from lunchEntree first
                                                                            let removed = false;
                                                                            newEntree = newEntree.map((en) => {
                                                                                if (!removed && en.qty > 0) {
                                                                                    removed = true;
                                                                                    return { ...en, qty: en.qty - 1 };
                                                                                }
                                                                                return en;
                                                                            });
                                                                            if (!removed) {
                                                                                // Try to remove from another alternative item (not the current one)
                                                                                newAlternative = newAlternative.map((alt) => {
                                                                                    if (!removed && alt.id !== item.id && alt.qty > 0) {
                                                                                        removed = true;
                                                                                        return { ...alt, qty: alt.qty - 1 };
                                                                                    }
                                                                                    return alt;
                                                                                });
                                                                            }
                                                                        }
                                                                        // Now add qty to the current item
                                                                        newAlternative = newAlternative.map((i) =>
                                                                            i.id === item.id ? { ...i, qty: (i.qty || 0) + 1 } : i
                                                                        );
                                                                        return {
                                                                            ...prev,
                                                                            lunchEntree: newEntree,
                                                                            lunchAlternative: newAlternative,
                                                                        };
                                                                    });
                                                                }}
                                                                style={{ marginLeft: 8 }}
                                                                disabled={
                                                                    item.qty >= MAX_MEAL_QTY ||
                                                                    isAfter3PM ||
                                                                    isPast
                                                                }
                                                            >
                                                                +
                                                            </button>
                                                        )}
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
                                    &&
                                    !kitchenSummery
                                ) && (
                                        <Box mt={3}>
                                            {/* <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                                                Additional Services
                                            </Typography> */}
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
                                                {langObj.escortService}
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
                                                {langObj.trayService}
                                            </label>
                                            <label>
                                                <input
                                                    type="checkbox"
                                                // checked={data.is_dinner_tray_service === 1}
                                                // onChange={e => {
                                                //     setData(prev => ({
                                                //         ...prev,
                                                //         is_dinner_tray_service: e.target.checked ? 1 : 0
                                                //     }));
                                                // }}
                                                />
                                                {langObj.Takeout}
                                            </label>
                                        </Box>
                                    )}
                                {showLunchGuideline && (
                                    <>
                                        <hr />
                                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                                            {userData?.langCode === "cn" && userData?.guideline_cn && userData?.guideline_cn.trim() !== ""
                                                ? userData?.guideline_cn
                                                : userData?.guideline}
                                        </Typography>
                                    </>
                                )}
                                {data.lunchSoup && data.lunchEntree && data.lunchAlternative &&
                                    data.lunchSoup.length === 0 &&
                                    data.lunchEntree.length === 0 &&
                                    data.lunchAlternative.length === 0 && (
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
                                {/* Add lunch submit button,  if breakfast not submited then here breakfast and lunch submited */}
                                {(
                                    (
                                        (data.breakFastDailySpecial?.some(item => item.qty > 0) || data.breakFastAlternative?.some(item => item.qty > 0)) ||
                                        (data.lunchSoup?.some(item => item.qty > 0) || data.lunchEntree?.some(item => item.qty > 0) || data.lunchAlternative?.some(item => item.qty > 0)) ||
                                        (data.dinnerSoup?.some(item => item.qty > 0) || data.dinnerEntree?.some(item => item.qty > 0) || data.dinnerAlternative?.some(item => item.qty > 0))
                                    ) && !kitchenSummery
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
                                            {/* {data.dinnerSoupCatName || "Soup"} */}
                                            {userData?.langCode === "cn" && data.dinnerSoupCatName_cn && data.dinnerSoupCatName_cn.trim() !== ""
                                                ? data.dinnerSoupCatName_cn
                                                : data.dinnerSoupCatName || "Soup"}
                                        </Typography>
                                        {data.dinnerSoup.map((item) => (
                                            <Box key={item.id} display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                                                <Box display="flex" alignItems="center">
                                                    {item.image && (
                                                        <img
                                                            src={item.image}
                                                            alt={userData?.langCode === "cn" && item.chinese_name && item.chinese_name.trim() !== "" ? item.chinese_name : item.name}
                                                            style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 8, marginRight: 12 }}
                                                        />
                                                    )}
                                                    <Typography>
                                                        {userData?.langCode === "cn" && item.chinese_name && item.chinese_name.trim() !== ""
                                                            ? item.chinese_name
                                                            : item.name}
                                                    </Typography>
                                                </Box>
                                                <Box display="flex" alignItems="center">
                                                    {!kitchenSummery && (
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
                                                    )}
                                                    <Typography
                                                        sx={kitchenSummery ? { fontSize: 24, fontWeight: 700 } : {}}
                                                    >
                                                        {item.qty || 0}
                                                    </Typography>
                                                    {!kitchenSummery && (
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
                                                    )}
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
                                            {userData?.langCode === "cn" && data.dinnerEntreeCatName_cn && data.dinnerEntreeCatName_cn.trim() !== ""
                                                ? data.dinnerEntreeCatName_cn
                                                : data.dinnerEntreeCatName} ({langObj.servedWithDesset})
                                        </Typography>
                                        {data.dinnerEntree.map((item) => (
                                            <Box key={item.id} mb={1}>
                                                <Box display="flex" alignItems="center" justifyContent="space-between">
                                                    <Box display="flex" alignItems="center">
                                                        {item.image && (
                                                            <img
                                                                src={item.image}
                                                                alt={userData?.langCode === "cn" && item.chinese_name && item.chinese_name.trim() !== "" ? item.chinese_name : item.name}
                                                                style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 8, marginRight: 12 }}
                                                            />
                                                        )}
                                                        <Typography>
                                                            {userData?.langCode === "cn" && item.chinese_name && item.chinese_name.trim() !== ""
                                                                ? item.chinese_name
                                                                : item.name}
                                                        </Typography>
                                                    </Box>
                                                    <Box display="flex" alignItems="center">
                                                        {!kitchenSummery && (
                                                            <button
                                                                onClick={() =>
                                                                    setData((prev) => ({
                                                                        ...prev,
                                                                        dinnerEntree: prev.dinnerEntree.map((i) => {
                                                                            if (i.id === item.id) {
                                                                                const newQty = Math.max((i.qty || 0) - 1, 0);
                                                                                return {
                                                                                    ...i,
                                                                                    qty: newQty,
                                                                                    options: (i.options || []).length > 0 && newQty === 0
                                                                                        ? i.options.map((opt, idx) => ({ ...opt, is_selected: idx === 0 ? 1 : 0 }))
                                                                                        : i.options,
                                                                                    preference: (i.preference || []).map((p) => ({ ...p, is_selected: 0 })),
                                                                                };
                                                                            }
                                                                            // If qty is already 0, also reset options/preference
                                                                            if ((i.qty || 0) === 0) {
                                                                                return {
                                                                                    ...i,
                                                                                    options: (i.options || []).length > 0
                                                                                        ? i.options.map((opt, idx) => ({ ...opt, is_selected: idx === 0 ? 1 : 0 }))
                                                                                        : i.options,
                                                                                    preference: (i.preference || []).map((p) => ({ ...p, is_selected: 0 })),
                                                                                };
                                                                            }
                                                                            return i;
                                                                        }),
                                                                    }))
                                                                }
                                                                style={{ marginRight: 8 }}
                                                                disabled={item.qty === 0 || isAfter12PM || isPast}
                                                            >
                                                                -
                                                            </button>
                                                        )}
                                                        <Typography
                                                            sx={kitchenSummery ? { fontSize: 24, fontWeight: 700 } : {}}
                                                        >
                                                            {item.qty || 0}
                                                        </Typography>                                                        {!kitchenSummery && (
                                                            <button
                                                                onClick={() => {
                                                                    setData((prev) => {
                                                                        const totalQty = (prev.dinnerEntree?.reduce((sum, i) => sum + (i.qty || 0), 0) || 0) +
                                                                            (prev.dinnerAlternative?.reduce((sum, i) => sum + (i.qty || 0), 0) || 0);
                                                                        let newEntree = [...prev.dinnerEntree];
                                                                        let newAlternative = [...(prev.dinnerAlternative || [])];
                                                                        if (totalQty >= MAX_MEAL_QTY) {
                                                                            // Remove 1 qty from the other group if possible
                                                                            // Try to remove from dinnerAlternative first
                                                                            let removed = false;
                                                                            newAlternative = newAlternative.map((alt) => {
                                                                                if (!removed && alt.qty > 0) {
                                                                                    removed = true;
                                                                                    return { ...alt, qty: alt.qty - 1 };
                                                                                }
                                                                                return alt;
                                                                            });
                                                                            if (!removed) {
                                                                                // Try to remove from another entree item (not the current one)
                                                                                newEntree = newEntree.map((en) => {
                                                                                    if (!removed && en.id !== item.id && en.qty > 0) {
                                                                                        removed = true;
                                                                                        return { ...en, qty: en.qty - 1 };
                                                                                    }
                                                                                    return en;
                                                                                });
                                                                            }
                                                                        }
                                                                        // Now add qty to the current item
                                                                        newEntree = newEntree.map((i) =>
                                                                            i.id === item.id ? { ...i, qty: (i.qty || 0) + 1 } : i
                                                                        );
                                                                        return {
                                                                            ...prev,
                                                                            dinnerEntree: newEntree,
                                                                            dinnerAlternative: newAlternative,
                                                                        };
                                                                    });
                                                                }}
                                                                style={{ marginLeft: 8 }}
                                                                disabled={
                                                                    item.qty >= MAX_MEAL_QTY ||
                                                                    isAfter12PM ||
                                                                    isPast
                                                                }
                                                            >
                                                                +
                                                            </button>
                                                        )}
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
                                            {/* {data.dinnerAlternativeCatName} */}
                                            {userData?.langCode === "cn" && data.dinnerAlternativeCatName_cn && data.dinnerAlternativeCatName_cn.trim() !== ""
                                                ? data.dinnerAlternativeCatName_cn
                                                : data.dinnerAlternativeCatName}
                                        </Typography>
                                        {data.dinnerAlternative.map((item) => (
                                            <Box key={item.id} mb={1}>
                                                <Box display="flex" alignItems="center" justifyContent="space-between">
                                                    <Box display="flex" alignItems="center">
                                                        {item.image && (
                                                            <img
                                                                src={item.image}
                                                                alt={userData?.langCode === "cn" && item.chinese_name && item.chinese_name.trim() !== "" ? item.chinese_name : item.name}
                                                                style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 8, marginRight: 12 }}
                                                            />
                                                        )}
                                                        <Typography>
                                                            {userData?.langCode === "cn" && item.chinese_name && item.chinese_name.trim() !== ""
                                                                ? item.chinese_name
                                                                : item.name}
                                                        </Typography>
                                                    </Box>
                                                    <Box display="flex" alignItems="center">
                                                        {!kitchenSummery && (
                                                            <button
                                                                onClick={() =>
                                                                    setData((prev) => ({
                                                                        ...prev,
                                                                        dinnerAlternative: prev.dinnerAlternative.map((i) => {
                                                                            if (i.id === item.id) {
                                                                                const newQty = Math.max((i.qty || 0) - 1, 0);
                                                                                return {
                                                                                    ...i,
                                                                                    qty: newQty,
                                                                                    options: (i.options || []).length > 0 && newQty === 0
                                                                                        ? i.options.map((opt, idx) => ({ ...opt, is_selected: idx === 0 ? 1 : 0 }))
                                                                                        : i.options,
                                                                                    preference: (i.preference || []).map((p) => ({ ...p, is_selected: 0 })),
                                                                                };
                                                                            }
                                                                            // If qty is already 0, also reset options/preference
                                                                            if ((i.qty || 0) === 0) {
                                                                                return {
                                                                                    ...i,
                                                                                    options: (i.options || []).length > 0
                                                                                        ? i.options.map((opt, idx) => ({ ...opt, is_selected: idx === 0 ? 1 : 0 }))
                                                                                        : i.options,
                                                                                    preference: (i.preference || []).map((p) => ({ ...p, is_selected: 0 })),
                                                                                };
                                                                            }
                                                                            return i;
                                                                        }),
                                                                    }))
                                                                }
                                                                style={{ marginRight: 8 }}
                                                                disabled={item.qty === 0 || isAfter12PM || isPast}
                                                            >
                                                                -
                                                            </button>
                                                        )}
                                                        <Typography
                                                            sx={kitchenSummery ? { fontSize: 24, fontWeight: 700 } : {}}
                                                        >
                                                            {item.qty || 0}
                                                        </Typography>                                                        {/* <button
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
                                                        {!kitchenSummery && (
                                                            <button
                                                                onClick={() => {
                                                                    setData((prev) => {
                                                                        const totalQty = (prev.dinnerEntree?.reduce((sum, i) => sum + (i.qty || 0), 0) || 0) +
                                                                            (prev.dinnerAlternative?.reduce((sum, i) => sum + (i.qty || 0), 0) || 0);
                                                                        let newAlternative = [...prev.dinnerAlternative];
                                                                        let newEntree = [...(prev.dinnerEntree || [])];
                                                                        if (totalQty >= MAX_MEAL_QTY) {
                                                                            // Remove 1 qty from the other group if possible
                                                                            // Try to remove from dinnerEntree first
                                                                            let removed = false;
                                                                            newEntree = newEntree.map((en) => {
                                                                                if (!removed && en.qty > 0) {
                                                                                    removed = true;
                                                                                    return { ...en, qty: en.qty - 1 };
                                                                                }
                                                                                return en;
                                                                            });
                                                                            if (!removed) {
                                                                                // Try to remove from another alternative item (not the current one)
                                                                                newAlternative = newAlternative.map((alt) => {
                                                                                    if (!removed && alt.id !== item.id && alt.qty > 0) {
                                                                                        removed = true;
                                                                                        return { ...alt, qty: alt.qty - 1 };
                                                                                    }
                                                                                    return alt;
                                                                                });
                                                                            }
                                                                        }
                                                                        // Now add qty to the current item
                                                                        newAlternative = newAlternative.map((i) =>
                                                                            i.id === item.id ? { ...i, qty: (i.qty || 0) + 1 } : i
                                                                        );
                                                                        return {
                                                                            ...prev,
                                                                            dinnerEntree: newEntree,
                                                                            dinnerAlternative: newAlternative,
                                                                        };
                                                                    });
                                                                }}
                                                                style={{ marginLeft: 8 }}
                                                                disabled={
                                                                    item.qty >= MAX_MEAL_QTY ||
                                                                    isAfter12PM ||
                                                                    isPast
                                                                }
                                                            >
                                                                +
                                                            </button>
                                                        )}
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
                                        data.dinnerAlternative?.some(item => item.qty > 0)) &&
                                    !kitchenSummery
                                ) && (
                                        <Box mt={3}>
                                            {/* <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                                                Additional Services
                                            </Typography> */}
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
                                                {langObj.escortService}
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
                                                {langObj.trayService}
                                            </label>
                                            <label>
                                                <input
                                                    type="checkbox"
                                                // checked={data.is_dinner_tray_service === 1}
                                                // onChange={e => {
                                                //     setData(prev => ({
                                                //         ...prev,
                                                //         is_dinner_tray_service: e.target.checked ? 1 : 0
                                                //     }));
                                                // }}
                                                />
                                                {langObj.Takeout}
                                            </label>
                                        </Box>
                                    )}
                                {data.dinnerSoup && data.dinnerEntree && data.dinnerAlternative &&
                                    data.dinnerSoup.length === 0 &&
                                    data.dinnerEntree.length === 0 &&
                                    data.dinnerAlternative.length === 0 && (
                                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                                            {langObj.dinnerMenuWarn}
                                        </Typography>
                                    )}
                                {/* Add Dinner Submit, if lunch and breakfast not submited then here all data submited like breakfast, lunch and dinner */}
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
                                {(
                                    (
                                        (data.breakFastDailySpecial?.some(item => item.qty > 0) || data.breakFastAlternative?.some(item => item.qty > 0)) ||
                                        (data.lunchSoup?.some(item => item.qty > 0) || data.lunchEntree?.some(item => item.qty > 0) || data.lunchAlternative?.some(item => item.qty > 0)) ||
                                        (data.dinnerSoup?.some(item => item.qty > 0) || data.dinnerEntree?.some(item => item.qty > 0) || data.dinnerAlternative?.some(item => item.qty > 0))
                                    ) && !kitchenSummery
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
