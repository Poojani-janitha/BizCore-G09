// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import HrStatsCard from '../../component/HR/Dashboard/HrStatsCard';
// import { generateEmployees, EMP_KEY } from '../../storeContext/employeesData';

// const Attendance = () => {
//   const navigate = useNavigate();
//   const today = new Date().toISOString().split('T')[0];
//   const [employees, setEmployees] = useState([]);
//   const [date, setDate] = useState(today);
//   const [attendance, setAttendance] = useState({});

//   useEffect(() => {
//     const stored = localStorage.getItem(EMP_KEY);
//     let list = [];
//     if (stored) {
//       try { list = JSON.parse(stored); } catch { list = generateEmployees(); }
//     } else {
//       list = generateEmployees();
//       localStorage.setItem(EMP_KEY, JSON.stringify(list));
//     }
//     setEmployees(list);
//     setAttendance(
//       Object.fromEntries(
//         list.map(emp => [
//           emp.id,
//           // ✅ FIX: timeIn and timeOut start empty — only user can fill them
//           { status: 'present', timeIn: '', timeOut: '', otHours: 0 },
//         ])
//       )
//     );
//   }, []);

//   const [submitted, setSubmitted] = useState(false);
//   const [searchTerm, setSearchTerm] = useState('');

//   const updateField = (id, field, value) => {
//     setAttendance(prev => {
//       const current = prev[id] || {};
//       if (field !== 'status') {
//         return {
//           ...prev,
//           [id]: { ...current, [field]: value },
//         };
//       }

//       const nextStatus = value;
//       const next = { ...current, status: nextStatus };

//       // Absent: clear times + OT
//       if (nextStatus === 'absent') {
//         next.timeIn = '';
//         next.timeOut = '';
//         next.otHours = 0;
//       }

//       // ✅ FIX: Present — preserve whatever the user has typed, never auto-fill
//       if (nextStatus === 'present') {
//         if (typeof next.otHours !== 'number') next.otHours = 0;
//       }

//       // ✅ FIX: Leave — preserve whatever the user has typed, clear OT only
//       if (nextStatus === 'leave') {
//         next.otHours = 0;
//       }

//       return { ...prev, [id]: next };
//     });
//   };

//   const markAll = (status) => {
//     setAttendance(prev => {
//       const updated = { ...prev };
//       employees.forEach(emp => {
//         const existing = updated[emp.id] || {};
//         updated[emp.id] = {
//           ...existing,
//           status,
//           // ✅ FIX: When marking all absent, clear times; otherwise preserve user's entries
//           timeIn: status === 'absent' ? '' : (existing.timeIn || ''),
//           timeOut: status === 'absent' ? '' : (existing.timeOut || ''),
//           otHours: status === 'present' ? (existing.otHours ?? 0) : 0,
//         };
//       });
//       return updated;
//     });
//   };

//   const getWorkHours = (timeIn, timeOut) => {
//     if (!timeIn || !timeOut) return 0;
//     const [inH, inM] = timeIn.split(':').map(Number);
//     const [outH, outM] = timeOut.split(':').map(Number);
//     return ((outH * 60 + outM) - (inH * 60 + inM)) / 60;
//   };

//   const isHalfDay = (id) => {
//     const { timeIn, timeOut, status } = attendance[id] || {};
//     if (status !== 'present') return false;
//     const hours = getWorkHours(timeIn, timeOut);
//     // Only flag as half-day if times are actually entered and hours < 4
//     return timeIn && timeOut && hours > 0 && hours < 4;
//   };

//   const handleSubmit = () => {
//     setSubmitted(true);
//     setTimeout(() => setSubmitted(false), 3000);
//     console.log('Attendance Data:', { date, attendance });
//     // TODO: send to backend via fetch/axios
//   };

//   const summary = {
//     present: employees.filter(e => attendance[e.id]?.status === 'present' && !isHalfDay(e.id)).length,
//     halfDay: employees.filter(e => isHalfDay(e.id)).length,
//     leave: employees.filter(e => attendance[e.id]?.status === 'leave').length,
//     absent: employees.filter(e => attendance[e.id]?.status === 'absent').length,
//   };

//   const filtered = employees.filter(e =>
//     e.name.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const statusColors = {
//     present: { bg: 'rgba(34,197,94,0.15)', border: '#22c55e', color: '#16a34a' },
//     leave: { bg: 'rgba(59,130,246,0.15)', border: '#3b82f6', color: '#2563eb' },
//     absent: { bg: 'rgba(239,68,68,0.15)', border: '#ef4444', color: '#dc2626' },
//   };

//   return (
//     <div style={{
//       minHeight: '100vh',
//       background: '#f5f6fa',
//       padding: '28px 32px',
//       fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
//     }}>

//       {/* Header */}
//       <div style={{ marginBottom: '24px' }}>
//         <h1 style={{
//           margin: 0, fontSize: '26px', fontWeight: 800, letterSpacing: '-0.5px',
//         }}>
//           <span style={{
//             background: 'linear-gradient(135deg, #1e3a5f, #3b82f6)',
//             WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
//           }}>Daily Attendance</span>
//         </h1>
//         <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '13px' }}>
//           Mark attendance for all employees · Work hours: 8:00 AM – 4:00 PM
//         </p>
//       </div>

//       {/* Summary Cards */}
//       <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginBottom: '22px' }}>
//         <HrStatsCard title="Present Today" value={summary.present} subtitle="Fingerprint verified" icon="✅" color="green" />
//         <HrStatsCard title="Half Day" value={summary.halfDay} subtitle="Less than 4 hours" icon="🕐" color="blue" />
//         <HrStatsCard title="On Leave" value={summary.leave} subtitle="Approved leaves" icon="📋" color="amber" />
//         <HrStatsCard title="Absent" value={summary.absent} subtitle="No show" icon="❌" color="red" />
//       </div>

//       {/* Controls */}
//       <div style={{
//         background: '#fff', borderRadius: '12px', border: '1px solid #e8e8e8',
//         padding: '16px 20px', marginBottom: '18px',
//         display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center',
//         boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
//       }}>
//         <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
//           <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>Date:</label>
//           <input
//             type="date"
//             value={date}
//             onChange={e => setDate(e.target.value)}
//             style={{
//               padding: '7px 12px', borderRadius: '8px', border: '1px solid #d1d5db',
//               fontSize: '13px', color: '#1a1a2e', outline: 'none',
//             }}
//           />
//         </div>

//         <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
//           <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>Mark All:</span>
//           {['present', 'leave', 'absent'].map(s => (
//             <button key={s} onClick={() => markAll(s)} style={{
//               padding: '6px 14px', borderRadius: '8px', border: 'none',
//               background: statusColors[s].bg, color: statusColors[s].color,
//               fontSize: '12px', fontWeight: 600, cursor: 'pointer',
//               border: `1px solid ${statusColors[s].border}20`,
//             }}>
//               {s.charAt(0).toUpperCase() + s.slice(1)}
//             </button>
//           ))}
//         </div>

//         <input
//           type="text"
//           placeholder="🔍 Search employee..."
//           value={searchTerm}
//           onChange={e => setSearchTerm(e.target.value)}
//           style={{
//             padding: '7px 14px', borderRadius: '8px', border: '1px solid #d1d5db',
//             fontSize: '13px', outline: 'none', minWidth: '200px',
//           }}
//         />
//       </div>

//       {/* Attendance Table */}
//       <div style={{
//         background: '#fff', borderRadius: '12px', border: '1px solid #e8e8e8',
//         boxShadow: '0 1px 4px rgba(0,0,0,0.05)', overflow: 'hidden', marginBottom: '20px',
//       }}>
//         {/* ✅ FIX: Header and row grids now both use the same 8-column layout (removed duplicate Profile column) */}
//         <div style={{
//           display: 'grid',
//           gridTemplateColumns: '40px 1fr 120px 160px 110px 110px 100px 120px',
//           background: '#f8fafc', borderBottom: '2px solid #e8e8e8',
//           padding: '12px 20px', gap: '12px', alignItems: 'center',
//         }}>
//           {['#', 'Employee', 'Role', 'Status', 'Time In', 'Time Out', 'OT Hours', 'Tea Cost'].map(h => (
//             <div key={h} style={{
//               fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
//               color: '#1e40af',
//               background: 'rgba(59,130,246,0.12)',
//               padding: '8px 10px',
//               borderRadius: '8px',
//               border: '1px solid rgba(59,130,246,0.3)',
//             }}>{h}</div>
//           ))}
//         </div>

//         {/* Table Rows */}
//         {filtered.map((emp, index) => {
//           const rec = attendance[emp.id] || { status: 'present', timeIn: '', timeOut: '', otHours: 0 };
//           const halfDay = isHalfDay(emp.id);

//           // ✅ FIX: Tea cost = Rs 60 automatically when status is 'present' (half-day gets Rs 30)
//           const teaCost =
//             rec.status === 'present' && !halfDay ? 'Rs 60' :
//             rec.status === 'present' && halfDay ? 'Rs 30' :
//             '—';

//           const rowBg = index % 2 === 0 ? '#fff' : '#fafbfc';

//           return (
//             <div key={emp.id} style={{
//               display: 'grid',
//               gridTemplateColumns: '40px 1fr 120px 160px 110px 110px 100px 120px',
//               padding: '12px 20px', gap: '12px', alignItems: 'center',
//               background: rowBg, borderBottom: '1px solid #f1f5f9',
//               transition: 'background 0.15s',
//             }}
//               onMouseEnter={e => e.currentTarget.style.background = '#f0f7ff'}
//               onMouseLeave={e => e.currentTarget.style.background = rowBg}
//             >
//               {/* # */}
//               <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>{emp.id}</div>

//               {/* Name */}
//               <div>
//                 <div style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a2e' }}>{emp.name}</div>
//                 {halfDay && (
//                   <span style={{ fontSize: '10px', color: '#2563eb', fontWeight: 600 }}>Half Day</span>
//                 )}
//               </div>

//               {/* Role */}
//               <div style={{
//                 fontSize: '11px', fontWeight: 600,
//                 color: emp.role === 'Monthly Salaried' ? '#8b5cf6' : '#64748b',
//               }}>{emp.role}</div>

//               {/* Status */}
//               <div style={{
//                 display: 'flex', gap: '6px',
//                 padding: '8px 10px', borderRadius: '8px',
//                 background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)',
//               }}>
//                 {['present', 'leave', 'absent'].map(s => (
//                   <button key={s} onClick={() => updateField(emp.id, 'status', s)} style={{
//                     padding: '6px 12px', borderRadius: '6px', border: `2px solid ${statusColors[s].border}`,
//                     fontSize: '12px', fontWeight: 700, cursor: 'pointer',
//                     background: rec.status === s ? statusColors[s].bg : `${statusColors[s].border}15`,
//                     color: rec.status === s ? statusColors[s].color : statusColors[s].border,
//                     boxShadow: rec.status === s ? `0 2px 4px ${statusColors[s].border}30` : 'none',
//                   }}>
//                     {s === 'present' ? '✓' : s === 'leave' ? 'L' : 'A'}
//                   </button>
//                 ))}
//               </div>

//               {/* Time In — placeholder only, no default value */}
//               <input
//                 type="time"
//                 value={rec.timeIn}
//                 disabled={rec.status === 'absent'}
//                 onChange={e => updateField(emp.id, 'timeIn', e.target.value)}
//                 placeholder="--:--"
//                 style={{
//                   padding: '5px 8px', borderRadius: '6px',
//                   border: '1px solid #d1d5db', fontSize: '12px',
//                   background: rec.status === 'absent' ? '#f1f5f9' : '#fff',
//                   color: rec.status === 'absent' ? '#94a3b8' : '#1a1a2e',
//                   outline: 'none', width: '90px',
//                 }}
//               />

//               {/* Time Out — placeholder only, no default value */}
//               <input
//                 type="time"
//                 value={rec.timeOut}
//                 disabled={rec.status === 'absent'}
//                 onChange={e => updateField(emp.id, 'timeOut', e.target.value)}
//                 placeholder="--:--"
//                 style={{
//                   padding: '5px 8px', borderRadius: '6px',
//                   border: '1px solid #d1d5db', fontSize: '12px',
//                   background: rec.status === 'absent' ? '#f1f5f9' : '#fff',
//                   color: rec.status === 'absent' ? '#94a3b8' : '#1a1a2e',
//                   outline: 'none', width: '90px',
//                 }}
//               />

//               {/* OT Hours */}
//               <input
//                 type="number"
//                 min="0"
//                 max="3"
//                 value={rec.otHours}
//                 disabled={rec.status !== 'present'}
//                 onChange={e => updateField(emp.id, 'otHours', Number(e.target.value))}
//                 placeholder="0"
//                 style={{
//                   padding: '5px 8px', borderRadius: '6px',
//                   border: '1px solid #d1d5db', fontSize: '12px',
//                   background: rec.status !== 'present' ? '#f1f5f9' : '#fff',
//                   color: rec.status !== 'present' ? '#94a3b8' : '#1a1a2e',
//                   outline: 'none', width: '60px',
//                 }}
//               />

//               {/* ✅ Tea Cost — auto-applied for present employees */}
//               <div style={{
//                 fontSize: '12px', fontWeight: 700,
//                 color: teaCost === 'Rs 60' ? '#16a34a' : teaCost === 'Rs 30' ? '#2563eb' : '#94a3b8',
//                 background: teaCost !== '—' ? (teaCost === 'Rs 60' ? 'rgba(34,197,94,0.1)' : 'rgba(59,130,246,0.1)') : 'transparent',
//                 padding: teaCost !== '—' ? '4px 8px' : '0',
//                 borderRadius: '6px',
//               }}>{teaCost}</div>
//             </div>
//           );
//         })}
//       </div>

//       {/* Submit Button */}
//       <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '14px' }}>
//         {submitted && (
//           <span style={{
//             fontSize: '13px', fontWeight: 600, color: '#16a34a',
//             background: 'rgba(34,197,94,0.1)', padding: '8px 16px', borderRadius: '8px',
//           }}>
//             ✅ Attendance saved successfully!
//           </span>
//         )}
//         <button onClick={handleSubmit} style={{
//           padding: '12px 32px', borderRadius: '10px', border: 'none',
//           background: 'linear-gradient(135deg, #1e3a5f, #3b82f6)',
//           color: '#fff', fontSize: '14px', fontWeight: 700,
//           cursor: 'pointer', boxShadow: '0 4px 12px rgba(59,130,246,0.3)',
//           transition: 'transform 0.2s, box-shadow 0.2s',
//         }}
//           onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(59,130,246,0.4)'; }}
//           onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(59,130,246,0.3)'; }}
//         >
//           Save Attendance
//         </button>
//       </div>
//     </div>
//   );
// };

// export default Attendance;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import HrStatsCard from '../../component/HR/Dashboard/HrStatsCard';

const API_BASE = 'http://localhost:5000/api/hr';

const Attendance = () => {
  const today = new Date().toISOString().split('T')[0];
  const [employees, setEmployees] = useState([]);
  const [date, setDate] = useState(today);
  const [attendance, setAttendance] = useState({});
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

  const initializeAttendance = (employeeList, attendanceRows = []) => {
    const byEmployeeId = {};
    attendanceRows.forEach((row) => {
      const empId = String(row.Employee_ID);
      byEmployeeId[empId] = {
        attendanceId: row.Attendance_ID,
        status: mapStatusToUi(row.Status),
        timeIn: row.Check_In_Time || '',
        timeOut: row.Check_Out_Time || '',
        otHours: Number(row.Overtime_Hours || 0),
      };
    });

    setAttendance(
      Object.fromEntries(
        employeeList.map((emp) => [
          emp.id,
          byEmployeeId[emp.id] || { status: 'absent', timeIn: '', timeOut: '', otHours: 0 },
        ])
      )
    );
  };

  const loadEmployeesAndAttendance = async (selectedDate) => {
    try {
      setLoading(true);
      setError('');
      const [employeesRes, attendanceRes] = await Promise.all([
        axios.get(`${API_BASE}/employees`),
        axios.get(`${API_BASE}/attendance`, { params: { from: selectedDate, to: selectedDate } }),
      ]);

      const employeeList = Array.isArray(employeesRes?.data?.data)
        ? employeesRes.data.data.map(mapEmployee)
        : [];
      setEmployees(employeeList);

      const attendanceRows = Array.isArray(attendanceRes?.data?.data)
        ? attendanceRes.data.data
        : [];
      initializeAttendance(employeeList, attendanceRows);
    } catch (err) {
      console.error('loadEmployeesAndAttendance error:', err);
      setError('Failed to load attendance data from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployeesAndAttendance(today);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadEmployeesAndAttendance(date);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  const [submitted, setSubmitted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const getWorkHours = (timeIn, timeOut) => {
    if (!timeIn || !timeOut) return 0;
    const [inH, inM] = timeIn.split(':').map(Number);
    const [outH, outM] = timeOut.split(':').map(Number);
    return ((outH * 60 + outM) - (inH * 60 + inM)) / 60;
  };

  const calculateOtHours = (timeIn, timeOut, role) => {
    if (role !== 'Cashier') return 0;
    if (!timeIn || !timeOut) return 0;
    const [outH, outM] = timeOut.split(':').map(Number);
    const outMinutes = outH * 60 + outM;
    const thresholdMinutes = 17 * 60; // 5:00 PM
    const overtimeMinutes = Math.max(0, outMinutes - thresholdMinutes);
    return Math.round((overtimeMinutes / 60) * 100) / 100;
  };

  const applyAttendanceRules = (record, role) => {
    const next = { ...record };

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

    // OT only applies when Present, role is Cashier, and Time Out is after 4:00 PM.
    if (next.status === 'present' && role === 'Cashier') {
      next.otHours = calculateOtHours(next.timeIn, next.timeOut, role);
    } else {
      next.otHours = 0;
    }

    return next;
  };

  const updateField = (id, field, value) => {
    const empRole = employees.find(e => e.id === String(id))?.role || '';
    setAttendance(prev => {
      const current = prev[id] || {};
      if (field !== 'status') {
        const updatedRecord = applyAttendanceRules({ ...current, [field]: value }, empRole);
        return {
          ...prev,
          [id]: updatedRecord,
        };
      }

      const nextStatus = value;
      const next = applyAttendanceRules({ ...current, status: nextStatus }, empRole);
      return { ...prev, [id]: next };
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
          // ✅ FIX: When marking all absent, clear times; otherwise preserve user's entries
          timeIn: nextTimeIn,
          timeOut: nextTimeOut,
          otHours: status === 'present' ? calculateOtHours(nextTimeIn, nextTimeOut, emp.role) : 0,
        };
        updated[emp.id] = applyAttendanceRules(updated[emp.id], emp.role);
      });
      return updated;
    });
  };

  const handleSubmit = async () => {
    try {
      const records = employees.map((emp) => {
        const rec = attendance[emp.id] || { status: 'absent', timeIn: '', timeOut: '', otHours: 0 };
        const totalHours = getWorkHours(rec.timeIn, rec.timeOut);
        return {
          Employee_ID: Number(emp.id),
          Attendance_Date: date,
          Check_In_Time: rec.timeIn || null,
          Check_Out_Time: rec.timeOut || null,
          Total_Hours: totalHours > 0 ? Number(totalHours.toFixed(2)) : null,
          Status: mapStatusToApi(rec.status),
          Is_Late: false,
          Late_Minutes: 0,
          Is_Overtime: Number(rec.otHours || 0) > 0,
          Overtime_Hours: Number(rec.otHours || 0),
          Marked_By: 'Manual'
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

  const handleDelete = async (empId) => {
    const record = attendance[empId];
    if (!record || !record.attendanceId) {
      // Just clear local UI state if it hasn't been saved to DB yet
      setAttendance(prev => ({
        ...prev,
        [empId]: { status: 'absent', timeIn: '', timeOut: '', otHours: 0 }
      }));
      return;
    }

    if (!window.confirm('Are you sure you want to delete this attendance record?')) return;

    try {
      setLoading(true);
      await axios.delete(`${API_BASE}/attendance/${record.attendanceId}`);

      // Update local state to reflect deletion
      setAttendance(prev => ({
        ...prev,
        [empId]: { status: 'absent', timeIn: '', timeOut: '', otHours: 0 }
      }));

      // Reload to ensure totals are correct
      loadEmployeesAndAttendance(date);
    } catch (err) {
      console.error('handleDelete error:', err);
      alert(err?.response?.data?.message || 'Failed to delete attendance record');
    } finally {
      setLoading(false);
    }
  };

  const summary = {
    present: employees.filter(e => attendance[e.id]?.status === 'present').length,
    absent: employees.filter(e => attendance[e.id]?.status === 'absent').length,
  };

  const filtered = employees.filter(e =>
    e.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusColors = {
    present: { bg: 'rgba(34,197,94,0.15)', border: '#22c55e', color: '#16a34a' },
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
            background: 'linear-gradient(135deg, #0d9488, #0f172a)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>Daily Attendance</span>
        </h1>
        <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '13px' }}>
          Mark attendance for all employees · Work hours: 8:00 AM – 5:00 PM
        </p>
        {error && <p style={{ margin: '8px 0 0 0', color: '#b91c1c', fontSize: '13px' }}>{error}</p>}
      </div>

      {/* Summary Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(2, 1fr)', 
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
          const isExcludedFromTea = roleText.includes('cashier') || roleText.includes('manager');
          const workedHours = getWorkHours(rec.timeIn, rec.timeOut);
          
          let teaCost = '—';
          if (rec.status === 'present' && !isExcludedFromTea && rec.timeIn && rec.timeOut && workedHours >= 4) {
            const [outH, outM] = rec.timeOut.split(':').map(Number);
            const outMinutes = outH * 60 + outM;
            teaCost = outMinutes > (17 * 60) ? 'Rs 450' : 'Rs 60';
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
                {['present', 'absent'].map(s => (
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
                ))}
              </div>

              {/* Time In — placeholder only, no default value */}
              <input
                type="time"
                value={rec.timeIn}
                onChange={e => updateField(emp.id, 'timeIn', e.target.value)}
                placeholder="--:--"
                style={{
                  padding: '5px 8px', borderRadius: '6px',
                  border: '1px solid #d1d5db', fontSize: '12px',
                  background: '#fff',
                  color: '#1a1a2e',
                  outline: 'none', width: '90px',
                }}
              />

              {/* Time Out — placeholder only, no default value */}
              <input
                type="time"
                value={rec.timeOut}
                disabled={!rec.timeIn}
                onChange={e => updateField(emp.id, 'timeOut', e.target.value)}
                placeholder="--:--"
                style={{
                  padding: '5px 8px', borderRadius: '6px',
                  border: '1px solid #d1d5db', fontSize: '12px',
                  background: !rec.timeIn ? '#f1f5f9' : '#fff',
                  color: !rec.timeIn ? '#94a3b8' : '#1a1a2e',
                  outline: 'none', width: '90px',
                }}
              />

               {/* OT Hours */}
              <input
                type="number"
                min="0"
                value={rec.otHours}
                disabled={emp.role !== 'Cashier'}
                onChange={e => updateField(emp.id, 'otHours', Number(e.target.value))}
                placeholder="0"
                style={{
                  padding: '5px 8px', borderRadius: '6px',
                  border: '1px solid #d1d5db', fontSize: '12px',
                  background: emp.role !== 'Cashier' ? '#f1f5f9' : '#fff',
                  color: emp.role !== 'Cashier' ? '#94a3b8' : '#1a1a2e',
                  outline: 'none', width: '60px',
                }}
              />

              {/* ✅ Tea Cost — auto-applied for present employees */}
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
            ✅ Attendance saved successfully!
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