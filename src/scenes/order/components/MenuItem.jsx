import React from "react";
import { Box, Typography } from "@mui/material";
import _ from "lodash";

const MenuItem = ({
  item,
  userData,
  kitchenSummery,
  disabled,
  onDecrease,
  onIncrease,
  onOptionChange,
  onPreferenceChange,
  mealType,
  categoryId,
  itemType,
}) => {
  const displayName =
    userData?.langCode === "cn" && item.chinese_name
      ? item.chinese_name
      : item.name;

  const hasOptions = _.size(item.options) > 0;
  const hasPreferences = _.size(item.preference) > 0;
  const showOptionsAndPreferences = item.qty > 0;

  return (
    <Box mb={1} ml={itemType === "alternative" ? 2 : 0}>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box display="flex" alignItems="center">
          {item.image && (
            <img
              src={item.image}
              alt={displayName}
              style={{
                width: 64,
                height: 64,
                objectFit: "cover",
                borderRadius: 8,
                marginRight: 12,
              }}
            />
          )}
          <Typography>{displayName}</Typography>
        </Box>

        <Box display="flex" alignItems="center">
          {!kitchenSummery && (
            <button
              onClick={onDecrease}
              style={{ marginRight: 8 }}
              disabled={item.qty === 0 || disabled}
            >
              -
            </button>
          )}
          <Typography
            sx={kitchenSummery ? { fontSize: 24, fontWeight: 700 } : {}}
          >
            {item.qty || 0}
          </Typography>
          {!kitchenSummery && (
            <button
              onClick={onIncrease}
              style={{ marginLeft: 8 }}
              disabled={disabled}
            >
              +
            </button>
          )}
        </Box>
      </Box>

      {/* Options and Preferences */}
      <Box
        mt={2}
        ml={itemType === "alternative" ? 3 : 1}
        sx={{ width: "100%", minHeight: showOptionsAndPreferences ? "auto" : 0 }}
      >
        {showOptionsAndPreferences && (
          <Box mt={2}>
            {hasOptions && (
              <Box mb={1}>
                {item.options.map((opt) => (
                  <label key={opt.id} style={{ marginRight: 12 }}>
                    <input
                      type="radio"
                      name={`${mealType}-${itemType}-option-${categoryId}-${item.id}`}
                      checked={!!opt.is_selected}
                      onChange={() => onOptionChange(opt.id)}
                    />
                    <span style={{ marginLeft: 5 }}>{opt.name}</span>
                  </label>
                ))}
              </Box>
            )}

            {hasPreferences && (
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: 18 }}>
                  * Preference
                </Typography>
                {item.preference.map((pref) => (
                  <label key={pref.id} style={{ marginRight: 12 }}>
                    <input
                      type="checkbox"
                      checked={!!pref.is_selected}
                      onChange={() => onPreferenceChange(pref.id)}
                    />
                    <span style={{ marginLeft: 5 }}>{pref.name}</span>
                  </label>
                ))}
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default MenuItem;
