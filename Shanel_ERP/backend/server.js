const express = require("express");
const applyMiddleware = require('./middleware/appMiddleware');
const inventoryRoutes = require('./routes/inventory/inventory');
require('dotenv').config();

const app = express();

applyMiddleware(app);

//Inventory routes
app.use('/api/inventory', inventoryRoutes);

//Sales routes

//Customer routes

//HR routes

//Finance routes

//Supplier routes

const PORT = process.env.PORT || 5000;

app.listen(PORT,()=>{
    console.log(`Backend running on port ${PORT}`);
})