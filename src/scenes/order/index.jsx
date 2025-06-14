import {
    Box, useTheme, Table, TableHead, TableBody, TableRow, TableCell,
    TableContainer, Paper, Typography, Tabs, Tab
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { Header } from "../../components";
import { tokens } from "../../theme";
import { LocalPizzaOutlined, TagOutlined } from "@mui/icons-material";
import { useEffect, useState, useCallback } from "react";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import CustomLoadingOverlay from "../../components/CustomLoadingOverlay";

// ...reportData definition remains unchanged...
let mealData = {
      "breakfast": [
        {
            "cat_id": 1,
            "cat_name": "BREAKFAST DAILY SPECIAL",
            "chinese_name": "是日精選",
            "items": [
                {
                    "type": "item",
                    "item_id": 649,
                    "item_name": "Egg, Turkey Bacon, Hashbrowns, Whole Wheat and Oatmeal & Fruits",
                    "chinese_name": "雞蛋、火雞培根、土豆餅、全麥和燕麥、水果",
                    "options": [],
                    "preference": [],
                    "item_image": null,
                    "qty": 0,
                    "comment": "",
                    "order_id": 0
                },
                {
                    "type": "sub_cat",
                    "item_id": 4,
                    "item_name": "BREAKFAST ALTERNATIVES",
                    "chinese_name": "其他早晨選擇",
                    "options": [],
                    "preference": [],
                    "item_image": "",
                    "qty": 0,
                    "comment": "",
                    "order_id": 0
                },
                {
                    "type": "sub_cat_item",
                    "item_id": 4,
                    "item_name": "Choice of Egg",
                    "chinese_name": "雞蛋",
                    "item_image": null,
                    "options": [],
                    "preference": [],
                    "qty": 0,
                    "comment": "",
                    "order_id": 0
                },
                {
                    "type": "sub_cat_item",
                    "item_id": 191,
                    "item_name": "Toast",
                    "chinese_name": "吐司",
                    "item_image": null,
                    "options": [],
                    "preference": [],
                    "qty": 0,
                    "comment": "",
                    "order_id": 0
                },
                {
                    "type": "sub_cat_item",
                    "item_id": 192,
                    "item_name": "Oatmeal",
                    "chinese_name": "麥皮",
                    "item_image": null,
                    "options": [],
                    "preference": [],
                    "qty": 0,
                    "comment": "",
                    "order_id": 0
                },
                {
                    "type": "sub_cat_item",
                    "item_id": 193,
                    "item_name": "Fruit",
                    "chinese_name": "水果",
                    "item_image": null,
                    "options": [],
                    "preference": [],
                    "qty": 0,
                    "comment": "",
                    "order_id": 0
                }
            ]
        }
    ],
    "lunch": [
        {
            "cat_id": 2,
            "cat_name": "LUNCH SOUP",
            "chinese_name": "湯",
            "items": [
                {
                    "type": "item",
                    "item_id": 470,
                    "item_name": "Soup of the Day",
                    "chinese_name": null,
                    "options": [],
                    "preference": [],
                    "item_image": null,
                    "qty": 0,
                    "comment": "",
                    "order_id": 0
                }
            ]
        },
        {
            "cat_id": 5,
            "cat_name": "LUNCH ENTREE",
            "chinese_name": "主菜",
            "items": [
                {
                    "type": "item",
                    "item_id": 522,
                    "item_name": "Chicken With Black Beans on Rice and Steamed Broccoli",
                    "chinese_name": "豆豉雞飯",
                    "options": [
                        {
                            "id": 1,
                            "name": "Rice",
                            "c_name": "Rice",
                            "is_selected": 0
                        },
                        {
                            "id": 3,
                            "name": "Yam Fries ( extra $5)",
                            "c_name": "山药薯条 (额外 5 美元)",
                            "is_selected": 0
                        }
                    ],
                    "preference": [],
                    "item_image": null,
                    "qty": 0,
                    "comment": "",
                    "order_id": 0
                },
                {
                    "type": "item",
                    "item_id": 571,
                    "item_name": "Tuna & Avocado Sandwich with Salad",
                    "chinese_name": "吞拿魚蛋黃醬三明治配蕃薯條",
                    "options": [],
                    "preference": [
                        {
                            "id": 3,
                            "name": "Less Sugar",
                            "c_name": "Less Sugar",
                            "is_selected": 0
                        },
                        {
                            "id": 4,
                            "name": "No Rice",
                            "c_name": "No Rice",
                            "is_selected": 0
                        }
                    ],
                    "item_image": null,
                    "qty": 0,
                    "comment": "",
                    "order_id": 0
                },
                {
                    "type": "sub_cat",
                    "item_id": 8,
                    "item_name": "LUNCH ALTERNATIVES",
                    "chinese_name": "其他午餐選擇",
                    "options": [],
                    "preference": [],
                    "item_image": "",
                    "qty": 0,
                    "comment": "",
                    "order_id": 0
                },
                {
                    "type": "sub_cat_item",
                    "item_id": 119,
                    "item_name": "Egg Salad Sandwich",
                    "chinese_name": "蛋沙律三文治",
                    "item_image": null,
                    "options": [],
                    "preference": [],
                    "qty": 0,
                    "comment": "",
                    "order_id": 0
                },
                {
                    "type": "sub_cat_item",
                    "item_id": 120,
                    "item_name": "Ham and Cheese Sandwich",
                    "chinese_name": "火腿芝士三文治",
                    "item_image": null,
                    "options": [],
                    "preference": [],
                    "qty": 0,
                    "comment": "",
                    "order_id": 0
                },
                {
                    "type": "sub_cat_item",
                    "item_id": 121,
                    "item_name": "Turkey Sandwich",
                    "chinese_name": "火雞三文治",
                    "item_image": null,
                    "options": [],
                    "preference": [],
                    "qty": 0,
                    "comment": "",
                    "order_id": 0
                },
                {
                    "type": "sub_cat_item",
                    "item_id": 122,
                    "item_name": "Cheese Omelette",
                    "chinese_name": "芝士奄列",
                    "item_image": null,
                    "options": [],
                    "preference": [],
                    "qty": 0,
                    "comment": "",
                    "order_id": 0
                }
            ]
        }
    ],
    "dinner": [
        {
            "cat_id": 3,
            "cat_name": "DINNER ENTREE",
            "chinese_name": "主菜",
            "items": [
                {
                    "type": "item",
                    "item_id": 624,
                    "item_name": "Salt Baked Chicken with Rice and Steamed Bok Choy",
                    "chinese_name": "鹽焗雞飯配白菜",
                    "options": [],
                    "preference": [],
                    "item_image": null,
                    "qty": 0,
                    "comment": "",
                    "order_id": 0
                },
                {
                    "type": "item",
                    "item_id": 642,
                    "item_name": "White Wine Seafood Pasta (Clam, Shrimp, Baby Scallop) and Broccoli",
                    "chinese_name": "白酒海鮮意粉（蜆、蝦、帶子）配西蘭花",
                    "options": [
                        {
                            "id": 1,
                            "name": "Rice",
                            "c_name": "Rice",
                            "is_selected": 0
                        },
                        {
                            "id": 2,
                            "name": "Noodles",
                            "c_name": "Noodles",
                            "is_selected": 0
                        },
                        {
                            "id": 3,
                            "name": "Yam Fries ( extra $5)",
                            "c_name": "山药薯条 (额外 5 美元)",
                            "is_selected": 0
                        }
                    ],
                    "preference": [
                        {
                            "id": 1,
                            "name": "Less oil",
                            "c_name": "Less oil",
                            "is_selected": 0
                        },
                        {
                            "id": 2,
                            "name": "Less Salt",
                            "c_name": "少盐",
                            "is_selected": 0
                        }
                    ],
                    "item_image": null,
                    "qty": 0,
                    "comment": "",
                    "order_id": 0
                },
                {
                    "type": "sub_cat",
                    "item_id": 11,
                    "item_name": "DINNER ALTERNATIVES",
                    "chinese_name": "其他晚餐選擇",
                    "options": [],
                    "preference": [],
                    "item_image": "",
                    "qty": 0,
                    "comment": "",
                    "order_id": 0
                },
                {
                    "type": "sub_cat_item",
                    "item_id": 78,
                    "item_name": "Pan Seared Chicken Breast",
                    "chinese_name": "香煎雞胸",
                    "item_image": null,
                    "options": [],
                    "preference": [],
                    "qty": 0,
                    "comment": "",
                    "order_id": 0
                },
                {
                    "type": "sub_cat_item",
                    "item_id": 159,
                    "item_name": "Pan Seared Fish",
                    "chinese_name": "煎魚",
                    "item_image": null,
                    "options": [],
                    "preference": [],
                    "qty": 0,
                    "comment": "",
                    "order_id": 0
                },
                {
                    "type": "sub_cat_item",
                    "item_id": 161,
                    "item_name": "Vegetarian Plate",
                    "chinese_name": "素食",
                    "item_image": null,
                    "options": [],
                    "preference": [],
                    "qty": 0,
                    "comment": "",
                    "order_id": 0
                },
                {
                    "type": "sub_cat_item",
                    "item_id": 162,
                    "item_name": "Sandwich of the Day",
                    "chinese_name": "是日三文治",
                    "item_image": null,
                    "options": [],
                    "preference": [],
                    "qty": 0,
                    "comment": "",
                    "order_id": 0
                }
            ]
        }
    ],
}


const Order = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const [date, setDate] = useState(dayjs());
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState({});
    const [tabIndex, setTabIndex] = useState(0);
    useEffect(() => {
        const fetchReports = async () => {
            try {
                setLoading(true);
                // const response = await ReportServices.getReportList(date.format("YYYY-MM-DD"));
                // setData(mealData);
                setData(transformMealData(mealData));
            } catch (error) {
                console.error("Error fetching menu list:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchReports();
    }, [date]);

    // ...existing code...

  // ...existing code...

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
    };
}

// ...existing code...

    // ...existing code...
    console.log("Meal data", data)
    return (
        <Box m="20px">
            <Header
                title="Room Number Here"
                icon={<TagOutlined />}
            />
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
                            onChange={(newValue) => setDate(newValue)}
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
                                                                            ? { ...i, qty: Math.max((i.qty || 0) - 1, 0) }
                                                                            : i
                                                                    ),
                                                                }))
                                                            }
                                                            style={{ marginRight: 8 }}
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
                                                                            ? { ...i, qty: (i.qty || 0) + 1 }
                                                                            : i
                                                                    ),
                                                                }))
                                                            }
                                                            style={{ marginLeft: 8 }}
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

                                {/* Alternatives */}
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
                                                                            ? { ...i, qty: (i.qty || 0) + 1 }
                                                                            : i
                                                                    ),
                                                                }))
                                                            }
                                                            style={{ marginLeft: 8 }}
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
                                {/* After all Items Display then if quantity graterthern 0 after show 2 check box like Escort Service and tray Service */}
                                {(
                                    (data.breakFastDailySpecial?.some(item => item.qty > 0) || data.breakFastAlternative?.some(item => item.qty > 0))
                                ) && (
                                        <Box mt={3}>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                                                Additional Services
                                            </Typography>
                                            <label style={{ marginRight: 24 }}>
                                                <input
                                                    type="checkbox"
                                                    checked={Array.isArray(data.breakfast_additional_services) && data.breakfast_additional_services.includes('escort')}
                                                    onChange={e => {
                                                        setData(prev => {
                                                            const arr = Array.isArray(prev.breakfast_additional_services) ? prev.breakfast_additional_services : [];
                                                            return {
                                                                ...prev,
                                                                breakfast_additional_services: e.target.checked
                                                                    ? [...arr, 'escort']
                                                                    : arr.filter(s => s !== 'escort')
                                                            };
                                                        });
                                                    }}
                                                />
                                                Escort Service
                                            </label>
                                            <label>
                                                <input
                                                    type="checkbox"
                                                    checked={Array.isArray(data.breakfast_additional_services) && data.breakfast_additional_services.includes('tray')}
                                                    onChange={e => {
                                                        setData(prev => {
                                                            const arr = Array.isArray(prev.breakfast_additional_services) ? prev.breakfast_additional_services : [];
                                                            return {
                                                                ...prev,
                                                                breakfast_additional_services: e.target.checked
                                                                    ? [...arr, 'tray']
                                                                    : arr.filter(s => s !== 'tray')
                                                            };
                                                        });
                                                    }}
                                                />
                                                Tray Service
                                            </label>
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
                                                                            : i
                                                                    ),
                                                                }))
                                                            }
                                                            style={{ marginLeft: 8 }}
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

                                {/* Entree */}
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
                                                                            ? { ...i, qty: (i.qty || 0) + 1 }
                                                                            : i
                                                                    ),
                                                                }))
                                                            }
                                                            style={{ marginLeft: 8 }}
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

                                {/* Alternatives */}
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
                                                                            : i
                                                                    ),
                                                                }))
                                                            }
                                                            style={{ marginLeft: 8 }}
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
                                            <label style={{ marginRight: 24 }}>
                                                <input
                                                    type="checkbox"
                                                    checked={Array.isArray(data.lunch_additional_services) && data.lunch_additional_services.includes('escort')}
                                                    onChange={e => {
                                                        setData(prev => {
                                                            const arr = Array.isArray(prev.lunch_additional_services) ? prev.lunch_additional_services : [];
                                                            return {
                                                                ...prev,
                                                                lunch_additional_services: e.target.checked
                                                                    ? [...arr, 'escort']
                                                                    : arr.filter(s => s !== 'escort')
                                                            };
                                                        });
                                                    }}
                                                />
                                                Escort Service
                                            </label>
                                            <label>
                                                <input
                                                    type="checkbox"
                                                    checked={Array.isArray(data.lunch_additional_services) && data.lunch_additional_services.includes('tray')}
                                                    onChange={e => {
                                                        setData(prev => {
                                                            const arr = Array.isArray(prev.lunch_additional_services) ? prev.lunch_additional_services : [];
                                                            return {
                                                                ...prev,
                                                                lunch_additional_services: e.target.checked
                                                                    ? [...arr, 'tray']
                                                                    : arr.filter(s => s !== 'tray')
                                                            };
                                                        });
                                                    }}
                                                />
                                                Tray Service
                                            </label>
                                        </Box>
                                    )}
                            </Box>
                        )}

                        {tabIndex === 2 && (
                            <Box>
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
                                                                        ? { ...i, qty: (i.qty || 0) + 1 }
                                                                        : i
                                                                ),
                                                            }))
                                                        }
                                                        style={{ marginLeft: 8 }}
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
                                                                            ? { ...i, qty: (i.qty || 0) + 1 }
                                                                            : i
                                                                    ),
                                                                }))
                                                            }
                                                            style={{ marginLeft: 8 }}
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
                                                                            ? { ...i, qty: (i.qty || 0) + 1 }
                                                                            : i
                                                                    ),
                                                                }))
                                                            }
                                                            style={{ marginLeft: 8 }}
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
                                            <label style={{ marginRight: 24 }}>
                                                <input
                                                    type="checkbox"
                                                    checked={Array.isArray(data.dinner_additional_services) && data.dinner_additional_services.includes('escort')}
                                                    onChange={e => {
                                                        setData(prev => {
                                                            const arr = Array.isArray(prev.dinner_additional_services) ? prev.dinner_additional_services : [];
                                                            return {
                                                                ...prev,
                                                                dinner_additional_services: e.target.checked
                                                                    ? [...arr, 'escort']
                                                                    : arr.filter(s => s !== 'escort')
                                                            };
                                                        });
                                                    }}
                                                />
                                                Escort Service
                                            </label>
                                            <label>
                                                <input
                                                    type="checkbox"
                                                    checked={Array.isArray(data.dinner_additional_services) && data.dinner_additional_services.includes('tray')}
                                                    onChange={e => {
                                                        setData(prev => {
                                                            const arr = Array.isArray(prev.dinner_additional_services) ? prev.dinner_additional_services : [];
                                                            return {
                                                                ...prev,
                                                                dinner_additional_services: e.target.checked
                                                                    ? [...arr, 'tray']
                                                                    : arr.filter(s => s !== 'tray')
                                                            };
                                                        });
                                                    }}
                                                />
                                                Tray Service
                                            </label>
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