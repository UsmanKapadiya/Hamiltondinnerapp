# Hamilton Dinner App

A modern, high-performance React application for managing dining services in senior living facilities. Built with React.js, Vite, and Material UI with comprehensive code quality improvements.

## 🚀 Features

- **Order Management:** Streamlined meal ordering system for residents
- **Room Management:** Efficient room and guest information tracking
- **Report Generation:** Comprehensive reporting for charges and orders
- **Static Forms:** Incident and log form management
- **Multi-language Support:** English and Chinese language options
- **Role-based Access:** Different views for admin, kitchen, and user roles
- **Dark/Light Mode:** Customizable theme preferences

## 📋 Recent Code Quality Improvements

### Performance Optimizations
- ✅ **Lazy Loading:** Route-based code splitting for faster initial load
- ✅ **Custom Hooks:** Reusable hooks for API calls and state management
- ✅ **Memoization:** Optimized re-renders with useMemo and useCallback
- ✅ **Request Cancellation:** Automatic cleanup of pending API requests

### Security Enhancements
- ✅ **Input Sanitization:** XSS protection on all user inputs
- ✅ **Validation Layer:** Comprehensive form validation utilities
- ✅ **Environment Variables:** Secure configuration management
- ✅ **Token Management:** Improved authentication token handling

### Code Quality
- ✅ **Error Boundary:** Graceful error handling across the application
- ✅ **Type Safety:** Better error handling and validation
- ✅ **Retry Logic:** Automatic retry for failed network requests
- ✅ **Utility Functions:** Reusable helpers for common operations

### Developer Experience
- ✅ **Custom Hooks:** useApi, useAuth, useLocalStorage, useDebounce
- ✅ **Better Structure:** Organized utils, hooks, and context folders
- ✅ **Environment Config:** Easy configuration management with .env files
- ✅ **Code Comments:** JSDoc comments for better documentation

## 🛠️ Technologies

- **React 18.2** - Modern React with hooks
- **Vite** - Lightning-fast build tool
- **Material UI 5** - Comprehensive component library
- **Axios** - HTTP client with interceptors
- **React Router DOM 6** - Client-side routing
- **Formik & Yup** - Form management and validation
- **FullCalendar** - Interactive calendar
- **Nivo Charts** - Beautiful data visualizations
- **Day.js** - Date manipulation library
- **React Toastify** - Toast notifications

## 📦 Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd Hamiltondinnerapp
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and update the API base URL if needed:
   ```
   VITE_API_BASE_URL=http://hamiltondinnerapp.staging.intelligrp.com/api/
   ```

4. **Start development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Build for production:**
   ```bash
   npm run build
   # or
   yarn build
   ```

## 🏗️ Project Structure

```
src/
├── assets/          # Images and static assets
├── components/      # Reusable UI components
│   ├── ErrorBoundary.jsx
│   ├── CustomButton.jsx
│   ├── CustomLoadingOverlay.jsx
│   └── ...
├── context/         # React Context providers
│   └── AuthContext.jsx
├── hooks/           # Custom React hooks
│   ├── useApi.js
│   ├── useAuth.js
│   └── useCommon.js
├── locales/         # Internationalization files
├── scenes/          # Page components
│   ├── login/
│   ├── Home/
│   ├── order/
│   ├── report/
│   └── ...
├── services/        # API service layer
│   ├── api.js
│   ├── authServices.jsx
│   └── orderServices.jsx
├── utils/           # Utility functions
│   ├── validation.js
│   ├── dateHelpers.js
│   └── helpers.js
├── App.jsx          # Main app component
├── Router.jsx       # Route configuration
├── main.jsx         # App entry point
└── theme.js         # Material UI theme
```

## 🔑 Key Features

### Custom Hooks

- **useApi:** Simplified API calls with loading, error states, and cancellation
- **useAuth:** Centralized authentication management
- **useLocalStorage:** Persistent state with localStorage
- **useDebounce:** Debounced values for search/filter inputs

### Utility Functions

- **Validation:** Input sanitization, email/password validation
- **Date Helpers:** Formatting, comparison, and manipulation
- **Common Helpers:** Debounce, throttle, deep clone, groupBy, etc.

### Security Features

- Input sanitization to prevent XSS attacks
- Secure token storage and management
- Request/response interceptors for authentication
- Environment-based configuration

## 🎯 Usage Examples

### Using the API Hook
```javascript
import { useLazyApi } from './hooks';
import OrderServices from './services/orderServices';

const { execute, loading, data, error } = useLazyApi(
  OrderServices.getMenuData,
  {
    onSuccess: (response) => console.log('Success!', response),
    showToast: true
  }
);

// Call the API
execute(roomId, date);
```

### Form Validation
```javascript
import { validateLoginForm, sanitizeInput } from './utils/validation';

const handleSubmit = (formData) => {
  const validation = validateLoginForm(formData);
  if (!validation.isValid) {
    setErrors(validation.errors);
    return;
  }
  // Proceed with submission
};
```

## 🌐 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | API base URL | `http://hamiltondinnerapp.staging.intelligrp.com/api/` |
| `VITE_APP_NAME` | Application name | `Hamilton Dinner App` |
| `VITE_APP_VERSION` | Application version | `1.0.0` |

## 📱 Pages

- **Login** - User authentication
- **Home** - Dashboard with role-based navigation
- **Room** - Room selection for dining
- **Order** - Meal ordering interface
- **Guest Order** - Guest meal management
- **Report** - Order reports and analytics
- **Charges** - Charges report
- **Static Forms** - Incident and log forms

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is proprietary software. All rights reserved.

## 🐛 Known Issues & Improvements

See the [Issues](../../issues) page for a list of known issues and planned improvements.

## 📞 Support

For support, please contact the development team or create an issue in the repository.

---

**Built with ❤️ for Hamilton Senior Living**
