const express = require("express");
const cors = require("cors");
const inventoryRoutes = require('./routes/inventory');
require('dotenv').config();

const app = express();
app.use(cors());  //allow frontend to access backend
app.use(express.json()); //parse json data

//link my inventry routes
app.use('/api/inventory', inventoryRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT,()=>{
    console.log(`Backend running on port ${PORT}`);
})