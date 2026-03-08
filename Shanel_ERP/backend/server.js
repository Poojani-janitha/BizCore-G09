const express = require("express");
const applyMiddleware = require('./middleware/appMiddleware');
const inventoryRoutes = require('./routes/inventory');
const customerRoutes = require('./routes/CustomerRoutes')
require('dotenv').config();

const app = express();

applyMiddleware(app);

//Inventry routes
app.use('/api/inventory', inventoryRoutes);

//Sales routes

//Customer routes
app.use('/api/customer',customerRoutes);
//HR routes

//Finance routes

//Supplier routes

const PORT = process.env.PORT || 5000;

app.listen(PORT,()=>{
    console.log(`Backend running on port ${PORT}`);
})