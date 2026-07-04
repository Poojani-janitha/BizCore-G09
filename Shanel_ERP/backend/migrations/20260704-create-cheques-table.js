'use strict';

/**
 * MIGRATION: 20260704-create-cheques-table
 * Creates the `cheques` table — decoupled cheque lifecycle tracking.
 * SAFE TO RUN: skips if table already exists.
 */

module.exports = {
    async up(queryInterface, Sequelize) {
        const existingTables = await queryInterface.showAllTables();

        if (existingTables.includes('cheques')) {
            console.log('⚠️  cheques already exists — skipped');
            return;
        }

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
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE'
            },
            Cheque_No: {
                type: Sequelize.STRING(100),
                allowNull: false
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
                allowNull: false
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

        console.log('✅ Created table: cheques');
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('cheques');
        console.log('✅ Dropped table: cheques');
    }
};
