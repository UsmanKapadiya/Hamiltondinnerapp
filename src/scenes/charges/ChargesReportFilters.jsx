import React, { useState } from "react";

import {
    Box,
    IconButton,
    Menu,
    MenuItem,
    Tooltip,
} from "@mui/material";

import { SummarizeOutlined } from "@mui/icons-material";

import {
    DatePicker,
    LocalizationProvider,
} from "@mui/x-date-pickers";

import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import dayjs from "dayjs";

const ChargesReportFilters = ({
    loading,

    date,
    setDate,

    startDate,
    setStartDate,

    endDate,
    setEndDate,

    selectedSummaryType,
    setSelectedSummaryType,

    colors,
}) => {
    const [anchorEl, setAnchorEl] =
        useState(null);

    return (
        <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            gap={2}
            flexWrap="wrap"
            mt="30px"
            mb="20px"
        >
            <LocalizationProvider
                dateAdapter={AdapterDayjs}
            >
                {selectedSummaryType ===
                    "Multiple Date Record" ? (
                    <Box
                        display="flex"
                        gap={2}
                        flexWrap="wrap"
                    >
                        <DatePicker
                            label="Start Date"
                            value={startDate}
                            onChange={(value) =>
                                setStartDate(
                                    value
                                )
                            }
                            maxDate={endDate}
                            disabled={loading}
                            slotProps={{
                                textField: {
                                    variant:
                                        "filled",
                                    sx: {
                                        minWidth: 220,
                                    },
                                },
                            }}
                        />

                        <DatePicker
                            label="End Date"
                            value={endDate}
                            onChange={(value) =>
                                setEndDate(
                                    value
                                )
                            }
                            minDate={startDate}
                            disabled={loading}
                            slotProps={{
                                textField: {
                                    variant:
                                        "filled",
                                    sx: {
                                        minWidth: 220,
                                    },
                                },
                            }}
                        />
                    </Box>
                ) : (
                    <DatePicker
                        label="Date"
                        value={date}
                        onChange={(value) => {
                            if (
                                value &&
                                dayjs(
                                    value
                                ).isValid()
                            ) {
                                setDate(
                                    value
                                );
                            }
                        }}
                        disabled={loading}
                        slotProps={{
                            textField: {
                                variant:
                                    "filled",
                                sx: {
                                    minWidth: 220,
                                },
                            },
                        }}
                    />
                )}
            </LocalizationProvider>

            <Tooltip
                title="Reports"
                arrow
            >
                <IconButton
                    onClick={(e) =>
                        setAnchorEl(
                            e.currentTarget
                        )
                    }
                    sx={{
                        color: colors
                            .blueAccent[700],
                    }}
                >
                    <SummarizeOutlined />
                </IconButton>
            </Tooltip>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() =>
                    setAnchorEl(null)
                }
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

                        setAnchorEl(
                            null
                        );
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

                        setAnchorEl(
                            null
                        );
                    }}
                >
                    Multiple Date Record
                </MenuItem>
            </Menu>
        </Box>
    );
};

export default ChargesReportFilters;