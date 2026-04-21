import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { generateEmployees, EMP_KEY } from '../../storeContext/employeesData';

const EmployeeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem(EMP_KEY);
    let list = [];
    if (stored) {
      try { list = JSON.parse(stored); } catch { list = generateEmployees(); }
    } else {
      list = generateEmployees();
      localStorage.setItem(EMP_KEY, JSON.stringify(list));
    }

    const found = list.find(e => String(e.id) === String(id));
    setEmployee(found || null);
  }, [id]);

  const handleChange = (field, value) => setEmployee(prev => ({ ...prev, [field]: value }));

  const handleSave = () => {
    if (!employee) return;
    const stored = localStorage.getItem(EMP_KEY);
    let list = stored ? JSON.parse(stored) : generateEmployees();
    const idx = list.findIndex(e => String(e.id) === String(employee.id));
    if (idx >= 0) list[idx] = employee; else list.push(employee);
    localStorage.setItem(EMP_KEY, JSON.stringify(list));
    navigate('/hr/employees');
  };

  if (!employee) return <div className="p-4">Employee not found.</div>;

  return (
    <div className="p-4" style={{ backgroundColor: '#faf9f6', minHeight: '10vh' }}>
      <h2 className="mb-4">Edit Profile - {employee.name}</h2>
      <div className="row">
        <div className="col-md-6">
          <div className="mb-3">
            <label className="form-label">Name</label>
            <input className="form-control" value={employee.name} onChange={e => handleChange('name', e.target.value)} />
          </div>
          <div className="mb-3">
            <label className="form-label">Role</label>
            <input className="form-control" value={employee.role} onChange={e => handleChange('role', e.target.value)} />
          </div>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input className="form-control" value={employee.email} onChange={e => handleChange('email', e.target.value)} />
          </div>
          <div className="mb-3">
            <label className="form-label">Phone</label>
            <input className="form-control" value={employee.phone} onChange={e => handleChange('phone', e.target.value)} />
          </div>
          <div className="mb-3">
            <label className="form-label">Department</label>
            <input className="form-control" value={employee.department} onChange={e => handleChange('department', e.target.value)} />
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-primary" onClick={handleSave}>Save</button>
            <button className="btn btn-secondary" onClick={() => navigate('/hr/employees')}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetail;
