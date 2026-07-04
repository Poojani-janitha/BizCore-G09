'use strict';

/**
 * Fix local employee table:
 * 1. Add ETF_Number column (missing from local DB, exists in model)
 * 2. Fix Salary_Category ENUM to include Daily_Rate and Hybrid
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Use lowercase table name — works on both Windows and Linux
      const columns = await queryInterface.describeTable('employee');
      const existing = Object.keys(columns);

      // ── Add ETF_Number ──────────────────────────────────────────────
      if (!existing.includes('ETF_Number')) {
        await queryInterface.addColumn('employee', 'ETF_Number', {
          type: Sequelize.STRING(50),
          allowNull: true,
          after: 'EPF_Number'
        });
        console.log('✅ Added ETF_Number column');
      } else {
        console.log('⏭  ETF_Number already exists, skipping');
      }

      // ── Add Bank_Account_Name if missing ────────────────────────────
      if (!existing.includes('Bank_Account_Name')) {
        await queryInterface.addColumn('employee', 'Bank_Account_Name', {
          type: Sequelize.STRING(200),
          allowNull: true,
          after: 'Bank_Branch'
        });
        console.log('✅ Added Bank_Account_Name column');
      } else {
        console.log('⏭  Bank_Account_Name already exists, skipping');
      }

      // ── Fix Salary_Category ENUM ────────────────────────────────────
      await queryInterface.sequelize.query(`
        ALTER TABLE \`employee\`
        MODIFY COLUMN \`Salary_Category\`
          ENUM('Monthly_Fixed', 'Daily_Rate', 'Production_Based', 'Hybrid')
          NOT NULL;
      `);
      console.log('✅ Salary_Category ENUM updated');

      console.log('✅ Migration complete');
    } catch (error) {
      console.error('❌ Migration failed:', error.message);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      // Revert Salary_Category ENUM (only if no rows use Daily_Rate/Hybrid)
      await queryInterface.sequelize.query(`
        ALTER TABLE \`employee\`
        MODIFY COLUMN \`Salary_Category\`
          ENUM('Monthly_Fixed', 'Production_Based')
          NOT NULL;
      `);

      await queryInterface.removeColumn('employee', 'ETF_Number').catch(() => {});
      await queryInterface.removeColumn('employee', 'Bank_Account_Name').catch(() => {});

      console.log('✅ Migration reverted');
    } catch (error) {
      console.error('❌ Revert failed:', error.message);
      throw error;
    }
  }
};
