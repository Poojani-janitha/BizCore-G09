import React from 'react';

const HrStatsCard = ({ title, value, subtitle, icon, color }) => {
  const colorMap = {
    blue: { border: '#3b82f6', bg: 'rgba(59,130,246,0.08)', icon: '#3b82f6' },
    green: { border: '#22c55e', bg: 'rgba(34,197,94,0.08)', icon: '#22c55e' },
    amber: { border: '#f59e0b', bg: 'rgba(245,158,11,0.08)', icon: '#f59e0b' },
    red: { border: '#ef4444', bg: 'rgba(239,68,68,0.08)', icon: '#ef4444' },
    purple: { border: '#a855f7', bg: 'rgba(168,85,247,0.08)', icon: '#a855f7' },
  };
  const c = colorMap[color] || colorMap.blue;

  return (
    <div style={{
      background: '#fff',
      borderRadius: '12px',
      border: `1px solid #e8e8e8`,
      borderTop: `3px solid ${c.border}`,
      padding: '20px 22px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
      flex: '1 1 160px',
      minWidth: '150px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ fontSize: '11px', fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{title}</span>
        <span style={{
          background: c.bg,
          borderRadius: '8px',
          padding: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: c.icon,
          fontSize: '16px',
        }}>{icon}</span>
      </div>
      <div style={{ fontSize: '28px', fontWeight: 700, color: '#1a1a2e', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '12px', color: '#999' }}>{subtitle}</div>
    </div>
  );
};

export default HrStatsCard;