import React from "react";

import {
    Box,
    Typography,
    useTheme,
} from "@mui/material";

import { useNavigate } from "react-router-dom";

import { tokens } from "../../theme";

import { Header } from "../../components";

import CustomLoadingOverlay from "../../components/CustomLoadingOverlay";

import useReportLogic from "./useReport";

import ReportHeader from "./ReportHeader";

import ReportTable from "./ReportTable";

const Report = () => {
    const navigate = useNavigate();

    const theme = useTheme();

    const colors = tokens(
        theme.palette.mode
    );

    const {
        date,
        setDate,
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        loading,
        data,
        rowsArray,
        selectedSummaryType,
        setSelectedSummaryType,
        summaryAnchor,
        handleSummaryClick,
        handleSummaryClose,
        getColumns,
        isReportEmpty,
    } = useReportLogic();

    return (
        <Box m="20px">
            <Header
                title="Report"
                profileScreen={true}
            />

            <Box mt="40px">
                <ReportHeader
                    colors={colors}
                    loading={loading}
                    navigate={navigate}
                    selectedSummaryType={
                        selectedSummaryType
                    }
                    setSelectedSummaryType={
                        setSelectedSummaryType
                    }
                    summaryAnchor={
                        summaryAnchor
                    }
                    handleSummaryClick={
                        handleSummaryClick
                    }
                    handleSummaryClose={
                        handleSummaryClose
                    }
                    date={date}
                    setDate={setDate}
                    startDate={startDate}
                    setStartDate={
                        setStartDate
                    }
                    endDate={endDate}
                    setEndDate={setEndDate}
                />

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
                        >
                          No Data Available for the selected date.
                        </Typography>
                    </Box>
                ) : (
                    <ReportTable
                        colors={colors}
                        data={data}
                        rowsArray={
                            rowsArray
                        }
                        getColumns={
                            getColumns
                        }
                    />
                )}
            </Box>
        </Box>
    );
};

export default Report;
