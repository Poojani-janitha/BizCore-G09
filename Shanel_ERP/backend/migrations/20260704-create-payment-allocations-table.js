'use strict';

/**
 * MIGRATION: 20260704-create-payment-allocations-table
 * Creates the `payment_allocations` table — FIFO receipt-to-invoice allocation lines.
 * Depends on: payment table, sales table.
 * SAFE TO RUN: skips if table already exists.
 */

module.exports = {
    async up(queryInterface, Sequelize) {
        const existingTables = await queryInterface.showAllTables();

        if (existingTables.includes('payment_allocations')) {
            console.log('⚠️  payment_allocations already exists — skipped');
            return;
        }

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
                comment: 'FK → sales.Sale_Id (invoice being settled)',
                references: { model: 'sales', key: 'Sale_Id' },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE'
            },
            Allocated_Amount: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
                comment: 'Amount of the receipt applied to this invoice'
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

        console.log('✅ Created table: payment_allocations');
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('payment_allocations');
        console.log('✅ Dropped table: payment_allocations');
    }
};
