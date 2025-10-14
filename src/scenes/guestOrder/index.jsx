import {
    Box, useTheme, Typography, Tabs, Tab,
    Button, Dialog, DialogTitle, DialogContent, DialogActions,
    TextField
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { Header } from "../../components";
import { tokens } from "../../theme";
import { useEffect, useState, useMemo, useCallback } from "react";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import CustomLoadingOverlay from "../../components/CustomLoadingOverlay";
import OrderServices from "../../services/orderServices";
import { toast, ToastContainer } from "react-toastify";
import { useLocation } from "react-router-dom";
import CustomButton from "../../components/CustomButton";
import en from "../../locales/Localizable_en";
import cn from "../../locales/Localizable_cn";
import 'dayjs/locale/zh-cn';
import { useLocalStorage } from "../../hooks";
import { 
  isToday, 
  isPast, 
  isAfterHour,
  getLanguageObject,
  getRoomId,
  calculateTotalMealQuantity,
  resetAllMealQuantities,
  transformCompleteMealData
} from "../../utils";
import config from "../../config";
import _ from 'lodash';

const { breakfastEndHour, lunchEndHour, dinnerEndHour } = config.mealTimes;

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

    const getDefaultTabIndex = useCallback(() => {
        const now = dayjs();
        if (now.hour() > lunchEndHour || (now.hour() === lunchEndHour && now.minute() > 0)) {
            return 2; // Dinner
        } else if (now.hour() > breakfastEndHour || (now.hour() === breakfastEndHour && now.minute() > 0)) {
            return 1; // Lunch
        }
        return 0; // Breakfast
    }, []);
    
    const [tabIndex, setTabIndex] = useState(getDefaultTabIndex());
    
    // Use date helpers and memoization
    const isTodayDate = useMemo(() => isToday(date), [date]);
    const isPastDate = useMemo(() => isPast(date), [date]);
    const isAfter10AM = useMemo(() => isTodayDate && isAfterHour(breakfastEndHour), [isTodayDate]);
    const isAfter3PM = useMemo(() => isTodayDate && isAfterHour(lunchEndHour), [isTodayDate]);
    const isAfter12PM = useMemo(() => isTodayDate && isAfterHour(dinnerEndHour), [isTodayDate]);

    const [userData] = useLocalStorage("userData", null);
    const [guestCount, setGuestCount] = useState(1);
    const [alertOpen, setAlertOpen] = useState(false);
    const [langObj, setLangObj] = useState(en);

    // Set language based on user preference
    useEffect(() => {
        setLangObj(getLanguageObject(userData, en, cn));
    }, [userData]);

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
        // Use helper to calculate total quantity efficiently
        const totalQty = calculateTotalMealQuantity(data);

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
        // Use helper to reset all quantities
        setData(resetAllMealQuantities(data));
        setGuestCount(prev => (prev > 1 ? prev - 1 : 1));
    };

    const handleAlertCancel = () => {
        setAlertOpen(false);
    };


    useEffect(() => {
        fetchMenuDetails();
    }, [date]);

    const fetchMenuDetails = async () => {
        try {
            setLoading(true);
            const roomId = getRoomId(userData, roomNo);
            const payload = {
                date: date.format("YYYY-MM-DD"),
                room_id: roomId
            };
            
            const response = await OrderServices.getGuestOrderList(payload);
            const transformedData = transformCompleteMealData(response);

            setGuestCount(_.get(response, 'occupancy', 1));
            setMealData(transformedData);
            setData(transformedData);
        } catch (error) {
            console.error("Error fetching menu list:", error);
            toast.error("Failed to load guest order data");
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

    const handleDateChange = (newDate) => {
        setDate(newDate);
        setData(data => ({
            ...data,
            breakfastCategories: (data.breakfastCategories || []).map(cat => ({
                ...cat,
                entreeItems: (cat.entreeItems || []).map(item => ({ ...item, qty: 0 })),
                alternativeItems: (cat.alternativeItems || []).map(item => ({ ...item, qty: 0 }))
            })),
            lunchCategories: (data.lunchCategories || []).map(cat => ({
                ...cat,
                entreeItems: (cat.entreeItems || []).map(item => ({ ...item, qty: 0 })),
                alternativeItems: (cat.alternativeItems || []).map(item => ({ ...item, qty: 0 }))
            })),
            dinnerCategories: (data.dinnerCategories || []).map(cat => ({
                ...cat,
                entreeItems: (cat.entreeItems || []).map(item => ({ ...item, qty: 0 })),
                alternativeItems: (cat.alternativeItems || []).map(item => ({ ...item, qty: 0 }))
            }))
        }));
        setGuestCount(prev => (prev > 1 ? prev - 1 : 1));
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
        const is_dinner_tray_service = mealData?.is_dinner_tray_service

        return {
            breakfastCategories,
            lunchCategories,
            dinnerCategories,
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
        // Only include changed breakfast items
        const getChangedBreakfastItems = (obj, originalObj) => {
            const updated = [
                ...flattenItems(obj.breakfastCategories.flatMap(cat => [...cat.entreeItems, ...cat.alternativeItems]))
            ];
            const original = [
                ...flattenItems(originalObj.breakfastCategories.flatMap(cat => [...cat.entreeItems, ...cat.alternativeItems]))
            ];

            const findOriginal = (item) =>
                original.find(
                    ori =>
                        ori.item_id === item.item_id &&
                        ori.order_id === item.order_id
                );

            const changedItems = [];
            updated.forEach(item => {
                const ori = findOriginal(item);
                if (!ori) {
                    if (item.qty > 0) changedItems.push(item);
                } else if (
                    item.qty !== ori.qty ||
                    item.preference !== ori.preference ||
                    item.item_options !== ori.item_options
                ) {
                    changedItems.push(item);
                }
            });

            // Also include removed items (qty set to 0)
            original.forEach(ori => {
                const key = `${ori.item_id}_${ori.order_id}`;
                if (!updated.some(item => `${item.item_id}_${item.order_id}` === key) && ori.qty > 0) {
                    changedItems.push({
                        ...ori,
                        qty: 0,
                        preference: "",
                        item_options: ""
                    });
                }
            });

            return changedItems;
        };

        function getChangedLunchItems(obj, originalObj) {
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

            const updated = [
                ...flattenItems(obj.lunchCategories.flatMap(cat => [...cat.entreeItems, ...cat.alternativeItems]))
            ];
            const original = [
                ...flattenItems(originalObj.lunchCategories.flatMap(cat => [...cat.entreeItems, ...cat.alternativeItems]))
            ];

            const findOriginal = (item) =>
                original.find(
                    ori =>
                        ori.item_id === item.item_id &&
                        ori.order_id === item.order_id
                );

            const changedItems = [];
            updated.forEach(item => {
                const ori = findOriginal(item);
                if (!ori) {
                    if (item.qty > 0) changedItems.push(item);
                } else if (
                    item.qty !== ori.qty ||
                    item.preference !== ori.preference ||
                    item.item_options !== ori.item_options
                ) {
                    changedItems.push(item);
                }
            });

            // Also include removed items (qty set to 0)
            original.forEach(ori => {
                const key = `${ori.item_id}_${ori.order_id}`;
                if (!updated.some(item => `${item.item_id}_${item.order_id}` === key) && ori.qty > 0) {
                    changedItems.push({
                        ...ori,
                        qty: 0,
                        preference: "",
                        item_options: ""
                    });
                }
            });

            return changedItems;
        };

        function getChangedDinnerItems(obj, originalObj) {
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

            const updated = [
                ...flattenItems(obj.dinnerCategories.flatMap(cat => [...cat.entreeItems, ...cat.alternativeItems]))
            ];
            const original = [
                ...flattenItems(originalObj.dinnerCategories.flatMap(cat => [...cat.entreeItems, ...cat.alternativeItems]))
            ];

            const findOriginal = (item) =>
                original.find(
                    ori =>
                        ori.item_id === item.item_id &&
                        ori.order_id === item.order_id
                );

            const changedItems = [];
            updated.forEach(item => {
                const ori = findOriginal(item);
                if (!ori) {
                    if (item.qty > 0) changedItems.push(item);
                } else if (
                    item.qty !== ori.qty ||
                    item.preference !== ori.preference ||
                    item.item_options !== ori.item_options
                ) {
                    changedItems.push(item);
                }
            });

            // Also include removed items (qty set to 0)
            original.forEach(ori => {
                const key = `${ori.item_id}_${ori.order_id}`;
                if (!updated.some(item => `${item.item_id}_${item.order_id}` === key) && ori.qty > 0) {
                    changedItems.push({
                        ...ori,
                        qty: 0,
                        preference: "",
                        item_options: ""
                    });
                }
            });

            return changedItems;
        };

        const getAllItems = (obj) => [
            ...flattenItems(obj.breakfastCategories),
            ...flattenItems(obj.lunchCategories),
            ...flattenItems(obj.dinnerCategories),
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
            // orders_to_change: JSON.stringify(items),
            orders_to_change: JSON.stringify([
                ...getChangedBreakfastItems(data, mealData),
                ...getChangedLunchItems(data, mealData),
                ...getChangedDinnerItems(data, mealData)

            ]),
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

        const updateCategories = (categories) => {
            if (!Array.isArray(categories)) return categories;
            return categories.map(cat => ({
                ...cat,
                entreeItems: updateItems(cat.entreeItems),
                alternativeItems: updateItems(cat.alternativeItems)
            }));
        };

        return {
            ...data,
            breakfastCategories: updateCategories(data.breakfastCategories),
            lunchCategories: updateCategories(data.lunchCategories),
            dinnerCategories: updateCategories(data.dinnerCategories),

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
                    fetchMenuDetails(date.format("YYYY-MM-DD"));

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
        <>
            <Dialog open={alertOpen} onClose={handleAlertCancel} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ textAlign: 'center', fontWeight: 600 }}>Remove All Items?</DialogTitle>
                <DialogContent sx={{ textAlign: 'center', fontSize: 16 }}>
                    Order is already selected for {
                        [
                            ...(data.breakfastCategories || []).flatMap(cat =>
                                [...(cat.entreeItems || []), ...(cat.alternativeItems || [])]
                            ),
                            ...(data.lunchCategories || []).flatMap(cat =>
                                [...(cat.entreeItems || []), ...(cat.alternativeItems || [])]
                            ),
                            ...(data.dinnerCategories || []).flatMap(cat =>
                                [...(cat.entreeItems || []), ...(cat.alternativeItems || [])]
                            ),
                        ].reduce((sum, item) => sum + (item.qty || 0), 0)
                    } guest(s).<br />
                    If you continue, it will remove all items from the order.
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
                    <Button onClick={handleAlertCancel} variant="outlined" color="primary">Cancel</Button>
                    <Button onClick={handleAlertContinue} variant="contained" color="error">Continue</Button>
                </DialogActions>
            </Dialog>
            <Box m="20px">
                <Header
                    title={roomNo ? `${roomNo} ${langObj.guest}` : `${userData?.room_id}  ${langObj.guest}`}
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

                    <Box sx={{ textAlign: "center" }}>
                        <Typography>
                            {userData?.language === 1
                                ? `${dayjs(date).locale("zh-cn").format("MMMM")} ${dayjs(date).format("D, YYYY")}`
                                : dayjs(date).format("MMMM D, YYYY")}
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
                                <Button
                                    variant="outlined"
                                    sx={{ minWidth: 36, mx: 1 }}
                                    onClick={handleDecrement}
                                    disabled={isPastDate}
                                >
                                    -
                                </Button>
                                <Typography sx={{ mx: 1 }}>{guestCount}</Typography>
                                <Button
                                    variant="outlined"
                                    sx={{ minWidth: 36, mx: 1 }}
                                    onClick={handleIncrement}
                                    disabled={isPastDate}
                                >
                                    +
                                </Button>
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
                                <>
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
                                                                    disabled={item.qty === 0 || isAfter10AM || isPastDate}
                                                                >
                                                                    -
                                                                </button>
                                                                <Typography>
                                                                    {item.qty || 0}
                                                                </Typography>
                                                                <button
                                                                    onClick={() => {
                                                                        setData(prev => {
                                                                            const totalQty =
                                                                                (prev.breakfastCategories[catIdx]?.entreeItems?.reduce((sum, i) => sum + (i.qty || 0), 0) || 0) +
                                                                                (prev.breakfastCategories[catIdx]?.alternativeItems?.reduce((sum, i) => sum + (i.qty || 0), 0) || 0);
                                                                            let newEntree = [...prev.breakfastCategories[catIdx].entreeItems];
                                                                            let newAlternative = [...(prev.breakfastCategories[catIdx].alternativeItems || [])];
                                                                            if (totalQty >= guestCount) {
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
                                                                    disabled={
                                                                        item.qty >= guestCount ||
                                                                        isAfter10AM ||
                                                                        isPastDate
                                                                    }
                                                                >
                                                                    +
                                                                </button>
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
                                                                    disabled={item.qty === 0 || isAfter10AM || isPastDate}
                                                                >
                                                                    -
                                                                </button>
                                                                <Typography>
                                                                    {item.qty || 0}
                                                                </Typography>
                                                                <button
                                                                    onClick={() => {
                                                                        setData(prev => {
                                                                            const totalQty =
                                                                                (prev.breakfastCategories[catIdx]?.entreeItems?.reduce((sum, i) => sum + (i.qty || 0), 0) || 0) +
                                                                                (prev.breakfastCategories[catIdx]?.alternativeItems?.reduce((sum, i) => sum + (i.qty || 0), 0) || 0);
                                                                            let newAlternative = [...prev.breakfastCategories[catIdx].alternativeItems];
                                                                            let newEntree = [...(prev.breakfastCategories[catIdx].entreeItems || [])];
                                                                            if (totalQty >= guestCount) {
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
                                                                    disabled={
                                                                        item.qty >= guestCount ||
                                                                        isAfter10AM ||
                                                                        isPastDate
                                                                    }
                                                                >
                                                                    +
                                                                </button>
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
                                        {Array.isArray(data.breakfastCategories) &&
                                            data.breakfastCategories.some(cat =>
                                                (cat.entreeItems && cat.entreeItems.some(item => item.qty > 0)) ||
                                                (cat.alternativeItems && cat.alternativeItems.some(item => item.qty > 0))
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
                                                </Box>
                                            )
                                        }
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

                                        {tabIndex === 0 &&
                                            Array.isArray(data.breakfastCategories) &&
                                            data.breakfastCategories.some(cat =>
                                                (cat.entreeItems && cat.entreeItems.some(item => item.qty > 0)) ||
                                                (cat.alternativeItems && cat.alternativeItems.some(item => item.qty > 0))
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
                                                        disabled={isAfter10AM || isPastDate}
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

                                </>
                            )}

                            {tabIndex === 1 && (
                                <>
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
                                                                    disabled={item.qty === 0 || isAfter3PM || isPastDate}
                                                                >
                                                                    -
                                                                </button>
                                                                <Typography>
                                                                    {item.qty || 0}
                                                                </Typography>
                                                                <button
                                                                    onClick={() => {
                                                                        setData(prev => {
                                                                            const totalQty =
                                                                                (prev.lunchCategories[catIdx]?.entreeItems?.reduce((sum, i) => sum + (i.qty || 0), 0) || 0) +
                                                                                (prev.lunchCategories[catIdx]?.alternativeItems?.reduce((sum, i) => sum + (i.qty || 0), 0) || 0);
                                                                            let newEntree = [...prev.lunchCategories[catIdx].entreeItems];
                                                                            let newAlternative = [...(prev.lunchCategories[catIdx].alternativeItems || [])];
                                                                            if (totalQty >= guestCount) {
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
                                                                    disabled={item.qty >= guestCount || isAfter3PM || isPastDate}
                                                                >
                                                                    +
                                                                </button>
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
                                                                    disabled={item.qty === 0 || isAfter3PM || isPastDate}
                                                                >
                                                                    -
                                                                </button>
                                                                <Typography>
                                                                    {item.qty || 0}
                                                                </Typography>
                                                                <button
                                                                    onClick={() => {
                                                                        setData(prev => {
                                                                            const totalQty =
                                                                                (prev.lunchCategories[catIdx]?.entreeItems?.reduce((sum, i) => sum + (i.qty || 0), 0) || 0) +
                                                                                (prev.lunchCategories[catIdx]?.alternativeItems?.reduce((sum, i) => sum + (i.qty || 0), 0) || 0);
                                                                            let newAlternative = [...prev.lunchCategories[catIdx].alternativeItems];
                                                                            let newEntree = [...(prev.lunchCategories[catIdx].entreeItems || [])];
                                                                            if (totalQty >= guestCount) {
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
                                                                    disabled={item.qty >= guestCount || isAfter3PM || isPastDate}
                                                                >
                                                                    +
                                                                </button>
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
                                            )
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

                                        {tabIndex === 1 &&
                                            Array.isArray(data.lunchCategories) &&
                                            data.lunchCategories.some(cat =>
                                                (cat.entreeItems && cat.entreeItems.some(item => item.qty > 0)) ||
                                                (cat.alternativeItems && cat.alternativeItems.some(item => item.qty > 0))
                                            ) &&
                                            (
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
                                                        disabled={isAfter3PM || isPastDate}
                                                        onClick={() => {
                                                            submitData(data, date)
                                                        }}
                                                    >
                                                        {langObj.submit}
                                                    </CustomButton>
                                                </Box>
                                            )}
                                    </Box>

                                </>
                            )}

                            {tabIndex === 2 && (
                                <>
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
                                                                    disabled={item.qty === 0 || isAfter12PM || isPastDate}
                                                                >
                                                                    -
                                                                </button>
                                                                <Typography >
                                                                    {item.qty || 0}
                                                                </Typography>
                                                                <button
                                                                    onClick={() => {
                                                                        setData(prev => {
                                                                            const totalQty =
                                                                                (prev.dinnerCategories[catIdx]?.entreeItems?.reduce((sum, i) => sum + (i.qty || 0), 0) || 0) +
                                                                                (prev.dinnerCategories[catIdx]?.alternativeItems?.reduce((sum, i) => sum + (i.qty || 0), 0) || 0);
                                                                            let newEntree = [...prev.dinnerCategories[catIdx].entreeItems];
                                                                            let newAlternative = [...(prev.dinnerCategories[catIdx].alternativeItems || [])];
                                                                            if (totalQty >= guestCount) {
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
                                                                    disabled={item.qty >= guestCount || isAfter12PM || isPastDate}
                                                                >
                                                                    +
                                                                </button>
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
                                                                    disabled={item.qty === 0 || isAfter12PM || isPastDate}
                                                                >
                                                                    -
                                                                </button>

                                                                <Typography >
                                                                    {item.qty || 0}
                                                                </Typography>

                                                                <button
                                                                    onClick={() => {
                                                                        setData(prev => {
                                                                            const totalQty =
                                                                                (prev.dinnerCategories[catIdx]?.entreeItems?.reduce((sum, i) => sum + (i.qty || 0), 0) || 0) +
                                                                                (prev.dinnerCategories[catIdx]?.alternativeItems?.reduce((sum, i) => sum + (i.qty || 0), 0) || 0);
                                                                            let newAlternative = [...prev.dinnerCategories[catIdx].alternativeItems];
                                                                            let newEntree = [...(prev.dinnerCategories[catIdx].entreeItems || [])];
                                                                            if (totalQty >= guestCount) {
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
                                                                    disabled={item.qty >= guestCount || isAfter12PM || isPastDate}
                                                                >
                                                                    +
                                                                </button>
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
                                            )
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

                                        {tabIndex === 2 &&
                                            Array.isArray(data.dinnerCategories) &&
                                            data.dinnerCategories.some(cat =>
                                                (cat.entreeItems && cat.entreeItems.some(item => item.qty > 0)) ||
                                                (cat.alternativeItems && cat.alternativeItems.some(item => item.qty > 0))
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
                                                        disabled={isAfter12PM || isPastDate}
                                                        onClick={() => {
                                                            submitData(data, date)
                                                        }}
                                                    >
                                                        {langObj.submit}
                                                    </CustomButton>
                                                </Box>
                                            )}
                                    </Box>
                                </>
                            )}
                        </>
                    )}
                </Box>
            </Box>
        </>
    );
};

export default GuestOrder;