import React, { useEffect, useState, useCallback } from "react";
import {
    Box, useTheme, Table, TableHead, TableBody, TableRow, TableCell,
    TableContainer, Paper, Typography, Tooltip, TextField, Popover,
    Menu, MenuItem, IconButton
} from "@mui/material";
import { SummarizeOutlined } from "@mui/icons-material";
import CustomButton from "../../components/CustomButton";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { Header } from "../../components";
import { tokens } from "../../theme";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import CustomLoadingOverlay from "../../components/CustomLoadingOverlay";
import OrderServices from "../../services/orderServices";

const ChargesReport = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const [anchorEl, setAnchorEl] = useState(null);
    const [startDate, setStartDate] = useState(dayjs().startOf('month'));
    const [endDate, setEndDate] = useState(dayjs());
    const [date, setDate] = useState(dayjs());
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState({});
    const [openCalendar, setOpenCalendar] = useState(true);
    const [summaryAnchor, setSummaryAnchor] = useState(null);
    const [selectedSummaryType, setSelectedSummaryType] = useState("Single Date Record");


    // For custom popup
    const [popup, setPopup] = useState({ open: false, anchorEl: null, text: "", title: "" });

    // useEffect(() => {
    //     const fetchChargesReports = async () => {
    //         try {
    //             setLoading(true);
    //             const response = await OrderServices.getCharges(date.format("YYYY-MM-DD"));
    //             setData(response)
    //         } catch (error) {
    //             console.error("Error fetching menu list:", error);
    //         } finally {
    //             setLoading(false);
    //         }
    //     };
    //     fetchChargesReports();
    // }, [date]);

    useEffect(() => {
        // Single Date Record fetch
        if (selectedSummaryType === "Single Date Record") {
            const fetchReports = async () => {
                try {
                    setLoading(true);
                    const response = await OrderServices.getCharges(date.format("YYYY-MM-DD"));
                    setData(response);
                } catch (error) {
                    console.error("Error fetching menu list:", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchReports();
        }
    }, [date, selectedSummaryType]);

    useEffect(() => {
        // Multiple Date Record fetch
        if (
            selectedSummaryType === "Multiple Date Record" &&
            startDate && endDate &&
            dayjs(startDate).isValid() && dayjs(endDate).isValid()
        ) {
            // Validate that end date is not before start date (same date is allowed)
            if (dayjs(endDate).isBefore(dayjs(startDate), 'day')) {
                console.error("End date cannot be before start date");
                setData({});
                return;
            }

            const fetchReportsRange = async () => {
                try {
                    setLoading(true);
                    const response = await OrderServices.getMultipleDateChargesReportList(
                        dayjs(startDate).format("YYYY-MM-DD"),
                        dayjs(endDate).format("YYYY-MM-DD")
                    );
                    setData(response);
                } catch (error) {
                    console.error("Error fetching menu list:", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchReportsRange();
        }
    }, [startDate, endDate, selectedSummaryType]);

    const handleDateChange = (newValue) => {
        if (newValue && !newValue.isSame(date, 'day')) {
            setDate(newValue);
        }
        setOpenCalendar(false);
    };

    const handleUserMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleUserMenuClose = () => {
        setAnchorEl(null);
    };

    const handleSummaryClose = () => setSummaryAnchor(null);

    const handleSingleDateReport = () => {
        // Handle single date report logic
        console.log("Single Date Report for:", date.format("YYYY-MM-DD"));
        handleUserMenuClose();
    };

    const handleMultipleDateReport = () => {
        // Handle multiple date report logic
        console.log("Multiple Date Report");
        handleUserMenuClose();
    };

    return (
        <Box m="20px">
            <Header
                title="Charges Report"
                profileScreen={true}
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
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        {selectedSummaryType === "Multiple Date Record" ? (
                            <Box display="flex" gap={2}>
                                <DatePicker
                                    label="Start Date"
                                    value={startDate}
                                    onChange={(newValue) => setStartDate(newValue)}
                                    maxDate={endDate}
                                    slotProps={{
                                        textField: {
                                            fullWidth: true,
                                            variant: "filled",
                                            error: endDate && startDate && dayjs(startDate).isAfter(dayjs(endDate), 'day'),
                                            helperText: endDate && startDate && dayjs(startDate).isAfter(dayjs(endDate), 'day') 
                                                ? "Start date cannot be after end date" 
                                                : ""
                                        }
                                    }}
                                />
                                <DatePicker
                                    label="End Date"
                                    value={endDate}
                                    onChange={(newValue) => setEndDate(newValue)}
                                    minDate={startDate}
                                    slotProps={{
                                        textField: {
                                            fullWidth: true,
                                            variant: "filled",
                                            error: endDate && startDate && dayjs(endDate).isBefore(dayjs(startDate), 'day'),
                                            helperText: endDate && startDate && dayjs(endDate).isBefore(dayjs(startDate), 'day') 
                                                ? "End date cannot be before start date" 
                                                : ""
                                        }
                                    }}
                                />
                            </Box>
                        ) : (
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
                        )}
                    </LocalizationProvider>
                    <Tooltip title="Reports" arrow>
                        <IconButton
                            onClick={handleUserMenuOpen}
                            sx={{
                                color: colors.blueAccent[700],
                                "&:hover": {
                                    backgroundColor: colors.blueAccent[800],
                                    color: colors.gray[100],
                                },
                            }}
                        >
                            <SummarizeOutlined sx={{ fontSize: "28px" }} />
                        </IconButton>
                    </Tooltip>
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleUserMenuClose}
                        anchorOrigin={{
                            vertical: "bottom",
                            horizontal: "right",
                        }}
                        transformOrigin={{
                            vertical: "top",
                            horizontal: "right",
                        }}
                        disableScrollLock
                    >
                        <MenuItem
                            selected={selectedSummaryType === "Single Date Record"}
                            onClick={() => {
                                setSelectedSummaryType("Single Date Record");
                                handleSummaryClose();
                            }}
                        >
                            Single Date Record
                        </MenuItem>
                        <MenuItem
                            selected={selectedSummaryType === "Multiple Date Record"}
                            onClick={() => {
                                setSelectedSummaryType("Multiple Date Record");
                                handleSummaryClose();
                            }}
                        >
                            Multiple Date Record
                        </MenuItem>
                    </Menu>

                </Box>
                {loading ? (
                    <CustomLoadingOverlay />
                ) : (
                    <TableContainer component={Paper}>
                        <Table sx={{ border: '1px solid rgba(224, 224, 224, 1)', borderCollapse: 'collapse' }}>
                            <TableHead>
                                <TableRow sx={{ backgroundColor: colors.blueAccent[700] }}>
                                    <TableCell
                                        align="center"
                                        sx={{ border: '1px solid rgba(224, 224, 224, 1)' }}
                                        rowSpan={2}
                                    >
                                        #
                                    </TableCell>
                                    <TableCell
                                        align="center"
                                        sx={{ border: '1px solid rgba(224, 224, 224, 1)' }}
                                        colSpan={Math.max(data?.breakfast_item_list?.length || 0, 1)}
                                    >
                                        Breakfast
                                    </TableCell>
                                    <TableCell
                                        align="center"
                                        sx={{ border: '1px solid rgba(224, 224, 224, 1)' }}
                                        colSpan={Math.max(data?.lunch_item_list?.length || 0, 1)}
                                    >
                                        Lunch
                                    </TableCell>
                                    <TableCell
                                        align="center"
                                        sx={{ border: '1px solid rgba(224, 224, 224, 1)' }}
                                        colSpan={Math.max(data?.dinner_item_list?.length || 0, 1)}
                                    >
                                        Dinner
                                    </TableCell>
                                </TableRow>
                                <TableRow sx={{ backgroundColor: colors.blueAccent[700] }}>
                                    {data?.breakfast_item_list && data.breakfast_item_list.length > 0 ? (
                                        data.breakfast_item_list.map((item, idx) => {
                                            // Handle both single date and multi-date formats
                                            const getTooltipTitle = () => {
                                                if (item.real_item_name) {
                                                    return item.real_item_name;
                                                } else if (item.data) {
                                                    if (Array.isArray(item.data)) {
                                                        return item.data.map(d => `${d.date}: ${d.real_item_name}`).join('\n');
                                                    } else if (item.data.real_item_name) {
                                                        return item.data.real_item_name;
                                                    }
                                                }
                                                return item.item_name;
                                            };
                                            return (
                                                <TableCell
                                                    key={`breakfast-${idx}`}
                                                    align="center"
                                                    sx={{ border: '1px solid rgba(224, 224, 224, 1)' }}
                                                >
                                                    <Tooltip title={getTooltipTitle()} arrow>
                                                        <span>{item.item_name}</span>
                                                    </Tooltip>
                                                </TableCell>
                                            );
                                        })
                                    ) : (
                                        <TableCell
                                            align="center"
                                            sx={{ border: '1px solid rgba(224, 224, 224, 1)' }}
                                        >
                                            -
                                        </TableCell>
                                    )}
                                    {data?.lunch_item_list && data.lunch_item_list.length > 0 ? (
                                        data.lunch_item_list.map((item, idx) => {
                                            const getTooltipTitle = () => {
                                                if (item.real_item_name) {
                                                    return item.real_item_name;
                                                } else if (item.data) {
                                                    if (Array.isArray(item.data)) {
                                                        return item.data.map(d => `${d.date}: ${d.real_item_name}`).join('\n');
                                                    } else if (item.data.real_item_name) {
                                                        return item.data.real_item_name;
                                                    }
                                                }
                                                return item.item_name;
                                            };
                                            return (
                                                <TableCell
                                                    key={`lunch-${idx}`}
                                                    align="center"
                                                    sx={{ border: '1px solid rgba(224, 224, 224, 1)' }}
                                                >
                                                    <Tooltip title={getTooltipTitle()} arrow>
                                                        <span>{item.item_name}</span>
                                                    </Tooltip>
                                                </TableCell>
                                            );
                                        })
                                    ) : (
                                        <TableCell
                                            align="center"
                                            sx={{ border: '1px solid rgba(224, 224, 224, 1)' }}
                                        >
                                            -
                                        </TableCell>
                                    )}
                                    {data?.dinner_item_list && data.dinner_item_list.length > 0 ? (
                                        data.dinner_item_list.map((item, idx) => {
                                            const getTooltipTitle = () => {
                                                if (item.real_item_name) {
                                                    return item.real_item_name;
                                                } else if (item.data) {
                                                    if (Array.isArray(item.data)) {
                                                        return item.data.map(d => `${d.date}: ${d.real_item_name}`).join('\n');
                                                    } else if (item.data.real_item_name) {
                                                        return item.data.real_item_name;
                                                    }
                                                }
                                                return item.item_name;
                                            };
                                            return (
                                                <TableCell
                                                    key={`dinner-${idx}`}
                                                    align="center"
                                                    sx={{ border: '1px solid rgba(224, 224, 224, 1)' }}
                                                >
                                                    <Tooltip title={getTooltipTitle()} arrow>
                                                        <span>{item.item_name}</span>
                                                    </Tooltip>
                                                </TableCell>
                                            );
                                        })
                                    ) : (
                                        <TableCell
                                            align="center"
                                            sx={{ border: '1px solid rgba(224, 224, 224, 1)' }}
                                        >
                                            -
                                        </TableCell>
                                    )}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {/* Data displayed*/}
                                {(
                                    (!data?.report_breakfast_list || data.report_breakfast_list.length === 0) &&
                                    (!data?.report_lunch_list || data.report_lunch_list.length === 0) &&
                                    (!data?.report_dinner_list || data.report_dinner_list.length === 0)
                                ) ? (
                                    <TableRow>
                                        <TableCell 
                                            colSpan={
                                                Math.max(
                                                    1 + (data?.breakfast_item_list?.length || 0) + (data?.lunch_item_list?.length || 0) + (data?.dinner_item_list?.length || 0),
                                                    4
                                                )
                                            } 
                                            align="center"
                                            sx={{ 
                                                border: '1px solid rgba(224, 224, 224, 1)',
                                                padding: '40px',
                                                fontSize: '16px',
                                                fontWeight: 500,
                                                color: colors.gray[500]
                                            }}
                                        >
                                            No Report Found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    (() => {
                                        const roomNos = [
                                            ...(data?.report_breakfast_list?.map(r => r.room_no) || []),
                                            ...(data?.report_lunch_list?.map(r => r.room_no) || []),
                                            ...(data?.report_dinner_list?.map(r => r.room_no) || []),
                                        ];
                                        const uniqueRoomNos = [...new Set(roomNos)];
                                        const baseList = uniqueRoomNos.map(room_no => ({
                                            room_no
                                        }));
                                        return baseList.map((row, idx) => {
                                            const breakfastRow = data?.report_breakfast_list?.find(b => b.room_no === row.room_no) || { data: {}, option: {} };
                                            const lunchRow = data?.report_lunch_list?.find(l => l.room_no === row.room_no) || { data: {}, option: {} };
                                            const dinnerRow = data?.report_dinner_list?.find(d => d.room_no === row.room_no) || { data: {}, option: {} };
                                            return (
                                                <TableRow key={row.room_no}>
                                                    <TableCell align="center" sx={{ border: '1px solid rgba(224, 224, 224, 1)' }}>
                                                        {row.room_no}
                                                    </TableCell>
                                                    {/* Breakfast, Lunch, Dinner quantities */}
                                                    {[{
                                                        row: breakfastRow,
                                                        itemList: data?.breakfast_item_list,
                                                        prefix: 'b'
                                                    }, {
                                                        row: lunchRow,
                                                        itemList: data?.lunch_item_list,
                                                        prefix: 'l'
                                                    }, {
                                                        row: dinnerRow,
                                                        itemList: data?.dinner_item_list,
                                                        prefix: 'd'
                                                    }].map(({ row, itemList, prefix }, mealIdx) => (
                                                        <React.Fragment key={`${prefix}-meal-${mealIdx}`}>
                                                            {itemList && itemList.length > 0 ? (
                                                                itemList.map((item, i) => {
                                                                const itemKey = item?.item_name || "";
                                                                let qty = row.data?.[itemKey];
                                                                const optionRaw = row.option?.[itemKey];
                                                            
                                                            // Get real_item_name from either format
                                                            let realItemName = "";
                                                            if (item.real_item_name) {
                                                                realItemName = item.real_item_name;
                                                            } else if (item.data) {
                                                                if (Array.isArray(item.data)) {
                                                                    // For multi-date, we'll use the first item's name as base
                                                                    realItemName = item.data[0]?.real_item_name || "";
                                                                } else if (item.data.real_item_name) {
                                                                    realItemName = item.data.real_item_name;
                                                                }
                                                            }
                                                            
                                                            // Handle both string (single date) and array (multi date) formats
                                                            let option = "";
                                                            let popupText = "";
                                                            let popupTitle = "";
                                                            if (Array.isArray(optionRaw)) {
                                                                // Check if it's multiple date format (with date and items structure)
                                                                const isMultipleDateFormat = optionRaw.length > 0 && optionRaw[0]?.date && optionRaw[0]?.items;
                                                                
                                                                if (isMultipleDateFormat) {
                                                                    // Multiple date format: [{date: "2025-10-15", items: [{itemName: "..."}, ...]}, ...]
                                                                    popupTitle = realItemName; // Set title for multiple date format
                                                                    const optionLines = [];
                                                                    optionRaw.forEach(dateGroup => {
                                                                        if (dateGroup.date && Array.isArray(dateGroup.items)) {
                                                                            dateGroup.items.forEach(itemObj => {
                                                                                if (itemObj.itemName) {
                                                                                    optionLines.push(`${dateGroup.date}: ${itemObj.itemName}`);
                                                                                }
                                                                            });
                                                                        }
                                                                    });
                                                                    option = optionLines.join(', ');
                                                                    popupText = optionLines.join('\n');
                                                                } else {
                                                                    // Single date format: [{itemName: "..."}, ...]
                                                                    const optionLines = optionRaw
                                                                        .filter(opt => opt && (typeof opt === 'object' ? (opt.itemName || opt.optionName) : opt))
                                                                        .map(opt => {
                                                                            if (typeof opt === 'object' && (opt.itemName || opt.optionName)) {
                                                                                const optName = opt.itemName || opt.optionName;
                                                                                return `${realItemName} - ${optName}`;
                                                                            }
                                                                            return typeof opt === 'string' ? `${realItemName} - ${opt}` : '';
                                                                        })
                                                                        .filter(opt => opt.trim().length > 0);
                                                                    option = optionLines.join(', ');
                                                                    popupText = optionLines.join('\n');
                                                                }
                                                            } else if (typeof optionRaw === 'string') {
                                                                option = optionRaw;
                                                                popupText = `${realItemName} - ${optionRaw}`;
                                                            }
                                                            
                                                            const showPopup = i >= 4 && qty >= 1 && option && option.trim().length > 0;
                                                            // If qty is undefined or null, show '-'
                                                             return (
                                                                <TableCell key={`${prefix}-${i}`} align="center" sx={{ border: '1px solid rgba(224, 224, 224, 1)' }}>
                                                                    {qty === undefined || qty === null ? (
                                                                        '-'
                                                                    ) : showPopup ? (
                                                                        <span
                                                                            style={{
                                                                                textDecoration: 'underline',
                                                                                cursor: 'pointer',
                                                                                color: '#1976d2'
                                                                            }}
                                                                            onClick={e => {
                                                                                e.stopPropagation();
                                                                                setPopup({
                                                                                    open: true,
                                                                                    anchorEl: e.currentTarget,
                                                                                    text: popupText || 'No option available',
                                                                                    title: popupTitle
                                                                                });
                                                                            }}
                                                                        >
                                                                            {qty}
                                                                        </span>
                                                                    ) : (
                                                                        qty
                                                                    )}
                                                                </TableCell>
                                                            );
                                                        })
                                                            ) : (
                                                                <TableCell align="center" sx={{ border: '1px solid rgba(224, 224, 224, 1)' }}>
                                                                    -
                                                                </TableCell>
                                                            )}
                                                        </React.Fragment>
                                                    ))}
                                                </TableRow>
                                            );
                                        });
                                    })()
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
                {/* Custom Popup for Option */}
                <Popover
                    open={popup.open}
                    anchorEl={popup.anchorEl}
                    onClose={() => setPopup({ ...popup, open: false })}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'center' }}
                    disableEnforceFocus
                    disableRestoreFocus
                    disableScrollLock
                    PaperProps={{
                        sx: {
                            p: 2,
                            minWidth: 200,
                            maxWidth: 400,
                            pointerEvents: 'auto',
                            bgcolor: '#e3f2fd',
                            borderRadius: 2,
                            boxShadow: 3
                        }
                    }}
                >
                    {popup.title && (
                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#1565c0', mb: 1 }}>
                            {popup.title}
                        </Typography>
                    )}
                    <Typography variant="body2" sx={{ fontWeight: 500, color: '#1976d2', mb: 1, whiteSpace: 'pre-line' }}>
                        {popup.text || ''}
                    </Typography>
                    <Box display="flex" justifyContent="flex-end">
                        <CustomButton
                            onClick={() => setPopup({ ...popup, open: false })}
                            sx={{
                                background: '#1976d2',
                                color: '#fff',
                                borderRadius: 2,
                                padding: '4px 16px',
                                fontWeight: 600,
                                fontSize: 14,
                                width: 'auto',
                                margin: 0,
                                '&:hover': {
                                    background: '#1565c0',
                                    color: '#fff',
                                }
                            }}
                        >
                            OK
                        </CustomButton>
                    </Box>
                </Popover>
            </Box>
        </Box>
    );
};

export default ChargesReport;
