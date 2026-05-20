import React from "react";
import { Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { ArrowForwardIosOutlined } from "@mui/icons-material";
import _ from "lodash";
import { useTheme } from "@mui/material";
import { tokens } from "../../../theme";
import CustomButton from "../../../components/CustomButton";
import MenuItem from "./MenuItem";
import ServiceOptions from "./ServiceOptions";
import {
  decreaseItemQuantity,
  increaseItemQuantity,
  increaseItemQuantityWithLimit,
  increaseAlternativeItemQuantityWithLimit,
  updateItemOption,
  updateItemPreference,
  updateCategoryItems,
  hasItemsWithQuantity,
} from "../utils/itemHelpers";

const MealSection = ({
  mealType,
  categories,
  data,
  setData,
  userData,
  kitchenSummery,
  disabled,
  MAX_MEAL_QTY,
  isGuestOrder = false,
  langObj,
  guideline,
  guidelineCn,
  showGuideline,
  noMenuWarning,
  serviceKeys,
  onSubmit,
  servedWithText,
}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();

  const categoryKey = `${mealType}Categories`;
  const hasItems = hasItemsWithQuantity(categories);

  const handleDecrease = (catIdx, itemType, item) => {
    setData((prev) => ({
      ...prev,
      [categoryKey]: updateCategoryItems(
        prev[categoryKey],
        catIdx,
        itemType,
        item.id,
        decreaseItemQuantity
      ),
    }));
  };

  const handleIncrease = (catIdx, itemType, item) => {
    setData((prev) => {
      const category = prev[categoryKey][catIdx];
      const allEntreeItems = category.entreeItems || [];
      const allAlternativeItems = category.alternativeItems || [];

      let updatedItems;
      
      if (itemType === "entreeItems") {
        updatedItems = increaseItemQuantityWithLimit(
          item,
          MAX_MEAL_QTY,
          allEntreeItems,
          allAlternativeItems,
          userData?.role === "kitchen"
        );
      } else {
        updatedItems = increaseAlternativeItemQuantityWithLimit(
          item,
          MAX_MEAL_QTY,
          allEntreeItems,
          allAlternativeItems,
          userData?.role === "kitchen"
        );
      }

      return {
        ...prev,
        [categoryKey]: prev[categoryKey].map((cat, idx) =>
          idx === catIdx
            ? {
                ...cat,
                entreeItems: updatedItems.entreeItems,
                alternativeItems: updatedItems.alternativeItems,
              }
            : cat
        ),
      };
    });
  };

  const handleOptionChange = (catIdx, itemType, item, optionId) => {
    setData((prev) => ({
      ...prev,
      [categoryKey]: updateCategoryItems(
        prev[categoryKey],
        catIdx,
        itemType,
        item.id,
        (i) => updateItemOption(i, optionId)
      ),
    }));
  };

  const handlePreferenceChange = (catIdx, itemType, item, preferenceId) => {
    setData((prev) => ({
      ...prev,
      [categoryKey]: updateCategoryItems(
        prev[categoryKey],
        catIdx,
        itemType,
        item.id,
        (i) => updateItemPreference(i, preferenceId)
      ),
    }));
  };

  const handleServiceToggle = (serviceKey) => {
    setData((prev) => {
      // Reset all service flags for this meal type to 0, then toggle the selected one
      const updates = {};
      serviceKeys.forEach((key) => {
        updates[key.key] = 0;
      });
      
      // Toggle the selected service (if it was already 1, it becomes 0; if it was 0, it becomes 1)
      updates[serviceKey] = prev[serviceKey] === 1 ? 0 : 1;
      
      return {
        ...prev,
        ...updates,
      };
    });
  };

  const getCategoryName = (cat) => {
    if (userData?.langCode === "cn" && cat.cat_name_cn && cat.cat_name_cn.trim() !== "") {
      return cat.cat_name_cn;
    }
    return cat.cat_name;
  };

  const getAlternativeCategoryName = (cat) => {
    if (
      userData?.langCode === "cn" &&
      cat.alternativeCatName_cn &&
      cat.alternativeCatName_cn.trim() !== ""
    ) {
      return cat.alternativeCatName_cn;
    }
    return cat.alternativeCatName;
  };

  if (!_.isArray(categories)) return null;

  return (
    <Box>
      {categories.map((cat, catIdx) => (
        <Box key={cat.cat_id} mb={3}>
          <Typography
            variant="h6"
            sx={{
              mb: 2,
              fontWeight: 600,
              backgroundColor: "#f5f5f5",
              px: 2,
              py: 1,
              borderRadius: 1,
              textAlign: "center",
            }}
          >
            {getCategoryName(cat)}
            {servedWithText && cat.cat_name === servedWithText.catName && ` (${servedWithText.text})`}
          </Typography>

          {/* Entree Items */}
          {_.map(cat.entreeItems, (item) => (
            <MenuItem
              key={item.id}
              item={item}
              userData={userData}
              kitchenSummery={kitchenSummery}
              disabled={disabled}
              maxQty={MAX_MEAL_QTY}
              isGuestOrder={isGuestOrder}
              onDecrease={() => handleDecrease(catIdx, "entreeItems", item)}
              onIncrease={() => handleIncrease(catIdx, "entreeItems", item)}
              onOptionChange={(optId) =>
                handleOptionChange(catIdx, "entreeItems", item, optId)
              }
              onPreferenceChange={(prefId) =>
                handlePreferenceChange(catIdx, "entreeItems", item, prefId)
              }
              mealType={mealType}
              categoryId={cat.cat_id}
              itemType="entree"
            />
          ))}

          {/* Alternative Items */}
          {cat.alternativeCatName && (
            <Typography variant="subtitle1" sx={{ mt: 3, mb: 2, fontWeight: 700 }}>
              {getAlternativeCategoryName(cat)}
            </Typography>
          )}

          {_.map(cat.alternativeItems, (item) => (
            <MenuItem
              key={item.id}
              item={item}
              userData={userData}
              kitchenSummery={kitchenSummery}
              disabled={disabled}
              maxQty={MAX_MEAL_QTY}
              isGuestOrder={isGuestOrder}
              onDecrease={() => handleDecrease(catIdx, "alternativeItems", item)}
              onIncrease={() => handleIncrease(catIdx, "alternativeItems", item)}
              onOptionChange={(optId) =>
                handleOptionChange(catIdx, "alternativeItems", item, optId)
              }
              onPreferenceChange={(prefId) =>
                handlePreferenceChange(catIdx, "alternativeItems", item, prefId)
              }
              mealType={mealType}
              categoryId={cat.cat_id}
              itemType="alternative"
            />
          ))}
        </Box>
      ))}

      {/* Service Options */}
      {hasItems && !kitchenSummery && (
        <ServiceOptions
          data={data}
          langObj={langObj}
          serviceKeys={serviceKeys}
          onServiceToggle={handleServiceToggle}
        />
      )}

      {/* Guidelines */}
      {showGuideline && (
        <>
          <hr />
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
            {userData?.langCode === "cn" && guidelineCn && guidelineCn.trim() !== ""
              ? guidelineCn
              : guideline}
          </Typography>
        </>
      )}

      {/* No Menu Warning */}
      {_.isEmpty(categories) && (
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
          {noMenuWarning}
        </Typography>
      )}

      {/* Kitchen Summary Button */}
      {kitchenSummery && (
        <Box mt={3} display="flex" justifyContent="center">
          <CustomButton
            onClick={() => navigate("/report")}
            endIcon={<ArrowForwardIosOutlined />}
            sx={{
              bgcolor: colors.blueAccent[50],
              color: colors.blueAccent[700],
              "&:hover": {
                bgcolor: colors.blueAccent[100],
                color: colors.blueAccent[800],
              },
              padding: "10px 32px",
              boxShadow: "none",
              borderRadius: "30px",
              border: "none",
              fontWeight: 600,
              fontSize: 16,
              cursor: "pointer",
              width: "auto",
            }}
          >
            {langObj.viewReport}
          </CustomButton>
        </Box>
      )}

      {/* Submit Button */}
      {hasItems && !kitchenSummery && (
        <Box mt={3} display="flex" justifyContent="center">
          <CustomButton
            sx={{
              padding: "10px 32px",
              bgcolor: colors.blueAccent[700],
              color: "#fcfcfc",
              border: "none",
              borderRadius: 4,
              fontWeight: 600,
              fontSize: 16,
              cursor: "pointer",
              width: "auto",
            }}
            disabled={disabled}
            onClick={onSubmit}
          >
            {langObj.submit}
          </CustomButton>
        </Box>
      )}
    </Box>
  );
};

export default MealSection;
