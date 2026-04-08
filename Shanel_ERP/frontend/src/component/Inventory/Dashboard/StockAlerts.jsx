import React from 'react';
import { AlertTriangle } from 'react-feather';

const StockAlerts = ({ alerts = [] }) => (
  <div className="card border-0 shadow-sm rounded-3 p-4 h-100">
    <div className="d-flex justify-content-between align-items-center mb-3">
      <h6 className="fw-bold mb-0 d-flex align-items-center gap-2" style={{ fontSize: '13px' }}>
        <AlertTriangle size={15} className="text-warning"/> Low Stock Alerts
      </h6>
      <small className="text-muted">{alerts.length} active</small>
    </div>
    <div className="d-flex flex-column gap-2">
      {alerts.length > 0 ? alerts.map((alert, index) => (
        <div key={index} className="p-3 rounded-3 border-start border-4 border-warning bg-light d-flex justify-content-between align-items-center">
          <div>
            <strong className="d-block" style={{ fontSize: '12px' }}>{alert.name}</strong>
            <small className="text-muted">{alert.type?.replace('_', ' ')}</small>
          </div>
          <span className="badge bg-danger-subtle text-danger px-2 py-1" style={{ fontSize: '11px' }}>Low</span>
        </div>
      )) : (
        <div className="text-center py-4 text-muted">
          <AlertTriangle size={28} className="mb-2 text-muted opacity-50"/>
          <p className="small mb-0">No stock alerts</p>
        </div>
      )}
    </div>
  </div>
);

export default StockAlerts;
