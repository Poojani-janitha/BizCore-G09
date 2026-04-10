import React from 'react';
import { AlertTriangle, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StockAlerts = ({ alerts = [] }) => {
  const navigate = useNavigate();

  const alertColors = {
    low: { bg: 'bg-warning-subtle', border: 'border-warning', text: 'text-warning-emphasis' },
    critical: { bg: 'bg-danger-subtle', border: 'border-danger', text: 'text-danger-emphasis' },
    medium: { bg: 'bg-info-subtle', border: 'border-info', text: 'text-info-emphasis' }
  };

  const getSeverity = (alert) => {
    if (alert.quantity === 0) return 'critical';
    if (alert.quantity < alert.minStock / 2) return 'critical';
    return 'low';
  };

  return (
    <div className="card border-0 shadow-sm rounded-3 h-100 bg-white">
      <div className="pt-4 px-4">
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <h6 className="mb-1 fw-bold text-dark d-flex align-items-center gap-2">
              <AlertTriangle size={16} className="text-warning" /> Low Stock Alerts
            </h6>
            <p className="text-muted mb-0 small">
              {alerts.length} {alerts.length === 1 ? 'alert' : 'alerts'} active
            </p>
          </div>
          {alerts.length > 0 && (
            <span className="badge bg-danger">
              {alerts.length} Active
            </span>
          )}
        </div>
      </div>

      <div className="px-4 pb-4 pt-3">
        {alerts.length > 0 ? (
          <div className="d-flex flex-column gap-2">
            {alerts.map((alert, index) => {
              const severity = getSeverity(alert);
              const color = alertColors[severity];
              
              return (
                <div 
                  key={index} 
                  className={`p-3 rounded-3 border-start border-4 d-flex justify-content-between align-items-start gap-3 ${color.bg} ${color.border}`}
                  style={{ cursor: 'pointer', transition: 'transform 0.2s ease' }}
                  role="button"
                  tabIndex="0"
                  onClick={() => navigate('/inventory/alerts')}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(4px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className={`fw-bold small ${color.text}`}>
                      {alert.name || alert.productName || 'Unknown Item'}
                    </div>
                    <small className="text-muted d-block mt-1">
                      Current: {alert.quantity || 0} units
                    </small>
                    <small className="text-muted d-block">
                      Min: {alert.minStock || 0} units
                    </small>
                  </div>
                  <div className="d-flex flex-column align-items-end gap-1" style={{ flexShrink: 0 }}>
                    <span 
                      className="badge"
                      style={{
                        fontSize: '10px',
                        backgroundColor: color.border === 'border-danger' ? '#dc2626' : color.border === 'border-warning' ? '#f59e0b' : '#0ea5e9',
                        color: 'white',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {severity === 'critical' ? 'CRITICAL' : 'LOW'}
                    </span>
                    <ChevronRight size={14} className="opacity-50" />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-5 text-muted">
            <AlertTriangle size={32} className="mb-2 opacity-50" />
            <p className="small mb-0">All stock levels are healthy</p>
            <small className="text-muted">No alerts at this time</small>
          </div>
        )}
      </div>

      {alerts.length > 0 && (
        <div className="border-top px-4 py-3">
          <button 
            className="btn btn-sm btn-outline-primary w-100"
            onClick={() => navigate('/inventory/alerts')}
          >
            View All Alerts
          </button>
        </div>
      )}
    </div>
  );
};

export default StockAlerts;
