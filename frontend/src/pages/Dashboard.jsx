import React, { useEffect, useState } from "react";
import { FiPlusCircle, FiMinusCircle, FiAlertCircle, FiHome } from "react-icons/fi";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "../components/style/dashboard.css";

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [incomingCount, setIncomingCount] = useState(0);
  const [outgoingCount, setOutgoingCount] = useState(0);
  const [lowStockItems, setLowStockItems] = useState([]);

  useEffect(() => {
    fetchTransactions();
    fetchInventory();
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/transactions");
      const data = await res.json();
      setTransactions(data);

      // Hitung Incoming dan Outgoing
      const incoming = data.filter((t) => t.type === "Incoming").reduce((sum, t) => sum + t.quantity, 0);
      const outgoing = data.filter((t) => t.type === "Outgoing").reduce((sum, t) => sum + t.quantity, 0);
      setIncomingCount(incoming);
      setOutgoingCount(outgoing);
    } catch (err) {
      console.error("Error fetching transactions:", err);
    }
  };

  const fetchInventory = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/inventory");
      const data = await res.json();
      setInventory(data);

      const low = data.filter((item) => item.quantity < 3);
      setLowStockItems(low);
    } catch (err) {
      console.error("Error fetching inventory:", err);
    }
  };

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">
        <FiHome size={26} style={{ marginRight: 8 }} />
        Dashboard
      </h1>
      <p className="dashboard-subtitle">Welcome to your Warehouse Management System</p>

      <div className="dashboard-cards">
        <div className="dashboard-card incoming-stock">
          <h3>Incoming Stock</h3>
          <p>{incomingCount}</p>
        </div>
        <div className="dashboard-card outgoing-stock">
          <h3>Outgoing Stock</h3>
          <p>{outgoingCount}</p>
        </div>
        <div className="dashboard-card low-stock-alerts">
          <h3>Low Stock Alerts</h3>
          <p>{lowStockItems.length} Items</p>
        </div>
      </div>

      <div className="recent-activity">
        <h2>Recent Activity</h2>
        <ul>
          {transactions.slice(0, 3).map((t) => (
            <li key={t.id}>
              {t.type === "Incoming" && (
                <>
                  <FiPlusCircle className="icon add" /> Added {t.quantity} {t.item} to inventory
                </>
              )}
              {t.type === "Outgoing" && (
                <>
                  <FiMinusCircle className="icon remove" /> Shipped {t.quantity} {t.item}
                </>
              )}
              {t.type === "Adjustment" && (
                <>
                  <FiAlertCircle className="icon alert" /> Adjusted {t.quantity} {t.item}
                </>
              )}
            </li>
          ))}
          {lowStockItems.map((item) => (
            <li key={item.id}>
              <FiAlertCircle className="icon alert" /> Alert: {item.name} stock below threshold
            </li>
          ))}
        </ul>

        <div style={{ width: "100%", height: 300, marginTop: 30 }}>
          <ResponsiveContainer>
            <LineChart
              data={generateChartData(transactions)}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="date" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{ backgroundColor: "#f9fafb", borderRadius: 8, border: "none" }}
                labelStyle={{ fontWeight: "bold" }}
                itemStyle={{ color: "#2563eb" }}
              />
              <Legend verticalAlign="top" height={36} />
              <Line
                type="monotone"
                dataKey="incoming"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                name="Incoming Stock"
              />
              <Line
                type="monotone"
                dataKey="outgoing"
                stroke="#ef4444"
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                name="Outgoing Stock"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// Optional: generate daily grouped chart data from transaction list
function generateChartData(transactions) {
  const grouped = {};

  transactions.forEach(({ date, type, quantity }) => {
    if (!grouped[date]) grouped[date] = { date, incoming: 0, outgoing: 0 };
    if (type === "Incoming") grouped[date].incoming += quantity;
    if (type === "Outgoing") grouped[date].outgoing += quantity;
  });

  const sorted = Object.values(grouped).sort((a, b) => new Date(a.date) - new Date(b.date));
  return sorted;
}

export default Dashboard;
