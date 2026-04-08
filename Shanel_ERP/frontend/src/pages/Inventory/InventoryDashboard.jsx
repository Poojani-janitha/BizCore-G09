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
    summary:{} // Placeholder for future summary metrics
 });

  useEffect(() => {
    axios.get("http://localhost:5000/api/inventory/dashboard-stats")
      .then((res) => {
        if (res.data.success) {
          setData(res.data);
        }
      })
      .catch((err) => console.error("Error fetching data:", err));
  }, []);

  return (
    <div className="p-4 bg-light min-vh-100" style={{ fontSize: '13px' }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="fw-bold text-dark mb-0">Inventory Dashboard</h6>
      </div>
      
      {/* Summary Metrics */}
      <InventoryMetrics metrics={data.summary} />

      
      {/* Charts Section */}
      <div className="row g-4 mb-4">
        <div className="col-md-8">
          <StockChart data={data.stockLevel} />
        </div>
        <div className="col-md-4">
          <DistributionPie data={data.distribution} />
        </div>
      </div>

      {/* Lists Section */}
      <div className="row g-4">
        <div className="col-md-6">
          <StockAlerts alerts={data.alerts} />
        </div>
        <div className="col-md-6">
          <StockTransfers transfers={data.transfers} />
        </div>
      </div>
    </div>
  );
};

export default InventoryDashboard;