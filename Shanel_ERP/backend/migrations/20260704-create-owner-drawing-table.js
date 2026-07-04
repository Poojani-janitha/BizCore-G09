'use strict';

/**
 * MIGRATION: 20260704-create-owner-drawing-table
 * Creates the `owner_drawing` table — tracks owner cash/goods withdrawals.
 * Depends on: product table, account_chart table.
 * SAFE TO RUN: skips if table already exists.
 */

module.exports = {
    async up(queryInterface, Sequelize) {
        const existingTables = await queryInterface.showAllTables();

        if (existingTables.includes('owner_drawing')) {
            console.log('⚠️  owner_drawing already exists — skipped');
            return;
        }

        await queryInterface.createTable('owner_drawing', {
            Drawing_ID: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            Drawing_Date: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            Drawing_Type: {
                type: Sequelize.ENUM('Cash', 'Goods'),
                allowNull: false
            },
            P_ID: {
                type: Sequelize.INTEGER,
                allowNull: true,
                comment: 'FK → product.P_ID (only for Goods type)',
                references: { model: 'product', key: 'P_ID' },
                onDelete: 'SET NULL',
                onUpdate: 'CASCADE'
            },
            Qty: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: true
            },
            Unit_Cost: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: true
            },
            Total_Value: {
                type: Sequelize.DECIMAL(15, 2),
                allowNull: false
            },
            Account_ID: {
                type: Sequelize.INTEGER,
                allowNull: false,
                comment: 'FK → account_chart.Account_ID',
                references: { model: 'account_chart', key: 'Account_ID' },
                onDelete: 'RESTRICT',
                onUpdate: 'CASCADE'
            },
            Description: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            Created_At: {
                type: Sequelize.DATE,
                allowNull: true,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });

        console.log('✅ Created table: owner_drawing');
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('owner_drawing');
        console.log('✅ Dropped table: owner_drawing');
    }
};
