import React, { lazy, Suspense } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from "react-router-dom";
import App from "./App";
import CustomLoadingOverlay from "./components/CustomLoadingOverlay";

// Lazy load components for better performance
const Login = lazy(() => import("./scenes/login"));
const Home = lazy(() => import("./scenes/Home"));
const RoomEnter = lazy(() => import("./scenes/roomLogin"));
const Report = lazy(() => import("./scenes/report"));
const Order = lazy(() => import("./scenes/order"));
const GuestOrder = lazy(() => import("./scenes/guestOrder"));
const ChargesReport = lazy(() => import("./scenes/charges"));
const StaticForms = lazy(() => import("./scenes/staticForms"));
const IncidentForm = lazy(() => import("./scenes/staticForms/incidentForm"));
const LogForm = lazy(() => import("./scenes/staticForms/logForm"));
const MoveInSummeryForm = lazy(() => import("./scenes/staticForms/MoveInSummeryForm"));

/**
 * Protected Route Component
 * Redirects to login if user is not authenticated
 * Preserves the attempted route for redirect after login
 */
const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const isAuthenticated = !!localStorage.getItem("authToken");
  
  if (!isAuthenticated) {
    // Redirect to login and save the attempted location
    return <Navigate to="/" state={{ from: location }} replace />;
  }
  
  return children;
};

/**
 * Main App Router
 * Handles all application routing with lazy loading and protected routes
 */
const AppRouter = () => {
  return (
    <Router>
      <Suspense fallback={<CustomLoadingOverlay open={true} />}>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/"
            element={
              localStorage.getItem("authToken")
                ? <Navigate to="/home" replace />
                : <Login />
            }
          />
          
          {/* Protected Routes */}
          <Route
            element={
              <ProtectedRoute>
                <App />
              </ProtectedRoute>
            }
          >
            {/* Main Application Routes */}
            <Route path="/home" element={<Home />} />
            <Route path="/room" element={<RoomEnter />} />
            <Route path="/order" element={<Order />} />
            <Route path="/guestOrder" element={<GuestOrder />} />
            <Route path="/report" element={<Report />} />
            <Route path="/charges" element={<ChargesReport />} />
            
            {/* Static Forms Routes */}
            <Route path="/staticForms">
              <Route index element={<StaticForms />} />
              
              {/* Incident Form Routes */}
              <Route path="incidentForm-create" element={<IncidentForm />} />
              <Route path="incidentForm-edit/:id" element={<IncidentForm />} />
              
              {/* Log Form Routes */}
              <Route path="logForm-create" element={<LogForm />} />
              
              {/* Move-In Summary Form Routes */}
              <Route path="moveInSummaryForm-create" element={<MoveInSummeryForm />} />
              <Route path="moveInSummaryForm-edit/:id" element={<MoveInSummeryForm />} />
            </Route>
          </Route>
          
          {/* 404 - Not Found Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
};

export default AppRouter;
