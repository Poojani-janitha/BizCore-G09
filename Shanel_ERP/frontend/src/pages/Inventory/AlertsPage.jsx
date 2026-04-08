import React, { useState, useEffect } from "react";
import axios from "axios";
import { AlertTriangle, CheckCircle, Clock, X } from "react-feather";

const AlertsPage = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/inventory/dashboard-stats");
      if (res.data.success && res.data.alerts) {
        setAlerts(res.data.alerts);
      }
    } catch (err) {
      console.error("Error fetching alerts:", err);
    } finally {
      setLoading(false);
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case "Low_Stock":
        return <AlertTriangle size={18} className="text-warning" />;
      case "Out_Of_Stock":
        return <AlertTriangle size={18} className="text-danger" />;
      case "Expiry_Soon":
        return <Clock size={18} className="text-info" />;
      default:
        return <AlertTriangle size={18} className="text-secondary" />;
    }
  };

  const getAlertBadgeClass = (type) => {
    switch (type) {
      case "Low_Stock":
        return "badge bg-warning text-dark";
      case "Out_Of_Stock":
        return "badge bg-danger";
      case "Expiry_Soon":
        return "badge bg-info";
      default:
        return "badge bg-secondary";
    }
  };

  const filteredAlerts = filter === "all" ? alerts : alerts.filter(a => a.type === filter);

  return (
    <div className="p-4 bg-light min-vh-100">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="fw-bold text-dark mb-0">Stock Alerts</h5>
        <small className="text-muted">{filteredAlerts.length} alerts</small>
      </div>

      {/* Filter Buttons */}
      <div className="d-flex gap-2 mb-4 flex-wrap">
        <button
          className={`btn btn-sm ${filter === "all" ? "btn-primary" : "btn-outline-primary"}`}
          onClick={() => setFilter("all")}
        >
          All
        </button>
        <button
          className={`btn btn-sm ${filter === "Low_Stock" ? "btn-warning" : "btn-outline-warning"}`}
          onClick={() => setFilter("Low_Stock")}
        >
          Low Stock
        </button>
        <button
          className={`btn btn-sm ${filter === "Out_Of_Stock" ? "btn-danger" : "btn-outline-danger"}`}
          onClick={() => setFilter("Out_Of_Stock")}
        >
          Out of Stock
        </button>
        <button
          className={`btn btn-sm ${filter === "Expiry_Soon" ? "btn-info" : "btn-outline-info"}`}
          onClick={() => setFilter("Expiry_Soon")}
        >
          Expiry Soon
        </button>
      </div>

      {/* Alerts List */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : filteredAlerts.length > 0 ? (
        <div className="row g-3">
          {filteredAlerts.map((alert, index) => (
            <div key={index} className="col-lg-6">
              <div className="card border-0 shadow-sm p-4 h-100">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div className="d-flex align-items-center gap-2">
                    {getAlertIcon(alert.type)}
                    <div>
                      <h6 className="fw-bold mb-0">{alert.name}</h6>
                      <small className="text-muted">{alert.type.replace(/_/g, " ")}</small>
                    </div>
                  </div>
                  <span className={getAlertBadgeClass(alert.type)}>
                    {alert.type === "Low_Stock" ? "⚠" : alert.type === "Out_Of_Stock" ? "✕" : "⏱"}
                  </span>
                </div>

                <div className="row g-2 mb-2">
                  <div className="col-6">
                    <small className="text-muted d-block">Current Stock</small>
                    <h5 className="fw-bold text-primary">{alert.current}</h5>
                  </div>
                  <div className="col-6">
                    <small className="text-muted d-block">Minimum Stock</small>
                    <h5 className="fw-bold text-warning">{alert.min}</h5>
                  </div>
                </div>

                <div className="progress mb-3" style={{ height: "6px" }}>
                  <div
                    className={`progress-bar ${alert.current <= 0 ? "bg-danger" : alert.current <= alert.min ? "bg-warning" : "bg-success"}`}
                    style={{ width: `${Math.min((alert.current / alert.min) * 100, 100)}%` }}
                  ></div>
                </div>

                <div className="d-flex gap-2">
                  <button className="btn btn-sm btn-primary flex-grow-1">
                    Reorder
                  </button>
                  <button className="btn btn-sm btn-outline-secondary flex-grow-1">
                    View
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-5">
          <CheckCircle size={48} className="text-success mb-2" />
          <h6 className="fw-bold text-dark">All Clear!</h6>
          <p className="text-muted mb-0">No stock alerts at the moment</p>
        </div>
      )}
    </div>
  );
};

export default AlertsPage;
