const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const Product = sequelize.define(
    "Product",
    {
        P_ID: { 
            type: DataTypes.INTEGER, 
            primaryKey: true, 
            autoIncrement: true },

        P_Code: { 
            type: DataTypes.STRING(50), 
            unique: true, 
            allowNull: true },

        P_Name: { 
            type: DataTypes.STRING(200), 
            allowNull: false },

        P_Type: {
            type: DataTypes.ENUM("Company", "Other", "Raw"),
            allowNull: false,
        },

        Base_Unit: { 
            type: DataTypes.STRING(50), 
            allowNull: false },

        Status: {
            type: DataTypes.ENUM("Active", "Inactive", "Discontinued"),
            defaultValue: "Active",
        },

        Cost_Price: { 
            type: DataTypes.DECIMAL(10, 2), 
            defaultValue: 0.0 },

        Retail_Price: { 
            type: DataTypes.DECIMAL(10, 2), 
            allowNull: false },

        Wholesale_Price: { 
            type: DataTypes.DECIMAL(10, 2), 
            allowNull: false },
            
        Min_Stock: { 
            type: DataTypes.DECIMAL(10, 2), 
            defaultValue: 0.0 },
    },
    {
        tableName: "product",
        timestamps: true,
        createdAt: "Created_At",
        updatedAt: "Updated_At",
    },
);

module.exports = Product;
