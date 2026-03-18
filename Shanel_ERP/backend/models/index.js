
//Inventory models
const Product = require('./inventory/Product');
const Production = require('./inventory/Production');
const Inventory = require('./inventory/Inventory');
const setupInventoryAssociations = require('./inventory/InventoryAssosiation');



// Define associations for inventory and production
setupInventoryAssociations();


//Sales models
const Sale = require('./sales/Sales')
const SaleItem = require('./sales/SalesItem');
const Payment = require('./sales/Payment');
const SalesSummary = require('./sales/SalesSummaryDaily');
const setupSalesAssociations = require('./sales/SaleAssociation');

// Define associations for sales module
setupSalesAssociations();



//Customer models
const Customer = require('./customer/customer');
const CreditTranscation = require('./customer/CreditTranscation');
const CustomerNofification = require('./customer/CustomerNotification');
const CustomerBuyingPattern = require('./customer/CustomerBuyingPattern');
const setupCustomerAssociations = require('./customer/CustomerAssosiation');


//Define associations for customer module
setupCustomerAssociations();


//HR models

//Finance models

//Supplier models





module.exports = {
    Product,
    Production,
    Inventory,
    Sale,
    SaleItem,
    Payment,
    SalesSummary
};
