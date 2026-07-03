import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/apiEndpoints';

const API_BASE = API_ENDPOINTS.hr.root;

//set up variables for functions within leave page
const Leave = () => {
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [searchTerm, setSearchTerm] = useState('');
  const [employees, setEmployees] = useState([]);
  const [attendances, setAttendances] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);

  // Add Leave Modal State
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    Employee_ID: '',
    Leave_Type: 'Casual',
    Start_Date: today,
    End_Date: today,
    Reason: ''
  });

  /**
 * Data Fetcher: Loads Employees, Attendance, and Leave records for the selected date.
 */
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

  }, [date]);

  const leaveEmployees = React.useMemo(() => {
    const list = leaves.map(l => {
      const emp = employees.find(e => String(e.Employee_ID) === String(l.Employee_ID)) || {};
      return {
        id: l.Employee_ID,
        leaveId: l.Leave_ID,
        leaveStatus: l.Status,
        name: emp.Full_Name || 'Unknown',
        role: emp.Role || '—',
        email: emp.Email || '—',
        phone: emp.Contact_Phone || '—',
        leaveReason: l.Reason || '',
        leaveType: l.Leave_Type,
        startDate: l.Start_Date,
        endDate: l.End_Date,
        totalDays: l.Total_Days,
        appliedDate: l.Applied_Date,
        department: emp.Department || '—'
      };
    });

    if (!searchTerm.trim()) return list;
    const q = searchTerm.toLowerCase();
    return list.filter(e =>
      String(e.name || '').toLowerCase().includes(q) ||
      String(e.role || '').toLowerCase().includes(q) ||
      String(e.email || '').toLowerCase().includes(q) ||
      String(e.phone || '').toLowerCase().includes(q) ||
      String(e.leaveReason || '').toLowerCase().includes(q)
    );
  }, [employees, leaves, searchTerm]);

  /**
 * Submission Handler: Calculates total leave days and sends the new request to the backend.
 */
  const handleAddLeave = async (e) => {
    e.preventDefault();
    try {
      if (!formData.Employee_ID) return alert('Please select an employee');

      const start = new Date(formData.Start_Date);
      const end = new Date(formData.End_Date);
      const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

      const payload = {
        ...formData,
        Total_Days: totalDays,
        Applied_Date: today
      };

      await axios.post(`${API_BASE}/leaves`, payload);
      alert('Leave request submitted successfully!');
      setShowModal(false);
      setFormData({
        Employee_ID: '',
        Leave_Type: 'Casual',
        Start_Date: today,
        End_Date: today,
        Reason: ''
      });
      fetchData();
    } catch (error) {
      console.error('Error adding leave:', error);
      alert(error.response?.data?.message || 'Failed to submit leave request');
    }
  };

  /**
 * Status Updater: Approves or rejects a leave request via the backend API.
 */
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
            background: 'linear-gradient(135deg, #0d9488, #0f172a)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Leave Details
          </span>
        </h1>
        <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '13px' }}>
          Manage employee leave requests and approvals
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
            Total Results: {leaveEmployees.length}
          </div>

          <button
            onClick={() => setShowModal(true)}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: 'linear-gradient(135deg, #059669, #10b981)',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(16,185,129,0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>+</span> Add Leave Request
          </button>

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
          gridTemplateColumns: '60px 1.5fr 1fr 150px 1.8fr 1.5fr',
          background: '#f8fafc',
          borderBottom: '2px solid #e8e8e8',
          padding: '12px 20px',
          gap: '12px',
          alignItems: 'center',
        }}>
          {['ID', 'Employee', 'Type', 'Period', 'Reason', 'Status / Action'].map(h => (
            <div key={h} style={{
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#0d9488',
              background: '#f0fdfa',
              padding: '8px 10px',
              borderRadius: '8px',
              border: '1px solid #ccfbf1',
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
                  <div style={{ fontSize: '11px', color: '#64748b' }}>{emp.email}</div>
                </div>
                <div style={{ fontSize: '12px', color: '#475569', fontWeight: 700 }}>{emp.leaveType}</div>
                <div style={{ fontSize: '11px', color: '#475569' }}>
                  <div style={{ fontWeight: 600 }}>{emp.startDate}</div>
                  <div style={{ fontWeight: 400, color: '#94a3b8' }}>to {emp.endDate}</div>
                  <div style={{ fontWeight: 800, color: '#0d9488', marginTop: '2px' }}>{emp.totalDays} Day(s)</div>
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#4b5563',
                  fontStyle: 'italic',
                  paddingRight: '10px',
                  lineHeight: '1.4'
                }}>
                  {emp.leaveReason || <span style={{ color: '#94a3b8' }}>No reason provided</span>}
                </div>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', justifyContent: 'center' }}>
                  {emp.leaveStatus === 'Pending' ? (
                    <>
                      <button
                        onClick={() => updateLeaveStatus(emp.leaveId, 'approve')}
                        style={{
                          padding: '5px 10px', background: '#10b981', color: '#fff', border: 'none',
                          borderRadius: '6px', cursor: 'pointer', fontSize: '10px', fontWeight: 800,
                          boxShadow: '0 2px 4px rgba(16,185,129,0.2)', transition: 'all 0.2s'
                        }}
                      >APPROVE</button>
                      <button
                        onClick={() => updateLeaveStatus(emp.leaveId, 'reject')}
                        style={{
                          padding: '5px 10px', background: '#ef4444', color: '#fff', border: 'none',
                          borderRadius: '6px', cursor: 'pointer', fontSize: '10px', fontWeight: 800,
                          boxShadow: '0 2px 4px rgba(239,68,68,0.2)', transition: 'all 0.2s'
                        }}
                      >REJECT</button>
                    </>
                  ) : (
                    <div style={{
                      padding: '4px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: 800, textAlign: 'center',
                      textTransform: 'uppercase', minWidth: '80px',
                      background: emp.leaveStatus === 'Approved' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                      color: emp.leaveStatus === 'Approved' ? '#059669' : '#dc2626',
                      border: `1px solid ${emp.leaveStatus === 'Approved' ? '#10b981' : '#ef4444'}30`
                    }}>
                      {emp.leaveStatus}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Leave Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: '#fff', padding: '32px', borderRadius: '16px', width: '100%', maxWidth: '450px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)'
          }}>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: 800, color: '#1e3a5f' }}>Add Leave Request</h2>
            <form onSubmit={handleAddLeave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#4b5563', marginBottom: '6px' }}>Employee</label>
                <select
                  value={formData.Employee_ID}
                  onChange={e => setFormData({ ...formData, Employee_ID: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }}
                >
                  <option value="">Select Employee</option>
                  {employees.map(emp => (
                    <option key={emp.Employee_ID} value={emp.Employee_ID}>{emp.Full_Name} ({emp.Employee_Code})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#4b5563', marginBottom: '6px' }}>Leave Type</label>
                  <select
                    value={formData.Leave_Type}
                    onChange={e => setFormData({ ...formData, Leave_Type: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }}
                  >
                    <option value="Casual">Casual</option>
                    <option value="Sick">Sick</option>
                    <option value="Annual">Annual</option>
                    <option value="Unpaid">Unpaid</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#4b5563', marginBottom: '6px' }}>Start Date</label>
                  <input
                    type="date"
                    value={formData.Start_Date}
                    onChange={e => setFormData({ ...formData, Start_Date: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#4b5563', marginBottom: '6px' }}>End Date</label>
                <input
                  type="date"
                  value={formData.End_Date}
                  onChange={e => setFormData({ ...formData, End_Date: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#4b5563', marginBottom: '6px' }}>Reason</label>
                <textarea
                  value={formData.Reason}
                  onChange={e => setFormData({ ...formData, Reason: e.target.value })}
                  placeholder="Why is this employee taking leave?"
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', height: '80px', resize: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #d1d5db', background: '#fff', fontWeight: 700, cursor: 'pointer' }}
                >Cancel</button>
                <button
                  type="submit"
                  style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #1e3a5f, #3b82f6)', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
                >Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leave;
