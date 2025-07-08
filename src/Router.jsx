import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import App from "./App";
import StaticForms from "./scenes/staticForms";
import StaticFormCreate from "./scenes/staticForms/incidentForm";
import Login from "./scenes/login";
import Home from "./scenes/Home";
import RoomEnter from "./scenes/roomLogin";
import Report from "./scenes/report";
import Order from "./scenes/order";
import GuestOrder from "./scenes/guestOrder";
import ChargesReport from "./scenes/charges";
import IncidentForm from "./scenes/staticForms/incidentForm";
import LogForm from "./scenes/staticForms/logForm";
import MoveInSummeryForm from "./scenes/staticForms/MoveInSummeryForm";

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem("authToken");
  return isAuthenticated ? children : <Navigate to="/" />; //children;
};

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
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
          <Route path="/staticForms/logForm-create" element={<LogForm />} />
          <Route path="/staticForms/moveInSummaryForm-create" element={<MoveInSummeryForm />} />


        </Route>
      </Routes>
    </Router>
  );
};

export default AppRouter;
