const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
    process.env.DB_NAME || 'shanel_erp', //
    process.env.DB_USER || 'root',
    process.env.DB_PASS || '12345',
    {
        host: process.env.DB_HOST || 'localhost',
        dialect: 'mysql',
        logging: false, // Set to true if you want to see the SQL in the terminal
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

// Test the connection
sequelize.authenticate()
    .then(() => console.log('✅ Database connected with Sequelize'))
    .catch(err => console.error('❌ Unable to connect to the database:', err));

module.exports = sequelize;
