import { useEffect, useState, useCallback } from "react";
import dayjs from "dayjs";
import OrderServices from "../../services/orderServices";

const useChargesReport = () => {
    const [startDate, setStartDate] = useState(dayjs().startOf("month"));
    const [endDate, setEndDate] = useState(dayjs());
    const [date, setDate] = useState(dayjs());

    const [loading, setLoading] = useState(false);
    const [data, setData] = useState({});
    const [error, setError] = useState(null);

    const [selectedSummaryType, setSelectedSummaryType] =
        useState("Single Date Record");

    const fetchSingleDateReport = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response =
                await OrderServices.getCharges(
                    date.format("YYYY-MM-DD")
                );

            setData(response || {});
        } catch (err) {
            setError("Failed to fetch report.");
            setData({});
        } finally {
            setLoading(false);
        }
    }, [date]);

    const fetchMultipleDateReport = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response =
                await OrderServices.getMultipleDateChargesReportList(
                    dayjs(startDate).format("YYYY-MM-DD"),
                    dayjs(endDate).format("YYYY-MM-DD")
                );

            setData(response || {});
        } catch (err) {
            setError("Failed to fetch report.");
            setData({});
        } finally {
            setLoading(false);
        }
    }, [startDate, endDate]);

    useEffect(() => {
        if (selectedSummaryType === "Single Date Record") {
            fetchSingleDateReport();
        }
    }, [fetchSingleDateReport, selectedSummaryType]);

    useEffect(() => {
        if (
            selectedSummaryType === "Multiple Date Record" &&
            startDate &&
            endDate
        ) {
            fetchMultipleDateReport();
        }
    }, [
        fetchMultipleDateReport,
        selectedSummaryType,
        startDate,
        endDate,
    ]);

    return {
        startDate,
        endDate,
        date,
        loading,
        data,
        error,
        selectedSummaryType,

        setStartDate,
        setEndDate,
        setDate,
        setSelectedSummaryType,
    };
};

export default useChargesReport;
