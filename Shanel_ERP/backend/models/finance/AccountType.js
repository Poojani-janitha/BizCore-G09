const { Model, Sequelize } = require("sequelize");
const databaseCon = require("../../config/db");

class AccountType extends Model {}

AccountType.init({
    Type_ID: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    Type_Name: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
    },
    Created_At: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    }
}, {
    sequelize: databaseCon,
    tableName: 'ACCOUNT_TYPE',
    timestamps: false
});

module.exports = AccountType;