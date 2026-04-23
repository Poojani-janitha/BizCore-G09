import React, { useEffect, useMemo, useState } from 'react';
import { EMP_KEY, generateEmployees } from '../../storeContext/employeesData';
import { getAttendanceForDate, setAttendanceForDate } from '../../storeContext/attendanceData';

const Leave = () => {
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshTick, setRefreshTick] = useState(0);

  const employees = useMemo(() => {
    try {
      const storedEmployees = localStorage.getItem(EMP_KEY);
      return storedEmployees ? JSON.parse(storedEmployees) : generateEmployees();
    } catch {
      return generateEmployees();
    }
  }, [refreshTick]);

  const leaveEmployees = useMemo(() => {
    const dayAttendance = getAttendanceForDate(date);
    const leaves = employees
      .filter(e => dayAttendance?.[e.id]?.status === 'leave')
      .map(e => ({
        ...e,
        leaveReason: dayAttendance?.[e.id]?.reason || '',
      }));
    if (!searchTerm.trim()) return leaves;
    const q = searchTerm.toLowerCase();
    return leaves.filter(e =>
      String(e.name || '').toLowerCase().includes(q) ||
      String(e.role || '').toLowerCase().includes(q) ||
      String(e.email || '').toLowerCase().includes(q) ||
      String(e.phone || '').toLowerCase().includes(q) ||
      String(e.leaveReason || '').toLowerCase().includes(q)
    );
  }, [date, employees, searchTerm]);

  const updateReason = (employeeId, reason) => {
    const dayAttendance = getAttendanceForDate(date);
    const current = dayAttendance?.[employeeId] || { status: 'leave' };
    setAttendanceForDate(date, {
      ...dayAttendance,
      [employeeId]: {
        ...current,
        status: 'leave',
        reason,
      },
    });
  };

  useEffect(() => {
    const refresh = () => setRefreshTick(t => t + 1);
    window.addEventListener('attendance-updated', refresh);
    window.addEventListener('employees-updated', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('attendance-updated', refresh);
      window.removeEventListener('employees-updated', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f5f6fa',
      padding: '28px 32px',
      fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>
      <div style={{ marginBottom: '18px' }}>
        <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 800, letterSpacing: '-0.5px' }}>
          <span style={{
            background: 'linear-gradient(135deg, #1e3a5f, #3b82f6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Leave Details
          </span>
        </h1>
        <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '13px' }}>
          View employees who are marked as leave for a selected date
        </p>
      </div>

      <div style={{
        background: '#fff',
        borderRadius: '12px',
        border: '1px solid #e8e8e8',
        padding: '16px 20px',
        marginBottom: '18px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
        alignItems: 'center',
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>Date:</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            style={{
              padding: '7px 12px',
              borderRadius: '8px',
              border: '1px solid #d1d5db',
              fontSize: '13px',
              color: '#1a1a2e',
              outline: 'none',
            }}
          />
        </div>

        <div style={{
          marginLeft: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          flexWrap: 'wrap',
        }}>
          <div style={{
            fontSize: '12px',
            fontWeight: 700,
            color: '#b45309',
            background: 'rgba(245,158,11,0.12)',
            border: '1px solid rgba(245,158,11,0.25)',
            padding: '6px 10px',
            borderRadius: '10px',
          }}>
            Total on Leave: {leaveEmployees.length}
          </div>

          <input
            type="text"
            placeholder="🔍 Search name/role/email..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{
              padding: '7px 14px',
              borderRadius: '8px',
              border: '1px solid #d1d5db',
              fontSize: '13px',
              outline: 'none',
              minWidth: '220px',
            }}
          />
        </div>
      </div>

      <div style={{
        background: '#fff',
        borderRadius: '12px',
        border: '1px solid #e8e8e8',
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        overflow: 'hidden',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '60px 1fr 140px 220px 160px 1.2fr',
          background: '#f8fafc',
          borderBottom: '2px solid #e8e8e8',
          padding: '12px 20px',
          gap: '12px',
          alignItems: 'center',
        }}>
          {['ID', 'Employee', 'Role', 'Email', 'Phone', 'Reason'].map(h => (
            <div key={h} style={{
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#1e40af',
              background: 'rgba(59,130,246,0.12)',
              padding: '8px 10px',
              borderRadius: '8px',
              border: '1px solid rgba(59,130,246,0.3)',
            }}>
              {h}
            </div>
          ))}
        </div>

        {leaveEmployees.length === 0 ? (
          <div style={{ padding: '22px 20px', color: '#64748b', fontSize: '13px' }}>
            No employees are marked as leave for this date.
          </div>
        ) : (
          leaveEmployees.map((emp, idx) => {
            const rowBg = idx % 2 === 0 ? '#fff' : '#fafbfc';
            return (
              <div
                key={emp.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '60px 1fr 140px 220px 160px 1.2fr',
                  padding: '12px 20px',
                  gap: '12px',
                  alignItems: 'center',
                  background: rowBg,
                  borderBottom: '1px solid #f1f5f9',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#f0f7ff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = rowBg; }}
              >
                <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 700 }}>{emp.id}</div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#1a1a2e' }}>{emp.name}</div>
                  <div style={{ fontSize: '11px', color: '#b45309', fontWeight: 700 }}>LEAVE</div>
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>{emp.role || '—'}</div>
                <div style={{ fontSize: '12px', color: '#475569', fontWeight: 600 }}>{emp.email || '—'}</div>
                <div style={{ fontSize: '12px', color: '#475569', fontWeight: 600 }}>{emp.phone || '—'}</div>
                <input
                  type="text"
                  value={emp.leaveReason}
                  onChange={(e) => updateReason(emp.id, e.target.value)}
                  placeholder="Enter leave reason..."
                  style={{
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid #d1d5db',
                    fontSize: '12px',
                    outline: 'none',
                    width: '100%',
                    background: '#fff',
                    color: '#1a1a2e',
                  }}
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Leave;

