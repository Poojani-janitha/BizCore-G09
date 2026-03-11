import React, { useState, useEffect, useRef } from 'react';
import { generateEmployees, EMP_KEY } from '../../storeContext/employeesData';

const EmployeesPage = () => {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', role: 'Staff', email: '', phone: '', department: 'HR', image: '' });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const dragItem = useRef();
  const dragOverItem = useRef();
  const fileInputRef = useRef();
  const imageTargetIdRef = useRef(null);

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
      setEmployees(updated);
      localStorage.setItem(EMP_KEY, JSON.stringify(updated));
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
    const stored = localStorage.getItem(EMP_KEY);
    if (stored) {
      try { setEmployees(JSON.parse(stored)); } catch { setEmployees(generateEmployees()); }
    } else {
      const gen = generateEmployees();
      setEmployees(gen);
      localStorage.setItem(EMP_KEY, JSON.stringify(gen));
    }
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
    const updated = employees.map(emp =>
      String(emp.id) === String(editingId) ? { ...emp, ...editForm } : emp
    );
    setEmployees(updated);
    localStorage.setItem(EMP_KEY, JSON.stringify(updated));
    setEditingId(null);
  };

  const updateEditField = (field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const updateAddFormField = (field, value) => {
    setAddForm(prev => ({ ...prev, [field]: value }));
  };

  const addEmployee = (e) => {
    e?.stopPropagation();
    if (!addForm.name?.trim()) return;
    const maxId = employees.reduce((m, emp) => Math.max(m, Number(emp.id) || 0), 0);
    const newEmp = {
      id: String(maxId + 1),
      name: addForm.name.trim(),
      role: addForm.role || 'Staff',
      email: addForm.email?.trim() || `${addForm.name.trim().split(' ')[0].toLowerCase()}@shanel.local`,
      phone: addForm.phone?.trim() || '',
      department: addForm.department || 'HR',
      image: addForm.image || '',
    };
    const updated = [...employees, newEmp];
    setEmployees(updated);
    localStorage.setItem(EMP_KEY, JSON.stringify(updated));
    setAddForm({ name: '', role: 'Staff', email: '', phone: '', department: 'HR', image: '' });
    setShowAddForm(false);
  };

  const cancelAdd = () => {
    setShowAddForm(false);
    setAddForm({ name: '', role: 'Staff', email: '', phone: '', department: 'HR', image: '' });
  };

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f5f6fa',
      padding: '28px 32px',
      fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
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
          Employee directory · Manage profiles and roles
        </p>
      </div>

      <div style={{
        marginBottom: '22px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
        alignItems: 'center',
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
        <span style={{ fontSize: '13px', color: '#64748b' }}>Tip: drag cards to rearrange · Click picture to change photo · Click Edit to update profile.</span>
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
                setEmployees(_employees);
                try { localStorage.setItem(EMP_KEY, JSON.stringify(_employees)); } catch {}
              }}
              style={{ cursor: searchTerm ? 'default' : 'grab', minHeight: '200px' }}
            >
              <div className="card-body d-flex flex-column align-items-center text-center pt-4 pb-3">
                <div
                  onClick={e => triggerImagePick(emp.id, e)}
                  onMouseDown={e => e.stopPropagation()}
                  style={{
                    width: 96,
                    height: 96,
                    borderRadius: '50%',
                    overflow: 'hidden',
                    flexShrink: 0,
                    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: '24px',
                    fontWeight: 700,
                    position: 'relative',
                    cursor: 'pointer',
                    marginBottom: '12px',
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
                  <h5 className="card-title mb-1">{emp.name}</h5>
                  <p className="mb-0"><small className="text-muted">{emp.role}</small></p>
                  <p className="mb-0"><small className="text-muted">{emp.email}</small></p>
                  <button className="btn btn-outline-primary btn-sm py-0 px-2 mt-2" onClick={e => startEdit(emp, e)}>Edit</button>
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
                  zIndex: 100,
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
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmployeesPage;
