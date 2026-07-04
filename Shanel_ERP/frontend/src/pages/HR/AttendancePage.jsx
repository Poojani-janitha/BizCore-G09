

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import HrStatsCard from '../../component/HR/Dashboard/HrStatsCard';
import { API_ENDPOINTS } from '../../config/apiEndpoints';

const API_BASE = API_ENDPOINTS.hr.root;

const TimeInputAMPM = ({ value, onChange, disabled, placeholder }) => {
  const [text, setText] = useState('');
  const [ampm, setAmpm] = useState('AM');

  useEffect(() => {
    if (!value) {
      setText('');
      setAmpm('AM');
      return;
    }
    const [h, m] = value.split(':');
    let hInt = parseInt(h, 10);
    const isPM = hInt >= 12;
    setAmpm(isPM ? 'PM' : 'AM');
    hInt = hInt % 12 || 12;
    setText(`${String(hInt).padStart(2, '0')}:${m}`);
  }, [value]);

  const updateParent = (timeText, period) => {
    if (!timeText.trim()) {
      onChange('');
      return;
    }
    let cleaned = timeText.replace(/[^\d:]/g, '');
    if (!cleaned) {
        setText('');
        onChange('');
        return;
    }
    
    let h = 0, m = 0;
    if (cleaned.includes(':')) {
      const parts = cleaned.split(':');
      h = parseInt(parts[0], 10) || 0;
      m = parseInt(parts[1], 10) || 0;
    } else if (cleaned.length <= 2) {
      h = parseInt(cleaned, 10) || 0;
    } else if (cleaned.length === 3) {
      h = parseInt(cleaned.substring(0, 1), 10);
      m = parseInt(cleaned.substring(1), 10);
    } else if (cleaned.length >= 4) {
      h = parseInt(cleaned.substring(0, 2), 10);
      m = parseInt(cleaned.substring(2, 4), 10);
    }

    if (h > 12) h = 12;
    if (m > 59) m = 59;

    const formattedText = `${String(h || 12).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    setText(formattedText);

    if (h === 12 && period === 'AM') h = 0;
    else if (h < 12 && period === 'PM') h += 12;

    onChange(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
  };

  const handleBlur = () => {
    updateParent(text, ampm);
  };

  return (
    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
      <input
        type="text"
        value={text}
        disabled={disabled}
        onChange={e => setText(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={e => { if (e.key === 'Enter') e.target.blur(); }}
        placeholder={placeholder ? placeholder.split(' ')[0] : "08:00"}
        style={{
          padding: '5px 8px', borderRadius: '6px',
          border: '1px solid #d1d5db', fontSize: '12px',
          background: disabled ? '#f1f5f9' : '#fff',
          color: disabled ? '#94a3b8' : '#1a1a2e',
          outline: 'none', width: '56px', textAlign: 'center'
        }}
      />
      <select
        value={ampm}
        disabled={disabled || !text.trim()}
        onChange={e => {
            const newAmpm = e.target.value;
            setAmpm(newAmpm);
            if (text.trim()) {
                updateParent(text, newAmpm);
            }
        }}
        style={{
          padding: '4px', borderRadius: '6px',
          border: '1px solid #d1d5db', fontSize: '11px', fontWeight: 600,
          background: disabled || !text.trim() ? '#f1f5f9' : '#f8fafc',
          color: disabled || !text.trim() ? '#94a3b8' : '#475569',
          outline: 'none', cursor: disabled || !text.trim() ? 'not-allowed' : 'pointer'
        }}
      >
        <option value="AM">AM</option>
        <option value="PM">PM</option>
      </select>
    </div>
  );
};

//sets up the initial state and variables that the Attendance page needs to function
const Attendance = () => {
  const today = new Date().toISOString().split('T')[0];
  const [employees, setEmployees] = useState([]);
  const [date, setDate] = useState(today);
  const [attendance, setAttendance] = useState({});
  const latestAttendanceRef = React.useRef({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const mapEmployee = (emp) => ({
    id: String(emp.Employee_ID),
    name: emp.Full_Name || '',
    role: emp.Role || '',
  });

  const mapStatusToUi = (status) => {
    const normalized = String(status || '').toLowerCase();
    if (normalized === 'present') return 'present';
    return 'absent';
  };

  const mapStatusToApi = (status) => {
    if (status === 'present') return 'Present';
    return 'Absent';
  };

  /**
 * Helper: Initializes the local attendance state by merging the full employee list 
 * with any existing attendance records and approved leave records for the selected date.
 */
  const initializeAttendance = (employeeList, attendanceRows = [], leaveRows = []) => {
    const byEmployeeId = {};

    // 1. Process approved leaves first (they take priority)
    leaveRows.forEach((leave) => {
      if (leave.Status === 'Approved') {
        const empId = String(leave.Employee_ID);
        byEmployeeId[empId] = {
          status: 'leave',
          timeIn: '',
          timeOut: '',
          otHours: 0,
          isOnLeave: true,
          leaveType: leave.Leave_Type
        };
      }
    });

    // 2. Overlay existing attendance records (might override 'leave' if user marked it manually, 
    // but the UI will disable editing forisOnLeave rows anyway).
    attendanceRows.forEach((row) => {
      const empId = String(row.Employee_ID);
      // Only overlay if not already marked as leave by the leave engine
      if (!byEmployeeId[empId] || byEmployeeId[empId].status !== 'leave') {
        byEmployeeId[empId] = {
          attendanceId: row.Attendance_ID,
          status: mapStatusToUi(row.Status),
          timeIn: row.Check_In_Time || '',
          timeOut: row.Check_Out_Time || '',
          otHours: Number(row.Overtime_Hours || 0),
          cardsProduced: Number(row.Cards_Produced || 0),
        };
      }
    });

    setAttendance(
      Object.fromEntries(
        employeeList.map((emp) => [
          emp.id,
          byEmployeeId[emp.id] || { status: 'absent', timeIn: '', timeOut: '', otHours: 0, cardsProduced: 0 },
        ])
      )
    );
    latestAttendanceRef.current = Object.fromEntries(
      employeeList.map((emp) => [
        emp.id,
        byEmployeeId[emp.id] || { status: 'absent', timeIn: '', timeOut: '', otHours: 0, cardsProduced: 0 },
      ])
    );
  };

  /**
 * Data Fetcher: Retrieves the list of active employees, attendance logs, and approved leaves for a specific date.
 */
  const loadEmployeesAndAttendance = async (selectedDate) => {
    try {
      setLoading(true);
      setError('');
      const [employeesRes, attendanceRes, leavesRes] = await Promise.all([
        axios.get(`${API_BASE}/employees`, { params: { status: 'Active' } }),
        axios.get(`${API_BASE}/attendance`, { params: { from: selectedDate, to: selectedDate } }),
        axios.get(`${API_BASE}/leaves`, { params: { from: selectedDate, to: selectedDate, status: 'Approved' } }),
      ]);

      const employeeList = Array.isArray(employeesRes?.data?.data)
        ? employeesRes.data.data.map(mapEmployee)
        : [];
      setEmployees(employeeList);

      const attendanceRows = Array.isArray(attendanceRes?.data?.data)
        ? attendanceRes.data.data
        : [];
      const leaveRows = Array.isArray(leavesRes?.data?.data)
        ? leavesRes.data.data
        : [];

      initializeAttendance(employeeList, attendanceRows, leaveRows);
    } catch (err) {
      console.error('loadEmployeesAndAttendance error:', err);
      setError('Failed to load attendance/leave data from server.');
    } finally {
      setLoading(false);
    }
  };
  //loads employee and attendance data for today.
  useEffect(() => {
    loadEmployeesAndAttendance(today);
  }, []);


  //loads employee and attendance data when the date changes.
  useEffect(() => {
    loadEmployeesAndAttendance(date);
  }, [date]);

  const [submitted, setSubmitted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  //Calculates work hours.
  const getWorkHours = (timeIn, timeOut) => {
    if (!timeIn || !timeOut) return 0;
    const [inH, inM] = timeIn.split(':').map(Number);
    const [outH, outM] = timeOut.split(':').map(Number);
    return ((outH * 60 + outM) - (inH * 60 + inM)) / 60;
  };

  /**
 * OT Calculator: Calculates overtime hours if they work past 5:00 PM.
 */
  const calculateOtHours = (timeIn, timeOut, role) => {
    if (!timeIn || !timeOut) return 0;
    const [outH, outM] = timeOut.split(':').map(Number);
    const outMinutes = outH * 60 + outM;
    const thresholdMinutes = 17 * 60; // 5:00 PM
    const overtimeMinutes = Math.max(0, outMinutes - thresholdMinutes);
    return Math.round((overtimeMinutes / 60) * 100) / 100;
  };

  /**
 * BUSINESS RULES ENGINE (Attendance):
 * 1. If employee is on approved leave -> Status is 'leave', inputs are disabled.
 * 2. If Time In is cleared -> Status becomes Absent.
 * 3. If Time In is entered -> Status becomes Present.
 * 4. If Status is set to Absent -> All time fields are cleared.
 * 5. OT is automatically calculated for Cashiers working past 5 PM.
 */
  const applyAttendanceRules = (record, role) => {
    const next = { ...record };

    // Priority 0: Approved Leave
    if (next.isOnLeave) {
      next.status = 'leave';
      next.timeIn = '';
      next.timeOut = '';
      next.otHours = 0;
      return next;
    }

    // Default state at the beginning of the day is Absent.
    if (!next.status) next.status = 'absent';

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

    // When Time Out is entered, decide Present based on worked hours.
    if (next.timeIn && next.timeOut) {
      const workedHours = getWorkHours(next.timeIn, next.timeOut);
      if (workedHours > 0) {
        next.status = 'present';
      }
    }

    // OT only applies when Present and Time Out is after 5:00 PM.
    if (next.status === 'present') {
      next.otHours = calculateOtHours(next.timeIn, next.timeOut, role);
    } else {
      next.otHours = 0;
    }

    return next;
  };
  //Updates the attendance record when a field is changed.
  const updateField = (id, field, value) => {
    const empRole = employees.find(e => e.id === String(id))?.role || '';
    setAttendance(prev => {
      const current = prev[id] || {};
      let newState;
      if (field !== 'status') {
        const updatedRecord = applyAttendanceRules({ ...current, [field]: value }, empRole);
        newState = {
          ...prev,
          [id]: updatedRecord,
        };
      } else {
        const nextStatus = value;
        const next = applyAttendanceRules({ ...current, status: nextStatus }, empRole);
        newState = { ...prev, [id]: next };
      }
      latestAttendanceRef.current = newState;
      return newState;
    });
  };

  const markAll = (status) => {
    setAttendance(prev => {
      const updated = { ...prev };
      employees.forEach(emp => {
        const existing = updated[emp.id] || {};
        const nextTimeIn = (status === 'absent') ? '' : (existing.timeIn || '');
        const nextTimeOut = (status === 'absent') ? '' : (existing.timeOut || '');
        updated[emp.id] = {
          ...existing,
          status,
          // When marking all absent, clear times; otherwise preserve user's entries
          timeIn: nextTimeIn,
          timeOut: nextTimeOut,
          otHours: status === 'present' ? calculateOtHours(nextTimeIn, nextTimeOut, emp.role) : 0,
        };
        updated[emp.id] = applyAttendanceRules(updated[emp.id], emp.role);
      });
      latestAttendanceRef.current = updated;
      return updated;
    });
  };

  /**
 * Submit Handler: Sends the daily attendance records to the backend in bulk.
 * Recalculates total work hours and OT before sending.
 */
  const handleSubmit = async () => {
    if (document.activeElement && document.activeElement.blur) {
      document.activeElement.blur();
    }

    try {
      const today = new Date().toISOString().split('T')[0];
      if (date > today) {
        alert('Cannot mark attendance for future dates');
        return;
      }
      
      const currentAttendance = latestAttendanceRef.current;
      const records = employees.map((emp) => {
        const rec = currentAttendance[emp.id] || { status: 'absent', timeIn: '', timeOut: '', otHours: 0 };
        const totalHours = getWorkHours(rec.timeIn, rec.timeOut);
        return {
          Employee_ID: Number(emp.id),
          Attendance_Date: date,
          Check_In_Time: rec.timeIn || null,
          Check_Out_Time: rec.timeOut || null,
          Total_Hours: totalHours > 0 ? Number(totalHours.toFixed(2)) : null,
          Status: rec.status === 'leave' ? 'Leave' : mapStatusToApi(rec.status),
          Is_Late: false,
          Late_Minutes: 0,
          Is_Overtime: Number(rec.otHours || 0) > 0,
          Overtime_Hours: Number(rec.otHours || 0),
          Marked_By: 'Manual',
          Cards_Produced: rec.cardsProduced || 0
        };
      });

      const response = await axios.post(`${API_BASE}/attendance/bulk`, { records });
      const results = Array.isArray(response?.data?.results) ? response.data.results : [];
      const failed = results.filter((r) => !r.ok);
      if (failed.length > 0) {
        const first = failed[0];
        throw new Error(first.error || 'Some attendance rows failed to save');
      }

      // Reload from DB so UI always reflects exactly what is stored in ATTENDANCE table.
      await loadEmployeesAndAttendance(date);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err) {
      console.error('handleSubmit attendance error:', err);
      alert(err?.response?.data?.message || err?.message || 'Failed to save attendance');
    }
  };



  const summary = {
    present: employees.filter(e => attendance[e.id]?.status === 'present').length,
    absent: employees.filter(e => attendance[e.id]?.status === 'absent').length,
    leave: employees.filter(e => attendance[e.id]?.status === 'leave').length,
  };

  const filtered = employees.filter(e =>
    e.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusColors = {
    present: { bg: 'rgba(34,197,94,0.15)', border: '#22c55e', color: '#16a34a' },
    absent: { bg: 'rgba(239,68,68,0.15)', border: '#ef4444', color: '#dc2626' },
    leave: { bg: 'rgba(59,130,246,0.15)', border: '#3b82f6', color: '#2563eb' },
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

        {error && <p style={{ margin: '8px 0 0 0', color: '#b91c1c', fontSize: '13px' }}>{error}</p>}
      </div>

      {/* Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '20px',
        marginBottom: '28px'
      }}>
        <HrStatsCard
          title="Present Today"
          value={summary.present}
          subtitle="Staff present on premises"
          icon="✅"
          color="green"
        />
        <HrStatsCard
          title="On Leave"
          value={summary.leave}
          subtitle="Approved leave requests"
          icon="📋"
          color="blue"
        />
        <HrStatsCard
          title="Absent"
          value={summary.absent}
          subtitle="Employees not reported"
          icon="❌"
          color="red"
        />
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
            max={today}
            onChange={e => setDate(e.target.value)}
            style={{
              padding: '7px 12px', borderRadius: '8px', border: '1px solid #d1d5db',
              fontSize: '13px', color: '#1a1a2e', outline: 'none',
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>Mark All:</span>
          {['present', 'absent'].map(s => (
            <button key={s} onClick={() => markAll(s)} style={{
              padding: '6px 14px', borderRadius: '8px',
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
        {loading && <div style={{ padding: '8px 20px', color: '#64748b' }}>Loading attendance...</div>}
        {/*Header and row grids now both use the same 8-column layout (removed duplicate Profile column) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '40px 1fr 120px 160px 110px 110px 100px 120px',
          background: '#f8fafc', borderBottom: '2px solid #e8e8e8',
          padding: '12px 20px', gap: '12px', alignItems: 'center',
        }}>
          {['#', 'Employee', 'Role', 'Status', 'Time In', 'Time Out', 'OT Hours', 'Tea Cost'].map(h => (
            <div key={h} style={{
              fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
              color: '#0d9488',
              background: '#f0fdfa',
              padding: '8px 10px',
              borderRadius: '8px',
              border: '1px solid #ccfbf1',
            }}>{h}</div>
          ))}
        </div>

        {/* Table Rows */}
        {filtered.map((emp, index) => {
          const rec = attendance[emp.id] || { status: 'absent', timeIn: '', timeOut: '', otHours: 0 };

          const roleText = String(emp.role || '').toLowerCase();
          const isExcludedFromTea = roleText.includes('cashier') || roleText.includes('manager') || roleText.includes('admin');
          const workedHours = getWorkHours(rec.timeIn, rec.timeOut);

          let teaCost = '—';
          if (rec.status === 'present' && !isExcludedFromTea && rec.timeIn && rec.timeOut && workedHours >= 4) {
            const [outH, outM] = rec.timeOut.split(':').map(Number);
            const outMinutes = outH * 60 + outM;
            teaCost = outMinutes > (18 * 60) ? 'Rs 450' : 'Rs 60';
          }

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
                background: '#f8fafc', border: '1px solid #e2e8f0',
              }}>
                {rec.isOnLeave ? (
                  <div style={{
                    flex: 1, textAlign: 'center', padding: '6px 0',
                    background: statusColors.leave.bg, color: statusColors.leave.color,
                    borderRadius: '6px', fontSize: '12px', fontWeight: 800,
                    border: `1px solid ${statusColors.leave.border}30`
                  }}>
                    ON LEAVE ({rec.leaveType})
                  </div>
                ) : (
                  ['present', 'absent'].map(s => (
                    <button key={s} onClick={() => updateField(emp.id, 'status', s)} style={{
                      flex: 1,
                      padding: '6px 12px', borderRadius: '6px', border: `2px solid ${statusColors[s].border}`,
                      fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                      background: rec.status === s ? statusColors[s].border : 'transparent',
                      color: rec.status === s ? '#fff' : statusColors[s].border,
                      boxShadow: rec.status === s ? `0 4px 12px ${statusColors[s].border}40` : 'none',
                      transform: rec.status === s ? 'scale(1.02)' : 'scale(1)',
                      transition: 'all 0.2s',
                    }}>
                      {s === 'present' ? '✓ Present' : '✘ Absent'}
                    </button>
                  ))
                )}
              </div>

              {/* Time In — parsed AM/PM text box */}
              <TimeInputAMPM
                value={rec.timeIn}
                disabled={rec.isOnLeave}
                onChange={val => updateField(emp.id, 'timeIn', val)}
                placeholder="08:00 AM"
              />

              {/* Time Out — parsed AM/PM text box */}
              <TimeInputAMPM
                value={rec.timeOut}
                disabled={!rec.timeIn || rec.isOnLeave}
                onChange={val => updateField(emp.id, 'timeOut', val)}
                placeholder="05:00 PM"
              />

              {/* OT Hours */}
              <input
                type="number"
                min="0"
                value={rec.otHours}
                disabled={rec.isOnLeave}
                onChange={e => updateField(emp.id, 'otHours', Number(e.target.value))}
                placeholder="0"
                style={{
                  padding: '5px 8px', borderRadius: '6px',
                  border: '1px solid #d1d5db', fontSize: '12px',
                  background: rec.isOnLeave ? '#f1f5f9' : '#fff',
                  color: rec.isOnLeave ? '#94a3b8' : '#1a1a2e',
                  outline: 'none', width: '60px',
                }}
              />

              {/* Tea Cost — auto-applied for present employees */}
              <div style={{
                fontSize: '12px', fontWeight: 700,
                color: teaCost === 'Rs 450' ? '#f59e0b' : (teaCost === 'Rs 60' ? '#16a34a' : '#94a3b8'),
                background: teaCost !== '—' ? (teaCost === 'Rs 450' ? 'rgba(245,158,11,0.1)' : 'rgba(34,197,94,0.1)') : 'transparent',
                padding: teaCost !== '—' ? '4px 10px' : '0',
                borderRadius: '6px',
                border: teaCost !== '—' ? `1px solid ${teaCost === 'Rs 450' ? '#f59e0b30' : '#16a34a30'}` : 'none'
              }}>{teaCost}</div>
            </div>
          );
        })}
      </div>

      {/* Submit Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '14px' }}>
        {submitted && (
          <span style={{
            fontSize: '13px', fontWeight: 600, color: '#059669',
            background: '#ecfdf5', padding: '8px 16px', borderRadius: '8px',
          }}>
            Attendance saved successfully!
          </span>
        )}
        <button onClick={handleSubmit} style={{
          padding: '12px 32px', borderRadius: '12px', border: 'none',
          background: 'linear-gradient(135deg, #0d9488, #0f766e)',
          color: '#fff', fontSize: '14px', fontWeight: 700,
          cursor: 'pointer', boxShadow: '0 4px 12px rgba(13,148,136,0.3)',
          transition: 'transform 0.2s, box-shadow 0.2s',
        }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(13,148,136,0.4)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(13,148,136,0.3)'; }}
        >
          Save Attendance
        </button>
      </div>
    </div>
  );
};

export default Attendance;