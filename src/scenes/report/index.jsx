import { useNavigate } from "react-router-dom";
import {
    Box, useTheme, Table, TableHead, TableBody, TableRow, TableCell,
    TableContainer, Paper, Typography, TextField,
    IconButton,
    Menu,
    MenuItem,
    Tooltip
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { Header } from "../../components";
import { tokens } from "../../theme";
import { SummarizeOutlined } from "@mui/icons-material";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import CustomLoadingOverlay from "../../components/CustomLoadingOverlay";
import OrderServices from "../../services/orderServices";

const Report = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const [date, setDate] = useState(dayjs());
    const [startDate, setStartDate] = useState(dayjs().startOf('month'));
    const [endDate, setEndDate] = useState(dayjs());
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState({});
    const [rowsArray, setRowsArray] = useState([]);
    const [selectedSummaryType, setSelectedSummaryType] = useState("Single Date Record");
    const [summaryAnchor, setSummaryAnchor] = useState(null);


    useEffect(() => {
        // Single Date Record fetch
        if (selectedSummaryType === "Single Date Record") {
            const fetchReports = async () => {
                try {
                    setLoading(true);
                    const response = await OrderServices.getReportList(date.format("YYYY-MM-DD"));
                    const rowsArray = Object.values(response?.result?.rows || {});
                    setRowsArray(rowsArray);
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
            const fetchReportsRange = async () => {
                try {
                    setLoading(true);
                    const response = await OrderServices.getMultipleDateReportList(
                        dayjs(startDate).format("YYYY-MM-DD"),
                        dayjs(endDate).format("YYYY-MM-DD")
                    );
                    const rowsArray = Object.values(response?.result?.rows || {});
                    setRowsArray(rowsArray);
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

    const handleSummaryClick = (event) => {
        setSummaryAnchor(event.currentTarget);
    };

    const handleSummaryClose = () => setSummaryAnchor(null);

    // Helper to safely get columns for mapping
    const getColumns = (idx) =>
        Array.isArray(data?.columns) && Array.isArray(data.columns[idx])
            ? data.columns[idx]
            : [];

    // Check if report is empty
    const isReportEmpty = () => {
        return !rowsArray || rowsArray.length === 0;
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
                    {/* Left Side - Date Picker */}
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        {selectedSummaryType === "Multiple Date Record" ? (
                            <Box display="flex" gap={2}>
                                <DatePicker
                                    label="Start Date"
                                    value={startDate}
                                    onChange={(newValue) => setStartDate(newValue)}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            variant="filled"
                                            sx={{ minWidth: 200 }}
                                        />
                                    )}
                                />
                                <DatePicker
                                    label="End Date"
                                    value={endDate}
                                    onChange={(newValue) => setEndDate(newValue)}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            variant="filled"
                                            sx={{ minWidth: 200 }}
                                        />
                                    )}
                                />
                            </Box>
                        ) : (
                            <DatePicker
                                label="Date"
                                value={date}
                                onChange={(newValue) => setDate(newValue)}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        variant="filled"
                                        sx={{ minWidth: 200 }}
                                    />
                                )}
                            />
                        )}
                    </LocalizationProvider>

                    {/* Right Side - Menu Icon and Charges Link */}
                    <Box display="flex" alignItems="center" gap={2}>
                        <Tooltip title="Reports" arrow>
                            <IconButton
                                onClick={handleSummaryClick}
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
                            anchorEl={summaryAnchor}
                            open={Boolean(summaryAnchor)}
                            onClose={handleSummaryClose}
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
                        <Typography
                            variant="subtitle1"
                            sx={{
                                fontWeight: 600,
                                cursor: 'pointer',
                                color: colors.blueAccent[700],
                                "&:hover": {
                                    color: colors.blueAccent[500],
                                }
                            }}
                            onClick={() => navigate('/charges')}
                        >
                            Charges
                        </Typography>
                    </Box>
                </Box>
                {/* Table Section */}
                {loading ? (
                    <CustomLoadingOverlay />
                ) : isReportEmpty() ? (
                    <Box
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        height="50vh"
                    >
                        <Typography
                            variant="h5"
                            sx={{
                                fontWeight: 600,
                                color: colors.gray[100]
                            }}
                        >
                            No Data Available for the selected date.
                        </Typography>
                    </Box>
                ) : (
                    // <TableContainer component={Paper}>
                    //     <Table sx={{ border: '1px solid rgba(224, 224, 224, 1)', borderCollapse: 'collapse' }}>
                    //         <TableHead>
                    //             <TableRow sx={{ backgroundColor: colors.blueAccent[700] }}>
                    //                 <TableCell
                    //                     align="center"
                    //                     sx={{ border: '1px solid rgba(224, 224, 224, 1)' }}
                    //                     rowSpan={2}
                    //                 >
                    //                     Room No
                    //                 </TableCell>
                    //                 <TableCell
                    //                     align="center"
                    //                     sx={{ border: '1px solid rgba(224, 224, 224, 1)' }}
                    //                     colSpan={data?.breakfast_item_list?.length || 0}
                    //                 >
                    //                     Breakfast
                    //                 </TableCell>
                    //                 <TableCell
                    //                     align="center"
                    //                     sx={{ border: '1px solid rgba(224, 224, 224, 1)' }}
                    //                     colSpan={data?.lunch_item_list?.length || 0}
                    //                 >
                    //                     Lunch
                    //                 </TableCell>
                    //                 <TableCell
                    //                     align="center"
                    //                     sx={{ border: '1px solid rgba(224, 224, 224, 1)' }}
                    //                     colSpan={data?.dinner_item_list?.length || 0}
                    //                 >
                    //                     Dinner
                    //                 </TableCell>
                    //             </TableRow>
                    //             <TableRow sx={{ backgroundColor: colors.blueAccent[700] }}>
                    //                 {data?.breakfast_item_list?.map((item, idx) => (
                    //                     <TableCell
                    //                         key={`breakfast-${idx}`}
                    //                         align="center"
                    //                         sx={{ border: '1px solid rgba(224, 224, 224, 1)' }}
                    //                     >
                    //                         <Tooltip title={item.real_item_name} arrow>
                    //                             <span>{item.item_name}</span>
                    //                         </Tooltip>
                    //                     </TableCell>
                    //                 ))}
                    //                 {data?.lunch_item_list?.map((item, idx) => (
                    //                     <TableCell
                    //                         key={`lunch-${idx}`}
                    //                         align="center"
                    //                         sx={{ border: '1px solid rgba(224, 224, 224, 1)' }}
                    //                     >
                    //                         <Tooltip title={item.real_item_name} arrow>
                    //                             <span>{item.item_name}</span>
                    //                         </Tooltip>
                    //                     </TableCell>
                    //                 ))}
                    //                 {data?.dinner_item_list?.map((item, idx) => (
                    //                     <TableCell
                    //                         key={`dinner-${idx}`}
                    //                         align="center"
                    //                         sx={{ border: '1px solid rgba(224, 224, 224, 1)' }}
                    //                     >
                    //                         <Tooltip title={item.real_item_name} arrow>
                    //                             <span>{item.item_name}</span>
                    //                         </Tooltip>
                    //                     </TableCell>
                    //                 ))}
                    //             </TableRow>
                    //         </TableHead>

                    //         <TableBody>
                    //             {isReportEmpty(data) ? (
                    //                 <TableRow>
                    //                     <TableCell
                    //                         align="center"
                    //                         colSpan={4}
                    //                         sx={{ textAlign: 'center', fontWeight: 600, fontSize: '1.1rem' }}
                    //                     >
                    //                         No Report Found
                    //                     </TableCell>
                    //                 </TableRow>
                    //             ) : (
                    //                 <TableRow sx={{ backgroundColor: colors.blueAccent[800] }}>
                    //                     <TableCell align="center" sx={{ fontWeight: 700, border: '1px solid rgba(224, 224, 224, 1)' }}>
                    //                         Total
                    //                     </TableCell>
                    //                     {/* Breakfast Totals */}
                    //                     {map(get(data, 'breakfast_item_list', []), (item, i) => (
                    //                         <TableCell key={`btot-${i}`} align="center" sx={{ fontWeight: 700, border: '1px solid rgba(224, 224, 224, 1)', color: 'red' }}>
                    //                             {item.total_count}
                    //                         </TableCell>
                    //                     ))}

                    //                     {/* Lunch Totals */}
                    //                     {map(get(data, 'lunch_item_list', []), (item, i) => (
                    //                         <TableCell key={`ltot-${i}`} align="center" sx={{ fontWeight: 700, border: '1px solid rgba(224, 224, 224, 1)', color: 'red' }}>
                    //                             {item.total_count}
                    //                         </TableCell>
                    //                     ))}

                    //                     {/* Dinner Totals */}
                    //                     {map(get(data, 'dinner_item_list', []), (item, i) => (
                    //                         <TableCell key={`dtot-${i}`} align="center" sx={{ fontWeight: 700, border: '1px solid rgba(224, 224, 224, 1)', color: 'red' }}>
                    //                             {item.total_count}
                    //                         </TableCell>
                    //                     ))}
                    //                 </TableRow>
                    //             )}
                    //             {/* Data displayed - Room by Room */}
                    //             {map(getReportRoomNumbers(data), roomNo => {
                    //                 const roomData = findRoomReportData(data, roomNo);
                    //                 return (
                    //                     <TableRow key={roomNo}>
                    //                         <TableCell align="center" sx={{ border: '1px solid rgba(224, 224, 224, 1)' }}>
                    //                             {roomNo}
                    //                         </TableCell>
                    //                         {/* Breakfast quantities */}
                    //                         {map(roomData.breakfast.quantity, (qty, i) => (
                    //                             <TableCell key={`b-${i}`} align="center" sx={{ border: '1px solid rgba(224, 224, 224, 1)' }}>
                    //                                 {qty}
                    //                             </TableCell>
                    //                         ))}
                    //                         {/* Lunch quantities */}
                    //                         {map(roomData.lunch.quantity, (qty, i) => (
                    //                             <TableCell key={`l-${i}`} align="center" sx={{ border: '1px solid rgba(224, 224, 224, 1)' }}>
                    //                                 {qty}
                    //                             </TableCell>
                    //                         ))}
                    //                         {/* Dinner quantities */}
                    //                         {map(roomData.dinner.quantity, (qty, i) => (
                    //                             <TableCell key={`d-${i}`} align="center" sx={{ border: '1px solid rgba(224, 224, 224, 1)' }}>
                    //                                 {qty}
                    //                             </TableCell>
                    //                         ))}
                    //                     </TableRow>
                    //                 );
                    //             })}
                    //         </TableBody>
                    //     </Table>
                    // </TableContainer>
                    <TableContainer component={Paper}>
                        <Table sx={{ border: '1px solid rgba(224, 224, 224, 1)', borderCollapse: 'collapse' }}>
                            <TableHead>
                                <TableRow sx={{ backgroundColor: colors.blueAccent[700] }}>
                                    {getColumns(0).map((item, index) => (
                                        <TableCell
                                            key={index}
                                            align="center"
                                            sx={{ border: '1px solid rgba(224, 224, 224, 1)' }}
                                            {...(index === 0
                                                ? { rowSpan: item?.rowspan }
                                                : { colSpan: item?.colspan })}
                                        >
                                            {item?.title}
                                        </TableCell>
                                    ))}
                                </TableRow>
                                <TableRow sx={{ backgroundColor: colors.blueAccent[700] }}>
                                    {getColumns(data?.columns?.length - 2).map((item, key) => (
                                        <TableCell
                                            key={key}
                                            align="center"
                                            sx={{ border: '1px solid rgba(224, 224, 224, 1)' }}
                                        >
                                            {item.title}
                                        </TableCell>
                                    ))}
                                </TableRow>
                                {/* Display BA B1 La .... */}
                                <TableRow sx={{ backgroundColor: colors.blueAccent[700] }}>
                                    {getColumns(data?.columns?.length - 1).map((item, key) => (
                                        <TableCell
                                            key={key}
                                            align="center"
                                            sx={{ border: '1px solid rgba(224, 224, 224, 1)' }}
                                        >
                                            {item?.field || ''}
                                            {/* Currently toolTip Commented */}
                                            {/* <Tooltip title={item?.tooltip || ''} arrow>
                          <span style={{ display: 'inline-block', width: '100%' }}>
                            {item?.field || ''}
                          </span>
                        </Tooltip> */}
                                        </TableCell>
                                    ))}
                                </TableRow>
                                <TableRow>
                                    {/* First cell empty */}
                                    <TableCell
                                        align="center"
                                        sx={{ border: '1px solid rgba(224, 224, 224, 1)', fontWeight: 'bold', backgroundColor: colors.primary[400] }}
                                    >
                                    </TableCell>
                                    {/* Display total data */}
                                    {getColumns(data?.columns?.length - 1).map((item, key) => (
                                        <TableCell
                                            key={key}
                                            align="center"
                                            sx={{ border: '1px solid rgba(224, 224, 224, 1)', fontWeight: 'bold', backgroundColor: colors.primary[400], color: colors.redAccent[800] }}
                                        >
                                            {data?.total[item.field] !== undefined ? data?.total[item.field] : ''}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rowsArray.map((room, index) => (
                                    <TableRow key={index}>
                                        <TableCell
                                            align="center"
                                            sx={{ border: '1px solid rgba(224, 224, 224, 1)' }}
                                        >
                                            {room.room_id}
                                        </TableCell>
                                        {Object.keys(room).filter(key => key !== 'room_id').map((key, subIndex) => (
                                            <TableCell
                                                key={subIndex}
                                                align="center"
                                                sx={{ border: '1px solid rgba(224, 224, 224, 1)' }}
                                            >
                                                {room[key]}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Box>
        </Box>
    );
};

export default Report;
