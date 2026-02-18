import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const Inventory_Dashboard = () => {
  const [data, setData] = useState({ stockLevel: [], distribution: [] });
  const COLORS = ["#3b82f6", "#10b981", "#f59e0b"];

  useEffect(() => {
    //Fetch live data from Node.js backend
    axios
      .get("http://localhost:5000/api/inventory/dashboard-stats")
      .then((res) => {
        console.log("Backend data fetched:", res.data);
        setData(res.data);
      })
      .catch((err) => console.error("Error fetching dashboard data:", err));
  }, []);

  return (
    <div
      className="p-4"
      style={{ backgroundColor: "#faf9f6", minHeight: "100vh" }}
    >
      <h2 className="mb-4 fw-bold" style={{ color: "#7c5d47" }}>
        Inventory Overview
      </h2>

      <div className="row g-4">
        {/* Bar chart for stock vs Min levels */}
        <div className="col-md-8">
          <div className="bg-white p-4 rounded shadow-sm border">
            <h5 className="mb-3">Stock levels(Current vs Min)</h5>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.stockLevel}>
                <CartesianGrid strokeDasharray="3.3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="current"
                  name="Current Stock"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="min"
                  name="Min Stock"
                  fill="#ef4444"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie chart  to Product Type Distribution */}
        <div className="col-md-4">
          <div className="bg-white p-4 rounded shadow-sm border">
            <h5 className="mb-3">Inventory Distribution</h5>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.distribution}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.distribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="row g-4 mt-2">
        {/* stock alert section */}
        <div className="col-md-6">
          <div className="card border-0 shadow-sm p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h6 className="fw-bold mb-0">
                <span className="text-warning me-2">⚠️</span> Low Stock Alert
              </h6>
              <small className="text-muted">Active Alerts</small>
            </div>

            <div className="d-flex flex-column gap-3">
              <div className="p-3 rounded border-start border-4 border-warning bg-light d-flex justify-content-between align-items-center">
                <div>
                  <strong className="d-block" style={{ fontSize: "14px" }}>
                    Sugar
                  </strong>
                  <small className="text-muted">Below reorder level</small>
                </div>
                <span className="badge bg-danger text-white px-2 py-1">
                  high
                </span>
              </div>

              <div className="p-3 rounded border-start border-4 border-warning bg-light d-flex justify-content-between align-items-center">
                <div>
                  <strong className="d-block" style={{ fontSize: "14px" }}>
                    Sweet Tamarind
                  </strong>
                  <small className="text-muted">Expiring in 15 days</small>
                </div>
                <span className="badge bg-warning text-dark px-2 py-1">
                  medium
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Stock Trandfer Section */}
        <div className="col-md-6">
          <div className="card border-0 shadow-sm p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h6 className="fw-bold mb-0">
                <span className="text-primary me-2">⇄</span>Recent Stock
                Transfers
              </h6>
              <small
                className="text-primary fw-semibold"
                style={{ cursor: "pointer" }}
              >
                View all
              </small>
            </div>

            <div className="d-flex flex-column gap-3">
              <div className="p-3 rounded bg-light border">
                <div className="d-flex justify-content-between mb-1">
                  <span className="badge bg-success text-white">Completed</span>
                  <small className="text-muted">2026-02-18</small>
                </div>
                <div className="fw-bold" style={{ fontSize: "14px" }}>
                  Production<span className="text-muted mx-2">⇄</span> Sales
                  Stock
                </div>
                <small className="text-muted">50 items transferred</small>
              </div>

              <div className="p-3 rounded bg-light border">
                <div className="d-flex justify-content-between mb-1">
                  <span className="badge bg-success text-white">Pending</span>
                  <small className="text-muted">2026-02-16</small>
                </div>
                <div className="fw-bold" style={{ fontSize: "14px" }}>
                  Production<span className="text-muted mx-2">⇄</span> Sales Stock
                </div>
                <small className="text-muted">75 items transferred</small>
              </div>
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inventory_Dashboard;
