# Lodash Quick Reference Guide

## Quick Import

```javascript
// Import Lodash
import _ from 'lodash';

// Or import from helpers
import { get, isEmpty, sumBy } from '../../utils/helpers';

// Or import project-specific helpers
import { calculateTotalMealQuantity, resetMealQuantities } from '../../utils/lodashHelpers';
```

---

## Most Common Use Cases

### 1. Safe Property Access
```javascript
// ❌ Bad - Can throw errors
const name = user.profile.name;
const age = data && data.user && data.user.age;

// ✅ Good - Safe with defaults
const name = _.get(user, 'profile.name', 'Unknown');
const age = _.get(data, 'user.age', 0);
```

### 2. Check Empty Values
```javascript
// ❌ Bad - Multiple checks needed
if (!array || array.length === 0) { }
if (!obj || Object.keys(obj).length === 0) { }

// ✅ Good - One function for all
if (_.isEmpty(array)) { }
if (_.isEmpty(obj)) { }
```

### 3. Array Operations
```javascript
// ❌ Bad - Manual reduce
const total = items.reduce((sum, item) => sum + (item.qty || 0), 0);

// ✅ Good - Lodash sumBy
const total = _.sumBy(items, 'qty');
const total = _.sumBy(items, item => _.get(item, 'qty', 0));
```

### 4. Find in Array
```javascript
// ❌ Bad - Manual find with checks
const room = userData?.rooms?.find(r => r.name === roomName) || null;

// ✅ Good - Safe find
const room = _.find(_.get(userData, 'rooms', []), { name: roomName });
```

### 5. Map and Filter
```javascript
// ❌ Bad - Chain with null checks
const names = (items || []).filter(x => x.active).map(x => x.name);

// ✅ Good - Lodash chain
const names = _.chain(items).filter('active').map('name').value();
```

---

## Project-Specific Helpers

### Calculate Total Meal Quantity
```javascript
import { calculateTotalMealQuantity } from '../../utils/lodashHelpers';

const total = calculateTotalMealQuantity(mealData);
// Returns total qty from all meals
```

### Reset All Quantities
```javascript
import { resetMealQuantities } from '../../utils/lodashHelpers';

const resetData = resetMealQuantities(mealData);
// Returns data with all qty set to 0
```

### Find Room by Name
```javascript
import { findRoomByName, getRoomId } from '../../utils/lodashHelpers';

const room = findRoomByName(userData, 'Room 101');
const roomId = getRoomId(userData, 'Room 101');
```

### Check Kitchen User
```javascript
import { isKitchenUser } from '../../utils/lodashHelpers';

if (isKitchenUser(userData)) {
  // Kitchen user logic
}
```

### Get Language Object
```javascript
import { getLanguageObject } from '../../utils/lodashHelpers';
import en from '../../locales/Localizable_en';
import cn from '../../locales/Localizable_cn';

const langObj = getLanguageObject(userData, en, cn);
```

---

## Cheat Sheet

| Task | Lodash Function | Example |
|------|----------------|---------|
| Get nested property | `_.get()` | `_.get(obj, 'a.b.c', default)` |
| Set nested property | `_.set()` | `_.set(obj, 'a.b.c', value)` |
| Check empty | `_.isEmpty()` | `_.isEmpty([])` → `true` |
| Check type | `_.isString()` | `_.isString('hi')` → `true` |
| Sum array | `_.sum()` | `_.sum([1,2,3])` → `6` |
| Sum by property | `_.sumBy()` | `_.sumBy(items, 'qty')` |
| Find item | `_.find()` | `_.find(users, {id: 1})` |
| Filter items | `_.filter()` | `_.filter(items, 'active')` |
| Map array | `_.map()` | `_.map(items, 'name')` |
| Group by | `_.groupBy()` | `_.groupBy(items, 'category')` |
| Sort by | `_.orderBy()` | `_.orderBy(items, 'name', 'asc')` |
| Unique values | `_.uniq()` | `_.uniq([1,1,2,3])` → `[1,2,3]` |
| Unique by prop | `_.uniqBy()` | `_.uniqBy(items, 'id')` |
| Deep clone | `_.cloneDeep()` | `_.cloneDeep(obj)` |
| Merge objects | `_.merge()` | `_.merge({}, a, b)` |
| Pick properties | `_.pick()` | `_.pick(obj, ['id', 'name'])` |
| Omit properties | `_.omit()` | `_.omit(obj, ['password'])` |
| Flatten array | `_.flatten()` | `_.flatten([[1],[2]])` → `[1,2]` |
| Chunk array | `_.chunk()` | `_.chunk([1,2,3,4], 2)` → `[[1,2],[3,4]]` |
| Compact (remove falsy) | `_.compact()` | `_.compact([0,1,false,2])` → `[1,2]` |
| Debounce function | `_.debounce()` | `_.debounce(fn, 300)` |
| Throttle function | `_.throttle()` | `_.throttle(fn, 100)` |

---

## Common Patterns in This Project

### Pattern 1: Safe User Data Access
```javascript
// Get user role
const role = _.get(userData, 'role', 'guest');

// Get room ID
const roomId = _.get(userData, 'room_id', null);

// Find room by name
const room = _.find(_.get(userData, 'rooms', []), { name: roomNo });
```

### Pattern 2: Meal Data Processing
```javascript
// Get breakfast items
const breakfast = _.get(mealData, 'breakfast', []);

// Transform items
const items = _.chain(cat.items)
  .filter({ type: 'item' })
  .map(item => ({
    id: _.get(item, 'item_id'),
    qty: _.get(item, 'qty', 0)
  }))
  .value();
```

### Pattern 3: Calculations
```javascript
// Sum quantities
const total = _.sumBy(items, item => _.get(item, 'qty', 0));

// Count items
const count = _.size(_.filter(items, { active: true }));

// Group items
const grouped = _.groupBy(items, 'category');
```

### Pattern 4: Array Transformations
```javascript
// Map with safe access
const names = _.map(items, item => _.get(item, 'name', ''));

// Filter and map
const activeIds = _.chain(items)
  .filter('active')
  .map('id')
  .value();

// Flatten nested arrays
const allItems = _.flattenDeep([
  _.get(data, 'breakfast', []),
  _.get(data, 'lunch', []),
  _.get(data, 'dinner', [])
]);
```

---

## Performance Tips

1. **Use specific imports for tree-shaking** (optional)
   ```javascript
   import get from 'lodash/get';
   import isEmpty from 'lodash/isEmpty';
   ```

2. **Chain operations** for efficiency
   ```javascript
   _.chain(data)
     .filter('active')
     .map('id')
     .uniq()
     .value();
   ```

3. **Debounce expensive operations**
   ```javascript
   const debouncedSearch = _.debounce(searchAPI, 300);
   ```

4. **Memoize pure functions**
   ```javascript
   const memoizedCalc = _.memoize(expensiveCalculation);
   ```

---

## Migration Checklist

When updating old code to use Lodash:

- [ ] Replace `obj?.prop?.nested` with `_.get(obj, 'prop.nested', default)`
- [ ] Replace `.reduce()` with `_.sumBy()` or `_.groupBy()`
- [ ] Replace `.find()` with `_.find()` for safety
- [ ] Replace `|| []` with `_.get(obj, 'prop', [])`
- [ ] Replace manual type checks with `_.isString()`, `_.isArray()`, etc.
- [ ] Replace complex conditionals with `_.isEmpty()`
- [ ] Replace `.filter().map()` with `_.chain().filter().map().value()`

---

## Testing with Lodash

```javascript
import { get, isEmpty, sumBy } from '../../utils/helpers';

describe('Lodash helpers', () => {
  test('get returns default for undefined', () => {
    expect(get({}, 'a.b.c', 'default')).toBe('default');
  });
  
  test('isEmpty detects empty arrays', () => {
    expect(isEmpty([])).toBe(true);
  });
  
  test('sumBy calculates correctly', () => {
    const items = [{ qty: 1 }, { qty: 2 }];
    expect(sumBy(items, 'qty')).toBe(3);
  });
});
```

---

## Common Mistakes to Avoid

### ❌ Don't forget .value() with chain
```javascript
// Wrong - returns wrapper object
const result = _.chain(items).filter('active').map('name');

// Correct - returns actual value
const result = _.chain(items).filter('active').map('name').value();
```

### ❌ Don't use Lodash for everything
```javascript
// Overkill - native is fine
const len = _.size(array); // Just use array.length

// Better use case
const len = _.size(obj); // Lodash needed for objects
```

### ❌ Don't mutate with _.set()
```javascript
// This mutates original
_.set(obj, 'path', value);

// Better - create new object
const newObj = _.set(_.cloneDeep(obj), 'path', value);
```

---

## Resources

- [Lodash Docs](https://lodash.com/docs/)
- [LODASH_IMPLEMENTATION.md](./LODASH_IMPLEMENTATION.md) - Full implementation guide
- [LODASH_SUMMARY.md](./LODASH_SUMMARY.md) - Summary of changes

---

**Keep this guide handy for quick reference!** 📚
