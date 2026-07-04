'use strict';

/**
 * MIGRATION: 20260704-sync-payment-table-fields
 *
 * Syncs the hosted `payment` table to match the full schema.
 *
 * Gap analysis (hosted DB vs full schema):
 *
 * HOSTED DB has 34 columns. All columns from the full schema ARE present.
 * However the hosted DB has one EXTRA orphan column:
 *   - `Note` (text)  — added by an old migration (20260506), now replaced by `Notes`
 *     Both exist in hosted. Model only uses `Notes`. `Note` is unused/orphan.
 *
 * This migration:
 *   1. Removes the orphan `Note` column (if it exists)
 *   2. Ensures all required columns from the full schema exist (idempotent adds)
 *
 * SAFE TO RUN: all operations check column existence first.
 */

module.exports = {
    async up(queryInterface, Sequelize) {
        const columns = await queryInterface.describeTable('payment');

        console.log('📋 Syncing payment table...');

        // ── 1. Remove orphan `Note` column (replaced by `Notes`) ────────────
        if (columns.Note) {
            await queryInterface.removeColumn('payment', 'Note');
            console.log('✅ Removed orphan column: Note');
        } else {
            console.log('⚠️  Note column not found — skipped');
        }

        // ── 2. Ensure `Notes` exists (the correct column) ───────────────────
        if (!columns.Notes) {
            await queryInterface.addColumn('payment', 'Notes', {
                type: Sequelize.TEXT,
                allowNull: true,
                comment: 'Payment notes/remarks'
            });
            console.log('✅ Added column: Notes');
        } else {
            console.log('⚠️  Notes already exists — skipped');
        }

        // ── 3. Ensure Receipt_Printed exists ────────────────────────────────
        if (!columns.Receipt_Printed) {
            await queryInterface.addColumn('payment', 'Receipt_Printed', {
                type: Sequelize.TINYINT(1),
                allowNull: true,
                defaultValue: 0,
                comment: 'Flag: receipt has been printed'
            });
            console.log('✅ Added column: Receipt_Printed');
        } else {
            console.log('⚠️  Receipt_Printed already exists — skipped');
        }

        // ── 4. Ensure Receipt_Print_Date exists ──────────────────────────────
        if (!columns.Receipt_Print_Date) {
            await queryInterface.addColumn('payment', 'Receipt_Print_Date', {
                type: Sequelize.DATE,
                allowNull: true,
                comment: 'Timestamp when receipt was printed'
            });
            console.log('✅ Added column: Receipt_Print_Date');
        } else {
            console.log('⚠️  Receipt_Print_Date already exists — skipped');
        }

        // ── 5. Ensure Status exists ──────────────────────────────────────────
        if (!columns.Status) {
            await queryInterface.addColumn('payment', 'Status', {
                type: Sequelize.ENUM('Active', 'Void'),
                allowNull: true,
                defaultValue: 'Active'
            });
            console.log('✅ Added column: Status');
        } else {
            console.log('⚠️  Status already exists — skipped');
        }

        // ── 6. Ensure Cheque_Amount exists ───────────────────────────────────
        if (!columns.Cheque_Amount) {
            await queryInterface.addColumn('payment', 'Cheque_Amount', {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: true,
                comment: 'Amount on cheque'
            });
            console.log('✅ Added column: Cheque_Amount');
        } else {
            console.log('⚠️  Cheque_Amount already exists — skipped');
        }

        // ── 7. Ensure Invoice_Total exists ───────────────────────────────────
        if (!columns.Invoice_Total) {
            await queryInterface.addColumn('payment', 'Invoice_Total', {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: true,
                comment: 'Total invoice amount at time of payment'
            });
            console.log('✅ Added column: Invoice_Total');
        } else {
            console.log('⚠️  Invoice_Total already exists — skipped');
        }

        // ── 8. Ensure Credit_Amount exists ───────────────────────────────────
        if (!columns.Credit_Amount) {
            await queryInterface.addColumn('payment', 'Credit_Amount', {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: true,
                comment: 'Amount kept as customer credit'
            });
            console.log('✅ Added column: Credit_Amount');
        } else {
            console.log('⚠️  Credit_Amount already exists — skipped');
        }

        console.log('\n✅ payment table sync complete\n');
    },

    async down(queryInterface, Sequelize) {
        // Restore Note column on rollback
        const columns = await queryInterface.describeTable('payment');
        if (!columns.Note) {
            await queryInterface.addColumn('payment', 'Note', {
                type: Sequelize.TEXT,
                allowNull: true,
                comment: 'Payment notes (legacy — restored by rollback)'
            });
            console.log('✅ Rollback: restored Note column');
        }
    }
};
