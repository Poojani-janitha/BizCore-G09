import React, { useState } from 'react';
import { X, Save, User, Phone, Mail, MapPin, Info } from 'react-feather';
import axios from 'axios';

const SupplierModal = ({ show, onHide, onSupplierAdded }) => {
    const initialState = {
        S_Code: '',
        S_Name: '',
        Contact_Person: '',
        Phone_No: '',
        Phone_No_2: '',
        Email: '',
        Address: '',
        City: '',
        Country: 'Sri Lanka',
        Payment_Terms: '',
        Credit_Limit: 0,
        Tax_ID: '',
        Bank_Name: '',
        Bank_Account_No: '',
        Bank_Branch: '',
        Rating: 5,
        Notes: '',
        Status: 'Active'
    };

    const [formData, setFormData] = useState(initialState);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validate = () => {
        const newErrors = {};
        
        if (!formData.S_Name.trim()) {
            newErrors.S_Name = "Supplier Name is required";
        }
        
        // Validate Phone: Ensure exactly 10 digits starting with 0
        const phoneRegex = /^(0)\d{9}$/;
        if (!formData.Phone_No.trim()) {
            newErrors.Phone_No = "Primary phone is required";
        } else if (!phoneRegex.test(formData.Phone_No.trim().replace(/[-\s]/g, ''))) {
            newErrors.Phone_No = "Enter valid 10-digit phone (e.g., 0712345678)";
        }

        // Validate optional secondary phone if entered
        if (formData.Phone_No_2 && formData.Phone_No_2.trim()) {
            if (!phoneRegex.test(formData.Phone_No_2.trim().replace(/[-\s]/g, ''))) {
                newErrors.Phone_No_2 = "Enter valid 10-digit phone";
            }
        }

        // Validate Email if entered
        if (formData.Email.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.Email.trim())) {
                newErrors.Email = "Invalid email format";
            }
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        try {
            const response = await axios.post('http://localhost:5000/api/inventory/suppliers', formData);
            if (response.data.success) {
                if (onSupplierAdded) {
                    onSupplierAdded(response.data.data);
                }
                handleClose();
            }
        } catch (error) {
            console.error("Error saving supplier:", error);
            alert(error.response?.data?.message || "Failed to save supplier. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData(initialState);
        setErrors({});
        onHide();
    };

    if (!show) return null;

    return (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 1060 }}>
            <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                <div className="modal-content border-0 shadow-lg rounded-4">
                    {/* Header */}
                    <div className="modal-header text-white border-0 p-4" style={{ background: 'linear-gradient(135deg, #2C3E50 0%, #3498DB 100%)' }}>
                        <div className="d-flex align-items-center gap-3">
                            <div className="bg-white bg-opacity-25 rounded-3 p-2">
                                <User size={24} className="text-white" />
                            </div>
                            <div>
                                <h5 className="modal-title fw-bold mb-0">Create New Supplier</h5>
                                <small className="text-white-50">Fill all required operational details</small>
                            </div>
                        </div>
                        <button type="button" className="btn-close btn-close-white opacity-75 shadow-none" onClick={handleClose}></button>
                    </div>

                    {/* Body */}
                    <div className="modal-body p-4 bg-light bg-opacity-50">
                        <form id="supplierForm" onSubmit={handleSubmit}>
                            
                            {/* Section: General Information */}
                            <div className="card border-0 shadow-sm rounded-3 mb-4">
                                <div className="card-header bg-white py-3 d-flex align-items-center gap-2 border-bottom-0">
                                    <User size={18} className="text-primary" />
                                    <h6 className="mb-0 fw-bold text-dark">General Information</h6>
                                </div>
                                <div className="card-body pt-0 row g-3">
                                    <div className="col-md-12">
                                         <label className="form-label small fw-semibold text-danger">Supplier Name *</label>
                                         <input 
                                             type="text" className={`form-control ${errors.S_Name ? 'is-invalid' : ''}`} 
                                             name="S_Name" placeholder="Enter supplier or company name"
                                             value={formData.S_Name} onChange={handleChange} 
                                         />
                                         {errors.S_Name && <div className="invalid-feedback">{errors.S_Name}</div>}
                                     </div>
                                    
                                    <div className="col-md-6">
                                        <label className="form-label small fw-semibold">Primary Contact Person</label>
                                        <input 
                                            type="text" className="form-control" 
                                            name="Contact_Person" placeholder="Name of representative"
                                            value={formData.Contact_Person} onChange={handleChange} 
                                        />
                                    </div>
                                    
                                    <div className="col-md-6">
                                        <label className="form-label small fw-semibold">Email Address</label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-white text-muted border-end-0"><Mail size={16}/></span>
                                            <input 
                                                type="email" className={`form-control border-start-0 ps-0 ${errors.Email ? 'is-invalid' : ''}`} 
                                                name="Email" placeholder="vendor@example.com"
                                                value={formData.Email} onChange={handleChange} 
                                            />
                                            {errors.Email && <div className="invalid-feedback d-block">{errors.Email}</div>}
                                        </div>
                                    </div>
                                    
                                    <div className="col-md-6">
                                        <label className="form-label small fw-semibold text-danger">Primary Phone *</label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-white text-muted border-end-0"><Phone size={16}/></span>
                                            <input 
                                                type="tel" className={`form-control border-start-0 ps-0 ${errors.Phone_No ? 'is-invalid' : ''}`} 
                                                name="Phone_No" placeholder="07X XXX XXXX"
                                                value={formData.Phone_No} onChange={handleChange} 
                                            />
                                            {errors.Phone_No && <div className="invalid-feedback">{errors.Phone_No}</div>}
                                        </div>
                                    </div>
                                    
                                    <div className="col-md-6">
                                        <label className="form-label small fw-semibold">Secondary Phone</label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-white text-muted border-end-0"><Phone size={16}/></span>
                                            <input 
                                                type="tel" className={`form-control border-start-0 ps-0 ${errors.Phone_No_2 ? 'is-invalid' : ''}`} 
                                                name="Phone_No_2" placeholder="Office direct line"
                                                value={formData.Phone_No_2} onChange={handleChange} 
                                            />
                                            {errors.Phone_No_2 && <div className="invalid-feedback">{errors.Phone_No_2}</div>}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section: Location Details */}
                            <div className="card border-0 shadow-sm rounded-3 mb-4">
                                <div className="card-header bg-white py-3 d-flex align-items-center gap-2 border-bottom-0">
                                    <MapPin size={18} className="text-primary" />
                                    <h6 className="mb-0 fw-bold text-dark">Location Details</h6>
                                </div>
                                <div className="card-body pt-0 row g-3">
                                    <div className="col-12">
                                        <label className="form-label small fw-semibold">Street Address</label>
                                        <textarea 
                                            className="form-control" rows="2" 
                                            name="Address" placeholder="Building No, Street, Locality..."
                                            value={formData.Address} onChange={handleChange} 
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label small fw-semibold">City</label>
                                        <input 
                                            type="text" className="form-control" 
                                            name="City"
                                            value={formData.City} onChange={handleChange} 
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label small fw-semibold">Country</label>
                                        <input 
                                            type="text" className="form-control" 
                                            name="Country"
                                            value={formData.Country} onChange={handleChange} 
                                        />
                                    </div>
                                </div>
                            </div>



                            {/* Section: Notes */}
                            <div className="card border-0 shadow-sm rounded-3 mb-2">
                                <div className="card-body py-3">
                                    <div className="d-flex align-items-center gap-2 mb-2">
                                        <Info size={18} className="text-muted" />
                                        <label className="form-label small fw-semibold mb-0">Additional Notes</label>
                                    </div>
                                    <textarea 
                                        className="form-control form-control-sm" rows="2" 
                                        name="Notes" placeholder="Internal supplier remarks..."
                                        value={formData.Notes} onChange={handleChange} 
                                    />
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Footer */}
                    <div className="modal-footer border-top-0 p-4 bg-white rounded-bottom-4">
                        <button 
                            type="button" 
                            className="btn btn-light px-4 fw-semibold text-muted border-0 rounded-3 hover-shadow-sm" 
                            onClick={handleClose} 
                            disabled={loading}
                        >
                            Discard Changes
                        </button>
                        <button 
                            type="submit" 
                            form="supplierForm"
                            className="btn btn-primary px-4 fw-bold rounded-3 shadow-sm d-flex align-items-center gap-2" 
                            disabled={loading}
                            style={{ transition: 'all 0.2s' }}
                        >
                            {loading ? (
                                <div className="spinner-border spinner-border-sm text-white" role="status"></div>
                            ) : (
                                <Save size={18} />
                            )}
                            {loading ? 'Registering...' : 'Save Supplier Profile'}
                        </button>
                    </div>
                </div>
            </div>
            <style>{`
                .hover-shadow-sm:hover {
                    box-shadow: 0 .125rem .25rem rgba(0,0,0,.075) !important;
                }
            `}</style>
        </div>
    );
};

export default SupplierModal;
