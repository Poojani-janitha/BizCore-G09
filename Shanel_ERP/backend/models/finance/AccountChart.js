const { Model, Sequelize } = require("sequelize");
const databaseCon = require("../../config/db");

class AccountChart extends Model {}

AccountChart.init({
    Account_ID: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    Account_Code: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true
    },
    Account_Name: {
        type: Sequelize.STRING(200),
        allowNull: false
    },
    Type_ID: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    Account_Type: {
        type: Sequelize.VIRTUAL,
        get() {
            const types = {
                1: 'Asset',
                2: 'Liability',
                3: 'Equity',
                4: 'Revenue',
                5: 'Expense'
            };
            return types[this.Type_ID];
        }
    },
    Account_Category: {
        type: Sequelize.STRING(100),
        allowNull: true
    },
    Parent_Account_ID: {
        type: Sequelize.INTEGER,
        allowNull: true
    },
    Is_Active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
    },
    Description: {
        type: Sequelize.TEXT,
        allowNull: true
    },
    Created_At: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    },
    Updated_At: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    },
    Current_Balance: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: true,
        defaultValue: 0.00
    },
    Balance_Brought_Forward: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: true,
        defaultValue: 0.00
    }
}, {
    sequelize: databaseCon,
    tableName: 'ACCOUNT_CHART',
    timestamps: false
});

module.exports = AccountChart;
