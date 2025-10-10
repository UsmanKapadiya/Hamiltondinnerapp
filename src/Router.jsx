import React, { lazy, Suspense } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
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

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem("authToken");
  return isAuthenticated ? children : <Navigate to="/" />; //children;
};

const AppRouter = () => {
  return (
    <Router>
      <Suspense fallback={<CustomLoadingOverlay open={true} />}>
        <Routes>
          <Route
            path="/"
            element={
              localStorage.getItem("authToken")
                ? <Navigate to="/home" />
                : <Login />
            }
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <App />
              </ProtectedRoute>
            }
          >
            <Route path="/home" element={<Home />} />
            <Route path="/room" element={<RoomEnter />} />
            <Route path="/order" element={<Order />} />
            <Route path="/guestOrder" element={<GuestOrder />} />
            <Route path="/report" element={<Report />} />
            <Route path="/charges" element={<ChargesReport />} />
            <Route path="/staticForms" element={<StaticForms />} />
            <Route path="/staticForms/incidentForm-create" element={<IncidentForm />} />
            <Route path="/staticForms/incidentForm-edit/:id" element={<IncidentForm />} />
            <Route path="/staticForms/logForm-create" element={<LogForm />} />
            <Route path="/staticForms/moveInSummaryForm-create" element={<MoveInSummeryForm />} />
            <Route path="/staticForms/moveInSummaryForm-edit/:id" element={<MoveInSummeryForm />} />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
};

export default AppRouter;
