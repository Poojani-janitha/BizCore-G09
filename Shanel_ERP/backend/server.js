const express = require("express");
const cors = require('cors');
require('dotenv').config();

const applyMiddleware = require('./middleware/appMiddleware');
const inventoryRoutes = require('./routes/inventory/inventory');
const productionRoutes = require('./routes/inventory/productionRoutes');
const salesRoutes = require('./routes/inventory/salesRoutes');
const transferRoutes = require('./routes/inventory/transferRoutes');
const reportRoutes = require('./routes/inventory/reportRoutes');

const app = express();
app.use(cors());
app.use(express.json());
applyMiddleware(app);

//Inventory routes
app.use('/api/inventory', inventoryRoutes);
app.use('/api/production', productionRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/inventory/transfers', transferRoutes);
app.use('/api/inventory/reports', reportRoutes);
//Sales routes

//Customer routes

//HR routes

//Finance routes

//Supplier routes

const PORT = process.env.PORT || 5000;

app.listen(PORT,()=>{
    console.log(`Backend running on port ${PORT}`);
})