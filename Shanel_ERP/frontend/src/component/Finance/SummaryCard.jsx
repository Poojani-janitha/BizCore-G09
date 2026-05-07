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
  
  const cardStyle = {
    borderRadius: '20px',
    border: '1px solid #e2e8f0',
    backgroundColor: '#ffffff',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
    padding: '24px',
    transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: 'default',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  };

  const iconContainerStyle = {
    width: '48px',
    height: '48px',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: bgColor,
    fontSize: '22px'
  };

  const trendStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 10px',
    borderRadius: '20px',
    backgroundColor: isPositive ? '#f0fdf4' : '#fef2f2',
    color: isPositive ? '#166534' : '#991b1b',
    fontSize: '12px',
    fontWeight: 700
  };

  return (
    <div style={cardStyle} className="summary-card-hover">
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div style={iconContainerStyle}>
          {icon}
        </div>
        <div style={trendStyle}>
          {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {isPositive ? '+' : ''}{percentage}%
        </div>
      </div>
      
      <div>
        <h6 style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
          {title}
        </h6>
        <h3 style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b', marginBottom: '4px' }}>
          Rs. {amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </h3>
        <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
          {isNet ? <Activity size={14} /> : (title.includes('RECEIVED') ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />)}
          {count}
        </p>
      </div>
      
      <style>{`
        .summary-card-hover:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
};

export default SummaryCard;
