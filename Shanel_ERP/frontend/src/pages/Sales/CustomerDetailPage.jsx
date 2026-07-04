import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    ArrowLeft, Phone, Mail, MapPin, CreditCard, DollarSign,
    ShoppingBag, Eye, Edit2, RefreshCw, FileText, AlertCircle,
    CheckCircle, Clock, TrendingUp, User
} from 'react-feather';

// ─── Status Badge ────────────────────────────────────────────────────────────
const PaymentBadge = ({ status }) => {
    const { t } = useTranslation();
    const map = {
        'Paid': { cls: 'bg-success-subtle text-success', label: t('sales.paid') },
        'Partially_Paid': { cls: 'bg-warning-subtle text-warning', label: t('sales.partially_paid') },
        'Unpaid': { cls: 'bg-danger-subtle text-danger', label: t('sales.unpaid') }
    };
    const current = map[status] || { cls: 'bg-secondary-subtle text-secondary', label: status?.replace('_', ' ') };
    return (
        <span className={`badge rounded-pill px-2 py-1 ${current.cls}`} style={{ fontSize: '10px' }}>
            {current.label}
        </span>
    );
};

// ─── Info Row ────────────────────────────────────────────────────────────────
const InfoRow = ({ icon, label, value }) => (
    <div className="d-flex align-items-start gap-3 py-2 border-bottom" style={{ borderColor: '#f0f0f0' }}>
        <div className="text-muted mt-1" style={{ minWidth: 20 }}>{icon}</div>
        <div className="flex-grow-1">
            <small className="text-muted fw-bold text-uppercase d-block" style={{ fontSize: '9px', letterSpacing: '0.5px' }}>{label}</small>
            <span className="text-dark fw-medium small">{value || '—'}</span>
        </div>
    </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
const CustomerDetailPage = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [statement, setStatement] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [statementLoading, setStatementLoading] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/customer/${id}/detail`);
            if (res.data.success) setData(res.data.data);
        } catch (err) {
            console.error('Error fetching customer detail:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchStatement = async () => {
        setStatementLoading(true);
        try {
            const res = await axios.get(`/api/customer/${id}/statement`);
            if (res.data.success) setStatement(res.data.data);
        } catch (err) {
            console.error('Error fetching statement:', err);
        } finally {
            setStatementLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [id]);
    useEffect(() => {
        if (activeTab === 'statement') fetchStatement();
    }, [activeTab]);

    if (loading) {
        return (
            <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
                <div className="text-center">
                    <div className="spinner-border text-primary mb-3" />
                    <p className="text-muted small fw-bold text-uppercase">{t('sales.customer_detail.loading')}</p>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="container-fluid p-4">
                <div className="alert alert-danger rounded-4 border-0">{t('sales.customer_detail.not_found')}</div>
            </div>
        );
    }

    const { customer, recentSales } = data;
    const creditUsedPercent = customer.Credit_Limit > 0
        ? Math.min(100, Math.round((customer.Current_Balance / customer.Credit_Limit) * 100))
        : 0;

    return (
        <div className="container-fluid p-4" style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
            {/* Header removed for global navbar title consistency */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <button className="btn btn-light btn-sm rounded-3 border shadow-sm" onClick={() => navigate('/sales/customers')}>
                    <ArrowLeft size={16} />
                </button>
                <div className="d-flex gap-2">
                    <button className="btn btn-light btn-sm rounded-3 border shadow-sm d-flex align-items-center gap-2" onClick={fetchData}>
                        <RefreshCw size={14} />
                    </button>
                    <button
                        className="btn btn-primary btn-sm px-3 fw-bold rounded-3 shadow-sm d-flex align-items-center gap-2"
                        onClick={() => navigate('/finance/receive-payment', { state: { customerId: customer.C_ID, paymentType: 'credit' } })}
                    >
                        {t('sales.add_payment')}
                    </button>
                </div>
            </div>

            <div className="row g-4">
                {/* Left Column — Customer Info */}
                <div className="col-lg-4">
                    {/* Balance Card */}
                    <div className="card border-0 shadow-sm rounded-4 p-4 mb-3"
                        style={{ background: 'linear-gradient(135deg, #004445 0%, #2c7873 100%)', color: 'white' }}>
                        <p className="small fw-bold text-uppercase mb-1 opacity-75" style={{ fontSize: '10px', letterSpacing: '0.5px' }}>{t('sales.customer_detail.outstanding')}</p>
                        <h2 className="fw-bold mb-3">Rs.{parseFloat(customer.Current_Balance || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}</h2>
                        {customer.Credit_Allowed && (
                            <div>
                                <div className="d-flex justify-content-between small mb-1 opacity-75">
                                    <span>{t('sales.customer_detail.credit_used')}</span>
                                    <span>{creditUsedPercent}%</span>
                                </div>
                                <div className="progress" style={{ height: '6px', backgroundColor: 'rgba(255,255,255,0.2)' }}>
                                    <div
                                        className="progress-bar"
                                        style={{
                                            width: `${creditUsedPercent}%`,
                                            backgroundColor: creditUsedPercent > 80 ? '#ff7e67' : '#41b883'
                                        }}
                                    />
                                </div>
                                <small className="opacity-75 mt-1 d-block">{t('sales.customer_detail.limit')}: Rs.{parseFloat(customer.Credit_Limit).toLocaleString()}</small>
                            </div>
                        )}
                    </div>

                    {/* Stats Row */}
                    <div className="row g-2 mb-3">
                        <div className="col-6">
                            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white text-center">
                                <TrendingUp size={20} className="text-primary mx-auto mb-1" />
                                <p className="text-muted small fw-bold text-uppercase mb-0" style={{ fontSize: '9px' }}>{t('sales.customer_list.col_purchases')}</p>
                                <h6 className="fw-bold text-dark mb-0">Rs.{parseFloat(customer.Total_Purchases || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</h6>
                            </div>
                        </div>
                        <div className="col-6">
                            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white text-center">
                                <ShoppingBag size={20} className="text-success mx-auto mb-1" />
                                <p className="text-muted small fw-bold text-uppercase mb-0" style={{ fontSize: '9px' }}>{t('sales.customer_detail.invoices_count')}</p>
                                <h6 className="fw-bold text-dark mb-0">{recentSales.length}+</h6>
                            </div>
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                        <h6 className="fw-bold text-dark mb-3">{t('sales.details.customer_info')}</h6>
                        <InfoRow icon={<Phone size={14} />} label={t('customerForm.phone1')} value={customer.Phone1} />
                        <InfoRow icon={<Phone size={14} />} label={t('sales.customer_list.phone2')} value={customer.Phone2} />
                        <InfoRow icon={<Mail size={14} />} label={t('customerForm.email')} value={customer.Email} />
                        <InfoRow icon={<MapPin size={14} />} label={t('customerForm.address')} value={[customer.Address, customer.City].filter(Boolean).join(', ')} />
                        <InfoRow icon={<User size={14} />} label={t('sales.customer_list.contact_person')} value={customer.Contact_Person} />
                        <InfoRow icon={<CreditCard size={14} />} label={t('sales.customer_list.payment_terms')} value={customer.Payment_Terms} />
                        <InfoRow icon={<CheckCircle size={14} />} label={t('sales.customer_list.col_last_purchase')} value={customer.Last_Purchase_Date ? new Date(customer.Last_Purchase_Date).toLocaleDateString() : null} />
                    </div>
                </div>

                {/* Right Column — Tabs */}
                <div className="col-lg-8">
                    {/* Tabs */}
                    <div className="d-flex gap-2 mb-3">
                        {[
                            { key: 'overview', label: t('sales.purchase_history'), icon: <ShoppingBag size={14} /> },
                            { key: 'statement', label: t('sales.full_statement'), icon: <FileText size={14} /> }
                        ].map(tab => (
                            <button
                                key={tab.key}
                                className={`btn btn-sm d-flex align-items-center gap-2 px-3 rounded-3 fw-semibold ${activeTab === tab.key ? 'btn-dark text-white' : 'btn-light border'}`}
                                onClick={() => setActiveTab(tab.key)}
                            >
                                {tab.icon} {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Purchase History Tab */}
                    {activeTab === 'overview' && (
                        <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
                            <div className="card-header bg-white border-0 py-3 px-4">
                                <h6 className="fw-bold text-dark mb-0">{t('sales.recent_invoices')}</h6>
                            </div>
                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0">
                                    <thead className="bg-light">
                                        <tr>
                                            {[
                                                t('sales.invoice_no_col'),
                                                t('sales.date'),
                                                t('sales.type_col'),
                                                t('sales.total'),
                                                t('sales.paid_col'),
                                                t('sales.balance_due'),
                                                t('sales.status')
                                            ].map(h => (
                                                <th key={h} className="py-3 text-uppercase small fw-bold text-muted" style={{ fontSize: '10px' }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentSales.length === 0 ? (
                                            <tr><td colSpan={7} className="text-center py-5 text-muted small">{t('sales.no_transactions')}</td></tr>
                                        ) : recentSales.map(sale => (
                                            <tr key={sale.Sale_Id}>
                                                <td className="fw-bold text-primary small">{sale.Invoice_No}</td>
                                                <td className="small text-muted">{new Date(sale.Sale_Date).toLocaleDateString()}</td>
                                                <td>
                                                    <span className={`badge rounded-pill px-2 ${sale.Sale_Type === 'Wholesale' ? 'bg-primary-subtle text-primary' : 'bg-info-subtle text-info'}`} style={{ fontSize: '9px' }}>
                                                        {sale.Sale_Type === 'Wholesale' ? t('sales.wholesale') : t('sales.retail')}
                                                    </span>
                                                </td>
                                                <td className="fw-bold small">Rs.{parseFloat(sale.Total_Amount).toLocaleString()}</td>
                                                <td className="text-success small">Rs.{parseFloat(sale.Paid_Amount || 0).toLocaleString()}</td>
                                                <td className={`fw-bold small ${parseFloat(sale.Balance_Due) > 0 ? 'text-danger' : 'text-success'}`}>
                                                    Rs.{parseFloat(sale.Balance_Due || 0).toLocaleString()}
                                                </td>
                                                <td><PaymentBadge status={sale.Payment_Status} /></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Statement Tab */}
                    {activeTab === 'statement' && (
                        <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
                            <div className="card-header bg-white border-0 py-3 px-4">
                                <h6 className="fw-bold text-dark mb-0">{t('sales.customer_detail.statement_title')}</h6>
                            </div>
                            {statementLoading ? (
                                <div className="text-center py-5"><div className="spinner-border spinner-border-sm text-primary" /></div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle mb-0">
                                        <thead className="bg-light">
                                            <tr>
                                                {[
                                                    t('sales.date'),
                                                    t('sales.type_col'),
                                                    t('sales.amount_col'),
                                                    t('sales.running_balance_col'),
                                                    t('sales.reference_col'),
                                                    t('sales.notes_col')
                                                ].map(h => (
                                                    <th key={h} className="py-3 text-uppercase small fw-bold text-muted" style={{ fontSize: '10px' }}>{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {statement.length === 0 ? (
                                                <tr><td colSpan={6} className="text-center py-5 text-muted small">{t('sales.customer_detail.no_credit_found')}</td></tr>
                                            ) : statement.map(tx => (
                                                <tr key={tx.Credit_Trans_ID}>
                                                    <td className="small text-muted">{new Date(tx.Transaction_Date).toLocaleDateString()}</td>
                                                    <td>
                                                        <span className={`badge rounded-pill px-2 ${
                                                            tx.Transaction_Type === 'Credit_Taken' ? 'bg-danger-subtle text-danger' :
                                                            tx.Transaction_Type === 'Credit_Paid' ? 'bg-success-subtle text-success' :
                                                            'bg-secondary-subtle text-secondary'
                                                        }`} style={{ fontSize: '9px' }}>
                                                            {tx.Transaction_Type === 'Credit_Taken' ? t('sales.credit_taken') : tx.Transaction_Type === 'Credit_Paid' ? t('sales.credit_paid') : tx.Transaction_Type?.replace('_', ' ')}
                                                        </span>
                                                    </td>
                                                    <td className={`fw-bold small ${tx.Transaction_Type === 'Credit_Taken' ? 'text-danger' : 'text-success'}`}>
                                                        {tx.Transaction_Type === 'Credit_Taken' ? '+' : '-'}Rs.{parseFloat(tx.Amount).toLocaleString()}
                                                    </td>
                                                    <td className="fw-bold small">Rs.{parseFloat(tx.Running_Balance).toLocaleString()}</td>
                                                    <td className="small text-muted">{tx.Reference_No || '—'}</td>
                                                    <td className="small text-muted">{tx.Notes || '—'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CustomerDetailPage;
