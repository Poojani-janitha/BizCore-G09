'use strict';

/**
 * Fix local HR tables — add columns that exist in Sequelize models
 * but are missing from the local development database.
 *
 * Tables affected:
 *  - attendance        → Cards_Produced (int, default 0)
 *  - employee_leave    → Document_Path  (varchar 500, nullable)
 *  - payroll           → Other_Deductions_Reason, Other_Allowances_Reason (text, nullable)
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {

    // ── Helper: add column only if it doesn't already exist ──────────
    const addIfMissing = async (table, column, definition) => {
      try {
        const cols = await queryInterface.describeTable(table);
        if (!Object.keys(cols).includes(column)) {
          await queryInterface.addColumn(table, column, definition);
          console.log(`✅ ${table}.${column} added`);
        } else {
          console.log(`⏭  ${table}.${column} already exists`);
        }
      } catch (err) {
        console.error(`❌ ${table}.${column} failed: ${err.message}`);
        throw err;
      }
    };

    // ── attendance.Cards_Produced ─────────────────────────────────────
    await addIfMissing('attendance', 'Cards_Produced', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: true,
      after: 'Overtime_Hours'
    });

    // ── employee_leave.Document_Path ──────────────────────────────────
    await addIfMissing('employee_leave', 'Document_Path', {
      type: Sequelize.STRING(500),
      allowNull: true,
      after: 'Notes'
    });

    // ── payroll.Other_Deductions_Reason ───────────────────────────────
    await addIfMissing('payroll', 'Other_Deductions_Reason', {
      type: Sequelize.TEXT,
      allowNull: true,
      after: 'Other_Deductions'
    });

    // ── payroll.Other_Allowances_Reason ───────────────────────────────
    await addIfMissing('payroll', 'Other_Allowances_Reason', {
      type: Sequelize.TEXT,
      allowNull: true,
      after: 'Other_Allowances'
    });

    console.log('✅ HR migration complete');
  },

  down: async (queryInterface) => {
    const remove = async (table, col) => {
      try {
        await queryInterface.removeColumn(table, col);
        console.log(`✅ Removed ${table}.${col}`);
      } catch {
        // column may not exist
      }
    };

    await remove('attendance',    'Cards_Produced');
    await remove('employee_leave','Document_Path');
    await remove('payroll',       'Other_Deductions_Reason');
    await remove('payroll',       'Other_Allowances_Reason');
  }
};
