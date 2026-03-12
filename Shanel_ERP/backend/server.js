const express = require("express");
const applyMiddleware = require('./middleware/appMiddleware');
const inventoryRoutes = require('./routes/inventory/inventory');
const customerRoutes = require('./routes/customer/CustomerRoutes')
const productionRoutes = require('./routes/inventory/productionRoutes');

require('dotenv').config();



const app = express();

applyMiddleware(app);

//Inventory routes
app.use('/api/inventory', inventoryRoutes);
app.use('/api/production', productionRoutes);

//Sales routes

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