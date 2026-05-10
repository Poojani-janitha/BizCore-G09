import React, { useState, useEffect } from "react";
import axios from "axios";
import StockChart from "../../component/Inventory/Dashboard/StockChart";
import DistributionPie from "../../component/Inventory/Dashboard/DistributionPie";
import StockAlerts from "../../component/Inventory/Dashboard/StockAlerts";
import StockTransfers from "../../component/Inventory/Dashboard/StockTransfers";
import InventoryMetrics from "../../component/Inventory/Dashboard/InventoryMetrics";

const InventoryDashboard = () => {
  const [data, setData] = useState({ 
    stockLevel: [], 
    distribution: [],
    alerts: [],
    transfers: [],
    summary:{} 
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/inventory/dashboard-stats");
      if (res.data.success) {
        setData(res.data);
        setError(null);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="min-vh-100 bg-light p-4">
      {/* Header Section */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h5 className="mb-0 fw-bold text-dark">Inventory Dashboard</h5>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="alert alert-danger alert-dismissible fade show mt-3 mb-0 small" role="alert">
            <strong>Error:</strong> {error}
            <button type="button" className="btn-close" onClick={() => setError(null)}></button>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">Loading inventory data...</p>
        </div>
      ) : (
        <>
          {/* Summary Metrics */}
          <div className="mb-4">
            <InventoryMetrics metrics={data.summary} />
          </div>

          {/* Charts Section */}
          <div className="row g-4 mb-4">
            <div className="col-xxl-8 col-lg-8">
              <StockChart data={data.stockLevel} />
            </div>
            <div className="col-xxl-4 col-lg-4">
              <DistributionPie data={data.distribution} />
            </div>
          </div>

          {/* Lists Section */}
          <div className="row g-4">
            <div className="col-lg-6">
              <StockAlerts alerts={data.alerts ? data.alerts.slice(0, 5) : []} />
            </div>
            <div className="col-lg-6">
              <StockTransfers transfers={data.transfers} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default InventoryDashboard;