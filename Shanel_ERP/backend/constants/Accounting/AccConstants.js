
const ACCOUNTS = {
    // ASSETS
    CASH_IN_HAND: '1001',              // Account_Code: 1001
    BANK_ACCOUNT_BOC: '1002',          // Account_Code: 1002
    ACCOUNTS_RECEIVABLE: '1003',       // Account_Code: 1003
    INVENTORY: '1004',                 // Account_Code: 1004
    CHEQUES_IN_HAND: '1005',           // Account_Code: 1005
    
    // LIABILITIES
    ACCOUNTS_PAYABLE: '2001',          // Account_Code: 2001
    
    // EQUITY
    OWNER_CAPITAL: '3001',             // Account_Code: 3001
    RETAINED_EARNINGS: '3002',         // Account_Code: 3002 (if exists)
    
    // REVENUE
    SALES_REVENUE_RETAIL: '4001',      // Account_Code: 4001
    SALES_REVENUE_WHOLESALE: '4002',   // Account_Code: 4002
    OTHER_INCOME: '4003',              // Account_Code: 4003 (if exists)
    
    // EXPENSES
    COGS: '5001',                      // Account_Code: 5001
    SALARY_EXPENSE: '5002',            // Account_Code: 5002
    DISCOUNT_GIVEN: '5003'             // Account_Code: 5003
};

const PAYMENT_METHODS = {
    CASH: 'Cash',
    CREDIT: 'Credit',
    BANK: 'Bank',
    BANK_DEPOSIT: 'Bank_Deposit',
    CHEQUE: 'Cheque',
    CARD: 'Card'
};

module.exports = {
    ACCOUNTS,
    PAYMENT_METHODS
};