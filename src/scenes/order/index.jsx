import React from "react";
import { Box, useTheme, Typography, Tabs, Tab, TextField } from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Header } from "../../components";
import { tokens } from "../../theme";
import CustomLoadingOverlay from "../../components/CustomLoadingOverlay";
import { ToastContainer } from "react-toastify";
import { EditOutlined, EmojiPeopleOutlined } from "@mui/icons-material";
import "dayjs/locale/zh-cn";
import "react-toastify/dist/ReactToastify.css";
import { useOrderManagement } from "./hooks/useOrderManagement";
import MealSection from "./components/MealSection";
import { formatDate } from "../../utils";

const Order = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // Use custom hook for all business logic
  const {
    langObj,
    date,
    data,
    setData,
    userData,
    roomNo,
    tabIndex,
    setTabIndex,
    loading,
    kitchenUser,
    kitchenSummery,
    isPastDate,
    isAfter10AM,
    isAfter3PM,
    isAfter12PM,
    MAX_MEAL_QTY,
    showBreakFastGuideline,
    showLunchGuideline,
    showDinnerGuideline,
    submitData,
    roomUpdate,
    handleGuestOrderClick,
    handleDateChange,
  } = useOrderManagement();

  // Service option configurations
  const breakfastServiceKeys = [
    { key: "is_brk_tray_service", label: langObj.trayService },
    { key: "is_brk_escort_service", label: langObj.escortService },
    { key: "is_brk_takeout_service", label: langObj.Takeout },
  ];

  const lunchServiceKeys = [
    { key: "is_lunch_tray_service", label: langObj.trayService },
    { key: "is_lunch_escort_service", label: langObj.escortService },
    { key: "is_lunch_takeout_service", label: langObj.Takeout },
  ];

  const dinnerServiceKeys = [
    { key: "is_dinner_tray_service", label: langObj.trayService },
    { key: "is_dinner_escort_service", label: langObj.escortService },
    { key: "is_dinner_takeout_service", label: langObj.Takeout },
  ];

  return (
    <Box m="20px">
      <Header
        title={kitchenSummery ? "Kitchen Summary " : roomNo ? roomNo : userData?.room_id}
        icon={""}
        editRoomsDetails={userData?.role !== "kitchen" ? true : false}
        editIcon={<EditOutlined />}
        isGuest={kitchenSummery ? false : true}
        handleGuestClick={handleGuestOrderClick}
        isGuestIcon={<EmojiPeopleOutlined />}
        handleRoomUpdate={roomUpdate}
        profileScreen={true}
      />
      <ToastContainer />

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

        {/* Loading or Meal Tabs */}
        {loading ? (
          <CustomLoadingOverlay />
        ) : (
          <>
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
                kitchenSummery={kitchenSummery}
                disabled={!kitchenUser && (isPastDate || isAfter10AM)}
                MAX_MEAL_QTY={MAX_MEAL_QTY}
                langObj={langObj}
                guideline={userData?.breakfast_guideline}
                guidelineCn={userData?.breakfast_guideline_cn}
                showGuideline={showBreakFastGuideline}
                noMenuWarning={langObj.breakFasrMenuWarn}
                serviceKeys={breakfastServiceKeys}
                onSubmit={() => submitData(data, formatDate(date))}
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
                kitchenSummery={kitchenSummery}
                disabled={!kitchenUser && (isPastDate || isAfter3PM)}
                MAX_MEAL_QTY={MAX_MEAL_QTY}
                langObj={langObj}
                guideline={userData?.lunch_guideline}
                guidelineCn={userData?.lunch_guideline_cn}
                showGuideline={showLunchGuideline}
                noMenuWarning={langObj.lunchMenuWarn}
                serviceKeys={lunchServiceKeys}
                onSubmit={() => submitData(data, formatDate(date))}
                servedWithText={{ catName: "LUNCH ENTREE", text: langObj.servedWithSoup }}
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
                kitchenSummery={kitchenSummery}
                disabled={!kitchenUser && (isPastDate || isAfter12PM)}
                MAX_MEAL_QTY={MAX_MEAL_QTY}
                langObj={langObj}
                guideline={userData?.dinner_guideline}
                guidelineCn={userData?.dinner_guideline_cn}
                showGuideline={showDinnerGuideline}
                noMenuWarning={langObj.dinnerMenuWarn}
                serviceKeys={dinnerServiceKeys}
                onSubmit={() => submitData(data, formatDate(date))}
                servedWithText={{ catName: "DINNER ENTREE", text: langObj.servedWithDessert }}
              />
            )}
          </>
        )}
      </Box>
    </Box>
  );
};

export default Order;
