const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');   

const Payment = sequelize.define('Payment',{
    Pay_ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Sale_ID: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    Payment_Date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    Payment_Time: {
        type: DataTypes.TIME,
        allowNull: false
    },
    Payment_Method: {
        type: DataTypes.ENUM('Cash', 'Bank_Deposit', 'Cheque', 'Credit', 'Card'),
        allowNull: false
    },
    Payment_Amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        get() {
            return parseFloat(this.getDataValue('Payment_Amount'));
        }
    },

    // Cash -----------------------------------------
    Cash_Received_By: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    Cash_Tendered: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        get() {
            return parseFloat(this.getDataValue('Cash_Tendered'));
        }
    },
    Cash_Change: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        get() {
            return parseFloat(this.getDataValue('Cash_Change'));
        }
    },

    // Bank Deposit ----------------------------------
    Bank_Name: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    Deposit_Slip_No: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    Deposited_By: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    Deposit_Date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },

    // Cheque ----------------------------------
    Cheque_No: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    Cheque_Date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    Cheque_Bank: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    Cheque_Status: {
        type: DataTypes.ENUM('Pending', 'Cleared', 'Bounced'),
        defaultValue: 'Pending',
        allowNull: true
    },
    Cleared_Date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },

    // Card ----------------------------------
    Card_Type: {
        type: DataTypes.ENUM('Visa', 'MasterCard', 'Amex', 'Other'),
        allowNull: true
    },
    Card_Last_4_Digits: {
        type: DataTypes.STRING(4),
        allowNull: true
    },
    Card_Transaction_ID: {
        type: DataTypes.STRING(100),
        allowNull: true
    },

    // Credit ----------------------------------
    Credit_Note_No: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    Credit_Terms: {
        type: DataTypes.STRING(100),
        allowNull: true
    },

    // Common ----------------------------------
    Reference_No: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    Notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    Received_By: {
        type: DataTypes.INTEGER,
        allowNull: true
    },

    // Receipt ----------------------------------
    Receipt_Printed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    Receipt_Print_Date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    Receipt_No: {
        type: DataTypes.STRING(30),
        allowNull: true
    },
    Status: {
        type: DataTypes.ENUM('Active', 'Void'),
        defaultValue: 'Active'
    }
},{
    tableName:'payment',
    timestamps: true,
    createdAt: 'Created_At',
    updatedAt:false
})

module.exports = Payment;