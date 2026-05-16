import React, { useState, useEffect } from 'react';
import { 
    Plus, Search, User, Mail, Shield, Phone, 
    Edit2, Trash2, X, Check, AlertCircle 
} from 'lucide-react';

const UserDashboard = () => {
    // Data States
    const [users, setUsers] = useState([]);
    const [models, setModels] = useState([]);
    const [query, setQuery] = useState('');
    const [searchResult, setSearchResult] = useState([]);

    // Form Visibility States
    const [showAddForm, setShowAddForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);

    // Form Input States
    const [formData, setFormData] = useState({
        User_ID: '',
        username: '',
        password: '',
        full_name: '',
        email: '',
        phone: '',
        user_type: 'Cashier',
        status: 'Active',
        modules: []
    });

    const API_BASE = '/api/users';

    // Fetch all users
    const fetchAllUsers = async () => {
        try {
            const response = await fetch(`${API_BASE}/all`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await response.json();
            if (data.success) {
                setUsers(data.users);
            }
        } catch (err) {
            console.error("Failed to fetch users", err);
        }
    };

    // Fetch available modules (models)
    const fetchModels = async () => {
        try {
            const response = await fetch(`${API_BASE}/models`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await response.json();
            if (data.success) {
                setModels(data.models);
            }
        } catch (err) {
            console.error("Failed to fetch models", err);
        }
    };

    // Search users
    const handleSearch = async () => {
        if (!query) {
            setSearchResult([]);
            return;
        }
        try {
            const response = await fetch(`${API_BASE}/search?q=${query}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await response.json();
            if (data.success) {
                setSearchResult(data.users);
            }
        } catch (err) {
            console.error("Search failed", err);
        }
    };

    useEffect(() => {
        fetchAllUsers();
        fetchModels();
    }, []);

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            handleSearch();
        }, 300);
        return () => clearTimeout(delayDebounce);
    }, [query]);

    // Input handlers
    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handlePermissionToggle = (moduleId) => {
        setFormData(prev => {
            const modules = prev.modules.includes(moduleId)
                ? prev.modules.filter(id => id !== moduleId)
                : [...prev.modules, moduleId];
            return { ...prev, modules };
        });
    };

    // CRUD Actions
    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_BASE}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            if (data.success) {
                alert("User created successfully");
                setShowAddForm(false);
                fetchAllUsers();
            } else {
                alert(data.error);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_BASE}/update`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            if (data.success) {
                alert("User updated successfully");
                setShowEditForm(false);
                fetchAllUsers();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (userId) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            const response = await fetch(`${API_BASE}/delete`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ User_ID: userId })
            });
            const data = await response.json();
            if (data.success) {
                fetchAllUsers();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const openEditForm = (user) => {
        setFormData({
            User_ID: user.User_ID,
            username: user.Username,
            full_name: user.Full_Name,
            email: user.Email || '',
            phone: user.Phone || '',
            user_type: user.User_Type,
            status: user.Status,
            modules: user.ModuleAccess ? user.ModuleAccess.map(ma => ma.Module_ID) : []
        });
        setShowEditForm(true);
    };

    const displayList = query ? searchResult : users;

    return (
        <div className="min-vh-100 bg-light p-4" style={{ fontSize: '14px' }}>
            {/* Header Section */}
            <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h4 className="fw-bold text-dark mb-1">User Management</h4>
                        <p className="text-muted small mb-0">Control system access and assign module permissions</p>
                    </div>
                    <button 
                        onClick={() => {
                            setFormData({ username: '', password: '', full_name: '', email: '', phone: '', user_type: 'Cashier', status: 'Active', modules: [] });
                            setShowAddForm(true);
                        }} 
                        className="btn btn-dark btn-sm d-flex align-items-center gap-2 px-4 py-2 rounded-3 shadow-sm"
                    >
                        <Plus size={18} />
                        <span>Add New User</span>
                    </button>
                </div>

                {/* Search Bar */}
                <div className="bg-white p-3 rounded-4 shadow-sm border-0 d-flex flex-wrap gap-3 align-items-center justify-content-between">
                    <div className="position-relative" style={{ width: '350px' }}>
                        <Search className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={16} />
                        <input 
                            type="text" 
                            className="form-control form-control-sm bg-light border-0 ps-5 py-2 shadow-none rounded-3"
                            placeholder="Search users..." 
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>
                    <div>
                        <span className="badge bg-light text-dark border px-3 py-2 rounded-pill fw-normal">
                            Total Records: {users.length}
                        </span>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-4 shadow-sm overflow-hidden border-0">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light border-bottom">
                            <tr>
                                <th className="px-4 py-3 text-muted fw-semibold border-0">User Identity</th>
                                <th className="py-3 text-muted fw-semibold border-0">Role</th>
                                <th className="py-3 text-muted fw-semibold border-0 text-center">Status</th>
                                <th className="py-3 text-muted fw-semibold border-0">Modules</th>
                                <th className="px-4 py-3 text-muted fw-semibold border-0 text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayList.map((user) => (
                                <tr key={user.User_ID}>
                                    <td className="px-4 py-3">
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '38px', height: '38px' }}>
                                                <User size={18} />
                                            </div>
                                            <div>
                                                <div className="fw-bold text-dark">{user.Full_Name}</div>
                                                <div className="text-muted small">@{user.Username}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3">
                                        <span className="text-dark fw-medium">{user.User_Type.replace('_', ' ')}</span>
                                    </td>
                                    <td className="py-3 text-center">
                                        <span className={`badge rounded-pill px-3 py-1 fw-normal ${
                                            user.Status === 'Active' ? 'bg-success-subtle text-success border border-success-subtle' : 
                                            'bg-secondary-subtle text-secondary border border-secondary-subtle'
                                        }`}>
                                            {user.Status}
                                        </span>
                                    </td>
                                    <td className="py-3">
                                        <div className="d-flex flex-wrap gap-1">
                                            {user.ModuleAccess?.map(ma => (
                                                <span key={ma.Module_ID} className="badge bg-light text-dark border-0 small fw-normal px-2 py-1">
                                                    {ma.Module?.Module_Name}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-end">
                                        <div className="d-flex justify-content-end gap-2">
                                            <button onClick={() => openEditForm(user)} className="btn btn-sm btn-light border-0 p-2 rounded-circle text-primary shadow-none">
                                                <Edit2 size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(user.User_ID)} className="btn btn-sm btn-light border-0 p-2 rounded-circle text-danger shadow-none">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Form Modal */}
            {(showAddForm || showEditForm) && (
                <div className="modal d-block" style={{ backgroundColor: 'rgba(15,23,42,0.6)', zIndex: 1055 }}
                     onClick={(e) => { if (e.target === e.currentTarget) { setShowAddForm(false); setShowEditForm(false); } }}>
                    <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '550px' }}>
                        <form className="modal-content border-0 shadow-lg rounded-4 overflow-hidden" onSubmit={showAddForm ? handleRegister : handleUpdate}>
                            <div className="modal-header border-0 px-4 pt-4 pb-2">
                                <div>
                                    <h5 className="fw-bold mb-0">{showAddForm ? 'Add New User' : 'Edit User Account'}</h5>
                                    <p className="text-muted small mb-0 mt-1">Configure profile and module access</p>
                                </div>
                                <button type="button" className="btn-close shadow-none" onClick={() => { setShowAddForm(false); setShowEditForm(false); }} />
                            </div>

                            <div className="modal-body px-4 py-3">
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="form-label small fw-semibold text-muted mb-1">Username</label>
                                        <input id="username" placeholder="Username" className="form-control form-control-sm bg-light border-0 py-2 shadow-none" value={formData.username} onChange={handleInputChange} required />
                                    </div>
                                    {showAddForm && (
                                        <div className="col-md-6">
                                            <label className="form-label small fw-semibold text-muted mb-1">Password</label>
                                            <input id="password" type="password" placeholder="Password" className="form-control form-control-sm bg-light border-0 py-2 shadow-none" value={formData.password} onChange={handleInputChange} required />
                                        </div>
                                    )}
                                    <div className="col-md-12">
                                        <label className="form-label small fw-semibold text-muted mb-1">Full Name</label>
                                        <input id="full_name" placeholder="Full Name" className="form-control form-control-sm bg-light border-0 py-2 shadow-none" value={formData.full_name} onChange={handleInputChange} required />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label small fw-semibold text-muted mb-1">Email</label>
                                        <input id="email" type="email" placeholder="Email" className="form-control form-control-sm bg-light border-0 py-2 shadow-none" value={formData.email} onChange={handleInputChange} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label small fw-semibold text-muted mb-1">Phone</label>
                                        <input id="phone" placeholder="Phone" className="form-control form-control-sm bg-light border-0 py-2 shadow-none" value={formData.phone} onChange={handleInputChange} />
                                    </div>
                                    <div className="col-md-12">
                                        <label className="form-label small fw-semibold text-muted mb-1">User Type</label>
                                        <select id="user_type" className="form-select form-select-sm bg-light border-0 py-2 shadow-none" value={formData.user_type} onChange={handleInputChange}>
                                            <option value="Admin">Admin</option>
                                            <option value="Manager">Manager</option>
                                            <option value="Sales_Officer">Sales Officer</option>
                                            <option value="Cashier">Cashier</option>
                                            <option value="Finance_Staff">Finance Staff</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <label className="form-label small fw-bold text-dark mb-2 d-flex align-items-center gap-2">
                                        <Shield size={16} className="text-primary" />
                                        Module Permissions
                                    </label>
                                    <div className="bg-light p-3 rounded-3 border-0 d-flex flex-wrap gap-2">
                                        {models.map(m => (
                                            <button
                                                key={m.Module_ID}
                                                type="button"
                                                onClick={() => handlePermissionToggle(m.Module_ID)}
                                                className={`btn btn-sm d-flex align-items-center gap-2 px-3 py-2 rounded-pill border-0 transition-all ${
                                                    formData.modules.includes(m.Module_ID) 
                                                    ? 'bg-primary text-white shadow-sm' 
                                                    : 'bg-white text-muted shadow-none border'
                                                }`}
                                            >
                                                {formData.modules.includes(m.Module_ID) ? <Check size={14} /> : <Plus size={14} />}
                                                {m.Module_Name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="modal-footer border-0 px-4 pb-4 pt-1 gap-2">
                                <button type="button" className="btn btn-outline-secondary btn-sm px-4 rounded-3" onClick={() => { setShowAddForm(false); setShowEditForm(false); }}>Cancel</button>
                                <button type="submit" className="btn btn-dark btn-sm px-4 rounded-3 shadow-sm">
                                    {showAddForm ? 'Create Account' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserDashboard;
