import { Box, useTheme, TextField, Tabs, Tab } from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { EditOutlined, EmojiPeopleOutlined } from "@mui/icons-material";
import { ToastContainer } from "react-toastify";
import "dayjs/locale/zh-cn";
import "react-toastify/dist/ReactToastify.css";
import { Header } from "../../components";
import { tokens } from "../../theme";
import CustomLoadingOverlay from "../../components/CustomLoadingOverlay";
import MealSection from "./components/MealSection";
import { useOrder } from "./hooks/useOrder";
import { formatDate } from "../../utils";
import {
  getBreakfastServiceKeys,
  getLunchServiceKeys,
  getDinnerServiceKeys,
  SERVED_WITH_CONFIG,
} from "./constants/mealServiceConfig";

/**
 * OrderViewController - Main UI component for order management
 * Handles the presentation layer while delegating all business logic to useOrder hook
 */
const OrderViewController = () => {
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
    kitchenSummery,

    // Computed values
    kitchenUser,
    isPastDate,
    isAfter10AM,
    isAfter3PM,
    isAfter12PM,
    MAX_MEAL_QTY,
    showBreakFastGuideline,
    showLunchGuideline,
    showDinnerGuideline,

    // Methods
    submitData,
    roomUpdate,
    handleGuestOrderClick,
    handleDateChange,
  } = useOrder();

  // Get service configurations with translations
  const breakfastServiceKeys = getBreakfastServiceKeys(langObj);
  const lunchServiceKeys = getLunchServiceKeys(langObj);
  const dinnerServiceKeys = getDinnerServiceKeys(langObj);

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
    <Box m="20px">
      {/* Header */}
      <Header
        title={
          kitchenSummery
            ? "Kitchen Summary "
            : roomNo
              ? roomNo
              : userData?.room_id
        }
        icon={""}
        editRoomsDetails={userData?.role !== "kitchen"}
        editIcon={<EditOutlined />}
        isGuest={!kitchenSummery}
        handleGuestClick={handleGuestOrderClick}
        isGuestIcon={<EmojiPeopleOutlined />}
        handleRoomUpdate={roomUpdate}
        profileScreen={true}
      />

      <ToastContainer />

      {/* Main Content */}
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
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mb={2}
        >
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
                servedWithText={dinnerServedWith}
              />
            )}
          </>
        )}
      </Box>
    </Box>
  );
};

export default OrderViewController;
