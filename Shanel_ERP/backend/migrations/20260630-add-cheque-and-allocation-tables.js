'use strict';

/**
 * MIGRATION: 20260630-add-cheque-and-allocation-tables
 *
 * NOTE FOR THIS PROJECT: The backend uses `sequelize.sync({ alter: true })`
 * in server.js which auto-creates/updates tables when the backend restarts.
 * The Cheque and PaymentAllocation models are already defined in:
 *   - backend/models/sales/Cheque.js
 *   - backend/models/sales/PaymentAllocation.js
 *   - backend/models/index.js (registered)
 *   - backend/models/sales/SaleAssociation.js (associations)
 *
 * So SIMPLY RESTARTING THE BACKEND will create these tables automatically.
 * This migration file is for reference only if you use Sequelize CLI.
 *
 * Creates two new tables for the Sales Management module:
 *   1. cheques — decoupled cheque lifecycle tracking
 *   2. payment_allocations — FIFO allocation lines linking receipts to invoices
 *
 * SAFE TO RUN: only creates new tables, no existing tables modified.
 * ROLLBACK: drops the two tables if migrated down.
 */

module.exports = {
    async up(queryInterface, Sequelize) {
        // ── 1. cheques ──────────────────────────────────────────────────────────
        await queryInterface.createTable('cheques', {
            Cheque_ID: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            Pay_ID: {
                type: Sequelize.INTEGER,
                allowNull: true,
                comment: 'FK → payment.Pay_ID (the receipt that received this cheque)',
                references: { model: 'payment', key: 'Pay_ID' },
                onDelete: 'SET NULL',
                onUpdate: 'CASCADE'
            },
            C_ID: {
                type: Sequelize.INTEGER,
                allowNull: false,
                comment: 'FK → customer.C_ID',
                references: { model: 'customer', key: 'C_ID' },
                onDelete: 'RESTRICT',
                onUpdate: 'CASCADE'
            },
            Cheque_No: {
                type: Sequelize.STRING(100),
                allowNull: false,
                comment: 'Physical cheque number'
            },
            Bank: {
                type: Sequelize.STRING(100),
                allowNull: false
            },
            Branch: {
                type: Sequelize.STRING(100),
                allowNull: true
            },
            Cheque_Date: {
                type: Sequelize.DATEONLY,
                allowNull: false,
                comment: 'Date printed on the cheque'
            },
            Amount: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false
            },
            Cheque_Status: {
                type: Sequelize.ENUM('Pending', 'Cleared', 'Bounced', 'Expired'),
                allowNull: false,
                defaultValue: 'Pending'
            },
            Cleared_Date: {
                type: Sequelize.DATEONLY,
                allowNull: true
            },
            Cleared_By: {
                type: Sequelize.INTEGER,
                allowNull: true,
                comment: 'User_ID who cleared the cheque'
            },
            Bounced_Date: {
                type: Sequelize.DATE,
                allowNull: true
            },
            Bounced_By: {
                type: Sequelize.INTEGER,
                allowNull: true,
                comment: 'User_ID who recorded the bounce'
            },
            Bounced_Reason: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            Notes: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            Created_At: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            Updated_At: {
                type: Sequelize.DATE,
                allowNull: true
            }
        });

        // ── 2. payment_allocations ────────────────────────────────────────────
        await queryInterface.createTable('payment_allocations', {
            Alloc_ID: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            Pay_ID: {
                type: Sequelize.INTEGER,
                allowNull: false,
                comment: 'FK → payment.Pay_ID (receipt)',
                references: { model: 'payment', key: 'Pay_ID' },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE'
            },
            Sale_ID: {
                type: Sequelize.INTEGER,
                allowNull: false,
                comment: 'FK → Sales.Sale_Id (invoice being settled)',
                references: { model: 'Sales', key: 'Sale_Id' },
                onDelete: 'RESTRICT',
                onUpdate: 'CASCADE'
            },
            Allocated_Amount: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
                comment: 'Amount of this receipt applied to this invoice'
            },
            Allocation_Type: {
                type: Sequelize.ENUM('FIFO', 'Manual', 'Adjustment'),
                allowNull: false,
                defaultValue: 'FIFO'
            },
            Created_At: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });

        console.log('✅ Migration UP: cheques and payment_allocations tables created');
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('payment_allocations');
        await queryInterface.dropTable('cheques');
        console.log('✅ Migration DOWN: cheques and payment_allocations tables dropped');
    }
};
