'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      console.log('🔄 Adding Balance_Brought_Forward column to account_chart table...');
      
      const tableInfo = await queryInterface.describeTable('account_chart');
      if (!tableInfo.Balance_Brought_Forward) {
        await queryInterface.addColumn('account_chart', 'Balance_Brought_Forward', {
          type: Sequelize.DECIMAL(15, 2),
          allowNull: true,
          defaultValue: 0.00,
          comment: 'Balance brought forward value (opening balance)'
        });
        console.log('✅ Balance_Brought_Forward column added successfully!');
      } else {
        console.log('⚠️ Balance_Brought_Forward column already exists, skipping...');
      }
    } catch (error) {
      console.error('❌ Error adding Balance_Brought_Forward column:', error.message);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      console.log('🔄 Removing Balance_Brought_Forward column from account_chart table...');
      
      const tableInfo = await queryInterface.describeTable('account_chart');
      if (tableInfo.Balance_Brought_Forward) {
        await queryInterface.removeColumn('account_chart', 'Balance_Brought_Forward');
        console.log('✅ Balance_Brought_Forward column removed successfully!');
      } else {
        console.log('⚠️ Balance_Brought_Forward column does not exist, skipping...');
      }
    } catch (error) {
      console.error('❌ Error removing Balance_Brought_Forward column:', error.message);
      throw error;
    }
  }
};
