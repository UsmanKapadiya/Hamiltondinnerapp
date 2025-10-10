# Developer Quick Reference Guide

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm run dev

# Build for production
npm run build
```

---

## 📦 Import Shortcuts

### Hooks
```javascript
import { useApi, useLazyApi, useAuth, useLocalStorage, useDebounce } from './hooks';
```

### Utils
```javascript
import { 
  validateLoginForm, 
  sanitizeInput, 
  formatDate, 
  isToday,
  debounce,
  formatCurrency 
} from './utils';
```

### Components
```javascript
import { Header, ErrorBoundary, CustomButton } from './components';
```

### Services
```javascript
import AuthServices from './services/authServices';
import OrderServices from './services/orderServices';
```

---

## 🎣 Custom Hooks Reference

### useApi - For API calls
```javascript
const { data, loading, error, execute, cancel } = useApi(
  apiFunction,
  {
    immediate: false,        // Call immediately on mount
    showToast: true,         // Show toast notifications
    onSuccess: (data) => {}, // Success callback
    onError: (error) => {},  // Error callback
  }
);
```

### useLazyApi - For manual API calls
```javascript
const { data, loading, execute } = useLazyApi(apiFunction, options);

// Call manually
execute(param1, param2);
```

### useAuth - Authentication
```javascript
const { 
  isAuthenticated, 
  user, 
  loading,
  login,
  logout,
  updateUser,
  getToken 
} = useAuth();
```

### useLocalStorage - Persistent state
```javascript
const [value, setValue, removeValue] = useLocalStorage('key', defaultValue);
```

### useDebounce - Debounced value
```javascript
const debouncedSearchTerm = useDebounce(searchTerm, 500);
```

---

## 🛡️ Validation Functions

### Form Validation
```javascript
// Validate entire login form
const { isValid, errors } = validateLoginForm(formData);
if (!isValid) {
  setErrors(errors);
  return;
}
```

### Individual Validators
```javascript
validateEmail(email);           // Returns { isValid, message }
validatePassword(password);     // Returns { isValid, message }
validateRoomNumber(roomNo);     // Returns { isValid, message }
validateRequired(value, 'Name'); // Returns { isValid, message }
```

### Input Sanitization
```javascript
const sanitized = sanitizeInput(userInput);  // Prevents XSS
const formData = sanitizeFormData(rawData);  // Sanitize all fields
```

---

## 📅 Date Helpers

```javascript
formatDate(date);              // "2025-10-10"
formatDateTime(date);          // "October 10, 2025 2:30 PM"
formatTime(date);              // "14:30"
isToday(date);                 // boolean
isPast(date);                  // boolean
isFuture(date);                // boolean
isAfterHour(15);               // Is current time after 3 PM?
```

---

## 🔧 Common Helpers

### Debounce & Throttle
```javascript
const debouncedFn = debounce(fn, 300);
const throttledFn = throttle(fn, 1000);
```

### Array Utilities
```javascript
const grouped = groupBy(array, 'category');
const unique = removeDuplicates(array, 'id');
const sorted = sortBy(array, 'name', 'asc');
```

### Object Utilities
```javascript
const cloned = deepClone(obj);
const empty = isEmpty(obj);
const value = getNestedValue(obj, 'user.profile.name', 'default');
```

### Formatting
```javascript
formatNumber(1234567);         // "1,234,567"
formatCurrency(99.99, 'USD');  // "$99.99"
truncate(longText, 50);        // "This is a long text that will be..."
capitalize('hello');           // "Hello"
```

---

## 🌐 API Service Pattern

### Basic Service
```javascript
const MyService = {
  getData: async (id) => {
    if (!id) throw new Error('ID is required');
    return requests.get(`/data/${id}`);
  },
  
  createData: async (payload) => {
    return requests.post('/data', payload);
  },
};
```

### Using in Component
```javascript
const { data, loading, error, execute } = useLazyApi(
  MyService.getData,
  {
    showToast: true,
    onSuccess: (response) => {
      console.log('Success!', response);
    }
  }
);

// Call it
execute(userId);
```

---

## 🎨 Component Patterns

### Optimized Component Template
```javascript
import React, { useState, useCallback, useMemo } from 'react';
import { useLazyApi } from '../../hooks';
import { validateForm, sanitizeInput } from '../../utils';

const MyComponent = () => {
  const [formData, setFormData] = useState({});
  
  // API call
  const { execute, loading } = useLazyApi(
    MyService.submit,
    { showToast: true }
  );
  
  // Memoized computed value
  const computedValue = useMemo(() => {
    return expensiveCalculation(formData);
  }, [formData]);
  
  // Memoized event handler
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    const sanitized = sanitizeInput(value);
    setFormData(prev => ({ ...prev, [name]: sanitized }));
  }, []);
  
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    const validation = validateForm(formData);
    if (!validation.isValid) return;
    await execute(formData);
  }, [formData, execute]);
  
  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
    </form>
  );
};
```

---

## 🔐 Security Checklist

### For Every Form:
- [ ] Sanitize all inputs with `sanitizeInput()`
- [ ] Validate before submission
- [ ] Add proper autocomplete attributes
- [ ] Disable submit button while loading
- [ ] Show error messages clearly

### For Every API Call:
- [ ] Use useApi or useLazyApi hooks
- [ ] Handle loading state
- [ ] Handle error state
- [ ] Show user feedback (toast)
- [ ] Validate input parameters

---

## 🐛 Error Handling

### Try-Catch Pattern
```javascript
const handleAction = async () => {
  try {
    setLoading(true);
    const result = await apiCall();
    toast.success('Success!');
  } catch (error) {
    const message = error.response?.data?.message || 'Error occurred';
    toast.error(message);
  } finally {
    setLoading(false);
  }
};
```

### Using Custom Hook (Recommended)
```javascript
const { execute, loading, error } = useLazyApi(
  apiCall,
  {
    showToast: true,
    onError: (error) => {
      // Custom error handling
    }
  }
);
```

---

## 🎯 Performance Tips

### 1. Use Memoization
```javascript
// Expensive calculation
const result = useMemo(() => calculate(data), [data]);

// Event handlers
const handleClick = useCallback(() => {
  doSomething();
}, [dependencies]);
```

### 2. Debounce Search
```javascript
const [searchTerm, setSearchTerm] = useState('');
const debouncedSearch = useDebounce(searchTerm, 500);

useEffect(() => {
  if (debouncedSearch) {
    searchAPI(debouncedSearch);
  }
}, [debouncedSearch]);
```

### 3. Lazy Load Images
```javascript
<img 
  src={imageUrl} 
  loading="lazy" 
  alt="Description"
/>
```

---

## 🔄 State Management Tips

### Local State (useState)
```javascript
const [value, setValue] = useState(initialValue);
```

### Persistent State (useLocalStorage)
```javascript
const [theme, setTheme] = useLocalStorage('theme', 'light');
```

### Computed State (useMemo)
```javascript
const filteredData = useMemo(() => {
  return data.filter(item => item.active);
}, [data]);
```

---

## 📱 Responsive Design

```javascript
import { useMediaQuery } from '@mui/material';

const isMobile = useMediaQuery('(max-width: 600px)');
const isTablet = useMediaQuery('(max-width: 960px)');
const isDesktop = useMediaQuery('(min-width: 1280px)');
```

---

## 🧪 Testing Tips

### Test Utilities
```javascript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

test('should validate form', async () => {
  render(<LoginForm />);
  
  const button = screen.getByRole('button', { name: /login/i });
  fireEvent.click(button);
  
  await waitFor(() => {
    expect(screen.getByText(/required/i)).toBeInTheDocument();
  });
});
```

---

## 🚦 Common Pitfalls to Avoid

### ❌ Don't
```javascript
// Direct localStorage access
const user = JSON.parse(localStorage.getItem('user'));

// No input sanitization
setFormData({ ...formData, [name]: value });

// Missing dependencies
useEffect(() => { fetchData(id); }, []);

// Not handling loading/error states
const data = await apiCall();
```

### ✅ Do
```javascript
// Use custom hook
const [user] = useLocalStorage('user', null);

// Sanitize input
const sanitized = sanitizeInput(value);
setFormData({ ...formData, [name]: sanitized });

// Proper dependencies
useEffect(() => { fetchData(id); }, [id]);

// Use custom hook for API
const { data, loading, error } = useApi(apiCall);
```

---

## 📚 Further Reading

- [React Hooks Documentation](https://react.dev/reference/react)
- [Material-UI Documentation](https://mui.com/material-ui/)
- [Vite Documentation](https://vitejs.dev/)
- Project README.md
- CODE_QUALITY_SUMMARY.md
- CHANGELOG.md

---

## 💡 Pro Tips

1. **Always use custom hooks for API calls** - Better error handling and less code
2. **Sanitize user input** - Security first
3. **Memoize expensive calculations** - Better performance
4. **Use meaningful variable names** - Better maintainability
5. **Add loading states** - Better UX
6. **Handle errors gracefully** - Better reliability
7. **Comment complex logic** - Better collaboration

---

**Quick Reference Version**: 1.0  
**Last Updated**: October 10, 2025
