import React from 'react';

const AttendanceSummary = () => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const attendance = [20, 18, 22, 19, 21, 15];
  const maxVal = 22;

  return (
    <div style={{
      background: '#fff',
      borderRadius: '12px',
      border: '1px solid #e8e8e8',
      padding: '22px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
      flex: '1 1 300px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#1a1a2e' }}>Weekly Attendance</h3>
        <span style={{
          background: 'rgba(34,197,94,0.1)',
          color: '#16a34a',
          fontSize: '11px',
          fontWeight: 600,
          padding: '3px 10px',
          borderRadius: '20px',
        }}>This Week</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', height: '120px' }}>
        {days.map((day, i) => (
          <div key={day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 600 }}>{attendance[i]}</span>
            <div style={{
              width: '100%',
              height: `${(attendance[i] / maxVal) * 90}px`,
              background: i === 4 ? 'linear-gradient(180deg, #3b82f6, #1d4ed8)' : 'linear-gradient(180deg, #93c5fd, #bfdbfe)',
              borderRadius: '6px 6px 2px 2px',
              transition: 'height 0.3s ease',
            }} />
            <span style={{ fontSize: '10px', color: '#94a3b8' }}>{day}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '16px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
        {[
          { label: 'Present Today', val: '19', color: '#22c55e' },
          { label: 'On Leave', val: '2', color: '#f59e0b' },
          { label: 'Absent', val: '1', color: '#ef4444' },
        ].map(item => (
          <div key={item.label} style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: '18px', fontWeight: 700, color: item.color }}>{item.val}</div>
            <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AttendanceSummary;
