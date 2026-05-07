const express = require("express");
const path = require("path");
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
const expenseRoutes = require('./routes/Accounting/expenseRoutes');
const incomeRoutes = require('./routes/Accounting/incomeRoutes');
const bankRoutes = require('./routes/bank/BankRoutes');
const salesManagementRoutes = require('./routes/saleManagement/SaleManagementRoute');
const databaseCon = require('./config/db');
const seedBanks = require('./scripts/seedBanks');
const seedProducts = require('./scripts/seedProducts');

const app = express();
applyMiddleware(app);



// ─── STATIC FILE SERVING (for product images) ─────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


//inventry routes
app.use('/api/inventory', inventoryRoutes);
app.use('/api/production', productionRoutes);
app.use('/api/inventory/sales', inventorySalesRoutes);
app.use('/api/inventory/transfers', transferRoutes);
app.use('/api/inventory/reports', reportRoutes);

//Sales routes
app.use('/api/sales', productSalesRoutes);
app.use('/api/banks', bankRoutes);



//Customer routes
app.use('/api/customer',customerRoutes);

//HR routes

//Finance routes
app.use('/api/accounting/sales', accountingRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/incomes', incomeRoutes);


//Supplier routes



//sales management routes

app.use('/api/sales-management', salesManagementRoutes);

const PORT = process.env.PORT || 5000;

databaseCon.authenticate()
    .then(() => {
        console.log('✅ Database connected with Sequelize');
        app.listen(PORT, () => {
            console.log(`Backend running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });