const { DataTypes } = require('sequelize');


//export function form the file
// this function has 2 parameters , 1 is db object and define column type

const Customer = sequelize.define('Customer', {
    C_ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    Customer_Code: {
        type: DataTypes.STRING,
        unique: true
    },
    C_Name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    Contact_person: {
        type: DataTypes.STRING,
        allowNull: true
    },
    Phone1: {
        type: DataTypes.STRING,
        allowNull: false
    },
    Phone2: {
        type: DataTypes.STRING,
        allowNull: true
    },
    Email: {
        type: DataTypes.STRING,
        allowNull: true
    },
    Address: {
        type: DataTypes.STRING,
        allowNull: true
    },
    City: {
        type: DataTypes.STRING,
        allowNull: true
    },
    Customer_Type: {
        type: DataTypes.ENUM('Retail', 'Wholesale'),
        defaultValue: 'Retail'
    },
    Price_Level: {
        type: DataTypes.ENUM('Retail', 'Wholesale'),
        defaultValue: 'Retail'
    },
    Credit_Allowed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    Credit_Limit: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    },
    Current_Balance: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    },
    Payment_Terms: {
        type: DataTypes.STRING
    },
    Preferred_Payment_Method: {
        type: DataTypes.ENUM('Cash', 'Bank_Deposit', 'Cheque', 'Credit'),
        defaultValue: 'Cash',
    },
    Status: {
        type: DataTypes.ENUM('Active', 'Inactive', 'Blocked'),
        defaultValue: 'Active',
    },
    Last_Purchase_Date: {
        type: DataTypes.DATEONLY,
    },
    Total_Purchases: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0.00,
    },
    Loyalty_Points: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    Notes: {
        type: DataTypes.TEXT,
    },
    Created_BY: {
        type: DataTypes.INTEGER,
    }
}, {
    tableName: 'Customers',
    timestamps: true,
    createdAt: 'Created_At',
    updatedAt: 'Updated_At'
});


module.exports = Customer;