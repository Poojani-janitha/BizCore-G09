const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const User = sequelize.define('User', {
    User_ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Username: {
        type: DataTypes.STRING(50),
        unique: true,
        allowNull: false
    },
    Password_Hash: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'bcrypt or argon2 hash'
    },
    Full_Name: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    Email: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    Phone: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    User_Type: {
        type: DataTypes.ENUM(
            'Admin',
            'Manager',
            'Sales_Officer',
            'Cashier',
            'Production_Staff',
            'Finance_Staff'
        ),
        allowNull: false
    },
    Employee_ID: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Links to EMPLOYEE table if user is also an employee'
    },
    Status: {
        type: DataTypes.ENUM('Active', 'Inactive', 'Suspended'),
        defaultValue: 'Active'
    },
    Last_Login: {
        type: DataTypes.DATE,
        allowNull: true
    },
    Failed_Login_Attempts: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    Account_Locked_Until: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'USER',
    timestamps: true,
    createdAt: 'Created_At',
    updatedAt: 'Updated_At'
});

module.exports = User;
