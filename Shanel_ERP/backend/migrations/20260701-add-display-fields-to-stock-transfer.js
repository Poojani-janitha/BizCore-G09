'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      const columns = await queryInterface.describeTable('stock_transfer', { transaction });

      if (!columns.Display_Qty) {
        await queryInterface.addColumn('stock_transfer', 'Display_Qty', {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: true,
          comment: 'Quantity entered by user in selected unit'
        }, { transaction });
      }

      if (!columns.Display_Unit) {
        await queryInterface.addColumn('stock_transfer', 'Display_Unit', {
          type: Sequelize.STRING(50),
          allowNull: true,
          comment: 'Unit label selected by user at transfer time'
        }, { transaction });
      }

      await transaction.commit();
      console.log('Added Display_Qty and Display_Unit to stock_transfer');
    } catch (error) {
      await transaction.rollback();
      console.error('Migration failed:', error.message);
      throw error;
    }
  },

  async down(queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      const columns = await queryInterface.describeTable('stock_transfer', { transaction });

      if (columns.Display_Unit) {
        await queryInterface.removeColumn('stock_transfer', 'Display_Unit', { transaction });
      }

      if (columns.Display_Qty) {
        await queryInterface.removeColumn('stock_transfer', 'Display_Qty', { transaction });
      }

      await transaction.commit();
      console.log('Removed Display_Qty and Display_Unit from stock_transfer');
    } catch (error) {
      await transaction.rollback();
      console.error('Rollback failed:', error.message);
      throw error;
    }
  }
};