import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import AdminPanel from "./pages/AdminPanel";
import Transaction from "./pages/Transaction";
import CustomerService from "./pages/CustomerService";
import Login from "./pages/login";
import Signup from "./pages/Signup";

function Layout() {
  const location = useLocation();

  const noLayoutPaths = ["/login", "/signup"];

  const showLayout = !noLayoutPaths.includes(location.pathname);

  return (
    <div className="app-layout">
      {showLayout && <Sidebar />}
      <div className="main-area">
        {showLayout && <Header />}
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/admin-panel" element={<AdminPanel />} />
            <Route path="/transaction" element={<Transaction />} />
            <Route path="/customer-service" element={<CustomerService />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}
