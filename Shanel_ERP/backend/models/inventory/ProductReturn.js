const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

// Covers PRODUCT_RETURN table (section 7.4 in schema)
// Return_Type='Customer' uses Ref_ID → Sale_ID from SALES table

const ProductReturn = sequelize.define('ProductReturn', {
    RT_ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    P_ID: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    PR_ID: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Production batch ID if applicable'
    },
    Return_Type: {
        type: DataTypes.ENUM('Customer', 'Supplier'),
        allowNull: false
    },
    Ref_ID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Sale_ID for customer return, PO_ID for supplier return'
    },
    Qty: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Quantity in BASE UNIT',
        get() {
            return parseFloat(this.getDataValue('Qty'));
        }
    },
    Reason: {
        type: DataTypes.ENUM(
            'Damaged',
            'Expired',
            'Wrong_Product',
            'Quality_Issue',
            'Overstocked',
            'Other'
        ),
        allowNull: false
    },
    Reason_Details: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    Return_Date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    Refund_Amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        get() {
            const val = this.getDataValue('Refund_Amount');
            return val !== null ? parseFloat(val) : null;
        }
    },
    Restock: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        comment: 'Add back to inventory?'
    },
    Status: {
        type: DataTypes.ENUM('Pending', 'Approved', 'Rejected', 'Completed'),
        defaultValue: 'Pending'
    },
    Approved_By: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    Approved_Date: {
        type: DataTypes.DATEONLY,
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
}, {
    tableName: 'PRODUCT_RETURN',
    timestamps: true,
    createdAt: 'Created_At',
    updatedAt: 'Updated_At'
});

module.exports = ProductReturn;
