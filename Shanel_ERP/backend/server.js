const express = require("express");
const path = require("path");
require('dotenv').config();

/** Load Sequelize models & associations before routes so HR/inventory use one shared registry */
require('./models');

const applyMiddleware = require('./middleware/appMiddleware');
const inventoryRoutes = require('./routes/inventory/inventory');
const productionRoutes = require('./routes/inventory/productionRoutes');
const customerRoutes = require('./routes/customer/CustomerRoutes');
const inventorySalesRoutes = require('./routes/inventory/salesRoutes');
const productSalesRoutes = require('./routes/sales/SalesRoutes');
const transferRoutes = require('./routes/inventory/transferRoutes');
const reportRoutes = require('./routes/inventory/reportRoutes');
const accountingRoutes = require('./routes/Accounting/SalesAccountRoutes');
const expenseRoutes = require('./routes/Accounting/expenseRoutes');
const incomeRoutes = require('./routes/Accounting/incomeRoutes');
const hrRoutes = require('./routes/hr/hrRoutes');

const app = express();
applyMiddleware(app);

// ─── STATIC FILE SERVING (for product images) ─────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


//inventry routes
app.use('/api/inventory', inventoryRoutes);
app.use('/api/production', productionRoutes);
app.use('/api/inventory/sales', inventorySalesRoutes);
app.use('/api/sales', productSalesRoutes);
app.use('/api/inventory/transfers', transferRoutes);
app.use('/api/inventory/reports', reportRoutes);

//Sales routes
app.use('/api/sales', productSalesRoutes);



//Customer routes
app.use('/api/customer',customerRoutes);

// HR routes
app.use('/api/hr', hrRoutes);

//Finance routes
app.use('/api/accounting/sales', accountingRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/incomes', incomeRoutes);

//Supplier routes

const PORT = process.env.PORT || 5000;

app.listen(PORT,()=>{
    console.log(`Backend running on port ${PORT}`);
})