import React from 'react';

const StockTransfers = ({ transfers = [] }) => (
  <div className="card border-0 shadow-sm p-4 h-100">
    <div className="d-flex justify-content-between align-items-center mb-4">
      <h6 className="fw-bold mb-0"><span className="text-primary me-2">⇄</span> Recent Stock Transfers</h6>
      <small className="text-primary fw-semibold" style={{ cursor: "pointer" }}>View all</small>
    </div>
    <div className="d-flex flex-column gap-3">
      {transfers.map((transfer, index) => (
        <div key={index} className="p-3 rounded bg-light border">
          <div className="d-flex justify-content-between mb-1">
            <span className={`badge ${transfer.Status === 'Completed' ? 'bg-success' : 'bg-warning'} text-white`}>{transfer.Status}</span>
            <small className="text-muted">{new Date(transfer.Transfer_Date).toLocaleDateString()}</small>
          </div>
          <div className="fw-bold" style={{ fontSize: "14px" }}>
            {transfer.From_Location} <span className="text-muted mx-2">⇄</span> {transfer.To_Location}
          </div>
          <small className="text-muted">{transfer.Qty} units</small>
        </div>
      ))}
    </div>
  </div>
);

export default StockTransfers;