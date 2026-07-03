import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
//viewing and editing an individual employee's profile.
const API_BASE = 'http://localhost:5000/api/hr';

const EmployeeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadEmployee = async () => {
      try {
        setError('');
        const response = await axios.get(`${API_BASE}/employees/${id}`);
        const emp = response?.data?.data;
        if (!emp) {
          setEmployee(null);
          return;
        }
        setEmployee({
          id: String(emp.Employee_ID),
          name: emp.Full_Name || '',
          role: emp.Role || '',
          email: emp.Email || '',
          phone: emp.Contact_Phone || '',
          department: emp.Department || '',
        });
      } catch (err) {
        console.error('loadEmployee error:', err);
        setError(err?.response?.data?.message || 'Failed to load employee');
        setEmployee(null);
      }
    };
    loadEmployee();
  }, [id]);

  const handleChange = (field, value) => setEmployee(prev => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    if (!employee) return;
    try {
      await axios.put(`${API_BASE}/employees/${employee.id}`, {
        Full_Name: employee.name?.trim() || '',
        Role: employee.role || '',
        Email: employee.email?.trim() || null,
        Contact_Phone: employee.phone?.trim() || '',
        Department: employee.department || 'HR',
      });
      navigate('/hr/employees');
    } catch (err) {
      console.error('save employee error:', err);
      setError(err?.response?.data?.message || 'Failed to save employee');
    }
  };

  if (!employee) return <div className="p-4">{error || 'Employee not found.'}</div>;

  return (
    <div className="p-4" style={{ backgroundColor: '#faf9f6', minHeight: '10vh' }}>
      <h2 className="mb-4">Edit Profile - {employee.name}</h2>
      {error && <div className="alert alert-danger py-2">{error}</div>}
      <div className="row">
        <div className="col-md-6">
          <div className="mb-3">
            <label className="form-label">Name</label>
            <input className="form-control" value={employee.name} onChange={e => handleChange('name', e.target.value)} />
          </div>
          <div className="mb-3">
            <label className="form-label">Role</label>
            <select className="form-select" value={employee.role} onChange={e => handleChange('role', e.target.value)}>
              <option value="Staff">Staff</option>
              <option value="Cashier">Cashier</option>
              <option value="Staff (Production)">Staff (Production)</option>
              <option value="Manager">Manager</option>
            </select>
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
