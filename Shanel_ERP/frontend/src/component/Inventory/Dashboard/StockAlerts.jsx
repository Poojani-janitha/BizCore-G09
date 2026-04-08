import React from 'react';

const StockAlerts = ({ alerts }) => (
  <div className="card border-0 shadow-sm p-4 h-100">
    <div className="d-flex justify-content-between align-items-center mb-4">
      <h6 className="fw-bold mb-0"><span className="text-warning me-2">⚠️</span> Low Stock Alert</h6>
      <small className="text-muted">Active Alerts</small>
    </div>
    <div className="d-flex flex-column gap-3">
      {alerts.map((alert, index) => (
        <div key={index} className="p-3 rounded border-start border-4 border-warning bg-light d-flex justify-content-between align-items-center">
          <div>
            <strong className="d-block" style={{ fontSize: "14px" }}>{alert.name}</strong>
            <small className="text-muted">{alert.type.replace('_', ' ')}</small>
          </div>
          <span className="badge bg-danger text-white px-2 py-1">high</span>
        </div>
      ))}
    </div>
  </div>
);

export default StockAlerts;