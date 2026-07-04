'use strict';

/**
 * Add 'Inactive' to the employee.Status ENUM.
 *
 * The Sequelize model and deleteEmployee controller both use 'Inactive'
 * as a soft-delete status, but the local DB ENUM only contains:
 * Active, On_Leave, Suspended, Resigned, Terminated.
 *
 * This migration adds 'Inactive' so soft-delete works correctly.
 */
module.exports = {
  up: async (queryInterface) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE \`employee\`
      MODIFY COLUMN \`Status\`
        ENUM('Active','Inactive','On_Leave','Suspended','Resigned','Terminated')
        DEFAULT 'Active';
    `);
    console.log('✅ employee.Status ENUM updated — Inactive added');
  },

  down: async (queryInterface) => {
    // Only safe if no rows have Status = 'Inactive'
    await queryInterface.sequelize.query(`
      ALTER TABLE \`employee\`
      MODIFY COLUMN \`Status\`
        ENUM('Active','On_Leave','Suspended','Resigned','Terminated')
        DEFAULT 'Active';
    `);
    console.log('✅ employee.Status ENUM reverted');
  }
};
