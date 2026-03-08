const {Sequelize} = require('sequelize');

const databasecon = new Sequelize({
    dialect: 'mysql',
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
}); 

module.exports = databasecon;