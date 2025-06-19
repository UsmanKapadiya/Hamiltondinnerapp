import {
    Box, useTheme, Typography, Tabs, Tab,
    Button
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
import { useLocation } from "react-router-dom";
import CustomButton from "../../components/CustomButton";
import { EditOutlined, EmojiPeopleOutlined } from "@mui/icons-material";

let breakFastEndTime = 10;
let lunchEndTime = 15;
let dinnerEndTime = 24;


const GuestOrder = () => {

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const location = useLocation();
    const roomNo = location.state?.roomNo;
    const selectedDate = location.state?.selectedDate
    const [date, setDate] = useState(selectedDate ? dayjs(selectedDate) : dayjs());
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState({});
    const [mealData, setMealData] = useState({});

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
    const isToday = date.isSame(dayjs(), 'day');
    const isPast = date.isBefore(dayjs(), 'day');
    const isAfter10AM = isToday && (dayjs().hour() > breakFastEndTime || (dayjs().hour() === breakFastEndTime && dayjs().minute() > 0));
    const isAfter3PM = isToday && (dayjs().hour() > lunchEndTime || (dayjs().hour() === lunchEndTime && dayjs().minute() > 0));
    const isAfter12PM = isToday && (dayjs().hour() > dinnerEndTime || (dayjs().hour() === dinnerEndTime && dayjs().minute() > 0));

    const [userData] = useState(() => {
        const userDatas = localStorage.getItem("userData");
        return userDatas ? JSON.parse(userDatas) : null;
    });
    const [guestCount, setGuestCount] = useState(1);
    const handleIncrement = () => setGuestCount(prev => prev + 1);
    const handleDecrement = () => setGuestCount(prev => (prev > 1 ? prev - 1 : 1));


    useEffect(() => {
        const fetchMenuDetails = async () => {
            try {
                setLoading(true);
                const payload = {
                    date: date.format("YYYY-MM-DD"),
                    room_id: roomNo ? roomNo : userData?.room_id
                }
                const response = await OrderServices.guestOrderListData(payload);
                let data = {
                    breakfast: response.breakfast,
                    lunch: response?.lunch,
                    dinner: response?.dinner,
                    is_dinner_tray_service: response?.is_dinner_tray_service,
                    is_brk_tray_service: response?.is_brk_tray_service,
                    is_lunch_tray_service: response?.is_lunch_tray_service
                };
        
                setGuestCount(response?.occupancy)
                setMealData(data);
                setData(transformMealData(data));
            } catch (error) {
                console.error("Error fetching menu list:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMenuDetails();
    }, [date]);

    function selectFirstOption(options) {
        if (!options || options.length === 0) return [];
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
                preference: item.preference
            }));
        const breakFastAlternative = breakfast
            .filter(item => item.type === "sub_cat_item")
            .map(item => ({
                id: item.item_id,
                name: item.item_name,
                chinese_name: item.chinese_name,
                qty: item.qty,
                options: selectFirstOption(item.options),
                preference: item.preference
            }));
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
            preference: item.preference
        })) || [];
        const lunchEntree = mealData.lunch?.[1]?.items
            ?.filter(item => item.type === "item")
            .map(item => ({
                id: item.item_id,
                name: item.item_name,
                chinese_name: item.chinese_name,
                qty: item.qty,
                options: selectFirstOption(item.options),
                preference: item.preference
            })) || [];
        const lunchAlternative = mealData.lunch?.[1]?.items
            ?.filter(item => item.type === "sub_cat_item")
            .map(item => ({
                id: item.item_id,
                name: item.item_name,
                chinese_name: item.chinese_name,
                qty: item.qty,
                options: selectFirstOption(item.options),
                preference: item.preference
            })) || [];
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
                preference: item.preference
            })) || [];
        const dinnerAlternative = dinnerCat?.items
            ?.filter(item => item.type === "sub_cat_item")
            .map(item => ({
                id: item.item_id,
                name: item.item_name,
                chinese_name: item.chinese_name,
                qty: item.qty,
                options: selectFirstOption(item.options),
                preference: item.preference
            })) || [];
        const is_dinner_tray_service = mealData?.is_dinner_tray_service


        return {
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
            is_brk_tray_service,
            is_lunch_tray_service,
            is_dinner_tray_service,
        };
    }
    function buildOrderPayload(data, date) {
        console.log("data", data)
        // Helper to flatten and format items
        const collectItems = (arr = []) =>
            arr
                // .filter(item => item.qty > 0)
                .map(item => ({
                    item_id: item.id,
                    qty: item.qty,
                    order_id: item.order_id || 0,
                    //preference : "1,2,3"
                    preference: (item.preference || [])
                        .filter(p => p.is_selected)
                        .map(p => p.id)
                        .join(","),
                        //item_options: "3"

                    item_options: (item.options || [])
                        .filter(o => o.is_selected)
                        .map(o => o.id)
                        .join(","),
                }));

        // Collect all items
        const items = [
            ...collectItems(data.breakFastDailySpecial),
            ...collectItems(data.breakFastAlternative),
            ...collectItems(data.lunchSoup),
            ...collectItems(data.lunchEntree),
            ...collectItems(data.lunchAlternative),
            ...collectItems(data.dinnerSoup),
            ...collectItems(data.dinnerEntree),
            ...collectItems(data.dinnerAlternative),
        ];
        console.log("items items", items)

        // Helper for additional services
        const hasService = (arr, type) => Array.isArray(arr) && arr.includes(type) ? 1 : 0;

        return {
            date: date.format("YYYY-MM-DD"),
            room_id: roomNo,
            orders_to_change: JSON.stringify(items), // JSON RawString
            occupancy: guestCount,
            is_for_guest: 1,
            is_brk_tray_service:  data?.is_brk_tray_service, //hasService(data.is_brk_tray_service, "tray") ? 1 : 0,
            is_lunch_tray_service: data?.is_lunch_tray_service, //hasService(data.is_lunch_tray_service, "tray") ? 1 : 0,
            is_dinner_tray_service: data?.is_dinner_tray_service //hasService(data.is_dinner_tray_service, "tray") ? 1 : 0,
        };
    }

    const submitData = async (data, date) => {
        try {
            const payload = buildOrderPayload(data, date);
            console.log("payload", payload)
            let response = await OrderServices.updateGusetOrder(payload);
            if (response.ResponseText === "success") {
                toast.success("Guest Order submitted successfully!");
                // setData(transformMealData(mealData)); // <-- Now mealData is defined
            } else {
                toast.error(response.ResponseText || "Guest Order submission failed.");
            }
        } catch (error) {
            toast.error("An error occurred while submitting the order.");
            console.error(error);
        }
    };
    console.log("is_dinner_tray_service", data)
    return (
        <Box m="20px">
            <Header
                title={roomNo ? roomNo : userData?.room_id}
                icon={""}
                editRoomsDetails={false}
                isGuest={false}
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

                <Box sx={{ textAlign: "center" }}>
                    <Typography variant="h6" sx={{ mt: 3, mb: 2, fontWeight: 600 }}>
                        {dayjs(selectedDate).format("MMMM D, YYYY")}
                    </Typography>
                </Box>
                <Box
                    sx={{
                        bgcolor: "#f5f5f5",
                        borderRadius: 2,
                        p: 1,
                    }}
                >
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight: 600,
                            }}
                        >
                            No of Guest
                        </Typography>
                        <Box display="flex" alignItems="center">
                            <Button variant="outlined" sx={{ minWidth: 36, mx: 1 }} onClick={handleDecrement}>-</Button>
                            <Typography sx={{ mx: 1 }}>{guestCount}</Typography>
                            <Button variant="outlined" sx={{ minWidth: 36, mx: 1 }} onClick={handleIncrement}>+</Button>
                        </Box>
                    </Box>
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
                                                                            ? { ...i, qty: 0 }
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
                                                        <button
                                                            onClick={() =>
                                                                setData((prev) => ({
                                                                    ...prev,
                                                                    breakFastDailySpecial: prev.breakFastDailySpecial.map((i) =>
                                                                        i.id === item.id
                                                                            ? { ...i, qty: (i.qty || 0) + 1 } //{ ...i, qty: 1 }
                                                                            : { ...i, qty: 0 } // only single items selected 
                                                                    ),
                                                                }))
                                                            }
                                                            style={{ marginLeft: 8 }}
                                                            disabled={item.qty >= guestCount || isAfter10AM || isPast}
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
                                                                            ? { ...i, qty: Math.max((i.qty || 0) - 1, 0) }
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
                                                        <button
                                                            onClick={() =>
                                                                setData((prev) => ({
                                                                    ...prev,
                                                                    breakFastAlternative: prev.breakFastAlternative.map((i) =>
                                                                        i.id === item.id
                                                                            ? { ...i, qty: (i.qty || 0) + 1 } //{ ...i, qty: 1 }
                                                                            : { ...i, qty: 0 } // only single items selected 
                                                                    ),
                                                                }))
                                                            }
                                                            style={{ marginLeft: 8 }}
                                                            disabled={item.qty >= guestCount || isAfter10AM || isPast}
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
                                                                            ? { ...i, qty: Math.max((i.qty || 0) - 1, 0) }
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
                                                                        i.id === item.id
                                                                            ? { ...i, qty: (i.qty || 0) + 1 }
                                                                            : { ...i, qty: 0 }
                                                                    ),
                                                                }))
                                                            }
                                                            style={{ marginLeft: 8 }}
                                                            disabled={item.qty >= guestCount || isAfter3PM || isPast}
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
                                                                            ? { ...i, qty: Math.max((i.qty || 0) - 1, 0) }
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
                                                                    lunchEntree: prev.lunchEntree.map((i) =>
                                                                        i.id === item.id
                                                                            ? { ...i, qty: (i.qty || 0) + 1 } //{ ...i, qty: 1 }
                                                                            : { ...i, qty: 0 } // only single items selected i
                                                                    ),
                                                                }))
                                                            }
                                                            style={{ marginLeft: 8 }}
                                                            disabled={item.qty >= guestCount || isAfter3PM || isPast}
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
                                                                            ? { ...i, qty: Math.max((i.qty || 0) - 1, 0) }
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
                                                                    lunchAlternative: prev.lunchAlternative.map((i) =>
                                                                        i.id === item.id
                                                                            ? { ...i, qty: (i.qty || 0) + 1 }
                                                                            : { ...i, qty: 0 } // only single items selected i
                                                                    ),
                                                                }))
                                                            }
                                                            style={{ marginLeft: 8 }}
                                                            disabled={item.qty >= guestCount || isAfter3PM || isPast}
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
                                                                    i.id === item.id
                                                                        ? { ...i, qty: (i.qty || 0) + 1 } // { ...i, qty: 1 }
                                                                        : { ...i, qty: 0 } // only single items selected i
                                                                ),
                                                            }))
                                                        }
                                                        style={{ marginLeft: 8 }}
                                                        disabled={item.qty >= guestCount || isAfter12PM || isPast}
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
                                                                setData((prev) => ({
                                                                    ...prev,
                                                                    dinnerEntree: prev.dinnerEntree.map((i) =>
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
                                                                    dinnerEntree: prev.dinnerEntree.map((i) =>
                                                                        i.id === item.id
                                                                            ? { ...i, qty: (i.qty || 0) + 1 } //{ ...i, qty: 1 }
                                                                            : { ...i, qty: 0 } // only single items selected i
                                                                    ),
                                                                }))
                                                            }
                                                            style={{ marginLeft: 8 }}
                                                            disabled={item.qty >= guestCount || isAfter12PM || isPast}
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
                                                                setData((prev) => ({
                                                                    ...prev,
                                                                    dinnerAlternative: prev.dinnerAlternative.map((i) =>
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
                                                                    dinnerAlternative: prev.dinnerAlternative.map((i) =>
                                                                        i.id === item.id
                                                                            ? { ...i, qty: (i.qty || 0) + 1 } //{ ...i, qty: 1 }
                                                                            : i //{ ...i, qty: 0 } // only single items selected i
                                                                    ),
                                                                }))
                                                            }
                                                            style={{ marginLeft: 8 }}
                                                            disabled={item.qty >= guestCount || isAfter12PM || isPast}
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

export default GuestOrder;