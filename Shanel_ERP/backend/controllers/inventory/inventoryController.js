const { Product, Inventory, Production } = require('../../models/index');
const sequelize = require('../../config/db');
const { Op } = require('sequelize');

// 1. Get Dashboard Stats
const getDashboardStats = async (req, res) => {
    try {
        // Fetch products with their total inventory count
        const products = await Product.findAll({
            attributes: [
                'P_Name', 
                'Min_Stock',
                [sequelize.fn('SUM', sequelize.col('Inventories.Qty')), 'totalStock']
            ],
            include: [{
                model: Inventory,
                attributes: []
            }],
            group: ['Product.P_ID'],
            having: sequelize.where(sequelize.col('Min_Stock'), '>', 0)
        });

        // Distribution by Type
        const distribution = await Product.findAll({
            attributes: ['P_Type', [sequelize.fn('COUNT', sequelize.col('P_ID')), 'value']],
            group: ['P_Type']
        });

        // Summary Counts
        const activeProducts = await Product.count({ where: { Status: 'Active' } });
        
        const productionStock = await Inventory.sum('Qty', { where: { Location: 'Production' } });
        const storeStock = await Inventory.sum('Qty', { where: { Location: 'Shop' } });

        res.json({
            success: true,
            distribution,
            summary: {
                activeProducts,
                productionStock: productionStock || 0,
                storeStock: storeStock || 0,
                pendingOrders: 1 // Placeholder for now
            }
        });
    } catch (err) {
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