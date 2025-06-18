import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import App from "./App";
import StaticForms from "./scenes/staticForms";
import StaticFormCreate from "./scenes/staticForms/staticFormCreate";
import Login from "./scenes/login";
import Home from "./scenes/Home";
import RoomEnter from "./scenes/roomLogin";
import Report from "./scenes/report";
import Order from "./scenes/order";

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
          <Route path="/report" element={<Report />} />
          <Route path="/staticForms" element={<StaticForms />} />
          <Route path="/staticForms/staticForm-create" element={<StaticFormCreate />} />

        </Route>
      </Routes>
    </Router>
  );
};

export default AppRouter;
