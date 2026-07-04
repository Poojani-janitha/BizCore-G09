import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Package, Store, AlertTriangle, BoxIcon, TrendingUp, TrendingDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const InventoryMetrics = ({ metrics = {} }) => {
    const navigate = useNavigate()
    const { t } = useTranslation()

    const cardData = [
        {
            title: t('inventory.dashboard.metrics.company_items'),
            value: metrics?.companyItems || '0',
            label: t('inventory.dashboard.metrics.company_items_label'),
            icon: <Package className="text-primary" size={20} />,
            color: 'border-primary',
            trend: metrics?.companyItemsTrend || 0,
            onClick: () => navigate('/inventory/company-items')
        },
        { 
            title: t('inventory.dashboard.metrics.other_items'),
            value: metrics?.otherItems || '0', 
            label: t('inventory.dashboard.metrics.other_items_label'),
            icon: <BoxIcon className="text-info" size={20} />,
            color: 'border-info',
            trend: metrics?.otherItemsTrend || 0,
            onClick: () => navigate('/inventory/other-items')
        },
        {
            title: t('inventory.dashboard.metrics.production_stock'),
            value: Math.round(metrics?.productionStock) || '0', 
            label: t('inventory.dashboard.metrics.production_stock_label'),
            icon: <Package className="text-success" size={20} />,
            color: 'border-success',
            trend: metrics?.productionTrend || 0,
            onClick: () => navigate('/inventory/production-stock')
        },
        {
            title: t('inventory.dashboard.metrics.sales_stock'),
            value: Math.round(metrics?.salesStock) || '0', 
            label: t('inventory.dashboard.metrics.sales_stock_label'),
            icon: <Store className="text-warning" size={20} />,
            color: 'border-warning',
            trend: metrics?.salesTrend || 0,
            onClick: () => navigate('/inventory/reports/current-stock')
        },
        {
            title: t('inventory.dashboard.metrics.alerts'),
            value: metrics?.alertsCount || '0', 
            label: t('inventory.dashboard.metrics.alerts_label'),
            icon: <AlertTriangle className="text-danger" size={20} />,
            color: 'border-danger',
            trend: 0,
            onClick: () => navigate('/inventory/alerts')
        }
    ]

  return (
    <div className="d-flex gap-2 mb-4" style={{ width: '100%' }}>
        {cardData.map((card, index) => (
            <div 
              key={index} 
              style={{ flex: 1, minWidth: 0 }}
            >
                <div 
                    className={`card border-0 border-top border-4 ${card.color} shadow-sm p-3 h-100`}
                    style={{ 
                        cursor: 'pointer', 
                        transition: 'all 0.3s ease'
                    }}
                    onClick={card.onClick}
                    role="button"
                    tabIndex="0"
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-6px)';
                        e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '';
                    }}
                >
                    <div className="d-flex justify-content-between align-items-start mb-2">
                        <small className="text-muted fw-bold text-uppercase" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>
                            {card.title}
                        </small>
                        <div className="opacity-75">
                            {card.icon}
                        </div>
                    </div>
                    
                    {/* Value with Trend */}
                    <div className="d-flex align-items-center gap-2 mb-1">
                        <h5 className="fw-bold mb-0" style={{ fontSize: '24px', color: '#1e293b' }}>
                            {card.value}
                        </h5>
                        {card.trend !== 0 && (
                            <div className="d-flex align-items-center gap-1" style={{ fontSize: '12px' }}>
                                <span className={card.trend > 0 ? 'text-success' : 'text-danger'}>
                                    {card.trend > 0 ? 
                                        <TrendingUp size={14} className="d-inline" /> : 
                                        <TrendingDown size={14} className="d-inline" />
                                    }
                                </span>
                                <span className="fw-semibold" style={{ color: card.trend > 0 ? '#10b981' : '#ef4444' }}>
                                    {Math.abs(card.trend)}%
                                </span>
                            </div>
                        )}
                    </div>
                    
                    <small className="text-muted d-block" style={{ fontSize: '11px' }}>
                        {card.label}
                    </small>
                </div>
            </div>
        ))}
    </div>
  )
}

export default InventoryMetrics