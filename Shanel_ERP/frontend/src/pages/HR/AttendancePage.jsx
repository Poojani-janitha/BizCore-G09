import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HrStatsCard from '../../component/HR/Dashboard/HrStatsCard';
import { generateEmployees, EMP_KEY } from '../../storeContext/employeesData';

const Attendance = () => {
  const navigate = useNavigate();
  const today = new Date().toISOString().split('T')[0];
  const [employees, setEmployees] = useState([]);
  const [date, setDate] = useState(today);
  const [attendance, setAttendance] = useState({});

  useEffect(() => {
    const stored = localStorage.getItem(EMP_KEY);
    let list = [];
    if (stored) {
      try { list = JSON.parse(stored); } catch { list = generateEmployees(); }
    } else {
      list = generateEmployees();
      localStorage.setItem(EMP_KEY, JSON.stringify(list));
    }
    setEmployees(list);
    setAttendance(
      Object.fromEntries(
        list.map(emp => [
          emp.id,
          { status: 'present', timeIn: '08:00', timeOut: '16:00', otHours: 0 },
        ])
      )
    );
  }, []);
  const [submitted, setSubmitted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const updateField = (id, field, value) => {
    setAttendance(prev => {
      const current = prev[id] || {};
      if (field !== 'status') {
        return {
          ...prev,
          [id]: { ...current, [field]: value },
        };
      }

      const nextStatus = value;
      const next = { ...current, status: nextStatus };

      // Absent: clear times + OT
      if (nextStatus === 'absent') {
        next.timeIn = '';
        next.timeOut = '';
        next.otHours = 0;
      }

      // Present: set defaults (not editable)
      if (nextStatus === 'present') {
        next.timeIn = '08:00';
        next.timeOut = '16:00';
        next.otHours = 0;
      }

      // Leave: clear so user can enter arrival/leaving time
      if (nextStatus === 'leave') {
        next.timeIn = next.timeIn || '';
        next.timeOut = next.timeOut || '';
        next.otHours = 0;
      }

      return { ...prev, [id]: next };
    });
  };

  const markAll = (status) => {
    setAttendance(prev => {
      const updated = { ...prev };
      employees.forEach(emp => {
        const existing = updated[emp.id] || {};
        updated[emp.id] = {
          ...existing,
          status,
          timeIn: status === 'present' ? '08:00' : (status === 'absent' ? '' : (existing.timeIn || '')),
          timeOut: status === 'present' ? '16:00' : (status === 'absent' ? '' : (existing.timeOut || '')),
          otHours: status === 'present' ? (existing.otHours ?? 0) : 0,
        };
      });
      return updated;
    });
  };

  const getWorkHours = (timeIn, timeOut) => {
    if (!timeIn || !timeOut) return 0;
    const [inH, inM] = timeIn.split(':').map(Number);
    const [outH, outM] = timeOut.split(':').map(Number);
    return ((outH * 60 + outM) - (inH * 60 + inM)) / 60;
  };

  const isHalfDay = (id) => {
    const { timeIn, timeOut, status } = attendance[id];
    if (status !== 'present') return false;
    const hours = getWorkHours(timeIn, timeOut);
    return hours < 4;
  };

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    console.log('Attendance Data:', { date, attendance });
    // TODO: send to backend via fetch/axios
  };

  const summary = {
    present: employees.filter(e => attendance[e.id]?.status === 'present' && !isHalfDay(e.id)).length,
    halfDay: employees.filter(e => isHalfDay(e.id)).length,
    leave: employees.filter(e => attendance[e.id]?.status === 'leave').length,
    absent: employees.filter(e => attendance[e.id]?.status === 'absent').length,
  };

  const filtered = employees.filter(e =>
    e.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusColors = {
    present: { bg: 'rgba(34,197,94,0.15)', border: '#22c55e', color: '#16a34a' },
    leave: { bg: 'rgba(59,130,246,0.15)', border: '#3b82f6', color: '#2563eb' },
    absent: { bg: 'rgba(239,68,68,0.15)', border: '#ef4444', color: '#dc2626' },
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f5f6fa',
      padding: '28px 32px',
      fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>

      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{
          margin: 0, fontSize: '26px', fontWeight: 800, letterSpacing: '-0.5px',
        }}>
          <span style={{
            background: 'linear-gradient(135deg, #1e3a5f, #3b82f6)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>Daily Attendance</span>
        </h1>
        <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '13px' }}>
          Mark attendance for all employees · Work hours: 8:00 AM – 4:00 PM
        </p>
      </div>

      {/* Summary Cards - HrStatsCard */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginBottom: '22px' }}>
        <HrStatsCard title="Present Today" value={summary.present} subtitle="Fingerprint verified" icon="✅" color="green" />
        <HrStatsCard title="Half Day" value={summary.halfDay} subtitle="Less than 4 hours" icon="🕐" color="blue" />
        <HrStatsCard title="On Leave" value={summary.leave} subtitle="Approved leaves" icon="📋" color="amber" />
        <HrStatsCard title="Absent" value={summary.absent} subtitle="No show" icon="❌" color="red" />
      </div>

      {/* Controls */}
      <div style={{
        background: '#fff', borderRadius: '12px', border: '1px solid #e8e8e8',
        padding: '16px 20px', marginBottom: '18px',
        display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center',
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>Date:</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            style={{
              padding: '7px 12px', borderRadius: '8px', border: '1px solid #d1d5db',
              fontSize: '13px', color: '#1a1a2e', outline: 'none',
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>Mark All:</span>
          {['present', 'leave', 'absent'].map(s => (
            <button key={s} onClick={() => markAll(s)} style={{
              padding: '6px 14px', borderRadius: '8px', border: 'none',
              background: statusColors[s].bg, color: statusColors[s].color,
              fontSize: '12px', fontWeight: 600, cursor: 'pointer',
              border: `1px solid ${statusColors[s].border}20`,
            }}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="🔍 Search employee..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{
            padding: '7px 14px', borderRadius: '8px', border: '1px solid #d1d5db',
            fontSize: '13px', outline: 'none', minWidth: '200px',
          }}
        />
      </div>

      {/* Attendance Table */}
      <div style={{
        background: '#fff', borderRadius: '12px', border: '1px solid #e8e8e8',
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)', overflow: 'hidden', marginBottom: '20px',
      }}>
        {/* Table Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '40px 1fr 90px 120px 140px 110px 110px 100px 120px',
          background: '#f8fafc', borderBottom: '2px solid #e8e8e8',
          padding: '12px 20px', gap: '12px', alignItems: 'center',
        }}>
          {['#', 'Employee', 'Profile', 'Role', 'Status', 'Time In', 'Time Out', 'OT Hours', 'Tea Cost'].map(h => (
            <div key={h} style={{
              fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
              ...(h === 'Status' ? { color: '#1e40af', background: 'rgba(59,130,246,0.12)', padding: '8px 10px', borderRadius: '8px', border: '1px solid rgba(59,130,246,0.3)' } : { color: '#64748b' }),
            }}>{h}</div>
          ))}
        </div>

        {/* Table Rows */}
        {filtered.map((emp, index) => {
          const rec = attendance[emp.id];
          const halfDay = isHalfDay(emp.id);
          const teaCost = rec.status === 'present' && !halfDay ? 'Rs 60' : '—';
          const rowBg = index % 2 === 0 ? '#fff' : '#fafbfc';

          return (
            <div key={emp.id} style={{
              display: 'grid',
              gridTemplateColumns: '40px 1fr 120px 140px 110px 110px 100px 120px',
              padding: '12px 20px', gap: '12px', alignItems: 'center',
              background: rowBg, borderBottom: '1px solid #f1f5f9',
              transition: 'background 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = '#f0f7ff'}
              onMouseLeave={e => e.currentTarget.style.background = rowBg}
            >
              {/* # */}
              <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>{emp.id}</div>

              {/* Name */}
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a2e' }}>{emp.name}</div>
                {halfDay && (
                  <span style={{ fontSize: '10px', color: '#2563eb', fontWeight: 600 }}>Half Day</span>
                )}
              </div>

              {/* Role */}
              <div style={{
                fontSize: '11px', fontWeight: 600,
                color: emp.role === 'Monthly Salaried' ? '#8b5cf6' : '#64748b',
              }}>{emp.role}</div>

              {/* Status - highlighted column */}
              <div style={{
                display: 'flex', gap: '6px',
                padding: '8px 10px', borderRadius: '8px',
                background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)',
              }}>
                {['present', 'leave', 'absent'].map(s => (
                  <button key={s} onClick={() => updateField(emp.id, 'status', s)} style={{
                    padding: '6px 12px', borderRadius: '6px', border: `2px solid ${statusColors[s].border}`,
                    fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                    background: rec.status === s ? statusColors[s].bg : `${statusColors[s].border}15`,
                    color: rec.status === s ? statusColors[s].color : statusColors[s].border,
                    boxShadow: rec.status === s ? `0 2px 4px ${statusColors[s].border}30` : 'none',
                  }}>
                    {s === 'present' ? '✓' : s === 'leave' ? 'L' : 'A'}
                  </button>
                ))}
              </div>

              {/* Time In - enterable only when Leave */}
              <input
                type="time"
                value={rec.timeIn}
                disabled={rec.status !== 'leave'}
                onChange={e => updateField(emp.id, 'timeIn', e.target.value)}
                style={{
                  padding: '5px 8px', borderRadius: '6px',
                  border: '1px solid #d1d5db', fontSize: '12px',
                  background: rec.status !== 'leave' ? '#f1f5f9' : '#fff',
                  color: rec.status !== 'leave' ? '#94a3b8' : '#1a1a2e',
                  outline: 'none', width: '90px',
                }}
              />

              {/* Time Out - enterable only when Leave */}
              <input
                type="time"
                value={rec.timeOut}
                disabled={rec.status !== 'leave'}
                onChange={e => updateField(emp.id, 'timeOut', e.target.value)}
                style={{
                  padding: '5px 8px', borderRadius: '6px',
                  border: '1px solid #d1d5db', fontSize: '12px',
                  background: rec.status !== 'leave' ? '#f1f5f9' : '#fff',
                  color: rec.status !== 'leave' ? '#94a3b8' : '#1a1a2e',
                  outline: 'none', width: '90px',
                }}
              />

              {/* OT Hours */}
              <input
                type="number"
                min="0"
                max="3"
                value={rec.otHours}
                disabled={rec.status !== 'present'}
                onChange={e => updateField(emp.id, 'otHours', Number(e.target.value))}
                placeholder="0"
                style={{
                  padding: '5px 8px', borderRadius: '6px',
                  border: '1px solid #d1d5db', fontSize: '12px',
                  background: rec.status !== 'present' ? '#f1f5f9' : '#fff',
                  color: rec.status !== 'present' ? '#94a3b8' : '#1a1a2e',
                  outline: 'none', width: '60px',
                }}
              />

              {/* Tea Cost */}
              <div style={{
                fontSize: '12px', fontWeight: 600,
                color: teaCost === 'Rs 60' ? '#16a34a' : '#94a3b8',
              }}>{teaCost}</div>
            </div>
          );
        })}
      </div>

      {/* Submit Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '14px' }}>
        {submitted && (
          <span style={{
            fontSize: '13px', fontWeight: 600, color: '#16a34a',
            background: 'rgba(34,197,94,0.1)', padding: '8px 16px', borderRadius: '8px',
          }}>
            ✅ Attendance saved successfully!
          </span>
        )}
        <button onClick={handleSubmit} style={{
          padding: '12px 32px', borderRadius: '10px', border: 'none',
          background: 'linear-gradient(135deg, #1e3a5f, #3b82f6)',
          color: '#fff', fontSize: '14px', fontWeight: 700,
          cursor: 'pointer', boxShadow: '0 4px 12px rgba(59,130,246,0.3)',
          transition: 'transform 0.2s, box-shadow 0.2s',
        }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(59,130,246,0.4)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(59,130,246,0.3)'; }}
        >
          Save Attendance
        </button>
      </div>
    </div>
  );
};

export default Attendance;