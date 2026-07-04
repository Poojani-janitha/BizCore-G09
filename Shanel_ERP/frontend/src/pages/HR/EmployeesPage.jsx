
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/apiEndpoints';

const API_BASE = API_ENDPOINTS.hr.root;

/**
 * Converts a backend Employee record to a frontend-friendly object.
 * Normalizes status and adds a 'raw' reference for deep access.
 */
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
  status: (emp.Status && emp.Status !== 'Active') ? 'Inactive' : 'Active',
  raw: emp,
});

const defaultAddForm = {
  Full_Name: '', Name_With_Initials: '', NIC: '', Date_Of_Birth: '', Gender: '', Marital_Status: '',
  Contact_Phone: '', Contact_Phone_2: '', Email: '', City: '', Department: 'HR', Role: 'Staff',
  Salary_Category: 'Monthly_Fixed', Employee_Type: 'Permanent', Hire_Date: '', Confirmation_Date: '',
  Status: 'Active', EPF_Eligible: 'No', ETF_Eligible: 'No', EPF_Number: '', ETF_Number: '', Bank_Name: '',
  Bank_Account_No: '', Bank_Branch: '', Bank_Account_Name: '', Permanent_Address: '',
  Current_Address: '', Emergency_Contact_Name: '', Emergency_Contact_Phone: '',
  Emergency_Contact_Relationship: '', Notes: '', image: ''
};

const EmployeesPage = () => {
  const [employees, setEmployees] = useState([]);
  const [statusFilter, setStatusFilter] = useState('Active');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [viewingEmployee, setViewingEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState(defaultAddForm);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [errors, setErrors] = useState({});
  const [nicCopyFile, setNicCopyFile] = useState(null);
  const [nicCopyPreview, setNicCopyPreview] = useState(null);
  const dragItem = useRef();
  const dragOverItem = useRef();
  const fileInputRef = useRef();
  const nicFileInputRef = useRef();
  const imageTargetIdRef = useRef(null);
  const persistEmployees = (updatedEmployees) => {
    setEmployees(updatedEmployees);
    window.dispatchEvent(new Event('employees-updated'));
  };

  /**
 * Data Fetcher: Loads the full list of employees from the backend.
 * Filters for 'Active' by default but can be extended.
 */
  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      setError('');
      const statusParam = statusFilter === 'All' ? '' : statusFilter;
      const response = await axios.get(`${API_BASE}/employees`, { params: { status: statusParam, _t: Date.now() } });
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

  /**
 * Photo Handler: Manages local preview and state updates for employee profile images.
 */
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
  }, [statusFilter]);

  const getInitials = (name) => {
    const parts = String(name || '').trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return (name || '?').slice(0, 2).toUpperCase();
  };

  const startEdit = (emp, e) => {
    e.stopPropagation();
    setEditingId(emp.id);
    setEditForm({
      name: emp.name,
      role: emp.role,
      email: emp.email || '',
      phone: emp.phone || '',
      department: emp.department || '',
      image: emp.image || '',
      epfEligible: emp.raw?.EPF_Eligible ? 'Yes' : 'No',
      etfEligible: emp.raw?.ETF_Eligible ? 'Yes' : 'No',
      epfNumber: emp.raw?.EPF_Number || '',
      etfNumber: emp.raw?.ETF_Number || '',
      bankName: emp.raw?.Bank_Name || '',
      bankAccountNo: emp.raw?.Bank_Account_No || '',
      bankBranch: emp.raw?.Bank_Branch || 'Balangoda',
      bankAccountName: emp.raw?.Bank_Account_Name || '',
      confirmationDate: emp.raw?.Confirmation_Date || '',
      employeeType: emp.raw?.Employee_Type || 'Permanent'
    });
  };

  const cancelEdit = (e) => {
    e?.stopPropagation();
    setEditingId(null);
  };

  const saveEdit = (e) => {
    e?.stopPropagation();
    if (!editingId) return;

    if (editForm.epfEligible === 'Yes' && !editForm.epfNumber?.trim()) {
      alert('EPF Number is required if EPF is eligible');
      return;
    }
    if (editForm.etfEligible === 'Yes' && !editForm.etfNumber?.trim()) {
      alert('ETF Number is required if ETF is eligible');
      return;
    }

    (async () => {
      try {
        const payload = {
          Full_Name: editForm.name?.trim() || '',
          Role: editForm.role || 'Staff',
          Email: editForm.email?.trim() || null,
          Contact_Phone: editForm.phone?.trim() || '',
          Department: editForm.department || 'HR',
          EPF_Eligible: editForm.epfEligible === 'Yes',
          ETF_Eligible: editForm.etfEligible === 'Yes',
          EPF_Number: editForm.epfNumber?.trim() || null,
          ETF_Number: editForm.etfNumber?.trim() || null,
          Bank_Name: editForm.bankName || null,
          Bank_Account_No: editForm.bankAccountNo?.trim() || null,
          Bank_Branch: editForm.bankBranch?.trim() || null,
          Bank_Account_Name: editForm.bankAccountName?.trim() || null,
          Confirmation_Date: editForm.confirmationDate || null,
          Employee_Type: editForm.employeeType || 'Permanent'
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
  //updates the data and clears error messages.
  const updateAddFormField = (field, value) => {
    setAddForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  /**
 * Validator: Performs frontend checks (Required fields, Email format, NIC format) before submission.
 */
  const validateForm = () => {
    const newErrors = {};
    const { Full_Name, Contact_Phone, Email, NIC, Hire_Date } = addForm;

    if (!Full_Name?.trim()) {
      newErrors.Full_Name = 'Required';
    } else if (Full_Name.trim().length < 3) {
      newErrors.Full_Name = 'Min 3 characters';
    }

    if (!Contact_Phone?.trim()) {
      newErrors.Contact_Phone = 'Required';
    } else if (!/^\+?[\d\s-]{10,}$/.test(Contact_Phone.trim())) {
      newErrors.Contact_Phone = 'Invalid format';
    }

    if (Email?.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(Email.trim())) {
      newErrors.Email = 'Invalid email';
    }

    if (!NIC?.trim()) {
      newErrors.NIC = 'Required';
    } else {
      const nic = NIC.trim();
      if (!/^\d{9}[vVxX]$/.test(nic) && !/^\d{12}$/.test(nic)) {
        newErrors.NIC = 'Invalid format';
      }
    }

    if (!Hire_Date) {
      newErrors.Hire_Date = 'Required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
 * Add Employee: Sends the new employee data to the backend.
 * Automatically handles the conversion of 'Hire Date' and UI reset on success.
 */
  const addEmployee = (e) => {
    e?.stopPropagation();
    if (!validateForm()) {
      return;
    }

    (async () => {
      try {
        const now = new Date();
        const hireDate = addForm.Hire_Date || now.toISOString().slice(0, 10);

        const payload = {
          ...addForm,
          Full_Name: addForm.Full_Name.trim(),
          Hire_Date: hireDate,
        };
        delete payload.image;

        const createRes = await axios.post(`${API_BASE}/employees`, payload);
        const newEmployeeId = createRes?.data?.data?.Employee_ID;

        // Upload NIC copy if a file was selected
        if (nicCopyFile && newEmployeeId) {
          const formData = new FormData();
          formData.append('nicCopy', nicCopyFile);
          await axios.post(`${API_BASE}/employees/${newEmployeeId}/nic-copy`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
        }

        await fetchEmployees();
        setAddForm(defaultAddForm);
        setNicCopyFile(null);
        setNicCopyPreview(null);
        setShowAddForm(false);
      } catch (err) {
        console.error('addEmployee error:', err);

        // Build error message with validation details
        let errorMsg = err?.response?.data?.message || 'Failed to add employee';

        // Add validation errors if present
        if (err?.response?.data?.validationErrors && Array.isArray(err.response.data.validationErrors)) {
          const validationDetails = err.response.data.validationErrors
            .map(e => `${e.path}: ${e.message}`)
            .join('\n');
          errorMsg = `${errorMsg}\n\n${validationDetails}`;
        }

        alert(errorMsg);
      }
    })();
  };

  const cancelAdd = () => {
    setShowAddForm(false);
    setAddForm(defaultAddForm);
    setErrors({});
    setNicCopyFile(null);
    setNicCopyPreview(null);
  };

  /**
 * Deactivation: Marks an employee as "Inactive" via the backend API.
 */
  const deleteEmployee = (emp, e) => {
    e?.stopPropagation();
    const confirmed = window.confirm(`Delete employee "${emp.name}"?`);
    if (!confirmed) return;
    (async () => {
      try {
        await axios.delete(`${API_BASE}/employees/${emp.id}`);
        let updated = employees.map(item =>
          String(item.id) === String(emp.id) ? { ...item, status: 'Inactive', raw: { ...item.raw, Status: 'Inactive' } } : item
        );
        if (statusFilter === 'Active') {
          updated = updated.filter(item => item.status === 'Active');
        }
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

  const activateEmployee = (emp, e) => {
    e?.stopPropagation();
    const confirmed = window.confirm(`Activate employee "${emp.name}"?`);
    if (!confirmed) return;
    (async () => {
      try {
        await axios.patch(`${API_BASE}/employees/${emp.id}/status`, { Status: 'Active' });
        const updated = employees.map(item =>
          String(item.id) === String(emp.id) ? { ...item, status: 'Active', raw: { ...item.raw, Status: 'Active' } } : item
        );
        persistEmployees(updated);
      } catch (err) {
        console.error('activateEmployee error:', err);
        alert(err?.response?.data?.message || 'Failed to activate employee');
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

        <div style={{ marginLeft: 'auto', marginRight: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Filter:</label>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '7px 12px',
              borderRadius: '8px',
              border: '1px solid #d1d5db',
              fontSize: '13px',
              outline: 'none',
              cursor: 'pointer',
              color: '#1a1a2e',
              background: '#fff'
            }}
          >
            <option value="Active">Active Employees</option>
            <option value="Inactive">Inactive Employees</option>
            <option value="All">All Employees</option>
          </select>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: '#0d9488',
            color: '#fff',
            border: 'none',
            padding: '8px 20px',
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(13,148,136,0.2)'
          }}
        >
          ➕ Add Employee
        </button>
      </div>

      {showAddForm && (
        <div
          onClick={cancelAdd}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.4)',
            backdropFilter: 'blur(8px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 'min(900px, 95%)',
              maxHeight: '90vh',
              overflowY: 'auto',
              background: '#fff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              padding: '28px',
            }}
          >
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 style={{ margin: 0, fontWeight: 800, color: '#0f172a' }}>Add New Employee</h4>
              <button className="btn btn-sm btn-outline-secondary" onClick={cancelAdd}>Close</button>
            </div>

            <div className="row g-3">
              <div className="col-12 col-md-8">
                <label className="form-label small mb-1 fw-semibold text-secondary" style={{ color: errors.Full_Name ? '#dc2626' : 'inherit' }}>
                  Full Name * {errors.Full_Name && <span style={{ fontSize: '10px', fontWeight: 700 }}>({errors.Full_Name})</span>}
                </label>
                <input className="form-control form-control-sm" style={{ borderColor: errors.Full_Name ? '#dc2626' : '#ced4da' }} placeholder="Full name" value={addForm.Full_Name} onChange={e => updateAddFormField('Full_Name', e.target.value)} />
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label small mb-1 fw-semibold text-secondary" style={{ color: errors.NIC ? '#dc2626' : 'inherit' }}>
                  NIC * {errors.NIC && <span style={{ fontSize: '10px', fontWeight: 700 }}>({errors.NIC})</span>}
                </label>
                <input className="form-control form-control-sm" style={{ borderColor: errors.NIC ? '#dc2626' : '#ced4da' }} placeholder="NIC number" value={addForm.NIC} onChange={e => updateAddFormField('NIC', e.target.value)} />
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label small mb-1 fw-semibold text-secondary">Date Of Birth</label>
                <input type="date" className="form-control form-control-sm" value={addForm.Date_Of_Birth} onChange={e => updateAddFormField('Date_Of_Birth', e.target.value)} />
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label small mb-1 fw-semibold text-secondary">Gender</label>
                <select className="form-select form-select-sm" value={addForm.Gender} onChange={e => updateAddFormField('Gender', e.target.value)}>
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label small mb-1 fw-semibold text-secondary">Marital Status</label>
                <select className="form-select form-select-sm" value={addForm.Marital_Status} onChange={e => updateAddFormField('Marital_Status', e.target.value)}>
                  <option value="">Select</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                </select>
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label small mb-1 fw-semibold text-secondary" style={{ color: errors.Contact_Phone ? '#dc2626' : 'inherit' }}>
                  Contact Phone * {errors.Contact_Phone && <span style={{ fontSize: '10px', fontWeight: 700 }}>({errors.Contact_Phone})</span>}
                </label>
                <input className="form-control form-control-sm" style={{ borderColor: errors.Contact_Phone ? '#dc2626' : '#ced4da' }} placeholder="+94-71-555-1234" value={addForm.Contact_Phone} onChange={e => updateAddFormField('Contact_Phone', e.target.value)} />
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label small mb-1 fw-semibold text-secondary">Contact Phone 2</label>
                <input className="form-control form-control-sm" placeholder="Alternative phone" value={addForm.Contact_Phone_2} onChange={e => updateAddFormField('Contact_Phone_2', e.target.value)} />
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label small mb-1 fw-semibold text-secondary" style={{ color: errors.Email ? '#dc2626' : 'inherit' }}>
                  Email {errors.Email && <span style={{ fontSize: '10px', fontWeight: 700 }}>({errors.Email})</span>}
                </label>
                <input type="email" className="form-control form-control-sm" style={{ borderColor: errors.Email ? '#dc2626' : '#ced4da' }} placeholder="email@example.com" value={addForm.Email} onChange={e => updateAddFormField('Email', e.target.value)} />
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label small mb-1 fw-semibold text-secondary">City</label>
                <input className="form-control form-control-sm" placeholder="City" value={addForm.City} onChange={e => updateAddFormField('City', e.target.value)} />
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label small mb-1 fw-semibold text-secondary">Role</label>
                <select className="form-select form-select-sm" value={addForm.Role} onChange={e => updateAddFormField('Role', e.target.value)}>
                  <option value="Staff">Staff</option>
                  <option value="Cashier">Cashier</option>
                  <option value="Staff (Production)">Staff (Production)</option>
                  <option value="Manager">Manager</option>
                </select>
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label small mb-1 fw-semibold text-secondary">Salary Category</label>
                <select className="form-select form-select-sm" value={addForm.Salary_Category} onChange={e => updateAddFormField('Salary_Category', e.target.value)}>
                  <option value="Monthly_Fixed">Monthly Fixed</option>
                  <option value="Production_Based">Production Based</option>
                </select>
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label small mb-1 fw-semibold text-secondary">Employee Type</label>
                <select className="form-select form-select-sm" value={addForm.Employee_Type} onChange={e => updateAddFormField('Employee_Type', e.target.value)}>
                  <option value="Permanent">Permanent</option>
                  <option value="Casual">Casual</option>
                  <option value="Contract">Contract</option>
                </select>
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label small mb-1 fw-semibold text-secondary" style={{ color: errors.Hire_Date ? '#dc2626' : 'inherit' }}>
                  Hire Date * {errors.Hire_Date && <span style={{ fontSize: '10px', fontWeight: 700 }}>({errors.Hire_Date})</span>}
                </label>
                <input type="date" className="form-control form-control-sm" style={{ borderColor: errors.Hire_Date ? '#dc2626' : '#ced4da' }} value={addForm.Hire_Date} onChange={e => updateAddFormField('Hire_Date', e.target.value)} />
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label small mb-1 fw-semibold text-secondary">Status</label>
                <select className="form-select form-select-sm" value={addForm.Status} onChange={e => updateAddFormField('Status', e.target.value)}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Terminated">Terminated</option>
                  <option value="Resigned">Resigned</option>
                </select>
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label small mb-1 fw-semibold text-secondary">Emergency Contact Name</label>
                <input className="form-control form-control-sm" placeholder="Emergency Contact" value={addForm.Emergency_Contact_Name} onChange={e => updateAddFormField('Emergency_Contact_Name', e.target.value)} />
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label small mb-1 fw-semibold text-secondary">Emergency Contact Phone</label>
                <input className="form-control form-control-sm" placeholder="Emergency Phone" value={addForm.Emergency_Contact_Phone} onChange={e => updateAddFormField('Emergency_Contact_Phone', e.target.value)} />
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label small mb-1 fw-semibold text-secondary">Emergency Contact Relationship</label>
                <input className="form-control form-control-sm" placeholder="Relationship" value={addForm.Emergency_Contact_Relationship} onChange={e => updateAddFormField('Emergency_Contact_Relationship', e.target.value)} />
              </div>
              <div className="col-12">
                <label className="form-label small mb-1 fw-semibold text-secondary">Current Address</label>
                <textarea className="form-control form-control-sm" placeholder="Current Address" value={addForm.Current_Address} onChange={e => updateAddFormField('Current_Address', e.target.value)} rows={2} />
              </div>

              {/* NIC Copy Upload */}
              <div className="col-12">
                <label className="form-label small mb-1 fw-semibold text-secondary">NIC Copy Upload</label>
                <div
                  onClick={() => nicFileInputRef.current?.click()}
                  style={{
                    border: nicCopyFile ? '2px solid #0d9488' : '2px dashed #cbd5e1',
                    borderRadius: '10px',
                    padding: '16px',
                    cursor: 'pointer',
                    background: nicCopyFile ? '#f0fdfa' : '#f8fafc',
                    textAlign: 'center',
                    transition: 'all 0.2s'
                  }}
                >
                  {nicCopyPreview ? (
                    <div>
                      <img src={nicCopyPreview} alt="NIC Preview" style={{ maxHeight: 120, maxWidth: '100%', borderRadius: 6, marginBottom: 8 }} />
                      <div style={{ fontSize: 12, color: '#0d9488', fontWeight: 600 }}>✓ {nicCopyFile.name}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>Click to change</div>
                    </div>
                  ) : nicCopyFile ? (
                    <div>
                      <div style={{ fontSize: 28, marginBottom: 4 }}>📄</div>
                      <div style={{ fontSize: 12, color: '#0d9488', fontWeight: 600 }}>✓ {nicCopyFile.name}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>Click to change</div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontSize: 28, marginBottom: 4 }}>📎</div>
                      <div style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>Click to upload NIC copy</div>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>JPG, PNG, PDF accepted (max 15MB)</div>
                    </div>
                  )}
                </div>
                <input
                  ref={nicFileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  style={{ display: 'none' }}
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setNicCopyFile(file);
                    if (file.type.startsWith('image/')) {
                      const reader = new FileReader();
                      reader.onload = () => setNicCopyPreview(reader.result);
                      reader.readAsDataURL(file);
                    } else {
                      setNicCopyPreview(null);
                    }
                    e.target.value = '';
                  }}
                />
              </div>
            </div>

            <div className="d-flex gap-2 mt-4 pt-3 border-top justify-content-end">
              <button className="btn btn-secondary btn-sm px-4" onClick={cancelAdd}>Cancel</button>
              <button className="btn btn-primary btn-sm px-4" onClick={addEmployee} style={{ background: '#0d9488', borderColor: '#0d9488' }}>Save Employee</button>
            </div>
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
        {!isLoading && filteredEmployees.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
            <p style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>No employees found.</p>
            <p style={{ margin: '4px 0 0', fontSize: '13px' }}>Try adjusting your search or filters.</p>
          </div>
        )}
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
                  try { persistEmployees(_employees); } catch { }
                }}
                style={{
                  cursor: searchTerm ? 'default' : 'grab',
                  minHeight: '170px',
                  border: '1px solid #e8e8e8',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                  opacity: emp.status === 'Inactive' ? 0.6 : 1,
                  filter: emp.status === 'Inactive' ? 'grayscale(0.5)' : 'none',
                  background: emp.status === 'Inactive' ? '#f1f5f9' : '#fff'
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
                      background: 'linear-gradient(135deg, rgb(13, 148, 136), rgb(15, 23, 42))',
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
                    <div className="d-flex justify-content-center align-items-center gap-2 mt-1 mb-2">
                      <span style={{
                        fontSize: '10px',
                        fontWeight: 900,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: emp.status === 'Inactive' ? '#fee2e2' : '#ecfdf5',
                        color: emp.status === 'Inactive' ? '#dc2626' : '#059669',
                        textTransform: 'uppercase'
                      }}>
                        {emp.status}
                      </span>
                    </div>
                    <div className="d-flex justify-content-center gap-2 mt-2">
                      <button
                        className="btn btn-outline-secondary btn-sm py-0 px-2"
                        onClick={e => { e.stopPropagation(); setViewingEmployee(emp); }}
                      >
                        View
                      </button>
                      <button
                        className="btn btn-outline-primary btn-sm py-0 px-2"
                        onClick={e => startEdit(emp, e)}
                        disabled={emp.status === 'Inactive'}
                      >
                        Edit
                      </button>
                      {emp.status === 'Inactive' ? (
                        <button className="btn btn-outline-success btn-sm py-0 px-2" onClick={e => activateEmployee(emp, e)}>Activate</button>
                      ) : (
                        <button className="btn btn-outline-danger btn-sm py-0 px-2" onClick={e => deleteEmployee(emp, e)}>Delete</button>
                      )}
                    </div>
                  </div>
                </div>
              </div>


            </div>
          ))}
        </div>
      </div>

      {editingId && (
        <div
          onClick={cancelEdit}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.4)',
            backdropFilter: 'blur(8px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 'min(900px, 95%)',
              maxHeight: '90vh',
              overflowY: 'auto',
              background: '#fff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              padding: '28px',
            }}
          >
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 style={{ margin: 0, fontWeight: 800, color: '#0f172a' }}>Edit Employee Details</h4>
              <button className="btn btn-sm btn-outline-secondary" onClick={cancelEdit}>Close</button>
            </div>

            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label className="form-label small mb-1 fw-semibold text-secondary">Name</label>
                <input className="form-control form-control-sm" value={editForm.name} onChange={e => updateEditField('name', e.target.value)} />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label small mb-1 fw-semibold text-secondary">Role</label>
                <select className="form-select form-select-sm" value={editForm.role} onChange={e => updateEditField('role', e.target.value)}>
                  <option value="Staff">Staff</option>
                  <option value="Cashier">Cashier</option>
                  <option value="Staff (Production)">Staff (Production)</option>
                  <option value="Manager">Manager</option>
                </select>
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label small mb-1 fw-semibold text-secondary">Email</label>
                <input className="form-control form-control-sm" type="email" value={editForm.email} onChange={e => updateEditField('email', e.target.value)} />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label small mb-1 fw-semibold text-secondary">Phone</label>
                <input className="form-control form-control-sm" value={editForm.phone} onChange={e => updateEditField('phone', e.target.value)} />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label small mb-1 fw-semibold text-secondary">Employee Type</label>
                <select className="form-select form-select-sm" value={editForm.employeeType} onChange={e => updateEditField('employeeType', e.target.value)}>
                  <option value="Permanent">Permanent</option>
                  <option value="Casual">Casual</option>
                  <option value="Contract">Contract</option>
                </select>
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label small mb-1 fw-semibold text-secondary">Confirmation Date</label>
                <input className="form-control form-control-sm" type="date" value={editForm.confirmationDate} onChange={e => updateEditField('confirmationDate', e.target.value)} />
              </div>
              
              <div className="col-12 col-md-6">
                <label className="form-label small mb-1 fw-semibold text-secondary">EPF Eligible</label>
                <select className="form-select form-select-sm" value={editForm.epfEligible} onChange={e => updateEditField('epfEligible', e.target.value)}>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label small mb-1 fw-semibold text-secondary">EPF Number</label>
                <input className="form-control form-control-sm" value={editForm.epfNumber} onChange={e => updateEditField('epfNumber', e.target.value)} />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label small mb-1 fw-semibold text-secondary">ETF Eligible</label>
                <select className="form-select form-select-sm" value={editForm.etfEligible} onChange={e => updateEditField('etfEligible', e.target.value)}>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label small mb-1 fw-semibold text-secondary">ETF Number</label>
                <input className="form-control form-control-sm" value={editForm.etfNumber} onChange={e => updateEditField('etfNumber', e.target.value)} />
              </div>
              
              <div className="col-12 col-md-6">
                <label className="form-label small mb-1 fw-semibold text-secondary">Bank Name</label>
                <select className="form-select form-select-sm" value={editForm.bankName} onChange={e => updateEditField('bankName', e.target.value)}>
                  <option value="">Select Bank</option>
                  <option value="Bank of Ceylon">Bank of Ceylon</option>
                  <option value="People's Bank">People's Bank</option>
                  <option value="Commercial Bank">Commercial Bank</option>
                  <option value="Hatton National Bank">Hatton National Bank</option>
                  <option value="Sampath Bank">Sampath Bank</option>
                  <option value="Seylan Bank">Seylan Bank</option>
                  <option value="Nations Trust Bank">Nations Trust Bank</option>
                  <option value="DFCC Bank">DFCC Bank</option>
                  <option value="Pan Asia Bank">Pan Asia Bank</option>
                  <option value="Union Bank">Union Bank</option>
                  <option value="NDB Bank">NDB Bank</option>
                  <option value="RDB Bank">RDB Bank</option>
                </select>
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label small mb-1 fw-semibold text-secondary">Bank Account No</label>
                <input className="form-control form-control-sm" value={editForm.bankAccountNo} onChange={e => updateEditField('bankAccountNo', e.target.value)} />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label small mb-1 fw-semibold text-secondary">Bank Branch</label>
                <select className="form-select form-select-sm" value={editForm.bankBranch} onChange={e => updateEditField('bankBranch', e.target.value)}>
                  <option value="">Select Branch</option>
                  <option value="Balangoda">Balangoda</option>
                  <option value="Pallebedda">Pallebedda</option>
                  <option value="Kahawatta">Kahawatta</option>
                  <option value="Pelmadulla">Pelmadulla</option>
                  <option value="Embilipitiya">Embilipitiya</option>
                  <option value="Kiriella">Kiriella</option>
                  <option value="Erathna">Erathna</option>
                </select>
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label small mb-1 fw-semibold text-secondary">Bank Account Name</label>
                <input className="form-control form-control-sm" value={editForm.bankAccountName} onChange={e => updateEditField('bankAccountName', e.target.value)} />
              </div>

              <div className="col-12">
                <label className="form-label small mb-1 fw-semibold text-secondary">Profile photo</label>
                <div className="d-flex align-items-center gap-3">
                  <div onClick={e => triggerImagePick(editingId, e)} style={{ cursor: 'pointer' }} title="Click to change">
                    <div style={{
                      width: 64, height: 64, borderRadius: '50%', overflow: 'hidden',
                      background: 'linear-gradient(135deg, rgb(13, 148, 136), rgb(15, 23, 42))', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontSize: '20px', fontWeight: 700, border: '2px solid #e8e8e8',
                    }}>
                      {editForm.image ? (
                        <img src={editForm.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        getInitials(editForm.name)
                      )}
                    </div>
                  </div>
                  <div>
                    <button type="button" className="btn btn-outline-secondary btn-sm" onClick={e => triggerImagePick(editingId, e)}>Change Photo</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="d-flex gap-2 mt-4 pt-3 border-top justify-content-end">
              <button className="btn btn-secondary btn-sm px-4" onClick={cancelEdit}>Cancel</button>
              <button className="btn btn-danger btn-sm px-4" onClick={(e) => {
                const emp = employees.find(x => x.id === editingId);
                if (emp) deleteEmployee(emp, e);
              }}>Delete Employee</button>
              <button className="btn btn-primary btn-sm px-4" onClick={saveEdit} style={{ background: '#0d9488', borderColor: '#0d9488' }}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

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
            {/*Display employee details.*/}
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
              <div className="col-12 col-md-6"><strong>ETF Number:</strong> {renderDetailValue(viewingEmployee.raw?.ETF_Number)}</div>
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