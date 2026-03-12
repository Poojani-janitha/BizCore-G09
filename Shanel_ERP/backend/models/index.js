
//Inventory models
const Product = require('./inventory/Product');
const Production = require('./inventory/Production');
const Inventory = require('./inventory/Inventory');


//Sales models
const Sale = require('./sales/Sales')
const SaleItem = require('./sales/SalesItem');
const Payment = require('./sales/Payment');
const SalesSummary = require('./sales/SalesSummaryDaily');
const setupCustomerAssociations = require('./customer/CustomerAssosiation');


//HR models

//Finance models

//Supplier models



//Define associations for customer module
setupCustomerAssociations();


// Define associations for inventory and production



// Define associations for sales module





// Product <-> Inventory
Product.hasMany(Inventory, { foreignKey: 'P_ID' });
Inventory.belongsTo(Product, { foreignKey: 'P_ID' });

// Product <-> Production
Product.hasMany(Production, { foreignKey: 'P_ID' });
Production.belongsTo(Product, { foreignKey: 'P_ID' });

// Production <-> Inventory
Production.hasMany(Inventory, { foreignKey: 'PR_ID' });
Inventory.belongsTo(Production, { foreignKey: 'PR_ID' });

module.exports = {
    Product,
    Production,
    Inventory,
    Sale,
    SaleItem,
    Payment,
    SalesSummary
};
