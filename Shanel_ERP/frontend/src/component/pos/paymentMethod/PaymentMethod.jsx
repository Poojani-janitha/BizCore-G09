import React, { useEffect, useMemo, useState } from 'react';
import './PaymentMethod.css';
import { getBanks, getBranches } from '../../../services/bankService';
import { calculatePayment } from '../../../utils/paymentCalculator';

const PaymentMethod = ({ paymentData, setPaymentData, totalDue }) => {

    const toNumber = (value) => parseFloat(value) || 0;

    // Local state to manage payment inputs
    const [payments, setPayments] = useState({
        cashTendered: '',
        applied: '',  // NEW: Applied amount (auto-fills or user-defined)
        cheque: '',
        bankTrf: '',
    });

    // References state to hold all data holding fields together
    const [references, setReferences] = useState({
        chequeRef: '',
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

    useEffect(() => {
        const fetchBanks = async () => {
            const data = await getBanks();
            setBankList(data);
        };
        fetchBanks();
    }, []);

    const handleBankChange = async (bankName) => {
        setReferences({ ...references, cheque_bank: bankName, cheque_branch: '' });
        const selectedBank = bankList.find(b => b.bank_name === bankName);
        if (selectedBank) {
            const branches = await getBranches(selectedBank.bank_id);
            setBranchList(branches);
        } else {
            setBranchList([]);
        }
    };

    const [keepBalance, setKeepBalance] = useState(false);
    const [appliedError, setAppliedError] = useState('');

    // Validate Applied - cannot be greater than Cash Tendered
    useEffect(() => {
        const applied = toNumber(payments.applied);
        const cashTendered = toNumber(payments.cashTendered);

        if (applied > 0 && cashTendered > 0 && applied > cashTendered) {
            setAppliedError('Applied cannot be greater than Cash Tendered');
            // Clear applied field
            setPayments(prev => ({ ...prev, applied: '' }));
        } else {
            setAppliedError('');
        }
    }, [payments.applied, payments.cashTendered]);

    // Calculate payment status - Applied, Balance, Credit
    const paymentStatus = useMemo(() => {
        const cashTendered = toNumber(payments.cashTendered);
        const applied = toNumber(payments.applied);
        const chequeAmt = toNumber(payments.cheque);
        const bankAmt = toNumber(payments.bankTrf);

        // Use the calculator
        const result = calculatePayment({
            totalBill: toNumber(totalDue),
            cashTendered: cashTendered,
            applied: applied,
            cheque: chequeAmt,
            bank: bankAmt
        });

        return {
            applied: result.applied,
            balance: result.balance,
            credit: result.credit,
            change: result.change,
            balanceLabel: result.balance > 0 ? 'Balance Due' : 'Paid',
            creditLabel: result.credit > 0 ? 'Credit' : 'No Credit'
        };
    }, [payments.cashTendered, payments.applied, payments.cheque, payments.bankTrf, totalDue]);

    // Clear Applied when Cash Tendered is cleared
    useEffect(() => {
        const cashTendered = toNumber(payments.cashTendered);
        if (cashTendered === 0 && toNumber(payments.applied) > 0) {
            setPayments(prev => ({ ...prev, applied: '' }));
        }
    }, [payments.cashTendered]);

    useEffect(() => {
        // Calculate applied value internally (smart logic)
        let appliedValue = toNumber(payments.applied);
        const cashTendered = toNumber(payments.cashTendered);
        const tb = toNumber(totalDue);

        // If user didn't enter applied value (0 or empty)
        if (appliedValue === 0) {
            // If cash tendered exists
            if (cashTendered > 0) {
                // Applied = smaller of cash_tendered or total_bill
                appliedValue = Math.min(cashTendered, tb);
            } else {
                // If no cash tendered, applied is 0
                appliedValue = 0;
            }
        }

        // Determine dynamic Payment_Method string
        const activeMethods = [];
        if (toNumber(payments.cashTendered) > 0) activeMethods.push('Cash');
        if (toNumber(payments.cheque) > 0) activeMethods.push('Cheque');
        if (toNumber(payments.bankTrf) > 0) activeMethods.push('Bank Transfer');

        let methodString = activeMethods.length > 1 ? 'Mixed' : (activeMethods.length === 1 ? activeMethods[0] : 'Pending');
        
        // Calculate total payment amount
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
            Cheque_Ref: references.chequeRef,
            Bank_Ref: references.bankRef,
            Credit_Ref: references.creditRef,
            Cheque_No: references.chequeNo,
            Cheque_Date: references.chequeDate,
            Cheque_Bank: references.cheque_bank,
            Cheque_Branch: references.cheque_branch,
            Cheque_Delivered_By: references.cheque_delivered_by
        });
    }, [payments, references, keepBalance, setPaymentData, paymentStatus, totalDue]);

    return (
        <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '12px', 
            padding: '14px', 
            backgroundColor: '#f8f9fa', 
            borderRadius: '6px',
            border: '1px solid #e0e0e0'
        }}>
            {/* Main Grid - 3 Columns */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                
                {/* LEFT COLUMN - Payment Amounts */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <h6 style={{ fontSize: '12px', fontWeight: '600', color: '#333', marginBottom: '4px', borderBottom: '1px solid #ddd', paddingBottom: '6px' }}>Payment</h6>
                    
                    {/* Cash Tendered */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <label style={{ fontSize: '11px', fontWeight: '500', color: '#555', minWidth: '80px' }}>Cash Tendered</label>
                        <input
                            type="number"
                            value={payments.cashTendered}
                            onChange={(e) => setPayments({ ...payments, cashTendered: e.target.value })}
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                            style={{
                                flex: 1,
                                padding: '6px 8px',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                fontSize: '12px',
                                backgroundColor: '#c8e6c9',
                                fontWeight: '600'
                            }}
                        />
                    </div>

                    {/* Applied Amount - User enters manually, no auto-fill */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <label style={{ fontSize: '11px', fontWeight: '500', color: '#555', minWidth: '80px' }}>Applied</label>
                            <input
                                type="number"
                                value={payments.applied}
                                onChange={(e) => setPayments({ ...payments, applied: e.target.value })}
                                placeholder="0.00"
                                step="0.01"
                                min="0"
                                style={{
                                    flex: 1,
                                    padding: '6px 8px',
                                    border: appliedError ? '2px solid #d32f2f' : '1px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '12px',
                                    backgroundColor: appliedError ? '#ffebee' : '#ffe0b2',
                                    fontWeight: '600'
                                }}
                            />
                        </div>
                        {/* Error Message */}
                        {appliedError && (
                            <div style={{ paddingLeft: '80px' }}>
                                <span style={{ fontSize: '10px', color: '#d32f2f', fontWeight: '600' }}>
                                    ⚠ {appliedError}
                                </span>
                            </div>
                        )}
                        {/* Internal Applied Value Display */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '80px' }}>
                            <span style={{ fontSize: '10px', color: '#666', fontStyle: 'italic' }}>
                                Internal: {(() => {
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
                    </div>

                    {/* Change (Read-only) */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <label style={{ fontSize: '11px', fontWeight: '500', color: '#555', minWidth: '80px' }}>Change</label>
                        <input
                            type="text"
                            readOnly
                            value={paymentStatus.change.toFixed(2)}
                            style={{
                                flex: 1,
                                padding: '6px 8px',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                fontSize: '12px',
                                backgroundColor: '#ffebee',
                                fontWeight: '600'
                            }}
                        />
                    </div>

                    {/* Cheque */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <label style={{ fontSize: '11px', fontWeight: '500', color: '#555', minWidth: '80px' }}>Cheque</label>
                        <input
                            type="number"
                            value={payments.cheque}
                            onChange={(e) => setPayments({ ...payments, cheque: e.target.value })}
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                            style={{
                                flex: 1,
                                padding: '6px 8px',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                fontSize: '12px',
                                backgroundColor: '#ffccbc',
                                fontWeight: '600'
                            }}
                        />
                    </div>

                    {/* Bank Transfer */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <label style={{ fontSize: '11px', fontWeight: '500', color: '#555', minWidth: '80px' }}>Bank Trf</label>
                        <input
                            type="number"
                            value={payments.bankTrf}
                            onChange={(e) => setPayments({ ...payments, bankTrf: e.target.value })}
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                            style={{
                                flex: 1,
                                padding: '6px 8px',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                fontSize: '12px',
                                backgroundColor: '#bbdefb',
                                fontWeight: '600'
                            }}
                        />
                    </div>

                    {/* Credit Display */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
                        <label style={{ 
                            fontSize: '11px', 
                            fontWeight: '700', 
                            color: paymentStatus.credit > 0 ? '#d32f2f' : '#1b5e20', 
                            minWidth: '80px' 
                        }}>
                            {paymentStatus.creditLabel}
                        </label>
                        <input
                            type="text"
                            readOnly
                            value={paymentStatus.credit.toFixed(2)}
                            style={{
                                flex: 1,
                                padding: '6px 8px',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                fontSize: '12px',
                                backgroundColor: paymentStatus.credit > 0 ? '#ffebee' : '#e8f5e9',
                                fontWeight: '700',
                                color: paymentStatus.credit > 0 ? '#d32f2f' : '#1b5e20'
                            }}
                        />
                    </div>

                    {/* Keep Balance Checkbox */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #ddd' }}>
                        <input
                            type="checkbox"
                            checked={keepBalance}
                            onChange={(e) => setKeepBalance(e.target.checked)}
                            style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                        />
                        <label style={{ fontSize: '11px', fontWeight: '500', color: '#555', cursor: 'pointer' }}>Keep the balance</label>
                    </div>

                    {/* Overpayment Display */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
                        <label style={{ 
                            fontSize: '11px', 
                            fontWeight: '700', 
                            color: '#333', 
                            minWidth: '80px' 
                        }}>
                            Overpayment
                        </label>
                        <input
                            type="text"
                            readOnly
                            value={(() => {
                                try {
                                    // Calculate internal Applied value
                                    let internalApplied = toNumber(payments.applied);
                                    const cashTendered = toNumber(payments.cashTendered);
                                    const tb = toNumber(totalDue);
                                    
                                    if (internalApplied === 0 && cashTendered > 0) {
                                        internalApplied = Math.min(cashTendered, tb);
                                    }
                                    
                                    const total = internalApplied + toNumber(payments.cheque) + toNumber(payments.bankTrf);
                                    const overpayment = total - tb;
                                    return overpayment.toFixed(2);
                                } catch (error) {
                                    return '0.00';
                                }
                            })()}
                            style={(() => {
                                try {
                                    let internalApplied = toNumber(payments.applied);
                                    const cashTendered = toNumber(payments.cashTendered);
                                    const tb = toNumber(totalDue);
                                    
                                    if (internalApplied === 0 && cashTendered > 0) {
                                        internalApplied = Math.min(cashTendered, tb);
                                    }
                                    
                                    const total = internalApplied + toNumber(payments.cheque) + toNumber(payments.bankTrf);
                                    const overpayment = total - tb;
                                    
                                    return {
                                        flex: 1,
                                        padding: '6px 8px',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        fontSize: '12px',
                                        backgroundColor: overpayment > 0 ? '#e8f5e9' : overpayment < 0 ? '#ffebee' : '#fff',
                                        fontWeight: '600',
                                        color: overpayment > 0 ? '#1b5e20' : overpayment < 0 ? '#d32f2f' : '#333'
                                    };
                                } catch (error) {
                                    return {
                                        flex: 1,
                                        padding: '6px 8px',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        fontSize: '12px',
                                        backgroundColor: '#fff',
                                        fontWeight: '600'
                                    };
                                }
                            })()}
                        />
                    </div>

                </div>

                {/* MIDDLE COLUMN - References */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <h6 style={{ fontSize: '12px', fontWeight: '600', color: '#333', marginBottom: '4px', borderBottom: '1px solid #ddd', paddingBottom: '6px' }}>References</h6>
                    
                    {/* Cheque Ref */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '11px', fontWeight: '500', color: '#555' }}>Cheque Ref</label>
                        <input
                            type="text"
                            value={references.chequeRef}
                            onChange={(e) => setReferences({ ...references, chequeRef: e.target.value })}
                            placeholder=""
                            style={{
                                padding: '6px 8px',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                fontSize: '11px',
                                backgroundColor: '#fff'
                            }}
                        />
                    </div>

                    {/* Bank Ref */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '11px', fontWeight: '500', color: '#555' }}>Bank Ref</label>
                        <input
                            type="text"
                            value={references.bankRef}
                            onChange={(e) => setReferences({ ...references, bankRef: e.target.value })}
                            placeholder=""
                            style={{
                                padding: '6px 8px',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                fontSize: '11px',
                                backgroundColor: '#fff'
                            }}
                        />
                    </div>

                    {/* Credit Ref */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '11px', fontWeight: '500', color: '#555' }}>Credit Ref</label>
                        <input
                            type="text"
                            value={references.creditRef}
                            onChange={(e) => setReferences({ ...references, creditRef: e.target.value })}
                            placeholder=""
                            style={{
                                padding: '6px 8px',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                fontSize: '11px',
                                backgroundColor: '#fff'
                            }}
                        />
                    </div>
                </div>

                {/* RIGHT COLUMN - Cheque & Bank Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <h6 style={{ fontSize: '12px', fontWeight: '600', color: '#333', marginBottom: '4px', borderBottom: '1px solid #ddd', paddingBottom: '6px' }}>Details</h6>
                    
                    {/* Cheque No & Date Row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label style={{ fontSize: '11px', fontWeight: '500', color: '#555' }}>Cheque No</label>
                            <input
                                type="text"
                                value={references.chequeNo}
                                onChange={(e) => setReferences({ ...references, chequeNo: e.target.value })}
                                placeholder=""
                                style={{
                                    padding: '6px 8px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '11px',
                                    backgroundColor: '#fff'
                                }}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label style={{ fontSize: '11px', fontWeight: '500', color: '#555' }}>Chq. Date</label>
                            <input
                                type="date"
                                value={references.chequeDate}
                                onChange={(e) => setReferences({ ...references, chequeDate: e.target.value })}
                                style={{
                                    padding: '6px 8px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '11px',
                                    backgroundColor: '#fff'
                                }}
                            />
                        </div>
                    </div>

                    {/* Bank & Branch Row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label style={{ fontSize: '11px', fontWeight: '500', color: '#555' }}>Bank</label>
                            <select
                                value={references.cheque_bank}
                                onChange={(e) => handleBankChange(e.target.value)}
                                style={{
                                    padding: '6px 8px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '11px',
                                    backgroundColor: '#fff'
                                }}
                            >
                                <option value="">Select Bank</option>
                                {bankList.map(bank => (
                                    <option key={bank.bank_id} value={bank.bank_name}>{bank.bank_name}</option>
                                ))}
                            </select>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label style={{ fontSize: '11px', fontWeight: '500', color: '#555' }}>Branch</label>
                            <select
                                value={references.cheque_branch}
                                onChange={(e) => setReferences({ ...references, cheque_branch: e.target.value })}
                                disabled={!references.cheque_bank}
                                style={{
                                    padding: '6px 8px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '11px',
                                    backgroundColor: references.cheque_bank ? '#fff' : '#f5f5f5'
                                }}
                            >
                                <option value="">Select Branch</option>
                                {branchList.map(branch => (
                                    <option key={branch.branch_id} value={branch.branch_name}>{branch.branch_name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Cheque Delivered By */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '11px', fontWeight: '500', color: '#555' }}>Cheque Delivered By</label>
                        <input
                            type="text"
                            value={references.cheque_delivered_by}
                            onChange={(e) => setReferences({ ...references, cheque_delivered_by: e.target.value })}
                            placeholder="Person name or ID"
                            style={{
                                padding: '6px 8px',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                fontSize: '11px',
                                backgroundColor: '#fff'
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentMethod;