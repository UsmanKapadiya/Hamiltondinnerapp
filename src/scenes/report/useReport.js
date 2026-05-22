import { useState, useEffect, useCallback } from "react";
import dayjs from "dayjs";
import OrderServices from "../../services/orderServices";

const useReportLogic = () => {
  const [date, setDate] = useState(dayjs());

  const [startDate, setStartDate] = useState(dayjs().startOf("month"));

  const [endDate, setEndDate] = useState(dayjs());

  const [loading, setLoading] = useState(false);

  const [data, setData] = useState({});

  const [rowsArray, setRowsArray] = useState([]);

  const [selectedSummaryType, setSelectedSummaryType] =
    useState("Single Date Record");

  const [summaryAnchor, setSummaryAnchor] = useState(null);

  /**
   * Fetch single date report
   */
  const fetchSingleDateReport = useCallback(async () => {
    try {
      setLoading(true);

      const response = await OrderServices.getReportList(
        date.format("YYYY-MM-DD"),
      );

      setRowsArray(Object.values(response?.result?.rows || {}));

      setData(response);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [date]);

  /**
   * Fetch multiple date report
   */
  const fetchMultipleDateReport = useCallback(async () => {
    if (
      !startDate ||
      !endDate ||
      !dayjs(startDate).isValid() ||
      !dayjs(endDate).isValid()
    ) {
      return;
    }

    if (dayjs(endDate).isBefore(dayjs(startDate), "day")) {
      setRowsArray([]);
      setData({});
      return;
    }

    try {
      setLoading(true);

      const response = await OrderServices.getMultipleDateReportList(
        dayjs(startDate).format("YYYY-MM-DD"),
        dayjs(endDate).format("YYYY-MM-DD"),
      );

      setRowsArray(Object.values(response?.result?.rows || {}));

      setData(response);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  /**
   * Handle report fetch
   */
  useEffect(() => {
    if (selectedSummaryType === "Single Date Record") {
      fetchSingleDateReport();
    }
  }, [selectedSummaryType, fetchSingleDateReport]);

  useEffect(() => {
    if (selectedSummaryType === "Multiple Date Record") {
      fetchMultipleDateReport();
    }
  }, [selectedSummaryType, fetchMultipleDateReport]);

  /**
   * Summary menu handlers
   */
  const handleSummaryClick = (event) => {
    setSummaryAnchor(event.currentTarget);
  };

  const handleSummaryClose = () => {
    setSummaryAnchor(null);
  };

  /**
   * Helpers
   */
  const getColumns = (idx) =>
    Array.isArray(data?.columns) && Array.isArray(data.columns[idx])
      ? data.columns[idx]
      : [];

  const isReportEmpty = () => !rowsArray || rowsArray.length === 0;

  return {
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
  };
};

export default useReportLogic;
