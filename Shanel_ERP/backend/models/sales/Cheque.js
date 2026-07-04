const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

/**
 * Cheque — decoupled cheque entity
 * One row per physical cheque received. Linked to a Payment (receipt) via Pay_ID.
 * A cheque may settle parts of multiple invoices (via payment_allocations).
 */
const Cheque = sequelize.define('Cheque', {
    Cheque_ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Pay_ID: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'FK → payment.Pay_ID — the receipt event that logged this cheque'
    },
    C_ID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'FK → customer.C_ID'
    },
    Cheque_No: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    Bank: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    Branch: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    Cheque_Date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    Amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        get() {
            return parseFloat(this.getDataValue('Amount'));
        }
    },
    Cheque_Status: {
        type: DataTypes.ENUM('Pending', 'Cleared', 'Bounced', 'Expired'),
        allowNull: false,
        defaultValue: 'Pending'
    },
    Cleared_Date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    Cleared_By: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    Bounced_Date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    Bounced_By: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    Bounced_Reason: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    Notes: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'cheques',
    timestamps: true,
    createdAt: 'Created_At',
    updatedAt: 'Updated_At'
});

module.exports = Cheque;
