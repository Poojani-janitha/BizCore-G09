require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '1234',
    database: process.env.DB_NAME || 'shanel_erp',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    dialectOptions: {
      charset: 'utf8mb4'
    }
  },
  production: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '1234',
    database: process.env.DB_NAME || 'shanel_erp',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    dialectOptions: {
      charset: 'utf8mb4'
    }
  }
};
