import React from 'react';
import { useNavigate } from 'react-router-dom';

const QuickActions = () => {
  const navigate = useNavigate();
  const actions = [
    { label: 'Mark Attendance', icon: '🕗', color: '#3b82f6', bg: 'rgba(59,130,246,0.08)', path: '/hr/attendance' },
    { label: 'Add Employee', icon: '👤', color: '#22c55e', bg: 'rgba(34,197,94,0.08)' },
    { label: 'Process Salary', icon: '💰', color: '#8b5cf6', bg: 'rgba(139,92,246,0.08)' },
    { label: 'Approve Leave', icon: '✅', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
    { label: 'Send Paysheet', icon: '📧', color: '#ef4444', bg: 'rgba(239,68,68,0.08)' },
    { label: 'View Reports', icon: '📊', color: '#06b6d4', bg: 'rgba(6,182,212,0.08)' },
  ];

  return (
    <div style={{
      background: '#fff',
      borderRadius: '12px',
      border: '1px solid #e8e8e8',
      padding: '22px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    }}>
      <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: 700, color: '#1a1a2e' }}>Quick Actions</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
        {actions.map((a, i) => (
          <button key={i} onClick={() => a.path && navigate(a.path)} style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 16px', borderRadius: '8px',
            background: a.bg, border: `1px solid ${a.color}20`,
            cursor: 'pointer', color: a.color, fontSize: '12px',
            fontWeight: 600, transition: 'all 0.2s',
            flex: '1 1 140px',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = `0 4px 12px ${a.color}30`; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <span style={{ fontSize: '16px' }}>{a.icon}</span>
            {a.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;