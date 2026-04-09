const express = require("express");
const cors = require("cors");
const inventoryRoutes = require('./routes/inventory');
require('dotenv').config();

const applyMiddleware = require('./middleware/appMiddleware');
const inventoryRoutes = require('./routes/inventory/inventory');
const productionRoutes = require('./routes/inventory/productionRoutes');
const customerRoutes = require('./routes/customer/CustomerRoutes');
const accountingRoutes = require('./routes/Accounting/SalesAccountRoutes');

const app = express();
app.use(cors());  //allow frontend to access backend
app.use(express.json()); //parse json data

//link my inventry routes
app.use('/api/inventory', inventoryRoutes);
app.use('/api/production', productionRoutes);

//Sales routes

//Customer routes
app.use('/api/customer',customerRoutes);

//Accounting/Finance routes
app.use('/api/accounting', accountingRoutes);


//HR routes

//Finance routes

//Supplier routes

const PORT = process.env.PORT || 5000;

app.listen(PORT,()=>{
    console.log(`Backend running on port ${PORT}`);
})