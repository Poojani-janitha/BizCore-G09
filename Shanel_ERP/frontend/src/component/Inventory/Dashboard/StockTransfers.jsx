import React from 'react';
import { RefreshCcw, CheckCircle, Clock } from 'react-feather';

const StockTransfers = ({ transfers = [] }) => (
  <div className="card border-0 shadow-sm rounded-3 p-4 h-100">
    <div className="d-flex justify-content-between align-items-center mb-3">
      <h6 className="fw-bold mb-0 d-flex align-items-center gap-2" style={{ fontSize: '13px' }}>
        <RefreshCcw size={15} className="text-primary"/> Recent Stock Transfers
      </h6>
      <small className="text-primary fw-semibold" style={{ cursor: 'pointer' }}>View all</small>
    </div>
    <div className="d-flex flex-column gap-2">
      {transfers.length > 0 ? transfers.map((transfer, index) => (
        <div key={index} className="p-3 rounded-3 bg-light border-0 d-flex justify-content-between align-items-center">
          <div>
            <div className="fw-bold" style={{ fontSize: '12px' }}>
              {transfer.From_Location} <span className="text-muted mx-1">→</span> {transfer.To_Location}
            </div>
            <small className="text-muted">{transfer.Qty} units · {new Date(transfer.Transfer_Date).toLocaleDateString()}</small>
          </div>
          {transfer.Status === 'Completed'
            ? <CheckCircle size={15} className="text-success flex-shrink-0"/>
            : <Clock size={15} className="text-warning flex-shrink-0"/>
          }
        </div>
      )) : (
        <div className="text-center py-4 text-muted">
          <RefreshCcw size={28} className="mb-2 text-muted opacity-50"/>
          <p className="small mb-0">No recent transfers</p>
        </div>
      )}
    </div>
  </div>
);

export default StockTransfers;
