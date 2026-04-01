const { Product, Inventory, Production } = require('../../models/index');
const sequelize = require('../../config/db');
const { Op } = require('sequelize');

// 1. Get Dashboard Stats
const getDashboardStats = async (req, res) => {
    try {
        // --- 1. STOCK LEVELS (For Bar Chart) ---
        // We fetch name, total sum of inventory, and min_stock
        const stockLevelData = await Product.findAll({
            attributes: [
                ['P_Name', 'name'], 
                ['Min_Stock', 'min'],
                [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('Inventories.Qty')), 0), 'current']
            ],
            include: [{
                model: Inventory,
                attributes: [],
                required: false
            }],
            group: ['Product.P_ID'],
            where: {
                Min_Stock: { [Op.gt]: 0 } // Only include products that have a min stock defined
            },
            subQuery: false
        });

        // --- 2. LOW STOCK ALERTS ---
        // Logic: Find products where Total Inventory <= Min_Stock
        const products = await Product.findAll({
            attributes: ['P_Name', 'Min_Stock', 'P_Type'],
            include: [{ model: Inventory, attributes: ['Qty'] }]
        });

        const alerts = [];
        products.forEach(p => {
            const total = p.Inventories.reduce((sum, inv) => sum + parseFloat(inv.Qty), 0);
            if (total <= parseFloat(p.Min_Stock) && p.Min_Stock > 0) {
                alerts.push({
                    name: p.P_Name,
                    type: p.P_Type,
                    current: total,
                    min: p.Min_Stock
                });
            }
        });

        // --- 3. DISTRIBUTION BY TYPE ---
        const distribution = await Product.findAll({
            attributes: [['P_Type', 'name'], [sequelize.fn('COUNT', sequelize.col('P_ID')), 'value']],
            group: ['P_Type']
        });

        // --- 4. RECENT TRANSFERS (Placeholder until you build Transfer Model) ---
        // If you don't have a Transfer table yet, we send an empty array to prevent frontend errors
        const transfers = []; 

        // --- 5. SUMMARY COUNTS ---
        const activeProducts = await Product.count({ where: { Status: 'In Stock' } });
        const productionStock = await Inventory.sum('Qty', { where: { Location: 'Production' } }) || 0;
        const storeStock = await Inventory.sum('Qty', { where: { Location: 'Shop' } }) || 0;

        // --- FINAL RESPONSE ---
        res.json({
            success: true,
            stockLevel: stockLevelData, // Fixed: Added this
            distribution,
            alerts: alerts.slice(0, 5),  // Fixed: Added this
            transfers: transfers,       // Fixed: Added this
            summary: {
                activeProducts,
                productionStock,
                storeStock,
                pendingOrders: 0
            }
        });
    } catch (err) {
        console.error("Dashboard Error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// 2. Fetch All Products (with joined Stock Count)
const getProducts = async (req, res) => {
    try {
        const products = await Product.findAll({
            attributes: [
                ['P_ID', 'id'], 
                ['P_Name', 'name'], 
                ['P_Type', 'type'], 
                ['Barcode', 'barcode'],
                ['Cost_Price', 'costPrice'],
                ['Wholesale_Price', 'wholesalePrice'],
                ['Retail_Price', 'retailPrice'],
                ['Min_Stock', 'minStock'],
                ['Status', 'status'],
                [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('Inventories.Qty')), 0), 'stockCount']
            ],
            include: [{
                model: Inventory,
                attributes: []
            }],
            group: ['Product.P_ID']
        });
        res.json(products);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// 3. Add Product
const addProduct = async (req, res) => {
    try {
        const newProduct = await Product.create(req.body);
        res.status(201).json({ success: true, message: "Product created!", data: newProduct });
    } catch (err) {
        res.status(500).json({ success: false, message: "Creation failed", error: err.message });
    }
};

// 4. Update Product
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        await Product.update(req.body, { where: { P_ID: id } });
        res.json({ success: true, message: "Product updated successfully!" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// 5. Delete Product
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        await Product.destroy({ where: { P_ID: id } });
        res.json({ success: true, message: "Product deleted!" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

module.exports = { getDashboardStats, getProducts, addProduct, deleteProduct, updateProduct };