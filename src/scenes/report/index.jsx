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
import { 
  isReportEmpty,
  calculateReportColumnTotal,
  getReportRoomNumbers,
  findRoomReportData
} from "../../utils";
import { get, map } from 'lodash';

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
                                {isReportEmpty(data) ? (
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
                                        {/* Breakfast Totals */}
                                        {map(get(data, 'breakfast_item_list', []), (item, i) => (
                                               <TableCell key={`btot-${i}`} align="center" sx={{ fontWeight: 700, border: '1px solid rgba(224, 224, 224, 1)', color: 'red' }}>
                                                {item.total_count}
                                            </TableCell>
                                        ))}

                                        {/* Lunch Totals */}
                                        {map(get(data, 'lunch_item_list', []), (item, i) => (
                                            <TableCell key={`ltot-${i}`} align="center" sx={{ fontWeight: 700, border: '1px solid rgba(224, 224, 224, 1)', color: 'red' }}>
                                                {item.total_count}
                                            </TableCell>
                                        ))}

                                        {/* Dinner Totals */}
                                        {map(get(data, 'dinner_item_list', []), (item, i) => (
                                            <TableCell key={`dtot-${i}`} align="center" sx={{ fontWeight: 700, border: '1px solid rgba(224, 224, 224, 1)', color: 'red' }}>
                                                {item.total_count}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                )}
                                {/* Data displayed - Room by Room */}
                                {map(getReportRoomNumbers(data), roomNo => {
                                    const roomData = findRoomReportData(data, roomNo);
                                    return (
                                        <TableRow key={roomNo}>
                                            <TableCell align="center" sx={{ border: '1px solid rgba(224, 224, 224, 1)' }}>
                                                {roomNo}
                                            </TableCell>
                                            {/* Breakfast quantities */}
                                            {map(roomData.breakfast.quantity, (qty, i) => (
                                                <TableCell key={`b-${i}`} align="center" sx={{ border: '1px solid rgba(224, 224, 224, 1)' }}>
                                                    {qty}
                                                </TableCell>
                                            ))}
                                            {/* Lunch quantities */}
                                            {map(roomData.lunch.quantity, (qty, i) => (
                                                <TableCell key={`l-${i}`} align="center" sx={{ border: '1px solid rgba(224, 224, 224, 1)' }}>
                                                    {qty}
                                                </TableCell>
                                            ))}
                                            {/* Dinner quantities */}
                                            {map(roomData.dinner.quantity, (qty, i) => (
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
