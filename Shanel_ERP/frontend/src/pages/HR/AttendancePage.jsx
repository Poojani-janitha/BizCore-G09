import React, { useState } from 'react';

const employees = [
  { id: 1, name: 'Kumari Perera', role: 'Production Worker' },
  { id: 2, name: 'Nimal Silva', role: 'Production Worker' },
  { id: 3, name: 'Sunethra Fernando', role: 'Production Worker' },
  { id: 4, name: 'Amal Jayasinghe', role: 'Production Worker' },
  { id: 5, name: 'Manel Kumari', role: 'Production Worker' },
  { id: 6, name: 'Sumudu Rathnayake', role: 'Production Worker' },
  { id: 7, name: 'Chamari Wijesinghe', role: 'Production Worker' },
  { id: 8, name: 'Niluka Bandara', role: 'Production Worker' },
  { id: 9, name: 'Priyanka Dissanayake', role: 'Production Worker' },
  { id: 10, name: 'Kamal Weerasinghe', role: 'Production Worker' },
  { id: 11, name: 'Priya Senaratne', role: 'Production Worker' },
  { id: 12, name: 'Ruwan Dissanayake', role: 'Production Worker' },
  { id: 13, name: 'Sandya Gunawardena', role: 'Production Worker' },
  { id: 14, name: 'Lasith Perera', role: 'Production Worker' },
  { id: 15, name: 'Dilani Jayawardena', role: 'Production Worker' },
  { id: 16, name: 'Chatura Bandara', role: 'Production Worker' },
  { id: 17, name: 'Iresha Madushani', role: 'Production Worker' },
  { id: 18, name: 'Thilina Rajapaksha', role: 'Production Worker' },
  { id: 19, name: 'Samanthi Wickrama', role: 'Production Worker' },
  { id: 20, name: 'Nuwan Senanayake', role: 'Production Worker' },
  { id: 21, name: 'Ranjith Fernando', role: 'Monthly Salaried' },
  { id: 22, name: 'Anjali Gunasekara', role: 'Monthly Salaried' },
];

const Attendance = () => {
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [attendance, setAttendance] = useState(
    Object.fromEntries(
      employees.map(emp => [
        emp.id,
        { status: 'present', timeIn: '08:00', timeOut: '16:00', otHours: 0 },
      ])
    )
  );
  const [submitted, setSubmitted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const updateField = (id, field, value) => {
    setAttendance(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const markAll = (status) => {
    setAttendance(prev => {
      const updated = { ...prev };
      employees.forEach(emp => {
        updated[emp.id] = {
          ...updated[emp.id],
          status,
          timeIn: status === 'present' ? '08:00' : '',
          timeOut: status === 'present' ? '16:00' : '',
          otHours: 0,
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
    present: employees.filter(e => attendance[e.id].status === 'present' && !isHalfDay(e.id)).length,
    halfDay: employees.filter(e => isHalfDay(e.id)).length,
    leave: employees.filter(e => attendance[e.id].status === 'leave').length,
    absent: employees.filter(e => attendance[e.id].status === 'absent').length,
  };

  const filtered = employees.filter(e =>
    e.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusColors = {
    present: { bg: 'rgba(34,197,94,0.1)', border: '#22c55e', color: '#16a34a' },
    leave: { bg: 'rgba(245,158,11,0.1)', border: '#f59e0b', color: '#d97706' },
    absent: { bg: 'rgba(239,68,68,0.1)', border: '#ef4444', color: '#dc2626' },
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
        {[
          { label: 'Present', value: summary.present, color: '#22c55e', bg: 'rgba(34,197,94,0.08)', icon: '✅' },
          { label: 'Half Day', value: summary.halfDay, color: '#3b82f6', bg: 'rgba(59,130,246,0.08)', icon: '🕐' },
          { label: 'On Leave', value: summary.leave, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', icon: '📋' },
          { label: 'Absent', value: summary.absent, color: '#ef4444', bg: 'rgba(239,68,68,0.08)', icon: '❌' },
        ].map(card => (
          <div key={card.label} style={{
            flex: '1 1 140px', background: '#fff', borderRadius: '12px',
            border: '1px solid #e8e8e8', borderTop: `3px solid ${card.color}`,
            padding: '16px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{card.label}</span>
              <span style={{ fontSize: '18px' }}>{card.icon}</span>
            </div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#1a1a2e', marginTop: '6px' }}>{card.value}</div>
          </div>
        ))}
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
          gridTemplateColumns: '40px 1fr 120px 140px 110px 110px 100px 120px',
          background: '#f8fafc', borderBottom: '2px solid #e8e8e8',
          padding: '12px 20px', gap: '12px', alignItems: 'center',
        }}>
          {['#', 'Employee', 'Role', 'Status', 'Time In', 'Time Out', 'OT Hours', 'Tea Cost'].map(h => (
            <div key={h} style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</div>
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

              {/* Status */}
              <div style={{ display: 'flex', gap: '4px' }}>
                {['present', 'leave', 'absent'].map(s => (
                  <button key={s} onClick={() => updateField(emp.id, 'status', s)} style={{
                    padding: '4px 8px', borderRadius: '6px', border: 'none',
                    fontSize: '10px', fontWeight: 600, cursor: 'pointer',
                    background: rec.status === s ? statusColors[s].bg : '#f1f5f9',
                    color: rec.status === s ? statusColors[s].color : '#94a3b8',
                    outline: rec.status === s ? `1.5px solid ${statusColors[s].border}` : 'none',
                  }}>
                    {s === 'present' ? '✓' : s === 'leave' ? 'L' : 'A'}
                  </button>
                ))}
              </div>

              {/* Time In */}
              <input
                type="time"
                value={rec.timeIn}
                disabled={rec.status !== 'present'}
                onChange={e => updateField(emp.id, 'timeIn', e.target.value)}
                style={{
                  padding: '5px 8px', borderRadius: '6px',
                  border: '1px solid #d1d5db', fontSize: '12px',
                  background: rec.status !== 'present' ? '#f1f5f9' : '#fff',
                  color: rec.status !== 'present' ? '#94a3b8' : '#1a1a2e',
                  outline: 'none', width: '90px',
                }}
              />

              {/* Time Out */}
              <input
                type="time"
                value={rec.timeOut}
                disabled={rec.status !== 'present'}
                onChange={e => updateField(emp.id, 'timeOut', e.target.value)}
                style={{
                  padding: '5px 8px', borderRadius: '6px',
                  border: '1px solid #d1d5db', fontSize: '12px',
                  background: rec.status !== 'present' ? '#f1f5f9' : '#fff',
                  color: rec.status !== 'present' ? '#94a3b8' : '#1a1a2e',
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