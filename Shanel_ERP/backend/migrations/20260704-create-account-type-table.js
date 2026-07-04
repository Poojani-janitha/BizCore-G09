'use strict';

/**
 * MIGRATION: 20260704-create-account-type-table
 * Creates the `account_type` table — account type lookup for chart of accounts.
 * NOTE: account_chart has a FK → account_type, so this must exist first.
 * SAFE TO RUN: skips if table already exists.
 */

module.exports = {
    async up(queryInterface, Sequelize) {
        const existingTables = await queryInterface.showAllTables();

        if (existingTables.includes('account_type')) {
            console.log('⚠️  account_type already exists — skipped');
            return;
        }

        await queryInterface.createTable('account_type', {
            Type_ID: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            Type_Name: {
                type: Sequelize.STRING(50),
                allowNull: false,
                unique: true
            },
            Created_At: {
                type: Sequelize.DATE,
                allowNull: true,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });

        // Seed the 5 default account types
        await queryInterface.bulkInsert('account_type', [
            { Type_Name: 'Asset',     Created_At: new Date() },
            { Type_Name: 'Liability', Created_At: new Date() },
            { Type_Name: 'Equity',    Created_At: new Date() },
            { Type_Name: 'Revenue',   Created_At: new Date() },
            { Type_Name: 'Expense',   Created_At: new Date() }
        ]);

        console.log('✅ Created and seeded table: account_type');
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('account_type');
        console.log('✅ Dropped table: account_type');
    }
};
