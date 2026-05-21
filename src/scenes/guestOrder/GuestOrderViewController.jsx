import React from "react";
import {
  Box,
  useTheme,
  Typography,
  Tabs,
  Tab,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { ToastContainer } from "react-toastify";
import dayjs from "dayjs";
import "dayjs/locale/zh-cn";
import "react-toastify/dist/ReactToastify.css";
import { Header } from "../../components";
import { tokens } from "../../theme";
import CustomLoadingOverlay from "../../components/CustomLoadingOverlay";
import MealSection from "../order/components/MealSection";
import { useGuestOrder } from "./hooks/useGuestOrder";
import {
  getGuestBreakfastServiceKeys,
  getGuestLunchServiceKeys,
  getGuestDinnerServiceKeys,
  SERVED_WITH_CONFIG,
} from "../order/constants/mealServiceConfig";

/**
 * GuestOrderViewController - Main UI component for guest order management
 * Handles the presentation layer while delegating all business logic to useGuestOrder hook
 */
const GuestOrderViewController = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // Get all state and handlers from custom hook
  const {
    // State
    langObj,
    date,
    data,
    setData,
    userData,
    roomNo,
    tabIndex,
    setTabIndex,
    loading,
    guestCount,
    alertOpen,

    // Computed values
    isPastDate,
    isAfter10AM,
    isAfter3PM,
    isAfter12PM,
    showBreakFastGuideline,
    showLunchGuideline,
    showDinnerGuideline,

    // Methods
    submitData,
    handleIncrement,
    handleDecrement,
    handleAlertContinue,
    handleAlertCancel,
    handleDateChange,
  } = useGuestOrder();

  // Get guest-specific service configurations (tray service only)
  const breakfastServiceKeys = getGuestBreakfastServiceKeys(langObj);
  const lunchServiceKeys = getGuestLunchServiceKeys(langObj);
  const dinnerServiceKeys = getGuestDinnerServiceKeys(langObj);

  // Get served with text configurations
  const lunchServedWith = {
    catName: SERVED_WITH_CONFIG.lunch.catName,
    text: langObj[SERVED_WITH_CONFIG.lunch.textKey],
  };
  const dinnerServedWith = {
    catName: SERVED_WITH_CONFIG.dinner.catName,
    text: langObj[SERVED_WITH_CONFIG.dinner.textKey],
  };

  return (
    <>
      {/* Alert Dialog */}
      <Dialog open={alertOpen} onClose={handleAlertCancel} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ textAlign: "center", fontWeight: 600 }}>
          Remove All Items?
        </DialogTitle>
        <DialogContent sx={{ textAlign: "center", fontSize: 16 }}>
          Order is already selected for {guestCount} guest(s).
          <br />
          If you continue, it will remove all items from the order.
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
          <Button onClick={handleAlertCancel} variant="outlined" color="primary">
            Cancel
          </Button>
          <Button onClick={handleAlertContinue} variant="contained" color="error">
            Continue
          </Button>
        </DialogActions>
      </Dialog>

      {/* Main Content */}
      <Box m="20px">
        {/* Header */}
        <Header
          title={
            roomNo
              ? `${roomNo} ${langObj.guest}`
              : `${userData?.room_id} ${langObj.guest}`
          }
          icon={""}
          editRoomsDetails={false}
          isGuest={false}
          profileScreen={true}
        />
        
        <ToastContainer />

        {/* Content Box */}
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
          {/* Date Picker */}
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <LocalizationProvider
              dateAdapter={AdapterDayjs}
              adapterLocale={userData?.langCode === "cn" ? "zh-cn" : "en"}
            >
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

          {/* Date Display */}
          <Box sx={{ textAlign: "center" }}>
            <Typography>
              {userData?.language === 1
                ? `${dayjs(date).locale("zh-cn").format("MMMM")} ${dayjs(date).format("D, YYYY")}`
                : dayjs(date).format("MMMM D, YYYY")}
            </Typography>
          </Box>

          {/* Guest Count Section */}
          <Box
            sx={{
              bgcolor: "#f5f5f5",
              borderRadius: 2,
              p: 1,
            }}
          >
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                }}
              >
                {langObj.noOfGuests}
              </Typography>
              <Box display="flex" alignItems="center">
                <Button
                  variant="outlined"
                  sx={{ minWidth: 36, mx: 1 }}
                  onClick={handleDecrement}
                  disabled={isPastDate}
                >
                  -
                </Button>
                <Typography sx={{ mx: 1 }}>{guestCount}</Typography>
                <Button
                  variant="outlined"
                  sx={{ minWidth: 36, mx: 1 }}
                  onClick={handleIncrement}
                  disabled={isPastDate || guestCount >= 10}
                >
                  +
                </Button>
              </Box>
            </Box>
          </Box>

          {/* Loading or Meal Tabs */}
          {loading ? (
            <CustomLoadingOverlay />
          ) : (
            <>
              {/* Meal Type Tabs */}
              <Tabs
                value={tabIndex}
                onChange={(_, newValue) => setTabIndex(newValue)}
                indicatorColor="primary"
                textColor="primary"
                sx={{ mb: 2 }}
              >
                <Tab label={langObj.brk} />
                <Tab label={langObj.lunch} />
                <Tab label={langObj.dnr} />
              </Tabs>

              {/* Breakfast Tab */}
              {tabIndex === 0 && (
                <MealSection
                  mealType="breakfast"
                  categories={data.breakfastCategories}
                  data={data}
                  setData={setData}
                  userData={userData}
                  kitchenSummery={false}
                  disabled={isPastDate || isAfter10AM}
                  MAX_MEAL_QTY={guestCount}
                  isGuestOrder={true}
                  langObj={langObj}
                  guideline={userData?.breakfast_guideline}
                  guidelineCn={userData?.breakfast_guideline_cn}
                  showGuideline={showBreakFastGuideline}
                  noMenuWarning={langObj.breakFasrMenuWarn}
                  serviceKeys={breakfastServiceKeys}
                  onSubmit={() => submitData(data, date)}
                />
              )}

              {/* Lunch Tab */}
              {tabIndex === 1 && (
                <MealSection
                  mealType="lunch"
                  categories={data.lunchCategories}
                  data={data}
                  setData={setData}
                  userData={userData}
                  kitchenSummery={false}
                  disabled={isPastDate || isAfter3PM}
                  MAX_MEAL_QTY={guestCount}
                  isGuestOrder={true}
                  langObj={langObj}
                  guideline={userData?.lunch_guideline}
                  guidelineCn={userData?.lunch_guideline_cn}
                  showGuideline={showLunchGuideline}
                  noMenuWarning={langObj.lunchMenuWarn}
                  serviceKeys={lunchServiceKeys}
                  onSubmit={() => submitData(data, date)}
                  servedWithText={lunchServedWith}
                />
              )}

              {/* Dinner Tab */}
              {tabIndex === 2 && (
                <MealSection
                  mealType="dinner"
                  categories={data.dinnerCategories}
                  data={data}
                  setData={setData}
                  userData={userData}
                  kitchenSummery={false}
                  disabled={isPastDate || isAfter12PM}
                  isGuestOrder={true}
                  MAX_MEAL_QTY={guestCount}
                  langObj={langObj}
                  guideline={userData?.dinner_guideline}
                  guidelineCn={userData?.dinner_guideline_cn}
                  showGuideline={showDinnerGuideline}
                  noMenuWarning={langObj.dinnerMenuWarn}
                  serviceKeys={dinnerServiceKeys}
                  onSubmit={() => submitData(data, date)}
                  servedWithText={dinnerServedWith}
                />
              )}
            </>
          )}
        </Box>
      </Box>
    </>
  );
};

export default GuestOrderViewController;
