// ===== INVENTORY MODELS =====
const Product = require('./inventory/Product');
const Production = require('./inventory/Production');
const Inventory = require('./inventory/Inventory');
const StockTransfer = require('./inventory/StockTransfer');
const StockAdjustment = require('./inventory/StockAdjustment');
const UnitConversion = require('./inventory/UnitConversion');
const ProductReturn = require('./inventory/ProductReturn');

// ===== INVENTORY ASSOCIATIONS =====
const InventoryAssociations = require('./inventory/InventoryAssosiation');

// Initialize Inventory Associations
InventoryAssociations();

module.exports = { 
    Product, 
    Production, 
    Inventory, 
    StockTransfer,
    StockAdjustment,
    UnitConversion,
    ProductReturn
};