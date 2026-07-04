const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

/**
 * PaymentAllocation — FIFO allocation lines
 * Links a Payment (Receipt) to one or more Sale invoices.
 * System-generated (not user-facing). Created by recordReceipt().
 * Used by bounceCheque() to identify which invoices must be re-opened.
 */
const PaymentAllocation = sequelize.define('PaymentAllocation', {
    Alloc_ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Pay_ID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'FK → payment.Pay_ID (the receipt)'
    },
    Sale_ID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'FK → Sales.Sale_Id (invoice being settled)'
    },
    Allocated_Amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Amount of the receipt applied to this invoice',
        get() {
            return parseFloat(this.getDataValue('Allocated_Amount'));
        }
    },
    Allocation_Type: {
        type: DataTypes.ENUM('FIFO', 'Manual', 'Adjustment'),
        allowNull: false,
        defaultValue: 'FIFO'
    }
}, {
    tableName: 'payment_allocations',
    timestamps: true,
    createdAt: 'Created_At',
    updatedAt: false
});

module.exports = PaymentAllocation;
