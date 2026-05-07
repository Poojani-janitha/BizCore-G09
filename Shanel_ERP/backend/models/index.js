// ===== INVENTORY MODELS =====
const Product = require('./inventory/Product');
const Production = require('./inventory/Production');
const Inventory = require('./inventory/Inventory');
const StockTransfer = require('./inventory/StockTransfer');
const StockAdjustment = require('./inventory/StockAdjustment');
const UnitConversion = require('./inventory/UnitConversion');
const ProductReturn = require('./inventory/ProductReturn');

// ===== BANK MODELS =====
const Bank = require('./Bank/Bank');
const Branch = require('./Bank/Branch');



// ===== INVENTORY ASSOCIATIONS =====
const InventoryAssociations = require('./inventory/InventoryAssosiation');
InventoryAssociations();

// ===== BANK ASSOCIATIONS =====
const BankAssociations = require('./Bank/associations');
BankAssociations;


//===== SALES MODELS =====
const Sale = require('./sales/Sales');
const SaleItem = require('./sales/SalesItem');
const Payment = require('./sales/Payment');
const CreditTranscation = require('./customer/CreditTranscation');
const SalesSummaryDaily = require('./sales/SalesSummaryDaily');

// ===== SALES ASSOCIATIONS =====
const SaleAssociations = require('./sales/SaleAssociation');
SaleAssociations();

// ===== USER MODELS =====
const User = require('./user/User');

// ===== HR MODELS =====
const Employee = require('./hr/Employee');
const EmployeeLeave = require('./hr/EmployeeLeave');
const EmployeeDocument = require('./hr/EmployeeDocument');
const Attendance = require('./hr/Attendance');
const AttendanceSummary = require('./hr/AttendanceSummary');
const SalaryStructure = require('./hr/SalaryStructure');
const Payroll = require('./hr/Payroll');
const AdvanceSalary = require('./hr/AdvanceSalary');
const AdvanceRepayment = require('./hr/AdvanceRepayment');


// ===== CUSTOMER MODELS =====
const Customer = require('./customer/customer');

// ===== SUPPLIER MODELS =====
const Supplier = require('./supplier/Supplier');
const SupplierTransaction = require('./supplier/SupplierTransaction');

/// ===== CUSTOMER ASSOCIATIONS =====
const CustomerAssociations = require('./customer/CustomerAssosiation');
CustomerAssociations();

// ===== HR ASSOCIATIONS =====
const hrAssociations = require('./hr/hrAssociations');
hrAssociations();


// ===== FINANCE MODELS & ASSOCIATIONS =====
const FinanceAssociations = require('./finance/associations');
const { AccountChart, BankAccount, BankTransaction, JournalEntry, JournalEntryLine, Expense, Income } = FinanceAssociations;


module.exports = {
    Product,
    Production,
    Inventory,
    StockTransfer,
    StockAdjustment,
    UnitConversion,
    ProductReturn,
    Customer,
    Sale,
    SaleItem,
    Payment,
    CreditTranscation,
    SalesSummaryDaily,
    User,
    Employee,
    EmployeeLeave,
    EmployeeDocument,
    Attendance,
    AttendanceSummary,
    SalaryStructure,
    Payroll,
    AdvanceSalary,
    AdvanceRepayment,
    AccountChart,
    BankAccount,
    BankTransaction,
    JournalEntry,
    JournalEntryLine,
    Expense,
    Income,
    Supplier,
    SupplierTransaction,
    Bank,
    Branch
};