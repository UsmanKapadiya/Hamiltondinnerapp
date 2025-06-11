import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import App from "./App";
import {
  Dashboard,
  Team,
  Invoices,
  Contacts,
  Form,
  Bar,
  Line,
  Pie,
  FAQ,
  Geography,
  Calendar,
  Stream,
} from "./scenes";
import StaticForms from "./scenes/staticForms";
import StaticFormCreate from "./scenes/staticForms/staticFormCreate";

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<App />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/staticForms" element={<StaticForms />} />
          <Route path="/staticForms/staticForm-create" element={<StaticFormCreate />} />

        </Route>
      </Routes>
    </Router>
  );
};

export default AppRouter;
