import React from 'react'
import {Package, Store, AlertTriangle, FileText, Activity} from 'lucide-react'

const InventoryMetrics = ({ metrics = {} }) => {
    const cardData = [
        {
            title: "Production Stock",
            value: metrics?.productionStock || '0',
            label: 'Units in Production',
            icon: <Activity className="text-primary" size={20} />,
            color: 'border-primary'
        },
        { 
            title: 'Store Stock', 
            value: metrics?.storeStock || '0', 
            label: 'Units in store', 
            icon: <Store className="text-success" size={20} />,
            color: 'border-success' 
        },
        {
            title: 'Active Products', 
            value: metrics?.activeProducts || '0', 
            label: 'In catalog', 
            icon: <Package className="text-info" size={20} />,
            color: 'border-info'
        },
        {
            title: 'Alerts', 
            value: metrics?.alertsCount || '0', 
            label: 'Requires attention', 
            icon: <AlertTriangle className="text-danger" size={20} />,
            color: 'border-danger'
        },
        {
            title: 'Pending Orders', 
            value: metrics?.pendingOrders || '0', 
            label: 'Purchase orders', 
            icon: <FileText className="text-warning" size={20} />,
            color: 'border-warning'
        }
    ]

  return (
    <div className='row g-3 mb-4'>
        {cardData.map((card, index) => (
            <div key={index} className="col-md">
                <div className={`card border-0 border-top border-4 ${card.color} shadow-sm p-3 h-100`}>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                        <small className="text-muted fw-bold text-uppercase" style={{ fontSize: '11px' }}>{card.title}</small>
                        {card.icon}
                    </div>
                    <h6 className="fw-bold mb-0">{card.value}</h6>
                    <small className="text-muted" style={{ fontSize: '11px' }}>{card.label}</small>
                </div>
            </div>
        ))}
    </div>
  )
}

export default InventoryMetrics