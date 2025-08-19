import {
    Box, useTheme, Typography, Tabs, Tab,
    Button, Dialog, DialogTitle, DialogContent, DialogActions
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
import en from "../../locales/Localizable_en";
import cn from "../../locales/Localizable_cn";

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
    const [alertOpen, setAlertOpen] = useState(false);
    const [langObj, setLangObj] = useState(en);

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

    const handleIncrement = () => {
        setGuestCount(prev => {
            if (prev >= 10) {
                toast.warn(langObj.maximumGuestWarn);
                return prev;
            }
            return prev + 1;
        });
    };
    const handleDecrement = () => {
        const totalQty = [
            ...(data.breakFastDailySpecial || []),
            ...(data.breakFastAlternative || []),
            ...(data.lunchSoup || []),
            ...(data.lunchEntree || []),
            ...(data.lunchAlternative || []),
            ...(data.dinnerEntree || []),
            ...(data.dinnerAlternative || [])
        ].reduce((sum, item) => sum + (item.qty || 0), 0);

        setGuestCount(prev => {
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

    const handleAlertContinue = () => {
        setAlertOpen(false);
        // All Selected items Qty remove
        setData(data => ({
            ...data,
            breakFastDailySpecial: (data.breakFastDailySpecial || []).map(item => ({ ...item, qty: 0 })),
            breakFastAlternative: (data.breakFastAlternative || []).map(item => ({ ...item, qty: 0 })),
            lunchSoup: (data.lunchSoup || []).map(item => ({ ...item, qty: 0 })),
            lunchEntree: (data.lunchEntree || []).map(item => ({ ...item, qty: 0 })),
            lunchAlternative: (data.lunchAlternative || []).map(item => ({ ...item, qty: 0 })),
            dinnerEntree: (data.dinnerEntree || []).map(item => ({ ...item, qty: 0 })),
            dinnerAlternative: (data.dinnerAlternative || []).map(item => ({ ...item, qty: 0 })),
        }));
        setGuestCount(prev => (prev > 1 ? prev - 1 : 1));
    };

    const handleAlertCancel = () => {
        setAlertOpen(false);
    };


    useEffect(() => {
        console.log(date)
        const fetchMenuDetails = async () => {
            try {
                setLoading(true);
                let selectedObj = userData?.rooms.find((x) => x.name === roomNo);
                const payload = {
                    date: date.format("YYYY-MM-DD"),
                    room_id: selectedObj ? selectedObj?.id : userData?.room_id
                }
                const response = await OrderServices.guestOrderListData(payload);
                //console.log(response)
                let data = {
                    breakfast: response.breakfast,
                    lunch: response?.lunch,
                    dinner: response?.dinner,
                    is_dinner_tray_service: response?.is_dinner_tray_service,
                    is_brk_tray_service: response?.is_brk_tray_service,
                    is_lunch_tray_service: response?.is_lunch_tray_service
                };

                setGuestCount(response?.occupancy)
                setMealData(transformMealData(data));
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
        //console.log("MEAL DATA ==>", mealData)
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
        // mealData.lunch?.[0]?.items?.map(item => ({
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
        const is_dinner_tray_service = mealData?.is_dinner_tray_service


        return {
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
            is_brk_tray_service,
            is_lunch_tray_service,
            is_dinner_tray_service,
        };
    }
    function buildOrderPayload(data, date) {
        const flattenItems = (arr = []) =>
            arr.map(item => ({
                item_id: item.id,
                qty: item.qty,
                order_id: item.order_id || 0,
                preference: (item.preference || [])
                    .filter(p => p.is_selected)
                    .map(p => p.id)
                    .join(","),
                item_options: (item.options || [])
                    .filter(o => o.is_selected)
                    .map(o => o.id)
                    .join(","),
            }));

        const getAllItems = (obj) => [
            ...flattenItems(obj.breakFastDailySpecial),
            ...flattenItems(obj.breakFastAlternative),
            ...flattenItems(obj.lunchSoup),
            ...flattenItems(obj.lunchEntree),
            ...flattenItems(obj.lunchAlternative),
            ...flattenItems(obj.dinnerSoup),
            ...flattenItems(obj.dinnerEntree),
            ...flattenItems(obj.dinnerAlternative),
        ];

        const updatedItems = getAllItems(data);
        const originalItems = getAllItems(mealData);

        const findOriginal = (item) =>
            originalItems.find(
                ori =>
                    ori.item_id === item.item_id &&
                    ori.order_id === item.order_id
            );

        const updatedMap = new Map(
            updatedItems.map(item => [`${item.item_id}_${item.order_id}`, item])
        );

        const items = [];

        updatedItems.forEach(item => {
            const ori = findOriginal(item);
            if (!ori) {
                if (item.qty > 0) items.push(item);
            } else if (
                item.qty !== ori.qty ||
                item.preference !== ori.preference ||
                item.item_options !== ori.item_options
            ) {
                items.push(item);
            }
        });

        // 2. Check originalItems for removed items not present in updatedItems
        originalItems.forEach(ori => {
            const key = `${ori.item_id}_${ori.order_id}`;
            if (!updatedMap.has(key) && ori.qty > 0) {
                // Item was removed completely, send with qty:0
                items.push({
                    ...ori,
                    qty: 0,
                    preference: "",
                    item_options: ""
                });
            }
        });

        let selectedObj = userData?.rooms.find((x) => x.name === roomNo);
        return {
            date: date.format("YYYY-MM-DD"),
            room_id: selectedObj?.id,
            orders_to_change: JSON.stringify(items),
            occupancy: guestCount,
            is_for_guest: 1,
            is_brk_tray_service: data?.is_brk_tray_service,
            is_lunch_tray_service: data?.is_lunch_tray_service,
            is_dinner_tray_service: data?.is_dinner_tray_service
        };
    }

    const updateOrderIdsInData = (data, itemIds, orderIds) => {
        const updateItems = (items) => {
            if (!Array.isArray(items)) return items;
            return items.map(item => {
                const idx = itemIds.findIndex(id => id === item.id);
                if (idx !== -1) {
                    return { ...item, order_id: orderIds[idx] };
                }
                return item;
            });
        };
        return {
            ...data,
            breakFastDailySpecial: updateItems(data.breakFastDailySpecial),
            breakFastAlternative: updateItems(data.breakFastAlternative),
            lunchSoup: updateItems(data.lunchSoup),
            lunchEntree: updateItems(data.lunchEntree),
            lunchAlternative: updateItems(data.lunchAlternative),
            dinnerSoup: updateItems(data.dinnerSoup),
            dinnerEntree: updateItems(data.dinnerEntree),
            dinnerAlternative: updateItems(data.dinnerAlternative),
        };
    };

    const submitData = async (data, date) => {
        // console.log("data", data)
        try {
            const payload = buildOrderPayload(data, date);
            // //console.log("Submit Guest payload ", payload);
            // //console.log("Meal Data =>", mealData);
            let response = await OrderServices.updateGusetOrder(payload);
            if (response.ResponseText === "success") {
                if (response?.item_id && response?.order_id) {
                    setData(prevData =>
                        updateOrderIdsInData(prevData, response.item_id, response.order_id)
                    );
                }
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
    //console.log(" DATA ==>", data)

    const totalLunchSoupQty = (data.lunchSoup || []).reduce((sum, i) => sum + (i.qty || 0), 0);
    const totalDinnerSoupQty = (data.dinnerSoup || []).reduce((sum, i) => sum + (i.qty || 0), 0);

    const showBreakFastGuideline =
        userData?.guideline &&
        data.breakFastDailySpecial &&
        data.breakFastDailySpecial.length > 0;

    const showLunchGuideline =
        userData?.guideline &&
        data.lunchSoup && data.lunchSoup.length > 0 ||
        data.lunchEntree && data.lunchEntree.length > 0 ||
        data.lunchAlternative && data.lunchAlternative.length > 0;

    return (
        <>
            <Dialog open={alertOpen} onClose={handleAlertCancel} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ textAlign: 'center', fontWeight: 600 }}>Remove All Items?</DialogTitle>
                <DialogContent sx={{ textAlign: 'center', fontSize: 16 }}>
                    Order is already selected for {[
                        ...(data.breakFastDailySpecial || []),
                        ...(data.breakFastAlternative || []),
                        ...(data.lunchSoup || []),
                        ...(data.lunchEntree || []),
                        ...(data.lunchAlternative || []),
                        ...(data.dinnerEntree || []),
                        ...(data.dinnerAlternative || [])
                    ].reduce((sum, item) => sum + (item.qty || 0), 0)} guest(s).<br />
                    If you continue, it will remove all items from the order.
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
                    <Button onClick={handleAlertCancel} variant="outlined" color="primary">Cancel</Button>
                    <Button onClick={handleAlertContinue} variant="contained" color="error">Continue</Button>
                </DialogActions>
            </Dialog>
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
                        <Typography>
                            {userData?.language === 1
                                ? `${dayjs(selectedDate).locale("zh-cn").format("MMMM")} ${dayjs(selectedDate).format("D, YYYY")}`
                                : dayjs(selectedDate).format("MMMM D, YYYY")}
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
                                {langObj.noOfGuests}
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
                                                            <button
                                                                onClick={() => {
                                                                    setData((prev) => {
                                                                        const totalQty = (prev.breakFastDailySpecial?.reduce((sum, i) => sum + (i.qty || 0), 0) || 0) +
                                                                            (prev.breakFastAlternative?.reduce((sum, i) => sum + (i.qty || 0), 0) || 0);
                                                                        let newSpecial = [...prev.breakFastDailySpecial];
                                                                        let newAlternative = [...(prev.breakFastAlternative || [])];
                                                                        if (totalQty >= guestCount) {
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
                                                                    item.qty >= guestCount ||
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
                                                            <button
                                                                onClick={() => {
                                                                    setData((prev) => {
                                                                        const totalQty = (prev.breakFastDailySpecial?.reduce((sum, i) => sum + (i.qty || 0), 0) || 0) +
                                                                            (prev.breakFastAlternative?.reduce((sum, i) => sum + (i.qty || 0), 0) || 0);
                                                                        let newAlternative = [...prev.breakFastAlternative];
                                                                        let newSpecial = [...(prev.breakFastDailySpecial || [])];
                                                                        if (totalQty >= guestCount) {
                                                                            let removed = false;
                                                                            newSpecial = newSpecial.map((sp) => {
                                                                                if (!removed && sp.qty > 0) {
                                                                                    removed = true;
                                                                                    return { ...sp, qty: sp.qty - 1 };
                                                                                }
                                                                                return sp;
                                                                            });
                                                                            if (!removed) {
                                                                                newAlternative = newAlternative.map((alt) => {
                                                                                    if (!removed && alt.id !== item.id && alt.qty > 0) {
                                                                                        removed = true;
                                                                                        return { ...alt, qty: alt.qty - 1 };
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
                                                                    item.qty >= guestCount ||
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
                                            <Box mt={3} display="flex" gap={3}>
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
                                            </Box>
                                        )}
                                    {/* Add GuideLine */}
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
                                    {(
                                        (data.breakFastDailySpecial?.some(item => item.qty > 0) || data.breakFastAlternative?.some(item => item.qty > 0)) ||
                                        (data.lunchSoup?.some(item => item.qty > 0) || data.lunchEntree?.some(item => item.qty > 0) || data.lunchAlternative?.some(item => item.qty > 0)) ||
                                        (data.dinnerSoup?.some(item => item.qty > 0) || data.dinnerEntree?.some(item => item.qty > 0) || data.dinnerAlternative?.some(item => item.qty > 0))
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
                                                                    item.qty >= guestCount ||
                                                                    totalLunchSoupQty >= guestCount ||
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
                                                                onClick={() => {
                                                                    setData((prev) => {
                                                                        const totalQty = (prev.lunchEntree?.reduce((sum, i) => sum + (i.qty || 0), 0) || 0) +
                                                                            (prev.lunchAlternative?.reduce((sum, i) => sum + (i.qty || 0), 0) || 0);
                                                                        let newEntree = [...prev.lunchEntree];
                                                                        let newAlternative = [...(prev.lunchAlternative || [])];
                                                                        if (totalQty >= guestCount) {
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
                                                                    item.qty >= guestCount ||
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
                                                                onClick={() => {
                                                                    setData((prev) => {
                                                                        const totalQty = (prev.lunchEntree?.reduce((sum, i) => sum + (i.qty || 0), 0) || 0) +
                                                                            (prev.lunchAlternative?.reduce((sum, i) => sum + (i.qty || 0), 0) || 0);
                                                                        let newAlternative = [...prev.lunchAlternative];
                                                                        let newEntree = [...(prev.lunchEntree || [])];
                                                                        if (totalQty >= guestCount) {
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
                                                                    item.qty >= guestCount ||
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
                                            </Box>
                                        )}
                                    {/* Add GuideLine */}
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
                                    {/* Add lunch submit button,  if breakfast not submited then here breakfast and lunch submited */}
                                    {(
                                        (data.breakFastDailySpecial?.some(item => item.qty > 0) || data.breakFastAlternative?.some(item => item.qty > 0)) ||
                                        (data.lunchSoup?.some(item => item.qty > 0) || data.lunchEntree?.some(item => item.qty > 0) || data.lunchAlternative?.some(item => item.qty > 0)) ||
                                        (data.dinnerSoup?.some(item => item.qty > 0) || data.dinnerEntree?.some(item => item.qty > 0) || data.dinnerAlternative?.some(item => item.qty > 0))
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
                                                                item.qty >= guestCount ||
                                                                totalDinnerSoupQty >= guestCount ||
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
                                                                onClick={() => {
                                                                    setData((prev) => {
                                                                        const totalQty = (prev.dinnerEntree?.reduce((sum, i) => sum + (i.qty || 0), 0) || 0) +
                                                                            (prev.dinnerAlternative?.reduce((sum, i) => sum + (i.qty || 0), 0) || 0);
                                                                        let newEntree = [...prev.dinnerEntree];
                                                                        let newAlternative = [...(prev.dinnerAlternative || [])];
                                                                        if (totalQty >= guestCount) {
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
                                                                    item.qty >= guestCount ||
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
                                                            <button
                                                                onClick={() => {
                                                                    setData((prev) => {
                                                                        const totalQty = (prev.dinnerEntree?.reduce((sum, i) => sum + (i.qty || 0), 0) || 0) +
                                                                            (prev.dinnerAlternative?.reduce((sum, i) => sum + (i.qty || 0), 0) || 0);
                                                                        let newAlternative = [...prev.dinnerAlternative];
                                                                        let newEntree = [...(prev.dinnerEntree || [])];
                                                                        if (totalQty >= guestCount) {
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
                                                                    item.qty >= guestCount ||
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
                                    {(
                                        (data.breakFastDailySpecial?.some(item => item.qty > 0) || data.breakFastAlternative?.some(item => item.qty > 0)) ||
                                        (data.lunchSoup?.some(item => item.qty > 0) || data.lunchEntree?.some(item => item.qty > 0) || data.lunchAlternative?.some(item => item.qty > 0)) ||
                                        (data.dinnerSoup?.some(item => item.qty > 0) || data.dinnerEntree?.some(item => item.qty > 0) || data.dinnerAlternative?.some(item => item.qty > 0))
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
        </>
    );
};

export default GuestOrder;