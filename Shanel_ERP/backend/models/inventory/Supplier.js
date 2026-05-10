const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const Supplier = sequelize.define(
    "Supplier",
    {
        S_ID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        S_Code: {
            type: DataTypes.STRING(50),
            allowNull: true,
            unique: true
        },
        S_Name: {
            type: DataTypes.STRING(200),
            allowNull: false
        },
        Contact_Person: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        Phone_No: {
            type: DataTypes.STRING(20),
            allowNull: true
        },
        Phone_No_2: {
            type: DataTypes.STRING(20),
            allowNull: true
        },
        Email: {
            type: DataTypes.STRING(100),
            allowNull: true,
            validate: {
                isEmail: true
            }
        },
        Address: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        City: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        Country: {
            type: DataTypes.STRING(100),
            defaultValue: "Sri Lanka"
        },
        Payment_Terms: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        Credit_Limit: {
            type: DataTypes.DECIMAL(15, 2),
            defaultValue: 0.00
        },
        Current_Balance: {
            type: DataTypes.DECIMAL(15, 2),
            defaultValue: 0.00
        },
        Tax_ID: {
            type: DataTypes.STRING(50),
            allowNull: true
        },
        Bank_Name: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        Bank_Account_No: {
            type: DataTypes.STRING(50),
            allowNull: true
        },
        Bank_Branch: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        Status: {
            type: DataTypes.ENUM('Active', 'Inactive', 'Blocked'),
            defaultValue: 'Active'
        },
        Rating: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        Notes: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        Created_By: {
            type: DataTypes.INTEGER,
            allowNull: true
        }
    },
    {
        tableName: "supplier",
        timestamps: true,
        createdAt: "Created_At",
        updatedAt: "Updated_At",
    }
);

module.exports = Supplier;
