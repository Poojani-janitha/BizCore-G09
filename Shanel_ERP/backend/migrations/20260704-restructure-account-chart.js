'use strict';

/**
 * MIGRATION: 20260704-restructure-account-chart
 *
 * Restructures account_chart from ENUM-based to FK-based design:
 *   OLD: Account_Type ENUM('Asset','Liability','Equity','Revenue','Expense')
 *   NEW: Type_ID INT FK → account_type.Type_ID
 *
 * Also adds:
 *   - Current_Balance decimal(15,2) DEFAULT 0.00
 *   - Balance_Brought_Forward decimal(15,2) DEFAULT 0.00
 *
 * Then seeds the standard 21 chart of accounts entries.
 *
 * PREREQUISITES: account_type table must exist (run 20260704-create-account-type-table first).
 * SAFE: checks column existence before altering.
 */
module.exports = {
    async up(queryInterface, Sequelize) {
        const q = queryInterface.sequelize;

        // ── Step 1: Add Type_ID column if missing ─────────────────────────
        const cols = await queryInterface.describeTable('account_chart');

        if (!cols.Type_ID) {
            // Add nullable first so existing rows don't fail
            await queryInterface.addColumn('account_chart', 'Type_ID', {
                type: Sequelize.INTEGER,
                allowNull: true,
                after: 'Account_Name'
            });
            console.log('✅ Added Type_ID column');

            // Populate Type_ID from existing Account_Type ENUM values
            await q.query(`
                UPDATE account_chart ac
                JOIN account_type at2 ON at2.Type_Name COLLATE utf8mb4_unicode_ci = ac.Account_Type COLLATE utf8mb4_unicode_ci
                SET ac.Type_ID = at2.Type_ID
            `);
            console.log('✅ Populated Type_ID from Account_Type ENUM');

            // Now make it NOT NULL
            await queryInterface.changeColumn('account_chart', 'Type_ID', {
                type: Sequelize.INTEGER,
                allowNull: false
            });

            // Add FK constraint
            await q.query(`
                ALTER TABLE account_chart
                ADD CONSTRAINT fk_account_chart_type
                FOREIGN KEY (Type_ID) REFERENCES account_type(Type_ID)
            `);
            console.log('✅ Added FK constraint on Type_ID');
        } else {
            console.log('⏭  Type_ID already exists');
        }

        // ── Step 2: Add Current_Balance if missing ────────────────────────
        if (!cols.Current_Balance) {
            await queryInterface.addColumn('account_chart', 'Current_Balance', {
                type: Sequelize.DECIMAL(15, 2),
                defaultValue: 0.00,
                allowNull: true
            });
            console.log('✅ Added Current_Balance column');
        } else {
            console.log('⏭  Current_Balance already exists');
        }

        // ── Step 3: Add Balance_Brought_Forward if missing ────────────────
        if (!cols.Balance_Brought_Forward) {
            await queryInterface.addColumn('account_chart', 'Balance_Brought_Forward', {
                type: Sequelize.DECIMAL(15, 2),
                defaultValue: 0.00,
                allowNull: true,
                comment: 'Balance brought forward value (opening balance)'
            });
            console.log('✅ Added Balance_Brought_Forward column');
        } else {
            console.log('⏭  Balance_Brought_Forward already exists');
        }

        // ── Step 4: Drop Account_Type ENUM column if it exists ────────────
        const colsAfter = await queryInterface.describeTable('account_chart');
        if (colsAfter.Account_Type) {
            // Remove the index on Account_Type first
            try {
                await q.query(`ALTER TABLE account_chart DROP INDEX idx_account_type`);
            } catch { /* index may not exist */ }
            await queryInterface.removeColumn('account_chart', 'Account_Type');
            console.log('✅ Removed old Account_Type ENUM column');
        } else {
            console.log('⏭  Account_Type column already removed');
        }

        // ── Step 5: Seed standard chart of accounts (INSERT IGNORE) ──────
        await q.query(`
            INSERT IGNORE INTO account_chart
                (Account_Code, Account_Name, Type_ID, Account_Category, Parent_Account_ID,
                 Is_Active, Description, Created_At, Updated_At, Current_Balance, Balance_Brought_Forward)
            VALUES
                -- ASSETS
                ('1001', 'Cash in Hand',              1, 'Current Asset',  NULL, 1, 'Cash on hand',                   NOW(), NOW(), 0.00, 0.00),
                ('1002', 'Bank Account - BOC',         1, 'Current Asset',  NULL, 1, 'Bank account BOC',               NOW(), NOW(), 0.00, 0.00),
                ('1003', 'Accounts Receivable',        1, 'Current Asset',  NULL, 1, 'Customer receivables',           NOW(), NOW(), 0.00, 0.00),
                ('1004', 'Inventory',                  1, 'Current Asset',  NULL, 1, 'Inventory stock',                NOW(), NOW(), 0.00, 0.00),
                ('1005', 'Cheques in Hand',             1, 'Current Asset',  NULL, 1, 'Received cheques not deposited', NOW(), NOW(), 0.00, 0.00),
                -- LIABILITIES
                ('2001', 'Accounts Payable',           2, 'Current Liability', NULL, 1, 'Supplier payables',            NOW(), NOW(), 0.00, 0.00),
                -- EQUITY
                ('3001', 'Owner Capital',              3, NULL,             NULL, 1, 'Owner investment',               NOW(), NOW(), 0.00, 0.00),
                ('3002', 'Retained Earnings',          3, NULL,             NULL, 1, 'Accumulated retained earnings',  NOW(), NOW(), 0.00, 0.00),
                -- REVENUE
                ('4001', 'Sales Revenue - Retail',     4, NULL,             NULL, 1, 'Retail sales income',            NOW(), NOW(), 0.00, 0.00),
                ('4002', 'Sales Revenue - Wholesale',  4, NULL,             NULL, 1, 'Wholesale sales income',         NOW(), NOW(), 0.00, 0.00),
                ('4003', 'Other Income',               4, NULL,             NULL, 1, 'Interest, commission, etc.',     NOW(), NOW(), 0.00, 0.00),
                -- EXPENSES
                ('5001', 'Cost of Goods Sold',         5, 'Operating Expense', NULL, 1, 'COGS',                        NOW(), NOW(), 0.00, 0.00),
                ('5002', 'Salary Expense',             5, 'Operating Expense', NULL, 1, 'Employee salaries',           NOW(), NOW(), 0.00, 0.00),
                ('5003', 'Discount Given',             5, 'Operating Expense', NULL, 1, 'Customer discounts',          NOW(), NOW(), 0.00, 0.00),
                ('5004', 'Rent Expense',               5, 'Operating Expense', NULL, 1, 'Office/shop rent',            NOW(), NOW(), 0.00, 0.00),
                ('5005', 'Utilities Expense',          5, 'Operating Expense', NULL, 1, 'Electricity, water, etc.',    NOW(), NOW(), 0.00, 0.00),
                ('5006', 'Raw Materials Expense',      5, 'Operating Expense', NULL, 1, 'Raw material purchases',      NOW(), NOW(), 0.00, 0.00),
                ('5007', 'Transport Expense',          5, 'Operating Expense', NULL, 1, 'Transport costs',             NOW(), NOW(), 0.00, 0.00),
                ('5008', 'Maintenance Expense',        5, 'Operating Expense', NULL, 1, 'Repairs and maintenance',     NOW(), NOW(), 0.00, 0.00),
                ('5009', 'Marketing Expense',          5, 'Operating Expense', NULL, 1, 'Advertising and marketing',   NOW(), NOW(), 0.00, 0.00),
                ('5010', 'Office Supplies Expense',    5, 'Operating Expense', NULL, 1, 'Office supplies',             NOW(), NOW(), 0.00, 0.00),
                ('5011', 'Other Expense',              5, 'Operating Expense', NULL, 1, 'Miscellaneous expenses',      NOW(), NOW(), 0.00, 0.00)
        `);
        console.log('✅ Seeded standard chart of accounts');

        console.log('✅ account_chart restructure complete');
    },

    async down(queryInterface, Sequelize) {
        const q = queryInterface.sequelize;

        // Re-add Account_Type ENUM
        const cols = await queryInterface.describeTable('account_chart');
        if (!cols.Account_Type) {
            await queryInterface.addColumn('account_chart', 'Account_Type', {
                type: Sequelize.ENUM('Asset', 'Liability', 'Equity', 'Revenue', 'Expense'),
                allowNull: true
            });
            // Populate from Type_ID
            await q.query(`
                UPDATE account_chart ac
                JOIN account_type at2 ON at2.Type_ID = ac.Type_ID
                SET ac.Account_Type = at2.Type_Name
            `);
        }

        // Remove added columns
        try { await queryInterface.removeColumn('account_chart', 'Current_Balance'); } catch {}
        try { await queryInterface.removeColumn('account_chart', 'Balance_Brought_Forward'); } catch {}
        try {
            await q.query(`ALTER TABLE account_chart DROP FOREIGN KEY fk_account_chart_type`);
            await queryInterface.removeColumn('account_chart', 'Type_ID');
        } catch {}

        console.log('✅ account_chart reverted');
    }
};
