'use strict';

/**
 * MIGRATION: 20260630-add-void-audit-to-sales
 * Adds void audit trail columns to the Sales table.
 * These columns are all nullable so existing rows are unaffected.
 *
 * SAFE TO RUN: addColumn only, no data changes.
 * ROLLBACK: removes the three columns.
 */
module.exports = {
    async up(queryInterface, Sequelize) {
        const tableDesc = await queryInterface.describeTable('Sales');

        if (!tableDesc['Voided_By']) {
            await queryInterface.addColumn('Sales', 'Voided_By', {
                type: Sequelize.INTEGER,
                allowNull: true,
                comment: 'User_ID who voided this sale'
            });
        }

        if (!tableDesc['Voided_At']) {
            await queryInterface.addColumn('Sales', 'Voided_At', {
                type: Sequelize.DATE,
                allowNull: true,
                comment: 'Timestamp when sale was voided'
            });
        }

        if (!tableDesc['Void_Reason']) {
            await queryInterface.addColumn('Sales', 'Void_Reason', {
                type: Sequelize.TEXT,
                allowNull: true,
                comment: 'Reason given for voiding the sale'
            });
        }

        console.log('✅ Migration UP: Voided_By, Voided_At, Void_Reason added to Sales');
    },

    async down(queryInterface, Sequelize) {
        const tableDesc = await queryInterface.describeTable('Sales');

        if (tableDesc['Void_Reason']) {
            await queryInterface.removeColumn('Sales', 'Void_Reason');
        }
        if (tableDesc['Voided_At']) {
            await queryInterface.removeColumn('Sales', 'Voided_At');
        }
        if (tableDesc['Voided_By']) {
            await queryInterface.removeColumn('Sales', 'Voided_By');
        }

        console.log('✅ Migration DOWN: Voided_By, Voided_At, Void_Reason removed from Sales');
    }
};
