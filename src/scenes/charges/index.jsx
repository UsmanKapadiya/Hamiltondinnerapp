import {
    Box, useTheme, Table, TableHead, TableBody, TableRow, TableCell,
    TableContainer, Paper, Typography, Tooltip, TextField, Popover
} from "@mui/material";
import CustomButton from "../../components/CustomButton";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { Header } from "../../components";
import { tokens } from "../../theme";
import { useEffect, useState, useCallback } from "react";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import CustomLoadingOverlay from "../../components/CustomLoadingOverlay";
import OrderServices from "../../services/orderServices";

const ChargesReport = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const [date, setDate] = useState(dayjs());
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState({});
    const [openCalendar, setOpenCalendar] = useState(true);

    // For custom popup
    const [popup, setPopup] = useState({ open: false, anchorEl: null, text: "" });

    useEffect(() => {
        const fetchChargesReports = async () => {
            try {
                setLoading(true);
                const response = await OrderServices.getCharges(date.format("YYYY-MM-DD"));
                setData(response)
            } catch (error) {
                console.error("Error fetching menu list:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchChargesReports();
    }, [date]);

    const handleDateChange = (newValue) => {
        if (newValue && !newValue.isSame(date, 'day')) {
            setDate(newValue);
        }
        setOpenCalendar(false);
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
                                        colSpan={data?.breakfast_item_list?.length || 0}
                                    >
                                        Breakfast
                                    </TableCell>
                                    <TableCell
                                        align="center"
                                        sx={{ border: '1px solid rgba(224, 224, 224, 1)' }}
                                        colSpan={data?.lunch_item_list?.length || 0}
                                    >
                                        Lunch
                                    </TableCell>
                                    <TableCell
                                        align="center"
                                        sx={{ border: '1px solid rgba(224, 224, 224, 1)' }}
                                        colSpan={data?.dinner_item_list?.length || 0}
                                    >
                                        Dinner
                                    </TableCell>
                                </TableRow>
                                <TableRow sx={{ backgroundColor: colors.blueAccent[700] }}>
                                    {data?.breakfast_item_list?.map((item, idx) => (
                                        <TableCell
                                            key={`breakfast-${idx}`}
                                            align="center"
                                            sx={{ border: '1px solid rgba(224, 224, 224, 1)' }}
                                        >
                                            <Tooltip title={item.real_item_name} arrow>
                                                <span>{item.item_name}</span>
                                            </Tooltip>
                                        </TableCell>
                                    ))}
                                    {data?.lunch_item_list?.map((item, idx) => (
                                        <TableCell
                                            key={`lunch-${idx}`}
                                            align="center"
                                            sx={{ border: '1px solid rgba(224, 224, 224, 1)' }}
                                        >
                                            <Tooltip title={item.real_item_name} arrow>
                                                <span>{item.item_name}</span>
                                            </Tooltip>
                                        </TableCell>
                                    ))}
                                    {data?.dinner_item_list?.map((item, idx) => (
                                        <TableCell
                                            key={`dinner-${idx}`}
                                            align="center"
                                            sx={{ border: '1px solid rgba(224, 224, 224, 1)' }}
                                        >
                                            <Tooltip title={item.real_item_name} arrow>
                                                <span>{item.item_name}</span>
                                            </Tooltip>
                                        </TableCell>
                                    ))}
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
                                        <TableCell colSpan={1 + (data?.breakfast_item_list?.length || 0) + (data?.lunch_item_list?.length || 0) + (data?.dinner_item_list?.length || 0)} align="center">
                                            No Report Found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    (() => {                            
                                        const baseList = [
                                            ...(data?.report_breakfast_list?.length > 0 ? data.report_breakfast_list : []),
                                            ...(data?.report_lunch_list?.length > 0 ? data.report_lunch_list : []),
                                            ...(data?.report_dinner_list?.length > 0 ? data.report_dinner_list : []),
                                        ];
                                        return baseList.map((row, idx) => {
                                            const breakfastRow = data?.report_breakfast_list?.find(b => b.room_no === row.room_no) || { data: [] };
                                            const lunchRow = data?.report_lunch_list?.find(l => l.room_no === row.room_no) || { data: [] };
                                            const dinnerRow = data?.report_dinner_list?.find(d => d.room_no === row.room_no) || { data: [] };
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
                                                    }].map(({ row, itemList, prefix }) =>
                                                        (itemList || []).map((item, i) => {
                                                            let qty = row.data?.[i];
                                                            const option = row.option && row.option[i];
                                                            const realName = item?.real_item_name || "";
                                                            const showPopup = i >= 3 && qty >= 1;
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
                                                                                    text: `${realName}${option ? ` - ${option}` : ''}`
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
                                                    )}
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
                            minWidth: 180,
                            maxWidth: 300,
                            pointerEvents: 'auto',
                            bgcolor: '#e3f2fd',
                            borderRadius: 2,
                            boxShadow: 3
                        }
                    }}
                >
                    <Typography variant="body2" sx={{ fontWeight: 500, color: '#1976d2', mb: 1 }}>{popup.text}</Typography>
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
