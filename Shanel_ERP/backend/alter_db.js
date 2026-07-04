const sequelize = require('./config/db');

async function fixDb() {
  try {
    await sequelize.query("ALTER TABLE employee MODIFY COLUMN Status ENUM('Active','Inactive','On_Leave','Suspended','Resigned','Terminated') DEFAULT 'Active'");
    await sequelize.query('UPDATE employee SET Status = "Inactive" WHERE Status = "" OR Status IS NULL');
    console.log('Database altered and fixed!');
  } catch (error) {
    console.error(error);
  } finally {
    await sequelize.close();
  }
}

fixDb();
