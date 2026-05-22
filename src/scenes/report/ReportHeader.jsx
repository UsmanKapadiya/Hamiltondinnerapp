import React from "react";

import {
    Box,
    Typography,
    IconButton,
    Menu,
    MenuItem,
    Tooltip,
    TextField,
} from "@mui/material";

import {
    SummarizeOutlined,
} from "@mui/icons-material";

import {
    LocalizationProvider,
    DatePicker,
} from "@mui/x-date-pickers";

import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

const ReportHeader = ({
    colors,
    loading,
    navigate,
    selectedSummaryType,
    setSelectedSummaryType,
    summaryAnchor,
    handleSummaryClick,
    handleSummaryClose,
    date,
    setDate,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
}) => {
    return (
        <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            mb={2}
        >
            <LocalizationProvider
                dateAdapter={AdapterDayjs}
            >
                {selectedSummaryType ===
                    "Multiple Date Record" ? (
                    <Box display="flex" gap={2}>
                        <DatePicker
                            label="Start Date"
                            value={startDate}
                            onChange={setStartDate}
                            maxDate={endDate}
                            disabled={loading}
                        />

                        <DatePicker
                            label="End Date"
                            value={endDate}
                            onChange={setEndDate}
                            minDate={startDate}
                            disabled={loading}
                        />
                    </Box>
                ) : (
                    <DatePicker
                        label="Date"
                        value={date}
                        onChange={setDate}
                        disabled={loading}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                variant="filled"
                            />
                        )}
                    />
                )}
            </LocalizationProvider>

            <Box
                display="flex"
                alignItems="center"
                gap={2}
            >
                <Tooltip title="Reports">
                    <span>
                        <IconButton
                            onClick={
                                handleSummaryClick
                            }
                            disabled={loading}
                            sx={{
                                color:
                                    colors
                                        .blueAccent[700],
                            }}
                        >
                            <SummarizeOutlined />
                        </IconButton>
                    </span>
                </Tooltip>

                <Menu
                    anchorEl={summaryAnchor}
                    open={Boolean(summaryAnchor)}
                    onClose={handleSummaryClose}
                    disableScrollLock={true}
                >
                    <MenuItem
                        selected={
                            selectedSummaryType ===
                            "Single Date Record"
                        }
                        onClick={() => {
                            setSelectedSummaryType(
                                "Single Date Record"
                            );

                            handleSummaryClose();
                        }}
                    >
                        Single Date Record
                    </MenuItem>

                    <MenuItem
                        selected={
                            selectedSummaryType ===
                            "Multiple Date Record"
                        }
                        onClick={() => {
                            setSelectedSummaryType(
                                "Multiple Date Record"
                            );

                            handleSummaryClose();
                        }}
                    >
                        Multiple Date Record
                    </MenuItem>
                </Menu>

                <Typography
                    variant="subtitle1"
                    onClick={() =>
                        !loading &&
                        navigate("/charges")
                    }
                    sx={{
                        cursor: "pointer",
                        fontWeight: 600,
                        color:
                            colors.blueAccent[700],
                    }}
                >
                    Charges
                </Typography>
            </Box>
        </Box>
    );
};

export default ReportHeader;
