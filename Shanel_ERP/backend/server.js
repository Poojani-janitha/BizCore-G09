const express = require("express");
const cors = require('cors');
require('dotenv').config();

const applyMiddleware = require('./middleware/appMiddleware');
const inventoryRoutes = require('./routes/inventory/inventory');
const productionRoutes = require('./routes/inventory/productionRoutes');

const app = express();
app.use(cors());
app.use(express.json());
applyMiddleware(app);

//Inventory routes
app.use('/api/inventory', inventoryRoutes);
app.use('/api/production', productionRoutes);

//Sales routes

//Customer routes
<<<<<<< HEAD
=======
app.use('/api/customer',customerRoutes);


//Sales routes

>>>>>>> ef9f1afad0ba7f63341702a9ec7c023026477ffa

//HR routes

//Finance routes

//Supplier routes

const PORT = process.env.PORT || 5000;

app.listen(PORT,()=>{
    console.log(`Backend running on port ${PORT}`);
})