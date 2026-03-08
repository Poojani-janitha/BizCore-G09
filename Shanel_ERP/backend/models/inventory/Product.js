const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const Product = sequelize.define('Product', {
    P_ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    P_Code: {
        type: DataTypes.STRING(50),
        unique: true,
        allowNull: true,
        comment: 'Product code e.g., PROD-001'
    },
    P_Name: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    P_Name_Sinhala: {
        type: DataTypes.STRING(200),
        allowNull: true
    },
    P_Type: {
        type: DataTypes.ENUM('Finished', 'Raw', 'Resale'),
        allowNull: false,
        comment: 'Finished=Company Item, Raw=Material, Resale=Supplier Item'
    },
    Base_Unit: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: 'Base unit (Packet, Bottle, Kg, etc.)'
    },
    Status: {
        type: DataTypes.ENUM('Active', 'Inactive', 'Discontinued'),
        defaultValue: 'Active'
    },

    // Pricing (all per BASE UNIT)
    Cost_Price: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00,
        get() {
            return parseFloat(this.getDataValue('Cost_Price'));
        }
    },
    Retail_Price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        get() {
            return parseFloat(this.getDataValue('Retail_Price'));
        }
    },
    Wholesale_Price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        get() {
            return parseFloat(this.getDataValue('Wholesale_Price'));
        }
    },

    // Stock Management
    Min_Stock: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00,
        get() {
            return parseFloat(this.getDataValue('Min_Stock'));
        }
    },
    Max_Stock: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        get() {
            const val = this.getDataValue('Max_Stock');
            return val !== null ? parseFloat(val) : null;
        }
    },
    Reorder_Level: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        get() {
            const val = this.getDataValue('Reorder_Level');
            return val !== null ? parseFloat(val) : null;
        }
    },

    // Tax & Barcode
    Tax_Rate: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0.00,
        get() {
            return parseFloat(this.getDataValue('Tax_Rate'));
        }
    },
    Barcode: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    Barcode_Type: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: 'EAN-13, UPC, CODE128, QR'
    },
    Auto_Generate_Barcode: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },

    // Additional Info
    Category: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    Subcategory: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    Description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    Image_Path: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    Weight: {
        type: DataTypes.DECIMAL(10, 3),
        allowNull: true,
        get() {
            const val = this.getDataValue('Weight');
            return val !== null ? parseFloat(val) : null;
        }
    },
    Weight_Unit: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: 'g, kg, lb'
    },
    Created_By: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    tableName: 'PRODUCT',
    timestamps: true,
    createdAt: 'Created_At',
    updatedAt: 'Updated_At'
});

module.exports = Product;
