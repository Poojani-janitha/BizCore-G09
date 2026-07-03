const sequelize = require('./config/db');

async function fixDb() {
  try {
    await sequelize.query('UPDATE employee SET Status = "Inactive" WHERE Status != "Active" OR Status IS NULL');
    console.log('Fixed! All non-Active statuses have been set to Inactive.');
  } catch (error) {
    console.error(error);
  } finally {
    await sequelize.close();
  }
}

fixDb();
