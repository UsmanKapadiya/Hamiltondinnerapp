import React, { useState } from "react";

import {
    Box,
    Typography,
} from "@mui/material";

import {
    Header,
} from "../../components";

import {
    tokens,
} from "../../theme";

import { useTheme } from "@mui/material";

import useChargesReport from "./useChargesReport";

import ChargesReportTable from "./ChargesReportTable";

import ChargesOptionPopup from "./ChargesOptionPopup";

import ChargesReportFilters from "./ChargesReportFilters";
import CustomLoadingOverlay from "../../components/CustomLoadingOverlay";

const ChargesReport = () => {
    const theme = useTheme();

    const colors =
        tokens(theme.palette.mode);

    const {
        data,
        loading,
        error,

        date,
        setDate,

        startDate,
        setStartDate,

        endDate,
        setEndDate,

        selectedSummaryType,
        setSelectedSummaryType,
    } = useChargesReport();

    const [popup, setPopup] =
        useState({
            open: false,
            anchorEl: null,
            text: "",
            title: "",
        });

    return (
        <Box m="20px">
            <Header
                title="Charges Report"
                profileScreen
            />

            {/* Top Header Actions */}
            <ChargesReportFilters
                loading={loading}
                date={date}
                setDate={setDate}
                startDate={startDate}
                setStartDate={setStartDate}
                endDate={endDate}
                setEndDate={setEndDate}
                selectedSummaryType={
                    selectedSummaryType
                }
                setSelectedSummaryType={
                    setSelectedSummaryType
                }
                colors={colors}
            />

            <Box mt="20px">
                {loading ? (
                    <CustomLoadingOverlay/>
                ) : error ? (
                    <Typography color="error">
                        {error}
                    </Typography>
                ) : (
                    <ChargesReportTable
                        data={data}
                        colors={colors}
                        setPopup={setPopup}
                    />
                )}
            </Box>

            <ChargesOptionPopup
                popup={popup}
                setPopup={setPopup}
            />
        </Box>
    );
};

export default ChargesReport;
