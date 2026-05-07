// import React, { useState, useEffect, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { generateEmployees, EMP_KEY } from '../../storeContext/employeesData';

// const EmployeesPage = () => {
//   const navigate = useNavigate();
//   const [employees, setEmployees] = useState([]);
//   const dragItem = useRef();
//   const dragOverItem = useRef();

//   useEffect(() => {
//     const stored = localStorage.getItem(EMP_KEY);
//     if (stored) {
//       try { setEmployees(JSON.parse(stored)); } catch { setEmployees(generateEmployees()); }
//     } else {
//       const gen = generateEmployees();
//       setEmployees(gen);
//       localStorage.setItem(EMP_KEY, JSON.stringify(gen));
//     }
//     // no selected panel in this layout
//   }, []);

//   return (
//     <div style={{
//       minHeight: '100vh',
//       background: '#f5f6fa',
//       padding: '28px 32px',
//       fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
//     }}>
//       <div style={{ marginBottom: '18px' }}>
//         <h1 style={{
//           margin: 0,
//           fontSize: '22px',
//           fontWeight: 700,
//           color: '#1a1a2e'
//         }}>
//           <span style={{
//             background: 'linear-gradient(135deg, #1e3a5f, #3b82f6)',
//             WebkitBackgroundClip: 'text',
//             WebkitTextFillColor: 'transparent',
//           }}>Employees</span>
//         </h1>
//       </div>

//       <div className="mb-2 text-muted">Tip: drag cards to rearrange employee order.</div>
//       <div className="row g-3">
//         {employees.map((emp, index) => (
//           <div className="col-sm-6 col-md-4" key={emp.id}
//             onDragEnter={() => (dragOverItem.current = index)}>
//             <div
//               className="card"
//               draggable
//               onDragStart={(e) => { dragItem.current = index; e.dataTransfer.effectAllowed = 'move'; }}
//               onDragOver={(e) => e.preventDefault()}
//               onDragEnd={() => {
//                 const _employees = [...employees];
//                 const draggedItemContent = _employees.splice(dragItem.current, 1)[0];
//                 _employees.splice(dragOverItem.current, 0, draggedItemContent);
//                 dragItem.current = null;
//                 dragOverItem.current = null;
//                 setEmployees(_employees);
//                 try { localStorage.setItem(EMP_KEY, JSON.stringify(_employees)); } catch {}
//               }}
//               style={{ cursor: 'grab' }}
//               onClick={() => navigate(`/hr/employees/${emp.id}`)}
//             >
//               <div className="card-body">
//                 <h5 className="card-title mb-1">{emp.name}</h5>
//                 <p className="mb-0"><small className="text-muted">{emp.role}</small></p>
//                 <p className="mb-0"><small className="text-muted">{emp.email}</small></p>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default EmployeesPage;


import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api/hr';

const mapEmployeeFromApi = (emp) => ({
  id: String(emp.Employee_ID),
  name: emp.Full_Name || '',
  role: emp.Role || 'Staff',
  email: emp.Email || '',
  phone: emp.Contact_Phone || '',
  department: emp.Department || '',
  image: emp.Photo_Path || '',
  employeeCode: emp.Employee_Code || '',
  salaryCategory: emp.Salary_Category || '',
  status: emp.Status || 'Active',
  raw: emp,
});

const EmployeesPage = () => {
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [viewingEmployee, setViewingEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', role: 'Staff', email: '', phone: '', department: 'HR', image: '' });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const dragItem = useRef();
  const dragOverItem = useRef();
  const fileInputRef = useRef();
  const imageTargetIdRef = useRef(null);
  const persistEmployees = (updatedEmployees) => {
    setEmployees(updatedEmployees);
    window.dispatchEvent(new Event('employees-updated'));
  };

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await axios.get(`${API_BASE}/employees`);
      const list = Array.isArray(response?.data?.data)
        ? response.data.data.map(mapEmployeeFromApi)
        : [];
      setEmployees(list);
    } catch (err) {
      console.error('fetchEmployees error:', err);
      setError('Failed to load employees from server.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (empId, e) => {
    e?.stopPropagation();
    const file = e?.target?.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      const updated = employees.map(emp =>
        String(emp.id) === String(empId) ? { ...emp, image: dataUrl } : emp
      );
      persistEmployees(updated);
      if (String(editingId) === String(empId)) setEditForm(prev => ({ ...prev, image: dataUrl }));
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const triggerImagePick = (empId, e) => {
    e?.stopPropagation();
    imageTargetIdRef.current = empId;
    fileInputRef.current?.click();
  };

  const onFileInputChange = (e) => {
    const empId = imageTargetIdRef.current;
    if (!empId) return;
    handleImageChange(empId, e);
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const getInitials = (name) => {
    const parts = String(name || '').trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return (name || '?').slice(0, 2).toUpperCase();
  };

  const startEdit = (emp, e) => {
    e.stopPropagation();
    setEditingId(emp.id);
    setEditForm({ name: emp.name, role: emp.role, email: emp.email || '', phone: emp.phone || '', department: emp.department || '', image: emp.image || '' });
  };

  const cancelEdit = (e) => {
    e?.stopPropagation();
    setEditingId(null);
  };

  const saveEdit = (e) => {
    e?.stopPropagation();
    if (!editingId) return;
    (async () => {
      try {
        const payload = {
          Full_Name: editForm.name?.trim() || '',
          Role: editForm.role || 'Staff',
          Email: editForm.email?.trim() || null,
          Contact_Phone: editForm.phone?.trim() || '',
          Department: editForm.department || 'HR',
        };
        await axios.put(`${API_BASE}/employees/${editingId}`, payload);
        await fetchEmployees();
        setEditingId(null);
      } catch (err) {
        console.error('saveEdit error:', err);
        alert(err?.response?.data?.message || 'Failed to update employee');
      }
    })();
  };

  const updateEditField = (field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const updateAddFormField = (field, value) => {
    setAddForm(prev => ({ ...prev, [field]: value }));
  };

  const addEmployee = (e) => {
    e?.stopPropagation();
    if (!addForm.name?.trim() || !addForm.phone?.trim()) {
      alert('Name and phone are required');
      return;
    }

    (async () => {
      try {
        const now = new Date();
        const employeeCode = `EMP-${Date.now().toString().slice(-6)}`;
        const hireDate = now.toISOString().slice(0, 10);
        const payload = {
          Employee_Code: employeeCode,
          Full_Name: addForm.name.trim(),
          Role: addForm.role || 'Staff',
          Email: addForm.email?.trim() || null,
          Contact_Phone: addForm.phone?.trim(),
          Department: addForm.department || 'HR',
          Salary_Category: 'Monthly_Fixed',
          Hire_Date: hireDate,
          Employee_Type: 'Permanent',
          Status: 'Active'
        };
        await axios.post(`${API_BASE}/employees`, payload);
        await fetchEmployees();
        setAddForm({ name: '', role: 'Staff', email: '', phone: '', department: 'HR', image: '' });
        setShowAddForm(false);
      } catch (err) {
        console.error('addEmployee error:', err);
        alert(err?.response?.data?.message || 'Failed to add employee');
      }
    })();
  };

  const cancelAdd = () => {
    setShowAddForm(false);
    setAddForm({ name: '', role: 'Staff', email: '', phone: '', department: 'HR', image: '' });
  };

  const deleteEmployee = (emp, e) => {
    e?.stopPropagation();
    const confirmed = window.confirm(`Delete employee "${emp.name}"?`);
    if (!confirmed) return;
    (async () => {
      try {
        await axios.delete(`${API_BASE}/employees/${emp.id}`);
        const updated = employees.filter(item => String(item.id) !== String(emp.id));
        persistEmployees(updated);
        if (String(editingId) === String(emp.id)) {
          setEditingId(null);
          setEditForm({});
        }
      } catch (err) {
        console.error('deleteEmployee error:', err);
        alert(err?.response?.data?.message || 'Failed to delete employee');
      }
    })();
  };

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderDetailValue = (value) => {
    if (value === null || value === undefined || value === '') return '-';
    return String(value);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f5f6fa',
      padding: '28px 32px',
      fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
      width: '100%',
      maxWidth: '100%',
      boxSizing: 'border-box',
      overflowX: 'auto',
      position: 'relative',
      zIndex: 1,
    }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{
          margin: 0,
          fontSize: '26px',
          fontWeight: 800,
          letterSpacing: '-0.5px',
        }}>
          <span style={{
            background: 'linear-gradient(135deg, #1e3a5f, #3b82f6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>Employees</span>
        </h1>
        <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '13px' }}>
          Manage employee profiles and details
        </p>
        {error && <p style={{ margin: '8px 0 0 0', color: '#b91c1c', fontSize: '13px' }}>{error}</p>}
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
        <input
          type="text"
          placeholder="🔍 Search by name..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{
            padding: '8px 14px',
            borderRadius: '8px',
            border: '1px solid #d1d5db',
            fontSize: '13px',
            outline: 'none',
            minWidth: '220px',
          }}
        />
        <button
          className="btn btn-success btn-sm"
          onClick={() => setShowAddForm(!showAddForm)}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          ➕ Add Employee
        </button>
      </div>

      {showAddForm && (
        <div style={{
          marginBottom: '22px',
          background: '#fff',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid #e8e8e8',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}>
          <h5 style={{ margin: '0 0 16px 0', color: '#1a1a2e', fontSize: '15px' }}>Add New Employee</h5>
          <div className="row g-2">
            <div className="col-12 col-md-4">
              <label className="form-label small mb-0">Name *</label>
              <input className="form-control form-control-sm" placeholder="Full name" value={addForm.name} onChange={e => updateAddFormField('name', e.target.value)} />
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label small mb-0">Role</label>
              <input className="form-control form-control-sm" placeholder="e.g. Staff, Manager" value={addForm.role} onChange={e => updateAddFormField('role', e.target.value)} />
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label small mb-0">Department</label>
              <input className="form-control form-control-sm" placeholder="e.g. HR" value={addForm.department} onChange={e => updateAddFormField('department', e.target.value)} />
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label small mb-0">Email</label>
              <input className="form-control form-control-sm" type="email" placeholder="email@shanel.local" value={addForm.email} onChange={e => updateAddFormField('email', e.target.value)} />
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label small mb-0">Phone</label>
              <input className="form-control form-control-sm" placeholder="+94-71-555-1234" value={addForm.phone} onChange={e => updateAddFormField('phone', e.target.value)} />
            </div>
          </div>
          <div className="d-flex gap-2 mt-3">
            <button className="btn btn-primary btn-sm" onClick={addEmployee} disabled={!addForm.name?.trim()}>Save Employee</button>
            <button className="btn btn-secondary btn-sm" onClick={cancelAdd}>Cancel</button>
          </div>
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={onFileInputChange}
      />
      <div style={{
        background: '#fff',
        borderRadius: '12px',
        border: '1px solid #e8e8e8',
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        padding: '16px',
      }}>
        {isLoading && <div style={{ padding: '8px', color: '#64748b' }}>Loading employees...</div>}
        <div className="row g-3">
          {filteredEmployees.map((emp, index) => (
            <div
              className="col-12 col-sm-6 col-lg-4"
              key={emp.id}
              style={{ position: 'relative' }}
              onDragEnter={() => (dragOverItem.current = index)}
            >
              <div
                className="card"
                draggable={!searchTerm}
                onDragStart={(e) => { if (!searchTerm) { dragItem.current = index; e.dataTransfer.effectAllowed = 'move'; } }}
                onDragOver={(e) => e.preventDefault()}
                onDragEnd={() => {
                  if (searchTerm) return;
                  const _employees = [...employees];
                  const draggedItemContent = _employees.splice(dragItem.current, 1)[0];
                  _employees.splice(dragOverItem.current, 0, draggedItemContent);
                  dragItem.current = null;
                  dragOverItem.current = null;
                  try { persistEmployees(_employees); } catch {}
                }}
                style={{
                  cursor: searchTerm ? 'default' : 'grab',
                  minHeight: '170px',
                  border: '1px solid #e8e8e8',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                }}
              >
                <div className="card-body d-flex flex-column align-items-center text-center pt-3 pb-2">
                  <div
                    onClick={e => triggerImagePick(emp.id, e)}
                    onMouseDown={e => e.stopPropagation()}
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: '50%',
                      overflow: 'hidden',
                      flexShrink: 0,
                      background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontSize: '20px',
                      fontWeight: 700,
                      position: 'relative',
                      cursor: 'pointer',
                      marginBottom: '10px',
                    }}
                    title="Click to change photo"
                  >
                    {emp.image ? (
                      <>
                        <img src={emp.image} alt={emp.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; e.target.nextElementSibling.style.display = 'flex'; }} />
                        <span style={{ position: 'absolute', inset: 0, display: 'none', alignItems: 'center', justifyContent: 'center' }}>{getInitials(emp.name)}</span>
                      </>
                    ) : (
                      getInitials(emp.name)
                    )}
                  </div>
                  <div className="w-100 text-center">
                    <h5 className="card-title mb-1" style={{ fontSize: '18px' }}>{emp.name}</h5>
                    <p className="mb-0"><small className="text-muted" style={{ fontSize: '12px' }}>{emp.role}</small></p>
                    <p className="mb-0"><small className="text-muted" style={{ fontSize: '12px' }}>{emp.email}</small></p>
                    <div className="d-flex justify-content-center gap-2 mt-2">
                      <button
                        className="btn btn-outline-secondary btn-sm py-0 px-2"
                        onClick={e => { e.stopPropagation(); setViewingEmployee(emp); }}
                      >
                        View
                      </button>
                      <button className="btn btn-outline-primary btn-sm py-0 px-2" onClick={e => startEdit(emp, e)}>Edit</button>
                      <button className="btn btn-outline-danger btn-sm py-0 px-2" onClick={e => deleteEmployee(emp, e)}>Delete</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Edit panel - appears under this card, overlays below (no layout shift) */}
              {editingId === emp.id && (
                <div
                  onClick={e => e.stopPropagation()}
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    marginTop: '4px',
                    background: '#fff',
                    borderRadius: '12px',
                    padding: '16px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                    border: '1px solid #e8e8e8',
                  zIndex: 10,
                  }}
                >
                  <div className="mb-2">
                    <label className="form-label small mb-0">Name</label>
                    <input className="form-control form-control-sm" value={editForm.name} onChange={e => updateEditField('name', e.target.value)} />
                  </div>
                  <div className="mb-2">
                    <label className="form-label small mb-0">Role</label>
                    <input className="form-control form-control-sm" value={editForm.role} onChange={e => updateEditField('role', e.target.value)} />
                  </div>
                  <div className="mb-2">
                    <label className="form-label small mb-0">Email</label>
                    <input className="form-control form-control-sm" value={editForm.email} onChange={e => updateEditField('email', e.target.value)} />
                  </div>
                  <div className="mb-2">
                    <label className="form-label small mb-0">Phone</label>
                    <input className="form-control form-control-sm" value={editForm.phone} onChange={e => updateEditField('phone', e.target.value)} />
                  </div>
                  <div className="mb-2">
                    <label className="form-label small mb-0">Department</label>
                    <input className="form-control form-control-sm" value={editForm.department} onChange={e => updateEditField('department', e.target.value)} />
                  </div>
                  <div className="mb-2">
                    <label className="form-label small mb-0">Profile photo</label>
                    <div onClick={e => triggerImagePick(emp.id, e)} style={{ cursor: 'pointer', display: 'inline-block' }} title="Click to change">
                      <div style={{
                        width: 64, height: 64, borderRadius: '50%', overflow: 'hidden',
                        background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontSize: '20px', fontWeight: 700, border: '2px solid #e8e8e8',
                      }}>
                        {editForm.image ? (
                          <img src={editForm.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          getInitials(editForm.name)
                        )}
                      </div>
                      <small className="d-block mt-1 text-muted">Click to change</small>
                    </div>
                  </div>
                  <div className="d-flex gap-2">
                    <button className="btn btn-primary btn-sm" onClick={saveEdit}>Save</button>
                    <button className="btn btn-secondary btn-sm" onClick={cancelEdit}>Cancel</button>
                    <button className="btn btn-danger btn-sm ms-auto" onClick={e => deleteEmployee(emp, e)}>Delete</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {viewingEmployee && (
        <div
          onClick={() => setViewingEmployee(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.45)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 'min(920px, 100%)',
              maxHeight: '85vh',
              overflowY: 'auto',
              background: '#fff',
              borderRadius: '14px',
              border: '1px solid #e8e8e8',
              boxShadow: '0 14px 40px rgba(0,0,0,0.25)',
              padding: '20px'
            }}
          >
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 style={{ margin: 0 }}>Employee Details</h4>
              <button className="btn btn-sm btn-outline-secondary" onClick={() => setViewingEmployee(null)}>Close</button>
            </div>

            <div className="row g-2">
              <div className="col-12 col-md-6"><strong>Employee ID:</strong> {renderDetailValue(viewingEmployee.raw?.Employee_ID)}</div>
              <div className="col-12 col-md-6"><strong>Employee Code:</strong> {renderDetailValue(viewingEmployee.raw?.Employee_Code)}</div>
              <div className="col-12 col-md-6"><strong>Full Name:</strong> {renderDetailValue(viewingEmployee.raw?.Full_Name)}</div>
              <div className="col-12 col-md-6"><strong>Name With Initials:</strong> {renderDetailValue(viewingEmployee.raw?.Name_With_Initials)}</div>
              <div className="col-12 col-md-6"><strong>NIC:</strong> {renderDetailValue(viewingEmployee.raw?.NIC)}</div>
              <div className="col-12 col-md-6"><strong>Date Of Birth:</strong> {renderDetailValue(viewingEmployee.raw?.Date_Of_Birth)}</div>
              <div className="col-12 col-md-6"><strong>Gender:</strong> {renderDetailValue(viewingEmployee.raw?.Gender)}</div>
              <div className="col-12 col-md-6"><strong>Marital Status:</strong> {renderDetailValue(viewingEmployee.raw?.Marital_Status)}</div>
              <div className="col-12 col-md-6"><strong>Contact Phone:</strong> {renderDetailValue(viewingEmployee.raw?.Contact_Phone)}</div>
              <div className="col-12 col-md-6"><strong>Contact Phone 2:</strong> {renderDetailValue(viewingEmployee.raw?.Contact_Phone_2)}</div>
              <div className="col-12 col-md-6"><strong>Email:</strong> {renderDetailValue(viewingEmployee.raw?.Email)}</div>
              <div className="col-12 col-md-6"><strong>City:</strong> {renderDetailValue(viewingEmployee.raw?.City)}</div>
              <div className="col-12 col-md-6"><strong>Department:</strong> {renderDetailValue(viewingEmployee.raw?.Department)}</div>
              <div className="col-12 col-md-6"><strong>Role:</strong> {renderDetailValue(viewingEmployee.raw?.Role)}</div>
              <div className="col-12 col-md-6"><strong>Salary Category:</strong> {renderDetailValue(viewingEmployee.raw?.Salary_Category)}</div>
              <div className="col-12 col-md-6"><strong>Employee Type:</strong> {renderDetailValue(viewingEmployee.raw?.Employee_Type)}</div>
              <div className="col-12 col-md-6"><strong>Hire Date:</strong> {renderDetailValue(viewingEmployee.raw?.Hire_Date)}</div>
              <div className="col-12 col-md-6"><strong>Confirmation Date:</strong> {renderDetailValue(viewingEmployee.raw?.Confirmation_Date)}</div>
              <div className="col-12 col-md-6"><strong>Status:</strong> {renderDetailValue(viewingEmployee.raw?.Status)}</div>
              <div className="col-12 col-md-6"><strong>EPF Eligible:</strong> {renderDetailValue(viewingEmployee.raw?.EPF_Eligible)}</div>
              <div className="col-12 col-md-6"><strong>ETF Eligible:</strong> {renderDetailValue(viewingEmployee.raw?.ETF_Eligible)}</div>
              <div className="col-12 col-md-6"><strong>EPF Number:</strong> {renderDetailValue(viewingEmployee.raw?.EPF_Number)}</div>
              <div className="col-12 col-md-6"><strong>Bank Name:</strong> {renderDetailValue(viewingEmployee.raw?.Bank_Name)}</div>
              <div className="col-12 col-md-6"><strong>Bank Account No:</strong> {renderDetailValue(viewingEmployee.raw?.Bank_Account_No)}</div>
              <div className="col-12 col-md-6"><strong>Bank Branch:</strong> {renderDetailValue(viewingEmployee.raw?.Bank_Branch)}</div>
              <div className="col-12 col-md-6"><strong>Bank Account Name:</strong> {renderDetailValue(viewingEmployee.raw?.Bank_Account_Name)}</div>
              <div className="col-12"><strong>Permanent Address:</strong> {renderDetailValue(viewingEmployee.raw?.Permanent_Address)}</div>
              <div className="col-12"><strong>Current Address:</strong> {renderDetailValue(viewingEmployee.raw?.Current_Address)}</div>
              <div className="col-12"><strong>Emergency Contact Name:</strong> {renderDetailValue(viewingEmployee.raw?.Emergency_Contact_Name)}</div>
              <div className="col-12"><strong>Emergency Contact Phone:</strong> {renderDetailValue(viewingEmployee.raw?.Emergency_Contact_Phone)}</div>
              <div className="col-12"><strong>Emergency Contact Relationship:</strong> {renderDetailValue(viewingEmployee.raw?.Emergency_Contact_Relationship)}</div>
              <div className="col-12"><strong>Notes:</strong> {renderDetailValue(viewingEmployee.raw?.Notes)}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeesPage;