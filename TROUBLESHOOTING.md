# 🔧 **Troubleshooting Guide - Dynamic Import Error**

## Error
```
TypeError: Failed to fetch dynamically imported module
```

## Root Cause
This error occurs when:
1. Browser cache contains old module versions
2. Duplicate function names across utility files
3. Module hot-reload issues during development

## ✅ **Solution Steps**

### Step 1: Clear Browser Cache
1. Open your browser DevTools (F12)
2. Right-click the **Refresh** button
3. Select **"Empty Cache and Hard Reload"**

OR use keyboard shortcut:
- **Windows/Linux**: `Ctrl + Shift + Delete`
- **Mac**: `Cmd + Shift + Delete`

### Step 2: Clear Vite Cache
```powershell
# Stop the dev server first (Ctrl + C)

# Remove .vite cache directory
Remove-Item -Recurse -Force node_modules/.vite

# Remove dist directory if exists
Remove-Item -Recurse -Force dist

# Restart dev server
npm run dev
```

### Step 3: If Error Persists - Use Specific Imports

Instead of importing from the barrel export (`utils/index.js`), import directly from specific files:

#### ❌ **Problematic** (may cause conflicts)
```javascript
import { 
  calculateTotalMealQuantity,
  resetAllMealQuantities,
  isKitchenUser,
  getLanguageObject
} from '../../utils';  // Barrel import
```

#### ✅ **Recommended** (no conflicts)
```javascript
// Import from specific files
import { calculateTotalMealQuantity, resetAllMealQuantities } from '../../utils/mealDataTransformers';
import { isKitchenUser, getLanguageObject, getRoomId } from '../../utils/userHelpers';
import { isToday, isPast, isAfterHour } from '../../utils/dateHelpers';
```

---

## 📋 **Function Location Reference**

### **mealDataTransformers.js**
- `selectFirstOptionIfNeeded()`
- `transformMenuItem()`
- `extractItemsByType()`
- `extractSubcategoryInfo()`
- `transformCategory()`
- `transformMealCategories()`
- `extractServiceFlags()`
- `transformCompleteMealData()` ⭐
- `resetCategoryQuantities()`
- `calculateCategoryTotalQuantity()`
- `calculateTotalMealQuantity()` ⭐
- `resetAllMealQuantities()` ⭐

### **userHelpers.js**
- `isKitchenUser()` ⭐
- `getUserLanguage()`
- `getLanguageObject()` ⭐
- `findRoomByName()`
- `getRoomId()` ⭐
- `getRoomOccupancy()` ⭐
- `getApiRoomId()` ⭐
- `getUserRoomNames()`
- `hasRoomAccess()`
- `getDefaultRoom()`

### **dataProcessors.js**
- `updateMealDataList()` ⭐
- `findMealByDate()`
- `calculateReportColumnTotal()` ⭐
- `findRoomReportData()` ⭐
- `isReportEmpty()` ⭐
- `getReportRoomNumbers()` ⭐
- `aggregateByCategory()`
- `safeSortBy()`
- `filterByCriteria()`
- `createApiPayload()`
- `extractServiceOptions()`
- `safeMerge()`

### **dateHelpers.js**
- `formatDate()` ⭐
- `isToday()` ⭐
- `isPast()` ⭐
- `isAfterHour()` ⭐

### **helpers.js** (Lodash wrappers)
- `capitalize()`, `deepClone()`, `isEmpty()`
- `get()`, `set()`, `debounce()`, `throttle()`
- `unique()`, `uniqueBy()`, `groupBy()`, `sortBy()`
- `findItem()`, `filterItems()`, `merge()`
- `pick()`, `omit()`, `chunk()`, `sum()`, `sumBy()`
- `flatten()`, `flattenDeep()`, `compact()`

### **validation.js**
- `sanitizeInput()` ⭐
- `validateRoomNumber()`
- `validateRequired()`
- `validateLoginForm()` ⭐
- `validateEmail()`
- `validatePhone()`

---

## 🎯 **Quick Fix for Components**

### For **guestOrder/index.jsx**
```javascript
import { useLocalStorage } from "../../hooks";
import { isToday, isPast, isAfterHour } from "../../utils/dateHelpers";
import { 
  getLanguageObject,
  getRoomId 
} from "../../utils/userHelpers";
import { 
  calculateTotalMealQuantity,
  resetAllMealQuantities,
  transformCompleteMealData
} from "../../utils/mealDataTransformers";
import config from "../../config";
import _ from 'lodash';
```

### For **order/index.jsx**
```javascript
import { useLocalStorage, useLazyApi } from "../../hooks";
import { formatDate, isToday, isPast, isAfterHour } from "../../utils/dateHelpers";
import { 
  isKitchenUser,
  getApiRoomId,
  getRoomOccupancy,
  getLanguageObject
} from "../../utils/userHelpers";
import { 
  transformCompleteMealData 
} from "../../utils/mealDataTransformers";
import { 
  updateMealDataList 
} from "../../utils/dataProcessors";
import config from "../../config";
import _ from 'lodash';
```

### For **report/index.jsx**
```javascript
import OrderServices from "../../services/orderServices";
import { 
  isReportEmpty,
  calculateReportColumnTotal,
  getReportRoomNumbers,
  findRoomReportData
} from "../../utils/dataProcessors";
import _ from 'lodash';
```

---

## 🚀 **Prevention Tips**

1. **Always clear cache** when making structural changes
2. **Use specific imports** for better tree-shaking
3. **Restart dev server** after adding new utility files
4. **Check browser console** for detailed error messages
5. **Use source maps** in development mode (already enabled in Vite)

---

## 📞 **If Still Not Working**

1. Stop dev server completely
2. Delete `node_modules/.vite` folder
3. Clear browser cache completely
4. Restart dev server: `npm run dev`
5. Hard refresh browser: `Ctrl + Shift + R` (or `Cmd + Shift + R` on Mac)
6. Open in incognito/private window to test
7. Check browser console for specific error details

---

## ✅ **Verification Steps**

After fixes, verify:
1. ✅ No console errors in browser DevTools
2. ✅ All components load without errors
3. ✅ Functions work as expected
4. ✅ No "module not found" errors
5. ✅ Hot reload works properly

---

**Note**: The error is typically a browser cache issue after significant refactoring. A hard refresh usually resolves it!
