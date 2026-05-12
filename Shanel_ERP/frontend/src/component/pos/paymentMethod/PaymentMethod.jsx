import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getBanks, getBranches } from '../../../services/bankService';
import { calculatePayment } from '../../../utils/paymentCalculator';

const PaymentMethod = ({ paymentData, setPaymentData, totalDue, setError, customerData }) => {
    const { t } = useTranslation();
    const toNumber = (value) => parseFloat(value) || 0;

    const [payments, setPayments] = useState({
        cashTendered: '',
        applied: '',
        cheque: '',
        bankTrf: '',
    });

    const [references, setReferences] = useState({
        bankRef: '',
        creditRef: '',
        chequeNo: '',
        chequeDate: '',
        cheque_bank: '',
        cheque_branch: '',
        cheque_delivered_by: '',
    });

    const [bankList, setBankList] = useState([]);
    const [branchList, setBranchList] = useState([]);
    const [keepBalance, setKeepBalance] = useState(false);

    useEffect(() => {
        if (!paymentData || Object.keys(paymentData).length === 0) {
            setPayments({ cashTendered: '', applied: '', cheque: '', bankTrf: '' });
            setReferences({
                bankRef: '', creditRef: '', chequeNo: '',
                chequeDate: '', cheque_bank: '', cheque_branch: '', cheque_delivered_by: ''
            });
            setKeepBalance(false);
        }
    }, [paymentData]);

    useEffect(() => {
        const fetchBanks = async () => {
            const data = await getBanks();
            setBankList(data);
        };
        fetchBanks();
    }, []);

    const handleBankChange = async (bankName) => {
        setReferences(prev => ({ ...prev, cheque_bank: bankName, cheque_branch: '' }));
        if (!bankName) {
            setBranchList([]);
            return;
        }
        const selectedBank = bankList.find(b => (b.bank_name || b.Bank_Name) === bankName);
        if (selectedBank) {
            const branches = await getBranches(selectedBank.bank_id || selectedBank.Bank_ID);
            setBranchList(branches);
        }
    };

    const overpayment = useMemo(() => {
        const totalPaid = toNumber(payments.applied) + toNumber(payments.cheque) + toNumber(payments.bankTrf);
        const diff = totalPaid - toNumber(totalDue);
        return diff > 0 ? diff : 0;
    }, [payments, totalDue]);

    const paymentStatus = useMemo(() => {
        return calculatePayment({
            totalBill: toNumber(totalDue),
            cashTendered: toNumber(payments.cashTendered),
            applied: toNumber(payments.applied),
            cheque: toNumber(payments.cheque),
            bank: toNumber(payments.bankTrf)
        });
    }, [payments, totalDue]);

    useEffect(() => {
        let appliedValue = toNumber(payments.applied);
        const cashTendered = toNumber(payments.cashTendered);
        const tb = toNumber(totalDue);

        if (appliedValue === 0 && cashTendered > 0) {
            appliedValue = Math.min(cashTendered, tb);
        }

        const activeMethods = [];
        if (toNumber(payments.cashTendered) > 0) activeMethods.push('Cash');
        if (toNumber(payments.cheque) > 0) activeMethods.push('Cheque');
        if (toNumber(payments.bankTrf) > 0) activeMethods.push('Bank_Transfer');
        if (paymentStatus.credit > 0) activeMethods.push('Credit');

        let methodString = activeMethods.length > 1 ? 'Mixed' : (activeMethods.length === 1 ? activeMethods[0] : 'Pending');
        const totalPaymentAmount = appliedValue + toNumber(payments.cheque) + toNumber(payments.bankTrf);

        setPaymentData({
            Payment_Method: methodString,
            Payment_Amount: totalPaymentAmount,
            Cash_Tendered: toNumber(payments.cashTendered),
            Applied_Value: appliedValue,
            Cheque_Amount: toNumber(payments.cheque),
            Bank_Transfer_Amount: toNumber(payments.bankTrf),
            Balance: paymentStatus.balance,
            Credit_Amount: paymentStatus.credit,
            Change: paymentStatus.change,
            Invoice_Total: totalDue,
            Keep_Balance: keepBalance,
            Cheque_No: references.chequeNo,
            Cheque_Date: references.chequeDate,
            Cheque_Bank: references.cheque_bank,
            Cheque_Branch: references.cheque_branch,
            Cheque_Delivered_By: references.cheque_delivered_by,
            Bank_Ref: references.bankRef,
            Credit_Ref: references.creditRef
        });
    }, [payments, references, keepBalance, paymentStatus, totalDue, setPaymentData]);

    return (
        <div className="payment-method-container">
            <div className="row g-4">
                {/* Column 1: Payments */}
                <div className="col-md-4 border-end">
                    <h6 className="text-uppercase fw-bold text-primary mb-3" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>{t('paymentMethod.paymentDetails')}</h6>

                    <div className="mb-3">
                        <label className="form-label small fw-bold text-muted mb-1 text-uppercase">{t('paymentMethod.cashTendered')}</label>
                        <input type="number" className="form-control form-control-sm fw-bold border-success shadow-sm"
                            style={{ background: '#f0fff4', fontSize: '1rem' }}
                            value={payments.cashTendered} onChange={(e) => setPayments({ ...payments, cashTendered: e.target.value })}
                            placeholder="0.00" />
                    </div>

                    <div className="row g-2 mb-2">
                        <div className="col-6">
                            <label className="form-label small fw-bold text-muted mb-1 text-uppercase">{t('paymentMethod.applied')}</label>
                            <input type="number" className="form-control form-control-sm fw-bold border-warning shadow-sm"
                                style={{ background: '#fffbeb', fontSize: '0.9rem' }}
                                value={payments.applied} onChange={(e) => setPayments({ ...payments, applied: e.target.value })} />
                            <span style={{ fontSize: '0.65rem', color: '#666', fontStyle: 'italic', display: 'block', marginTop: '2px', lineHeight: '1' }}>
                                internally: {(() => {
                                    let internalApplied = toNumber(payments.applied);
                                    const cashTendered = toNumber(payments.cashTendered);
                                    const tb = toNumber(totalDue);

                                    if (internalApplied === 0 && cashTendered > 0) {
                                        internalApplied = Math.min(cashTendered, tb);
                                    }
                                    return internalApplied.toFixed(2);
                                })()}
                            </span>
                        </div>
                        <div className="col-6">
                            <label className="form-label small fw-bold text-muted mb-1 text-uppercase">{t('paymentMethod.change')}</label>
                            <input type="text" className="form-control form-control-sm fw-bold text-danger bg-white shadow-sm"
                                value={paymentStatus.change.toFixed(2)} readOnly />
                        </div>
                    </div>

                    <div className="row g-2 mb-3">
                        <div className="col-6">
                            <label className="form-label small fw-bold text-muted mb-1 text-uppercase">{t('paymentMethod.cheque')}</label>
                            <input type="number" className="form-control form-control-sm fw-bold border-primary shadow-sm"
                                style={{ background: '#eff6ff' }}
                                value={payments.cheque} onChange={(e) => setPayments({ ...payments, cheque: e.target.value })} />
                        </div>
                        <div className="col-6">
                            <label className="form-label small fw-bold text-muted mb-1 text-uppercase">{t('paymentMethod.bankTransfer')}</label>
                            <input type="number" className="form-control form-control-sm fw-bold border-info shadow-sm"
                                style={{ background: '#ecfeff' }}
                                value={payments.bankTrf} onChange={(e) => setPayments({ ...payments, bankTrf: e.target.value })} />
                        </div>
                    </div>

                    <div className="p-2 rounded bg-white border shadow-sm mt-2" style={{ borderColor: '#6366f1' }}>
                        <div className="d-flex justify-content-between align-items-center">
                            <label className="small fw-bold text-uppercase mb-0" style={{ fontSize: '0.65rem', color: '#4338ca' }}>{t('paymentMethod.creditAmount')}</label>
                            <input type="text" className="form-control form-control-sm fw-bold text-end border-0 p-0"
                                style={{ background: 'transparent', width: '100px', fontSize: '0.95rem', color: '#4338ca' }}
                                value={paymentStatus.credit.toFixed(2)} readOnly />
                        </div>
                    </div>
                </div>

                {/* Column 2: References */}
                <div className="col-md-4 border-end">
                    <h6 className="text-uppercase fw-bold text-primary mb-3" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>{t('paymentMethod.references')}</h6>

                    <div className="mb-3">
                        <label className="form-label small fw-bold text-muted mb-1 text-uppercase">{t('paymentMethod.chequeNo')}</label>
                        <input type="text" className="form-control form-control-sm shadow-sm"
                            value={references.chequeNo} onChange={(e) => setReferences({ ...references, chequeNo: e.target.value })} />
                    </div>

                    <div className="mb-3">
                        <label className="form-label small fw-bold text-muted mb-1 text-uppercase">{t('paymentMethod.bankRef')}</label>
                        <input type="text" className="form-control form-control-sm shadow-sm"
                            value={references.bankRef} onChange={(e) => setReferences({ ...references, bankRef: e.target.value })} />
                    </div>

                    <div className="mb-3">
                        <label className="form-label small fw-bold text-muted mb-1 text-uppercase">{t('paymentMethod.creditRef')}</label>
                        <input type="text" className="form-control form-control-sm shadow-sm"
                            value={references.creditRef} onChange={(e) => setReferences({ ...references, creditRef: e.target.value })} />
                    </div>
                </div>

                {/* Column 3: Details */}
                <div className="col-md-4">
                    <h6 className="text-uppercase fw-bold text-primary mb-3" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>{t('paymentMethod.otherDetails')}</h6>

                    <div className="mb-3">
                        <label className="form-label small fw-bold text-muted mb-1 text-uppercase">{t('paymentMethod.chequeDate')}</label>
                        <input type="date" className="form-control form-control-sm shadow-sm"
                            value={references.chequeDate} onChange={(e) => setReferences({ ...references, chequeDate: e.target.value })} />
                    </div>

                    <div className="row g-2 mb-3">
                        <div className="col-6">
                            <label className="form-label small fw-bold text-muted mb-1 text-uppercase">{t('paymentMethod.bank')}</label>
                            <select className="form-select form-select-sm shadow-sm" value={references.cheque_bank} onChange={(e) => handleBankChange(e.target.value)}>
                                <option value="">{t('paymentMethod.selectBank')}</option>
                                {bankList.map(bank => <option key={bank.bank_id} value={bank.bank_name}>{bank.bank_name}</option>)}
                            </select>
                        </div>
                        <div className="col-6">
                            <label className="form-label small fw-bold text-muted mb-1 text-uppercase">{t('paymentMethod.branch')}</label>
                            <select className="form-select form-select-sm shadow-sm" value={references.cheque_branch} onChange={(e) => setReferences({ ...references, cheque_branch: e.target.value })} disabled={!references.cheque_bank}>
                                <option value="">{t('paymentMethod.selectBranch')}</option>
                                {branchList.map(branch => <option key={branch.branch_id} value={branch.branch_name}>{branch.branch_name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="mb-3">
                        <label className="form-label small fw-bold text-muted mb-1 text-uppercase">{t('paymentMethod.deliveredBy')}</label>
                        <input type="text" className="form-control form-control-sm shadow-sm"
                            value={references.cheque_delivered_by} onChange={(e) => setReferences({ ...references, cheque_delivered_by: e.target.value })} />
                    </div>

                    <div className="d-flex align-items-center justify-content-between mt-3 p-2 rounded bg-light border border-dashed" style={{ borderStyle: 'dashed' }}>
                        <div className="form-check form-switch m-0">
                            <input className="form-check-input" type="checkbox" checked={keepBalance} onChange={(e) => setKeepBalance(e.target.checked)} />
                            <label className="form-check-label fw-bold text-primary small ms-1">{t('paymentMethod.keepBalance')}</label>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                            <span className="small fw-bold text-muted text-uppercase" style={{ fontSize: '0.65rem' }}>{t('paymentMethod.overpayment')}</span>
                            <input
                                type="text"
                                className="form-control form-control-sm fw-bold text-end border-0 bg-white"
                                style={{ width: '100px', fontSize: '0.85rem' }}
                                value={overpayment.toFixed(2)}
                                readOnly
                            />
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .payment-method-container .form-control:focus, .payment-method-container .form-select:focus {
                    box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.15);
                    border-color: #0d6efd;
                }
                .payment-method-container .form-label { font-size: 0.65rem; }
            `}</style>
        </div>
    );
};

export default PaymentMethod;