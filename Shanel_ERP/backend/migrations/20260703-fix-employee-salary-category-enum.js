'use strict';

/**
 * Fix Salary_Category ENUM on the employee table.
 *
 * The Sequelize model defines only ('Monthly_Fixed', 'Production_Based')
 * but the database (and some existing rows) also use 'Daily_Rate' and 'Hybrid'.
 * Sequelize throws a validation error when it encounters an unknown ENUM value,
 * causing GET /api/hr/employees to return 500.
 *
 * This migration aligns the DB column definition with all four values so that
 * Sequelize can load every row without errors.
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      console.log('🔄 Fixing Salary_Category ENUM on employee table...');

      await queryInterface.sequelize.query(`
        ALTER TABLE \`employee\`
        MODIFY COLUMN \`Salary_Category\`
          ENUM('Monthly_Fixed', 'Daily_Rate', 'Production_Based', 'Hybrid')
          NOT NULL;
      `);

      console.log('✅ Salary_Category ENUM updated to include Daily_Rate and Hybrid.');
    } catch (error) {
      console.error('❌ Migration failed:', error.message);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      console.log('🔄 Reverting Salary_Category ENUM to original two values...');

      // Only safe to run if no rows contain 'Daily_Rate' or 'Hybrid'
      await queryInterface.sequelize.query(`
        ALTER TABLE \`employee\`
        MODIFY COLUMN \`Salary_Category\`
          ENUM('Monthly_Fixed', 'Production_Based')
          NOT NULL;
      `);

      console.log('✅ Salary_Category ENUM reverted.');
    } catch (error) {
      console.error('❌ Revert failed:', error.message);
      throw error;
    }
  }
};
