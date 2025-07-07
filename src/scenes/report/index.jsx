import { useNavigate } from "react-router-dom";
import {
    Box, useTheme, Table, TableHead, TableBody, TableRow, TableCell,
    TableContainer, Paper, Typography, Tooltip, TextField
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { Header } from "../../components";
import { tokens } from "../../theme";
import { LocalPizzaOutlined } from "@mui/icons-material";
import { useEffect, useState, useCallback } from "react";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import CustomLoadingOverlay from "../../components/CustomLoadingOverlay";
import OrderServices from "../../services/orderServices";

const Report = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const [date, setDate] = useState(dayjs());
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState({});
    const [openCalendar, setOpenCalendar] = useState(true); // Open on mount

    useEffect(() => {
        const fetchReports = async () => {
            try {
                setLoading(true);
                const response = await OrderServices.getReportList(date.format("YYYY-MM-DD"));
                setData(response)
            } catch (error) {
                console.error("Error fetching menu list:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchReports();
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
                title="Report"
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
                    <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 600, cursor: 'pointer', }}
                        onClick={() => navigate('/charges')}
                        onMouseOver={e => (e.target.style.cursor = 'pointer')}
                    >
                        Charges
                    </Typography>
                </Box>
                {/* Table Section */}
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
                                        Room No
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
                                {(
                                    (!data?.report_breakfast_list || data.report_breakfast_list.length === 0) &&
                                    (!data?.report_lunch_list || data.report_lunch_list.length === 0) &&
                                    (!data?.report_dinner_list || data.report_dinner_list.length === 0)
                                ) ? (
                                    <TableRow>
                                        <TableCell
                                            align="center"
                                            colSpan={4}
                                            sx={{ textAlign: 'center', fontWeight: 600, fontSize: '1.1rem'}}
                                        >
                                            No Report Found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    <TableRow sx={{ backgroundColor: colors.blueAccent[800] }}>
                                        <TableCell align="center" sx={{ fontWeight: 700, border: '1px solid rgba(224, 224, 224, 1)' }}>
                                            Total
                                        </TableCell>
                                        {/* Breakfast  */}
                                        {data?.breakfast_item_list?.map((_, i) => {
                                            const total = data?.report_breakfast_list?.reduce((sum, row) => sum + (row.quantity[i] || 0), 0);
                                            return (
                                                <TableCell key={`btot-${i}`} align="center" sx={{ fontWeight: 700, border: '1px solid rgba(224, 224, 224, 1)',color:'red' }}>
                                                    {total}
                                                </TableCell>
                                            );
                                        })}

                                        {data?.lunch_item_list?.map((_, i) => {
                                            const total = data?.report_lunch_list?.reduce((sum, row) => sum + (row.quantity[i] || 0), 0);
                                            return (
                                                <TableCell key={`ltot-${i}`} align="center" sx={{ fontWeight: 700, border: '1px solid rgba(224, 224, 224, 1)',color:'red' }}>
                                                    {total} 
                                                </TableCell>
                                            );
                                        })}

                                        {data?.dinner_item_list?.map((_, i) => {
                                            const total = data?.report_dinner_list?.reduce((sum, row) => sum + (row.quantity[i] || 0), 0);
                                            return (
                                                <TableCell key={`dtot-${i}`} align="center" sx={{ fontWeight: 700, border: '1px solid rgba(224, 224, 224, 1)',color:'red' }}>
                                                    {total} 
                                                </TableCell>
                                            );
                                        })}
                                    </TableRow>
                                )}
                                {/* Data displayed*/}
                                {data?.report_breakfast_list?.map((breakfastRow, idx) => {
                                    const lunchRow = data?.report_lunch_list?.find(l => l.room_no === breakfastRow.room_no) || { quantity: [] };
                                    const dinnerRow = data?.report_dinner_list?.find(d => d.room_no === breakfastRow.room_no) || { quantity: [] };
                                    return (
                                        <TableRow key={breakfastRow.room_no}>
                                            <TableCell align="center" sx={{ border: '1px solid rgba(224, 224, 224, 1)' }}>
                                                {breakfastRow.room_no}
                                            </TableCell>
                                            {/* Breakfast quantities */}
                                            {breakfastRow.quantity.map((qty, i) => (
                                                <TableCell key={`b-${i}`} align="center" sx={{ border: '1px solid rgba(224, 224, 224, 1)' }}>
                                                    {qty}
                                                </TableCell>
                                            ))}
                                            {/* Lunch quantities */}
                                            {lunchRow.quantity.map((qty, i) => (
                                                <TableCell key={`l-${i}`} align="center" sx={{ border: '1px solid rgba(224, 224, 224, 1)' }}>
                                                    {qty}
                                                </TableCell>
                                            ))}
                                            {/* Dinner quantities */}
                                            {dinnerRow.quantity.map((qty, i) => (
                                                <TableCell key={`d-${i}`} align="center" sx={{ border: '1px solid rgba(224, 224, 224, 1)' }}>
                                                    {qty}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Box>
        </Box>
    );
};

export default Report;
