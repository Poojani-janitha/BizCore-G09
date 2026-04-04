const Product = require('./inventory/Product');
const Production = require('./inventory/Production');
const Inventory = require('./inventory/Inventory');
const StockTransfer = require('./inventory/StockTransfer');

// Product <-> Inventory
Product.hasMany(Inventory, { foreignKey: 'P_ID' });
Inventory.belongsTo(Product, { foreignKey: 'P_ID' });

// Product <-> Production
Product.hasMany(Production, { foreignKey: 'P_ID' });
Production.belongsTo(Product, { foreignKey: 'P_ID' });

// Production <-> Inventory
Production.hasMany(Inventory, { foreignKey: 'PR_ID' });
Inventory.belongsTo(Production, { foreignKey: 'PR_ID' });

module.exports = { Product, Production, Inventory, StockTransfer };