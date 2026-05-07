import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api/hr';

const Leave = () => {
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [searchTerm, setSearchTerm] = useState('');
  const [employees, setEmployees] = useState([]);
  const [attendances, setAttendances] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [empRes, attRes, leaveRes] = await Promise.all([
        axios.get(`${API_BASE}/employees`),
        axios.get(`${API_BASE}/attendance`, { params: { from: date, to: date } }),
        axios.get(`${API_BASE}/leaves`, { params: { from: date, to: date } })
      ]);
      setEmployees(empRes.data?.data || []);
      setAttendances(attRes.data?.data || []);
      setLeaves(leaveRes.data?.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  const leaveEmployees = React.useMemo(() => {
    const filteredLeaves = attendances
      .filter(a => String(a.Status).toLowerCase() === 'leave')
      .map(a => {
        const emp = employees.find(e => String(e.Employee_ID) === String(a.Employee_ID)) || {};
        
        const leaveRecord = leaves.find(l => 
          String(l.Employee_ID) === String(a.Employee_ID) && 
          new Date(l.Start_Date) <= new Date(date) && 
          new Date(l.End_Date) >= new Date(date)
        );

        return {
          id: a.Employee_ID,
          attendanceId: a.Attendance_ID,
          leaveId: leaveRecord?.Leave_ID,
          leaveStatus: leaveRecord?.Status || null,
          name: emp.Full_Name || 'Unknown',
          role: emp.Role || '—',
          email: emp.Email || '—',
          phone: emp.Contact_Phone || '—',
          leaveReason: leaveRecord?.Reason || a.Notes || '',
        };
      });
      
    if (!searchTerm.trim()) return filteredLeaves;
    const q = searchTerm.toLowerCase();
    return filteredLeaves.filter(e =>
      String(e.name || '').toLowerCase().includes(q) ||
      String(e.role || '').toLowerCase().includes(q) ||
      String(e.email || '').toLowerCase().includes(q) ||
      String(e.phone || '').toLowerCase().includes(q) ||
      String(e.leaveReason || '').toLowerCase().includes(q)
    );
  }, [attendances, employees, leaves, searchTerm, date]);

  const updateReason = (attendanceId, reason) => {
    setAttendances(prev => prev.map(a => a.Attendance_ID === attendanceId ? { ...a, Notes: reason } : a));
  };

  const saveLeave = async (emp) => {
    try {
      // 1. Update Attendance Note
      await axios.put(`${API_BASE}/attendance/${emp.attendanceId}`, { Notes: emp.leaveReason });

      // 2. Create EmployeeLeave record
      const payload = {
        Employee_ID: emp.id,
        Leave_Type: 'Casual',
        Start_Date: date,
        End_Date: date,
        Total_Days: 1,
        Reason: emp.leaveReason || 'Manual Leave',
        Applied_Date: today
      };
      await axios.post(`${API_BASE}/leaves`, payload);
      alert('Leave saved successfully!');
      fetchData(); // Reload to get the new leave record
    } catch (error) {
      console.error('Error saving leave:', error);
      alert('Failed to save leave');
    }
  };

  const updateLeaveStatus = async (leaveId, action) => {
    try {
      const endpoint = action === 'approve' ? 'approve' : 'reject';
      const payload = action === 'reject' ? { Rejection_Reason: 'Rejected by HR' } : {};
      await axios.patch(`${API_BASE}/leaves/${leaveId}/${endpoint}`, payload);
      alert(`Leave ${action}d successfully!`);
      fetchData();
    } catch (error) {
      console.error(`Error ${action}ing leave:`, error);
      alert(`Failed to ${action} leave`);
    }
  };

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
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="text"
                    value={emp.leaveReason}
                    onChange={(e) => updateReason(emp.attendanceId, e.target.value)}
                    placeholder="Enter leave reason..."
                    disabled={emp.leaveStatus && emp.leaveStatus !== 'Pending'}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: '1px solid #d1d5db',
                      fontSize: '12px',
                      outline: 'none',
                      width: '100%',
                      background: (emp.leaveStatus && emp.leaveStatus !== 'Pending') ? '#f1f5f9' : '#fff',
                      color: (emp.leaveStatus && emp.leaveStatus !== 'Pending') ? '#94a3b8' : '#1a1a2e',
                    }}
                  />
                  {!emp.leaveId ? (
                    <button 
                      onClick={() => saveLeave(emp)}
                      style={{
                        padding: '6px 12px',
                        background: 'linear-gradient(135deg, #1e3a5f, #3b82f6)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 600,
                        whiteSpace: 'nowrap'
                      }}
                    >
                      Save
                    </button>
                  ) : emp.leaveStatus === 'Pending' ? (
                    <>
                      <button 
                        onClick={() => updateLeaveStatus(emp.leaveId, 'approve')}
                        style={{
                          padding: '6px 10px', background: '#22c55e', color: '#fff', border: 'none', 
                          borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 600
                        }}
                      >Approve</button>
                      <button 
                        onClick={() => updateLeaveStatus(emp.leaveId, 'reject')}
                        style={{
                          padding: '6px 10px', background: '#ef4444', color: '#fff', border: 'none', 
                          borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 600
                        }}
                      >Reject</button>
                    </>
                  ) : (
                    <span style={{
                      padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700,
                      background: emp.leaveStatus === 'Approved' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                      color: emp.leaveStatus === 'Approved' ? '#16a34a' : '#dc2626'
                    }}>
                      {emp.leaveStatus}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Leave;
