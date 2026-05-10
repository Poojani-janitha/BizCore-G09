/**
 * Simplified Payment Calculator
 * - Applied: auto-fills with cash_tendered (user can change)
 * - Balance: Total Bill - Applied
 * - Credit: Total Bill - Applied - Cheque - Bank
 */

/**
 * Calculate payment status based on applied, cheque, bank amounts
 * @param {Object} params
 * @param {number} params.totalBill - Total bill amount
 * @param {number} params.cashTendered - Cash customer handed over
 * @param {number} params.applied - Amount applied to bill (auto-filled or user-entered)
 * @param {number} params.cheque - Cheque amount
 * @param {number} params.bank - Bank transfer amount
 * @returns {Object} { applied, balance, credit, change }
 */
export const calculatePayment = ({
    totalBill = 0,
    cashTendered = 0,
    applied = 0,
    cheque = 0,
    bank = 0
}) => {
    const tb = parseFloat(totalBill) || 0;
    const ct = parseFloat(cashTendered) || 0;
    const ap = parseFloat(applied) || 0;
    const ch = parseFloat(cheque) || 0;
    const bk = parseFloat(bank) || 0;

    // Auto-fill Applied internally: if not manually set, use min(cash_tendered, total_bill)
    let finalApplied = ap;
    if (ap === 0 && ct > 0) {
        // Applied = smaller of cash_tendered or total_bill
        finalApplied = Math.min(ct, tb);
    }

    // Balance = Total Bill - Applied
    const balance = Math.max(tb - finalApplied, 0);

    // Credit = Total Bill - Applied - Cheque - Bank
    const credit = Math.max(tb - finalApplied - ch - bk, 0);

    // Change = Cash Tendered - Applied (if positive, customer gets change)
    const change = Math.max(ct - finalApplied, 0);

    return {
        applied: parseFloat(finalApplied.toFixed(2)),
        balance: parseFloat(balance.toFixed(2)),
        credit: parseFloat(credit.toFixed(2)),
        change: parseFloat(change.toFixed(2))
    };
};

/**
 * Auto-fill applied value when cash is entered
 */
export const getAutoApplied = (cashTendered, totalBill, currentApplied) => {
    const ct = parseFloat(cashTendered) || 0;
    const tb = parseFloat(totalBill) || 0;
    const ca = parseFloat(currentApplied) || 0;

    // If user hasn't manually set applied yet and has entered cash
    if (ca === 0 && ct > 0) {
        return Math.min(ct, tb); // Don't auto-apply more than bill
    }
    return ca;
};
