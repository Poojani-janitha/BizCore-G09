import React from 'react';
import { AlertTriangle, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const StockAlerts = ({ alerts = [] }) => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isSinhala = i18n.language?.startsWith('si');

  const alertColors = {
    low: { bg: 'bg-warning-subtle', border: 'border-warning', text: 'text-warning-emphasis' },
    critical: { bg: 'bg-danger-subtle', border: 'border-danger', text: 'text-danger-emphasis' },
    medium: { bg: 'bg-info-subtle', border: 'border-info', text: 'text-info-emphasis' }
  };

  const getSeverity = (alert) => {
    const currentQty = alert.current !== undefined ? alert.current : alert.quantity;
    const min = alert.min !== undefined ? alert.min : alert.minStock;
    if (currentQty === 0) return 'critical';
    if (currentQty < min / 2) return 'critical';
    return 'low';
  };

  return (
    <div className="card border-0 shadow-sm rounded-3 h-100 bg-white">
      <div className="pt-4 px-4">
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <h6 className="mb-1 fw-bold text-dark d-flex align-items-center gap-2">
              <AlertTriangle size={16} className="text-warning" /> {t('inventory.dashboard.alerts_widget.title')}
            </h6>
            <p className="text-muted mb-0 small">
              {alerts.length} {alerts.length === 1 
                ? t('inventory.dashboard.alerts_widget.active_singular')
                : t('inventory.dashboard.alerts_widget.active_plural')}
            </p>
          </div>
          {alerts.length > 0 && (
            <span className="badge bg-danger">
              {alerts.length} {t('inventory.dashboard.alerts_widget.badge_active')}
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
                  className={`p-3 rounded-3 border-start border-2 d-flex justify-content-between align-items-start gap-3 ${color.bg} ${color.border}`}
                  style={{ cursor: 'pointer', transition: 'transform 0.2s ease' }}
                  role="button"
                  tabIndex="0"
                  onClick={() => navigate('/inventory/alerts')}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(4px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className={`fw-bold small ${color.text}`}>
                      {(isSinhala && alert.nameSinhala) ? alert.nameSinhala : (alert.name || alert.productName || 'Unknown Item')}
                    </div>
                    <small className="text-muted d-block mt-1">
                      {t('inventory.dashboard.alerts_widget.current_label')} {alert.current !== undefined ? alert.current : alert.quantity || 0} {alert.baseUnit || 'units'}
                    </small>
                    <small className="text-muted d-block">
                      {t('inventory.dashboard.alerts_widget.min_label')} {alert.min !== undefined ? alert.min : alert.minStock || 0} {alert.baseUnit || 'units'}
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
                      {severity === 'critical' 
                        ? t('inventory.dashboard.alerts_widget.severity_critical') 
                        : t('inventory.dashboard.alerts_widget.severity_low')}
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
            <p className="small mb-0">{t('inventory.dashboard.alerts_widget.all_healthy')}</p>
            <small className="text-muted">{t('inventory.dashboard.alerts_widget.no_alerts')}</small>
          </div>
        )}
      </div>

      {alerts.length > 0 && (
        <div className="border-top px-4 py-3">
          <button 
            className="btn btn-sm btn-outline-primary w-100"
            onClick={() => navigate('/inventory/alerts')}
          >
            {t('inventory.dashboard.alerts_widget.view_all')}
          </button>
        </div>
      )}
    </div>
  );
};

export default StockAlerts;
