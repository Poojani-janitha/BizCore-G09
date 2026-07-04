const sequelize = require('./config/db');
// Load all models and their associations so Sequelize registry knows about them
require('./models'); 

async function syncDb() {
  try {
    console.log('🔄 Starting Sequelize models-to-database sync...');
    
    // Clean up any legacy zero datetimes ('0000-00-00 00:00:00') that crash MySQL STRICT_TRANS_TABLES mode
    // We use a transaction to guarantee that both queries run on the same connection.
    try {
      console.log('🧹 Cleaning up legacy invalid dates in user_module_access...');
      const txn = await sequelize.transaction();
      try {
        await sequelize.query("SET SESSION sql_mode = ''", { transaction: txn });
        await sequelize.query("UPDATE `user_module_access` SET `Granted_At` = NOW()", { transaction: txn });
        await txn.commit();
        console.log('✅ Cleaned up user_module_access table!');
      } catch (e) {
        await txn.rollback();
        console.log('⚠️ user_module_access cleanup failed, trying uppercase table...', e.message);
        
        const txn2 = await sequelize.transaction();
        try {
          await sequelize.query("SET SESSION sql_mode = ''", { transaction: txn2 });
          await sequelize.query("UPDATE `USER_MODULE_ACCESS` SET `Granted_At` = NOW()", { transaction: txn2 });
          await txn2.commit();
          console.log('✅ Cleaned up USER_MODULE_ACCESS table!');
        } catch (e2) {
          await txn2.rollback();
          console.log('⚠️ USER_MODULE_ACCESS cleanup failed:', e2.message);
        }
      }
    } catch (err) {
      console.log('⚠️ Transaction initialization failed:', err.message);
    }

    // Clean up legacy Account_Type column in ACCOUNT_CHART. Since this field is now defined
    // as VIRTUAL in the model, the sync ({ alter: true }) step fails trying to change it to VIRTUAL type.
    try {
      console.log('🗑️ Dropping legacy column Account_Type from ACCOUNT_CHART...');
      await sequelize.query("ALTER TABLE `ACCOUNT_CHART` DROP COLUMN `Account_Type`");
      console.log('✅ Dropped legacy Account_Type column!');
    } catch (e) {
      console.log('ℹ️ ACCOUNT_CHART.Account_Type column drop skipped or already removed:', e.message);
    }

    // sync({ alter: true }) compares the model definitions to the database tables
    // and alters tables/creates missing ones without dropping existing tables/data.
    await sequelize.sync({ alter: true });
    
    console.log('✅ Sequelize model sync completed successfully!');
  } catch (error) {
    console.error('❌ Sequelize model sync failed:', error);
  } finally {
    await sequelize.close();
  }
}

syncDb();
