import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCcw, CheckCircle, Clock, ArrowRight, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const StockTransfers = ({ transfers = [] }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const getTransferProductName = (transfer) => {
    return transfer?.product?.P_Name || transfer?.P_Name || transfer?.name || 'Unknown Product';
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'completed':
        return { bg: 'bg-success-subtle', border: 'border-success', text: 'text-success-emphasis', badge: 'bg-success' };
      case 'pending':
        return { bg: 'bg-warning-subtle', border: 'border-warning', text: 'text-warning-emphasis', badge: 'bg-warning' };
      case 'in-progress':
        return { bg: 'bg-info-subtle', border: 'border-info', text: 'text-info-emphasis', badge: 'bg-info' };
      default:
        return { bg: 'bg-secondary-subtle', border: 'border-secondary', text: 'text-secondary-emphasis', badge: 'bg-secondary' };
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return 'N/A';
    }
  };

  const getDisplayTransferQty = (transfer) => {
    const qty = transfer?.Display_Qty ?? transfer?.Qty ?? 0;
    const numericQty = parseFloat(qty) || 0;
    const unit = transfer?.Display_Unit || 'units';
    return `${Number.isInteger(numericQty) ? numericQty : numericQty.toFixed(2)} ${unit}`;
  };

  return (
    <div className="card border-0 shadow-sm rounded-3 h-100 bg-white">
      <div className="pt-4 px-4">
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <h6 className="mb-1 fw-bold text-dark d-flex align-items-center gap-2">
              <RefreshCcw size={16} className="text-primary" /> {t('inventory.dashboard.transfers_widget.title')}
            </h6>
            <p className="text-muted mb-0 small">
              {transfers.length} {transfers.length === 1
                ? t('inventory.dashboard.transfers_widget.recently_singular')
                : t('inventory.dashboard.transfers_widget.recently_plural')}
            </p>
          </div>
          <div className="d-flex gap-2">
            <button
              className="btn btn-sm btn-primary fw-bold d-flex align-items-center gap-1"
              onClick={() => navigate('/inventory/stock-transfers?new=1')}
            >
              <Plus size={14} />
              {t('inventory.pages.stock_transfer.btn_new')}
            </button>
            <button 
              className="btn btn-sm btn-outline-primary fw-bold"
              onClick={() => navigate('/inventory/stock-transfers')}
            >
              {t('inventory.dashboard.transfers_widget.view_all')}
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 pb-4 pt-3">
        {transfers.length > 0 ? (
          <div className="d-flex flex-column gap-2">
            {transfers.slice(0, 5).map((transfer, index) => {
              const statusColor = getStatusColor(transfer.Status);
              
              return (
                <div 
                  key={index} 
                  className={`p-3 rounded-3 border border-2 d-flex justify-content-between align-items-start gap-3 ${statusColor.bg} ${statusColor.border}`}
                  style={{ cursor: 'pointer', transition: 'transform 0.2s ease' }}
                  role="button"
                  tabIndex="0"
                  onClick={() => navigate('/inventory/stock-transfers')}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(4px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/*  */}
                    <p className="mb-1 fw-semibold text-dark small" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {getTransferProductName(transfer)}
                    </p>
                    <div className={`d-flex align-items-center gap-2 mb-1 small fw-bold ${statusColor.text}`} style={{ minWidth: 0 }}>
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{transfer.From_Location || 'Unknown'}</span>
                      <ArrowRight size={12} style={{ flexShrink: 0 }} />
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{transfer.To_Location || 'Unknown'}</span>
                    </div>
                    <small className="text-muted d-block">
                      {getDisplayTransferQty(transfer)} • {formatDate(transfer.Transfer_Date)}
                    </small>
                  </div>
                  <div className="d-flex flex-column align-items-end gap-1" style={{ flexShrink: 0 }}>
                    {transfer.Status === 'Completed' ? (
                      <CheckCircle size={16} className="text-success flex-shrink-0"/>
                    ) : (
                      <Clock size={16} className="text-warning flex-shrink-0"/>
                    )}
                    <span className={`badge text-white px-2 py-1 ${statusColor.badge}`} style={{ fontSize: '10px', whiteSpace: 'nowrap' }}>
                      {transfer.Status || 'Unknown'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-5 text-muted">
            <RefreshCcw size={32} className="mb-2 opacity-50" />
            <p className="small mb-0">{t('inventory.dashboard.transfers_widget.no_transfers')}</p>
            <small className="text-muted">{t('inventory.dashboard.transfers_widget.transfers_appear')}</small>
          </div>
        )}
      </div>

      {transfers.length > 0 && (
        <div className="border-top px-4 py-3">
          <button 
            className="btn btn-sm btn-outline-primary w-100"
            onClick={() => navigate('/inventory/stock-transfers')}>
              {t('inventory.dashboard.transfers_widget.view_all_transfers')}
          </button>
        </div>
      )}
    </div>
  );
};

export default StockTransfers;
