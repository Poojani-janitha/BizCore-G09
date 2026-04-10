const express = require("express");
const cors = require('cors');
require('dotenv').config();

const applyMiddleware = require('./middleware/appMiddleware');
const inventoryRoutes = require('./routes/inventory/inventory');
const productionRoutes = require('./routes/inventory/productionRoutes');
const customerRoutes = require('./routes/customer/CustomerRoutes');
const saleRoutes =  require('./routes/sales/SalesRoutes')

const app = express();
applyMiddleware(app);

//Inventory routes
app.use('/api/inventory', inventoryRoutes);
app.use('/api/production', productionRoutes);

//Sales routes
app.use('/api/sales',saleRoutes);

//Customer routes
app.use('/api/customer',customerRoutes);


//Sales routes


//HR routes

//Finance routes

//Supplier routes

const PORT = process.env.PORT || 5000;

app.listen(PORT,()=>{
    console.log(`Backend running on port ${PORT}`);
})