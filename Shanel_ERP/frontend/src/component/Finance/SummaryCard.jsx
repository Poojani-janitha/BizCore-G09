import React from 'react';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownLeft, Activity } from 'react-feather';

const SummaryCard = ({ 
  title, 
  amount, 
  count, 
  percentage, 
  icon, 
  bgColor,
  textColor,
  isNet = false
}) => {
  const isPositive = percentage >= 0;
  
  const getBorderClass = () => {
    const tLower = title.toLowerCase();
    if (tLower.includes('received') || tLower.includes('income')) return 'border-success'; // Green for received/income
    if (tLower.includes('paid') || tLower.includes('expense')) return 'border-danger'; // Red for paid/expense
    if (tLower.includes('balance') || tLower.includes('net')) return 'border-primary'; // Blue for net/balance
    if (tLower.includes('activity')) return 'border-warning';
    return 'border-info';
  };

  const cardStyle = {
    cursor: 'default',
    transition: 'all 0.3s ease',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  };

  return (
    <div 
        style={cardStyle} 
        className={`card border-0 border-top border-4 ${getBorderClass()} shadow-sm p-3`}
        onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-6px)';
            e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
        }}
        onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '';
        }}
    >
      <div className="d-flex justify-content-between align-items-start mb-3">
        <small className="text-muted fw-bold text-uppercase" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>
          {title}
        </small>
        <div className="opacity-75">
          {icon}
        </div>
      </div>
      
      <div>
        <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
          <h5 className="fw-bold mb-0" style={{ fontSize: '24px', color: '#1e293b' }}>
            Rs. {amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </h5>
          {percentage !== 0 && (
            <div className="d-flex align-items-center gap-1" style={{ fontSize: '12px' }}>
              <span className={isPositive ? 'text-success' : 'text-danger'}>
                {isPositive ? <TrendingUp size={14} className="d-inline" /> : <TrendingDown size={14} className="d-inline" />}
              </span>
              <span className="fw-semibold" style={{ color: isPositive ? '#10b981' : '#ef4444' }}>
                {isPositive ? '+' : ''}{percentage}%
              </span>
            </div>
          )}
        </div>
        
        <small className="text-muted d-block" style={{ fontSize: '11px', marginTop: '4px' }}>
          {count}
        </small>
      </div>
      
    </div>
  );
};

export default SummaryCard;
