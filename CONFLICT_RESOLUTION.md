# Export Conflict Resolution

## Issue
Multiple utility files were exporting functions with the same names, causing:
- `SyntaxError: The requested module '/src/utils/index.js' contains conflicting star exports for name 'getLanguageObject'`
- `ReferenceError: findRoomByName is not defined`

## Root Cause
When using `export *` in `src/utils/index.js`, it re-exports all named exports from all utility files. If two files export the same function name, JavaScript throws a conflict error.

## Conflicts Found and Resolved

### 1. `getLanguageObject`
- **Duplicated in:**
  - `src/utils/lodashHelpers.js` ❌ REMOVED
  - `src/utils/userHelpers.js` ✅ KEPT (better implementation)

### 2. `isKitchenUser`
- **Duplicated in:**
  - `src/utils/lodashHelpers.js` ❌ REMOVED
  - `src/utils/userHelpers.js` ✅ KEPT (proper location)

### 3. `findRoomByName`
- **Duplicated in:**
  - `src/utils/lodashHelpers.js` ❌ REMOVED
  - `src/utils/userHelpers.js` ✅ KEPT (proper location)

### 4. `getRoomId`
- **Duplicated in:**
  - `src/utils/lodashHelpers.js` ❌ REMOVED
  - `src/utils/userHelpers.js` ✅ KEPT (proper location)

### 5. `calculateTotalMealQuantity`
- **Duplicated in:**
  - `src/utils/lodashHelpers.js` ❌ REMOVED
  - `src/utils/mealDataTransformers.js` ✅ KEPT (more specific implementation)

### 6. `resetMealQuantities` / `resetAllMealQuantities`
- **Similar functions in:**
  - `src/utils/lodashHelpers.js` - `resetMealQuantities` ❌ REMOVED
  - `src/utils/mealDataTransformers.js` - `resetAllMealQuantities` ✅ KEPT (more comprehensive)

## Changes Made

### File: `src/utils/lodashHelpers.js`

**Removed Functions:**
1. `getLanguageObject` - User-related, belongs in `userHelpers.js`
2. `isKitchenUser` - User-related, belongs in `userHelpers.js`
3. `findRoomByName` - User-related, belongs in `userHelpers.js`
4. `getRoomId` - User-related, belongs in `userHelpers.js`
5. `calculateTotalMealQuantity` - Meal-specific, better version in `mealDataTransformers.js`
6. `resetMealQuantities` - Meal-specific, better version in `mealDataTransformers.js`

**Updated Default Export:**
Removed references to deleted functions from the default export object at the end of the file.

### Current State: `lodashHelpers.js`
Now contains only Lodash-based utility functions that don't conflict:
- `transformMealItems`
- `selectFirstOption`
- `groupItemsByCategory`
- `calculateReportTotal`
- `findMealRowByRoom`
- `validateQuantity`
- `extractUniqueItemNames`
- `filterItemsBySearch`
- `sortItemsByPreference`
- `createOrderPayload`
- `hasAnyOrders`
- `mergeUserPreferences`

## Function Location Guide

### User-Related Functions → `src/utils/userHelpers.js`
- `isKitchenUser(userData)`
- `getUserLanguage(userData)`
- `getLanguageObject(userData, englishLocale, chineseLocale)`
- `findRoomByName(userData, roomName)`
- `getRoomId(userData, roomName)`
- `getApiRoomId(userData, roomName)`
- `getRoomOccupancy(userData, roomName, defaultMax)`
- `getUserRoomNames(userData)`
- `hasRoomAccess(userData, roomName)`
- `getDefaultRoom(userData)`

### Meal Data Transformations → `src/utils/mealDataTransformers.js`
- `transformCompleteMealData(mealData)`
- `calculateTotalMealQuantity(mealData)`
- `resetAllMealQuantities(mealData)`
- `transformCategory(category)`
- `transformMealCategories(mealCategories)`
- `extractServiceFlags(mealData, mealType)`
- `selectFirstOptionIfNeeded(options)`
- `transformMenuItem(item)`
- `extractItemsByType(category, itemType)`
- `extractSubcategoryInfo(category)`
- `resetCategoryQuantities(categories)`
- `calculateCategoryTotalQuantity(categories)`

### Data Processing → `src/utils/dataProcessors.js`
- `updateMealDataList(mealList, newMeal)`
- `findMealByDate(mealList, date)`
- `calculateReportColumnTotal(reportList, columnIndex)`
- `findRoomReportData(reportData, roomNo)`
- `isReportEmpty(reportData)`
- `getReportRoomNumbers(reportData)`
- `aggregateByCategory(items, categoryKey)`
- `safeSortBy(items, property, order)`
- `filterByCriteria(items, criteria)`
- `createApiPayload(params, requiredFields)`
- `extractServiceOptions(data, mealPrefix)`
- `safeMerge(...sources)`

### General Lodash Utilities → `src/utils/lodashHelpers.js`
- Generic Lodash-based helpers that don't fit specific categories
- Used for general data manipulation
- No domain-specific logic

### Date/Time Utilities → `src/utils/dateHelpers.js`
- `formatDate(date)`
- `isToday(date)`
- `isPast(date)`
- `isAfterHour(hour)`

### Core Utilities → `src/utils/helpers.js`
- General JavaScript utilities with Lodash wrappers
- String manipulation
- Object/Array operations
- Debounce/Throttle

## Best Practices Going Forward

### 1. Single Responsibility
Each utility file should have a clear, single purpose:
- `userHelpers.js` - User and room operations
- `mealDataTransformers.js` - Meal data transformations
- `dataProcessors.js` - Data aggregation and processing
- `lodashHelpers.js` - Generic Lodash utilities
- `dateHelpers.js` - Date/time operations
- `helpers.js` - Core JavaScript utilities
- `validation.js` - Input validation

### 2. Avoid Duplication
Before creating a new function:
1. Search existing utility files
2. Check if similar functionality exists
3. If found, use or enhance the existing function
4. Don't duplicate - consolidate instead

### 3. Proper File Organization
When adding new utilities:
```javascript
// ✅ GOOD - Function in correct file
// src/utils/userHelpers.js
export const getUserRole = (userData) => {
  return _.get(userData, 'role', 'guest');
};

// ❌ BAD - User function in wrong file
// src/utils/lodashHelpers.js
export const getUserRole = (userData) => {
  return _.get(userData, 'role', 'guest');
};
```

### 4. Import Pattern
Use specific imports when possible:
```javascript
// ✅ GOOD - Specific imports
import { isKitchenUser, getLanguageObject } from '../../utils/userHelpers';

// ✅ ALSO GOOD - Barrel import (now safe)
import { isKitchenUser, getLanguageObject } from '../../utils';

// ⚠️ USE CAREFULLY - Default import
import userHelpers from '../../utils/userHelpers';
userHelpers.isKitchenUser(userData);
```

## Testing After Fix

1. ✅ Clear browser cache (Ctrl + Shift + R)
2. ✅ Restart dev server
3. ✅ Verify no compile errors
4. ✅ Test all refactored components:
   - Order component
   - Guest Order component
   - Report component
5. ✅ Verify all helper functions work correctly

## Status
🟢 **RESOLVED** - All export conflicts eliminated. Application should now run without import/export errors.
