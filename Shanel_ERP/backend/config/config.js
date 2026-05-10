require('dotenv').config();
<<<<<<< HEAD
=======
const mysql2 = require('mysql2');
>>>>>>> 3308205b9ee0dce171c81fda80a09f70a2f268bf

module.exports = {
  development: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '1234',
    database: process.env.DB_NAME || 'shanel_erp',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
<<<<<<< HEAD
    dialect: 'mysql'
  },
  test: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: 'mysql'
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: 'mysql'
=======
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
>>>>>>> 3308205b9ee0dce171c81fda80a09f70a2f268bf
  }
};
