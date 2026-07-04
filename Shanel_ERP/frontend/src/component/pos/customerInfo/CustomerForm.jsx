import axios from 'axios';
import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react';

const CustomerForm = ({ onClose }) => {
    const { t } = useTranslation();
    const [customerInfo, setCustomerInfo] = useState({
        customer_name: '',
        contact_person: '',
        customer_email: '',
        customer_phone1: '',
        customer_phone2: '',
        customer_address: '',
        customer_city: '',
        customer_type: 'Retail',
        price_level: 'Retail',
        credit_allowed: false,
        credit_limit: 0.00,
        current_balance: 0.00,
        payment_terms: '',
        preferred_payment_method: 'Cash',
        tax_id: '',
        status: 'Active',
        last_purchase_date: '',
        total_purchases: 0.00,
        loyalty_points: 0,
        notes: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    // Auto-dismiss alerts after 5 seconds (same as POS)
    useEffect(() => {
        if (successMessage || error) {
            const timer = setTimeout(() => {
                setSuccessMessage('');
                setError(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [successMessage, error]);

    const resetForm = () => {
        setCustomerInfo({
            customer_name: '',
            contact_person: '',
            customer_email: '',
            customer_phone1: '',
            customer_phone2: '',
            customer_address: '',
            customer_city: '',
            customer_type: 'Retail',
            price_level: 'Retail',
            credit_allowed: false,
            credit_limit: 0.00,
            current_balance: 0.00,
            payment_terms: '',
            preferred_payment_method: 'Cash',
            tax_id: '',
            status: 'Active',
            last_purchase_date: '',
            total_purchases: 0.00,
            loyalty_points: 0,
            notes: ''
        });
        setError(null);
        setSuccessMessage('');
    };

    const saveCustomerData = async () => {
        setLoading(true);
        setError(null);
        setSuccessMessage('');

        if (!customerInfo.customer_name.trim()) {
            setError('Customer name is required');
            setLoading(false);
            return;
        }

        if (!customerInfo.customer_phone1.trim()) {
            setError('Phone number is required');
            setLoading(false);
            return;
        }

        try {
            const res = await axios.post(API_ENDPOINTS.customer.root, customerInfo);
            if (res.data.success) {
                setSuccessMessage('Customer saved successfully!');
                resetForm();
                setTimeout(() => {
                    onClose && onClose();
                }, 1500);
            } else {
                setError('Failed to save customer: ' + res.data.message);
            }
        } catch (err) {
            setError('Error saving customer: ' + (err.response?.data?.message || err.message));
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = {
        width: '100%',
        padding: '10px 12px',
        border: '1px solid #ddd',
        borderRadius: '6px',
        fontSize: '14px',
        fontFamily: 'inherit',
        transition: 'all 0.2s ease',
        boxSizing: 'border-box'
    };

    const labelStyle = {
        display: 'block',
        marginBottom: '6px',
        fontSize: '13px',
        fontWeight: '500',
        color: '#495057',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        }}>
            {/* Modal */}
            <div onClick={(e) => e.stopPropagation()} style={{
                backgroundColor: '#fff',
                borderRadius: '12px',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
                width: '100%',
                maxWidth: '600px',
                maxHeight: '90vh',
                overflowY: 'auto',
                animation: 'scaleIn 0.3s ease-out'
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '20px 24px',
                    borderBottom: '1px solid #e9ecef',
                    backgroundColor: '#f8f9fa'
                }}>
                    <h4 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#1a1a2e' }}>
                        {t('customerForm.title')}
                    </h4>
                    <button
                        onClick={() => onClose && onClose()}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '5px',
                            display: 'flex',
                            alignItems: 'center',
                            color: '#6c757d',
                            fontSize: '20px'
                        }}
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div style={{ padding: '24px' }}>
                    {error && (
                        <div style={{
                            padding: '15px 45px 15px 20px',
                            backgroundColor: '#c62828',
                            color: '#fff',
                            borderRadius: '8px',
                            marginBottom: '16px',
                            fontSize: '14px',
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
                            {/* <span style={{ fontSize: '20px' }}>⚠️</span> */}
                            <div>
                                <strong style={{ fontSize: '15px' }}>Attention</strong>
                                <div style={{ fontSize: '14px', marginTop: '2px' }}>{error}</div>
                            </div>
                        </div>
                    )}

                    {successMessage && (
                        <div style={{
                            padding: '15px 45px 15px 20px',
                            backgroundColor: '#2e7d32',
                            color: '#fff',
                            borderRadius: '8px',
                            marginBottom: '16px',
                            fontSize: '14px',
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
                            {/* <span style={{ fontSize: '20px' }}>✓</span> */}
                            <div>
                                <strong style={{ fontSize: '15px' }}>Success!</strong>
                                <div style={{ fontSize: '14px', marginTop: '2px' }}>{successMessage}</div>
                            </div>
                        </div>
                    )}

                    {/* Basic Info Section */}
                    <div style={{ marginBottom: '24px' }}>
                        <h6 style={{ margin: '0 0 16px 0', fontSize: '13px', fontWeight: '600', color: '#495057', textTransform: 'uppercase' }}>
                            {t('customerForm.basicInfo')}
                        </h6>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                            <div>
                                <label style={labelStyle}>{t('customerForm.customerName')} *</label>
                                <input
                                    type="text"
                                    style={inputStyle}
                                    placeholder={t('customerForm.customerNamePlaceholder')}
                                    value={customerInfo.customer_name}
                                    onChange={(e) => setCustomerInfo({...customerInfo, customer_name: e.target.value})}
                                    onFocus={(e) => e.target.style.borderColor = '#007bff'}
                                    onBlur={(e) => e.target.style.borderColor = '#ddd'}
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>{t('customerForm.phone1')} *</label>
                                <input
                                    type="text"
                                    style={inputStyle}
                                    placeholder={t('customerForm.phone1Placeholder')}
                                    value={customerInfo.customer_phone1}
                                    onChange={(e) => setCustomerInfo({...customerInfo, customer_phone1: e.target.value})}
                                    onFocus={(e) => e.target.style.borderColor = '#007bff'}
                                    onBlur={(e) => e.target.style.borderColor = '#ddd'}
                                />
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <label style={labelStyle}>{t('customerForm.contactPerson')}</label>
                                <input
                                    type="text"
                                    style={inputStyle}
                                    placeholder={t('customerForm.contactPersonPlaceholder')}
                                    value={customerInfo.contact_person}
                                    onChange={(e) => setCustomerInfo({...customerInfo, contact_person: e.target.value})}
                                    onFocus={(e) => e.target.style.borderColor = '#007bff'}
                                    onBlur={(e) => e.target.style.borderColor = '#ddd'}
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>{t('customerForm.phone2')}</label>
                                <input
                                    type="text"
                                    style={inputStyle}
                                    placeholder={t('customerForm.phone2Placeholder')}
                                    value={customerInfo.customer_phone2}
                                    onChange={(e) => setCustomerInfo({...customerInfo, customer_phone2: e.target.value})}
                                    onFocus={(e) => e.target.style.borderColor = '#007bff'}
                                    onBlur={(e) => e.target.style.borderColor = '#ddd'}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Contact Info Section */}
                    <div style={{ marginBottom: '24px' }}>
                        <h6 style={{ margin: '0 0 16px 0', fontSize: '13px', fontWeight: '600', color: '#495057', textTransform: 'uppercase' }}>
                            {t('customerForm.contactInfo')}
                        </h6>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                            <div>
                                <label style={labelStyle}>{t('customerForm.email')}</label>
                                <input
                                    type="email"
                                    style={inputStyle}
                                    placeholder={t('customerForm.emailPlaceholder')}
                                    value={customerInfo.customer_email}
                                    onChange={(e) => setCustomerInfo({...customerInfo, customer_email: e.target.value})}
                                    onFocus={(e) => e.target.style.borderColor = '#007bff'}
                                    onBlur={(e) => e.target.style.borderColor = '#ddd'}
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>{t('customerForm.city')}</label>
                                <input
                                    type="text"
                                    style={inputStyle}
                                    placeholder={t('customerForm.cityPlaceholder')}
                                    value={customerInfo.customer_city}
                                    onChange={(e) => setCustomerInfo({...customerInfo, customer_city: e.target.value})}
                                    onFocus={(e) => e.target.style.borderColor = '#007bff'}
                                    onBlur={(e) => e.target.style.borderColor = '#ddd'}
                                />
                            </div>
                        </div>
                        <div>
                            <label style={labelStyle}>{t('customerForm.address')}</label>
                            <textarea
                                style={{...inputStyle, minHeight: '80px', resize: 'vertical'}}
                                placeholder={t('customerForm.addressPlaceholder')}
                                value={customerInfo.customer_address}
                                onChange={(e) => setCustomerInfo({...customerInfo, customer_address: e.target.value})}
                                onFocus={(e) => e.target.style.borderColor = '#007bff'}
                                onBlur={(e) => e.target.style.borderColor = '#ddd'}
                            />
                        </div>
                    </div>

                    {/* Business Info Section */}
                    <div style={{ marginBottom: '24px' }}>
                        <h6 style={{ margin: '0 0 16px 0', fontSize: '13px', fontWeight: '600', color: '#495057', textTransform: 'uppercase' }}>
                            {t('customerForm.businessInfo')}
                        </h6>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <label style={labelStyle}>{t('customerForm.customerType')}</label>
                                <select
                                    style={inputStyle}
                                    value={customerInfo.customer_type}
                                    onChange={(e) => setCustomerInfo({...customerInfo, customer_type: e.target.value})}
                                    onFocus={(e) => e.target.style.borderColor = '#007bff'}
                                    onBlur={(e) => e.target.style.borderColor = '#ddd'}
                                >
                                    <option value="Retail">Retail</option>
                                    <option value="Wholesale">Wholesale</option>
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>{t('customerForm.priceLevel')}</label>
                                <select
                                    style={inputStyle}
                                    value={customerInfo.price_level}
                                    onChange={(e) => setCustomerInfo({...customerInfo, price_level: e.target.value})}
                                    onFocus={(e) => e.target.style.borderColor = '#007bff'}
                                    onBlur={(e) => e.target.style.borderColor = '#ddd'}
                                >
                                    <option value="Retail">Retail</option>
                                    <option value="Wholesale">Wholesale</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Payment Info Section */}
                    <div style={{ marginBottom: '24px' }}>
                        <h6 style={{ margin: '0 0 16px 0', fontSize: '13px', fontWeight: '600', color: '#495057', textTransform: 'uppercase' }}>
                            {t('customerForm.paymentSettings')}
                        </h6>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <label style={labelStyle}>{t('customerForm.preferredPayment')}</label>
                                <select
                                    style={inputStyle}
                                    value={customerInfo.preferred_payment_method}
                                    onChange={(e) => setCustomerInfo({...customerInfo, preferred_payment_method: e.target.value})}
                                    onFocus={(e) => e.target.style.borderColor = '#007bff'}
                                    onBlur={(e) => e.target.style.borderColor = '#ddd'}
                                >
                                    <option value="Cash">Cash</option>
                                    <option value="Bank_Deposit">Bank Deposit</option>
                                    <option value="Cheque">Cheque</option>
                                    <option value="Credit">Credit</option>
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>{t('customerForm.status')}</label>
                                <select
                                    style={inputStyle}
                                    value={customerInfo.status}
                                    onChange={(e) => setCustomerInfo({...customerInfo, status: e.target.value})}
                                    onFocus={(e) => e.target.style.borderColor = '#007bff'}
                                    onBlur={(e) => e.target.style.borderColor = '#ddd'}
                                >
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                    <option value="Blocked">Blocked</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label style={labelStyle}>{t('customerForm.notes')}</label>
                        <textarea
                            style={{...inputStyle, minHeight: '80px', resize: 'vertical'}}
                            placeholder={t('customerForm.notesPlaceholder')}
                            value={customerInfo.notes}
                            onChange={(e) => setCustomerInfo({...customerInfo, notes: e.target.value})}
                            onFocus={(e) => e.target.style.borderColor = '#007bff'}
                            onBlur={(e) => e.target.style.borderColor = '#ddd'}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div style={{
                    display: 'flex',
                    gap: '12px',
                    padding: '16px 24px',
                    borderTop: '1px solid #e9ecef',
                    backgroundColor: '#f8f9fa',
                    justifyContent: 'flex-end'
                }}>
                    <button
                        onClick={() => onClose && onClose()}
                        style={{
                            padding: '10px 20px',
                            border: '1px solid #ddd',
                            backgroundColor: '#fff',
                            color: '#495057',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.target.backgroundColor = '#e9ecef';
                        }}
                        onMouseLeave={(e) => {
                            e.target.backgroundColor = '#fff';
                        }}
                    >
                        {t('customerForm.cancel')}
                    </button>
                    <button
                        onClick={saveCustomerData}
                        disabled={loading}
                        style={{
                            padding: '10px 20px',
                            border: 'none',
                            backgroundColor: loading ? '#6c757d' : '#007bff',
                            color: '#fff',
                            borderRadius: '6px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontSize: '14px',
                            fontWeight: '500',
                            transition: 'all 0.2s ease',
                            opacity: loading ? 0.7 : 1
                        }}
                        onMouseEnter={(e) => {
                            if (!loading) e.target.backgroundColor = '#0056b3';
                        }}
                        onMouseLeave={(e) => {
                            if (!loading) e.target.backgroundColor = '#007bff';
                        }}
                    >
                        {loading ? t('customerForm.saving') : t('customerForm.save')}
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes scaleIn {
                    from {
                        transform: scale(0.95);
                        opacity: 0;
                    }
                    to {
                        transform: scale(1);
                        opacity: 1;
                    }
                }
            `}</style>
        </div>
    );
};

export default CustomerForm;
