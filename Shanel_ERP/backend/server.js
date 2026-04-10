const express = require("express");
require('dotenv').config();

const applyMiddleware = require('./middleware/appMiddleware');
const inventoryRoutes = require('./routes/inventory/inventory');
const productionRoutes = require('./routes/inventory/productionRoutes');
const customerRoutes = require('./routes/customer/CustomerRoutes');
const inventorySalesRoutes = require('./routes/inventory/salesRoutes');
const productSalesRoutes = require('./routes/sales/SalesRoutes');
const transferRoutes = require('./routes/inventory/transferRoutes');
const reportRoutes = require('./routes/inventory/reportRoutes');
const accountingRoutes = require('./routes/Accounting/SalesAccountRoutes');

const app = express();
applyMiddleware(app);


//link my inventry routes
app.use('/api/inventory', inventoryRoutes);
app.use('/api/production', productionRoutes);
app.use('/api/sales', inventorySalesRoutes);
app.use('/api/sales', productSalesRoutes);
app.use('/api/inventory/transfers', transferRoutes);
app.use('/api/inventory/reports', reportRoutes);
//Sales routes
app.use('/api/accounting/sales', accountingRoutes);

//Customer routes
app.use('/api/customer',customerRoutes);

//HR routes

//Finance routes

//Supplier routes

const PORT = process.env.PORT || 5000;

app.listen(PORT,()=>{
    console.log(`Backend running on port ${PORT}`);
})