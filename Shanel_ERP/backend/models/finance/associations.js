const AccountChart      = require('./AccountChart');
const BankAccount       = require('./BankAccount');
const BankTransaction   = require('./BankTransaction');
const JournalEntry      = require('./JournalEntry');
const JournalEntryLine  = require('./JournalEntryLine');
const Expense           = require('./Expense');

// ── AccountChart self-referential (parent / children) ─────────────────────────
AccountChart.hasMany(AccountChart, {
    foreignKey: 'Parent_Account_ID',
    as: 'ChildAccounts'
});
AccountChart.belongsTo(AccountChart, {
    foreignKey: 'Parent_Account_ID',
    as: 'ParentAccount'
});

// ── AccountChart  <──>  BankAccount ───────────────────────────────────────────
AccountChart.hasMany(BankAccount, {
    foreignKey: 'Account_Chart_ID',
    as: 'BankAccounts'
});
BankAccount.belongsTo(AccountChart, {
    foreignKey: 'Account_Chart_ID',
    as: 'AccountChart'
});

// ── BankAccount  <──>  BankTransaction ────────────────────────────────────────
BankAccount.hasMany(BankTransaction, {
    foreignKey: 'Bank_Account_ID',
    as: 'Transactions'
});
BankTransaction.belongsTo(BankAccount, {
    foreignKey: 'Bank_Account_ID',
    as: 'BankAccount'
});

// ── JournalEntry  <──>  JournalEntryLine ──────────────────────────────────────
JournalEntry.hasMany(JournalEntryLine, {
    foreignKey: 'Journal_ID',
    as: 'Lines'
});
JournalEntryLine.belongsTo(JournalEntry, {
    foreignKey: 'Journal_ID',
    as: 'JournalEntry'
});

// ── AccountChart  <──>  JournalEntryLine ──────────────────────────────────────
AccountChart.hasMany(JournalEntryLine, {
    foreignKey: 'Account_ID',
    as: 'JournalLines'
});
JournalEntryLine.belongsTo(AccountChart, {
    foreignKey: 'Account_ID',
    as: 'Account'
});

// ── Expense  <──>  AccountChart ───────────────────────────────────────────────
Expense.belongsTo(AccountChart, {
    foreignKey: 'Account_ID',
    as: 'ExpenseAccount'
});
AccountChart.hasMany(Expense, {
    foreignKey: 'Account_ID',
    as: 'Expenses'
});

// ── Expense  <──>  BankAccount ────────────────────────────────────────────────
Expense.belongsTo(BankAccount, {
    foreignKey: 'Bank_Account_ID',
    as: 'BankAccount'
});
BankAccount.hasMany(Expense, {
    foreignKey: 'Bank_Account_ID',
    as: 'Expenses'
});

module.exports = {
    AccountChart,
    BankAccount,
    BankTransaction,
    JournalEntry,
    JournalEntryLine,
    Expense
};

