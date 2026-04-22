import React, { useState, useEffect } from 'react';
import HrStatsCard from '../../component/HR/Dashboard/HrStatsCard';
import { generateEmployees, EMP_KEY } from '../../storeContext/employeesData';
import { getAttendanceForDate, setAttendanceForDate, setLastSavedAttendanceDate } from '../../storeContext/attendanceData';

const Attendance = () => {
  const today = new Date().toISOString().split('T')[0];
  const [employees, setEmployees] = useState([]);
  const [date, setDate] = useState(today);
  const [attendance, setAttendance] = useState({});
  const loadEmployees = () => {
    const stored = localStorage.getItem(EMP_KEY);
    let list = [];
    if (stored) {
      try { list = JSON.parse(stored); } catch { list = generateEmployees(); }
    } else {
      list = generateEmployees();
      localStorage.setItem(EMP_KEY, JSON.stringify(list));
    }

    setEmployees(list);
    const storedAttendance = getAttendanceForDate(date);
    setAttendance(prev => Object.fromEntries(
      list.map(emp => [
        emp.id,
        storedAttendance?.[emp.id] || { status: 'absent', timeIn: '', timeOut: '', otHours: 0 },
      ])
    ));
  };

  useEffect(() => {
    loadEmployees();

    const syncEmployees = () => loadEmployees();
    window.addEventListener('employees-updated', syncEmployees);
    window.addEventListener('storage', syncEmployees);
    return () => {
      window.removeEventListener('employees-updated', syncEmployees);
      window.removeEventListener('storage', syncEmployees);
    };
  }, []);

  useEffect(() => {
    // When the date changes, load saved attendance for that day (keeping employee list in sync)
    if (!employees.length) return;
    const storedAttendance = getAttendanceForDate(date);
    setAttendance(prev => Object.fromEntries(
      employees.map(emp => [
        emp.id,
        storedAttendance?.[emp.id] || { status: 'absent', timeIn: '', timeOut: '', otHours: 0 },
      ])
    ));
  }, [date]); // eslint-disable-line react-hooks/exhaustive-deps

  const [submitted, setSubmitted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const getWorkHours = (timeIn, timeOut) => {
    if (!timeIn || !timeOut) return 0;
    const [inH, inM] = timeIn.split(':').map(Number);
    const [outH, outM] = timeOut.split(':').map(Number);
    return ((outH * 60 + outM) - (inH * 60 + inM)) / 60;
  };

  const calculateOtHours = (timeIn, timeOut) => {
    if (!timeIn || !timeOut) return 0;
    const [outH, outM] = timeOut.split(':').map(Number);
    const outMinutes = outH * 60 + outM;
    const thresholdMinutes = 16 * 60; // 4:00 PM
    const overtimeMinutes = Math.max(0, outMinutes - thresholdMinutes);
    return Math.round((overtimeMinutes / 60) * 100) / 100;
  };

  const applyAttendanceRules = (record) => {
    const next = { ...record };

    // Default state at the beginning of the day is Absent.
    if (!next.status) next.status = 'absent';

    // Manager override: Leave means "not working today".
    // Keep times cleared and do not auto-switch to Present.
    if (next.status === 'leave') {
      next.timeIn = '';
      next.timeOut = '';
      next.otHours = 0;
      return next;
    }

    // If Time In is cleared, employee is Absent (reset the record for the day).
    if (!next.timeIn) {
      next.status = 'absent';
      next.timeOut = '';
      next.otHours = 0;
      return next;
    }

    // If Time In is entered, automatically switch to Present.
    // (If Time Out later shows < 4 hours, it will be converted to Leave below.)
    if (next.timeIn) next.status = 'present';

    // If user marks Absent, clear all time fields + OT.
    if (next.status === 'absent') {
      next.timeIn = '';
      next.timeOut = '';
      next.otHours = 0;
      return next;
    }

    // When Time Out is entered, decide Leave vs Present based on worked hours.
    if (next.timeIn && next.timeOut) {
      const workedHours = getWorkHours(next.timeIn, next.timeOut);
      if (workedHours > 0 && workedHours < 4) {
        next.status = 'leave';
      } else if (workedHours >= 4) {
        next.status = 'present';
      }
    }

    // OT only applies when Present and Time Out is after 4:00 PM.
    if (next.status === 'present') {
      next.otHours = calculateOtHours(next.timeIn, next.timeOut);
    } else {
      next.otHours = 0;
    }

    return next;
  };

  const updateField = (id, field, value) => {
    setAttendance(prev => {
      const current = prev[id] || {};
      if (field !== 'status') {
        const updatedRecord = applyAttendanceRules({ ...current, [field]: value });
        const next = {
          ...prev,
          [id]: updatedRecord,
        };
        setAttendanceForDate(date, next);
        return next;
      }

      const nextStatus = value;
      const next = applyAttendanceRules({ ...current, status: nextStatus });
      const updated = { ...prev, [id]: next };
      setAttendanceForDate(date, updated);
      return updated;
    });
  };

  const markAll = (status) => {
    setAttendance(prev => {
      const updated = { ...prev };
      employees.forEach(emp => {
        const existing = updated[emp.id] || {};
        const nextTimeIn = (status === 'absent' || status === 'leave') ? '' : (existing.timeIn || '');
        const nextTimeOut = (status === 'absent' || status === 'leave') ? '' : (existing.timeOut || '');
        updated[emp.id] = {
          ...existing,
          status,
          // ✅ FIX: When marking all absent, clear times; otherwise preserve user's entries
          timeIn: nextTimeIn,
          timeOut: nextTimeOut,
          otHours: status === 'present' ? calculateOtHours(nextTimeIn, nextTimeOut) : 0,
        };
        updated[emp.id] = applyAttendanceRules(updated[emp.id]);
      });
      setAttendanceForDate(date, updated);
      return updated;
    });
  };

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setAttendanceForDate(date, attendance);
    setLastSavedAttendanceDate(date);
    console.log('Attendance Data:', { date, attendance });
    // TODO: send to backend via fetch/axios
  };

  const summary = {
    present: employees.filter(e => attendance[e.id]?.status === 'present').length,
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

      {/* Summary Cards */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginBottom: '22px' }}>
        <HrStatsCard title="Present Today" value={summary.present} subtitle="Fingerprint verified" icon="✅" color="green" />
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
        {/* ✅ FIX: Header and row grids now both use the same 8-column layout (removed duplicate Profile column) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '40px 1fr 120px 160px 110px 110px 100px 120px',
          background: '#f8fafc', borderBottom: '2px solid #e8e8e8',
          padding: '12px 20px', gap: '12px', alignItems: 'center',
        }}>
          {['#', 'Employee', 'Role', 'Status', 'Time In', 'Time Out', 'OT Hours', 'Tea Cost'].map(h => (
            <div key={h} style={{
              fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
              color: '#1e40af',
              background: 'rgba(59,130,246,0.12)',
              padding: '8px 10px',
              borderRadius: '8px',
              border: '1px solid rgba(59,130,246,0.3)',
            }}>{h}</div>
          ))}
        </div>

        {/* Table Rows */}
        {filtered.map((emp, index) => {
          const rec = attendance[emp.id] || { status: 'absent', timeIn: '', timeOut: '', otHours: 0 };

          const roleText = String(emp.role || '').toLowerCase();
          const isProductionOrStaffRole = roleText.includes('production') || roleText.includes('staff');
          const workedHours = getWorkHours(rec.timeIn, rec.timeOut);
          const teaCost = rec.status === 'present' && isProductionOrStaffRole && rec.timeIn && rec.timeOut && workedHours >= 4 ? 'Rs 60' : '—';

          const rowBg = index % 2 === 0 ? '#fff' : '#fafbfc';

          return (
            <div key={emp.id} style={{
              display: 'grid',
              gridTemplateColumns: '40px 1fr 120px 160px 110px 110px 100px 120px',
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
              </div>

              {/* Role */}
              <div style={{
                fontSize: '11px', fontWeight: 600,
                color: emp.role === 'Monthly Salaried' ? '#8b5cf6' : '#64748b',
              }}>{emp.role}</div>

              {/* Status */}
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

              {/* Time In — placeholder only, no default value */}
              <input
                type="time"
                value={rec.timeIn}
                disabled={rec.status === 'leave'}
                onChange={e => updateField(emp.id, 'timeIn', e.target.value)}
                placeholder="--:--"
                style={{
                  padding: '5px 8px', borderRadius: '6px',
                  border: '1px solid #d1d5db', fontSize: '12px',
                  background: rec.status === 'leave' ? '#f1f5f9' : '#fff',
                  color: rec.status === 'leave' ? '#94a3b8' : '#1a1a2e',
                  outline: 'none', width: '90px',
                }}
              />

              {/* Time Out — placeholder only, no default value */}
              <input
                type="time"
                value={rec.timeOut}
                disabled={!rec.timeIn || rec.status === 'leave'}
                onChange={e => updateField(emp.id, 'timeOut', e.target.value)}
                placeholder="--:--"
                style={{
                  padding: '5px 8px', borderRadius: '6px',
                  border: '1px solid #d1d5db', fontSize: '12px',
                  background: (!rec.timeIn || rec.status === 'leave') ? '#f1f5f9' : '#fff',
                  color: (!rec.timeIn || rec.status === 'leave') ? '#94a3b8' : '#1a1a2e',
                  outline: 'none', width: '90px',
                }}
              />

              {/* OT Hours */}
              <input
                type="number"
                min="0"
                value={rec.otHours}
                disabled
                placeholder="0"
                style={{
                  padding: '5px 8px', borderRadius: '6px',
                  border: '1px solid #d1d5db', fontSize: '12px',
                  background: '#f1f5f9',
                  color: rec.status !== 'present' ? '#94a3b8' : '#1a1a2e',
                  outline: 'none', width: '60px',
                }}
              />

              {/* ✅ Tea Cost — auto-applied for present employees */}
              <div style={{
                fontSize: '12px', fontWeight: 700,
                color: teaCost === 'Rs 60' ? '#16a34a' : '#94a3b8',
                background: teaCost !== '—' ? 'rgba(34,197,94,0.1)' : 'transparent',
                padding: teaCost !== '—' ? '4px 8px' : '0',
                borderRadius: '6px',
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