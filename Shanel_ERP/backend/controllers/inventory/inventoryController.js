const { Product, Inventory, Production, UnitConversion, StockTransfer } = require('../../models/index');
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
                [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('inventories.Qty')), 0), 'current']
            ],
            include: [{
                model: Inventory,
                as: 'inventories',
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
            include: [{ model: Inventory, as: 'inventories', attributes: ['Qty'] }]
        });

        const alerts = [];
        products.forEach(p => {
            const total = p.inventories.reduce((sum, inv) => sum + parseFloat(inv.Qty), 0);
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

        // --- 4. RECENT TRANSFERS ---
        const transfers = await StockTransfer.findAll({
            attributes: ['ST_ID', 'P_ID', 'From_Location', 'To_Location', 'Qty', 'Transfer_Date', 'Status'],
            include: [{
                model: Product,
                as: 'product',
                attributes: ['P_Name']
            }],
            order: [['Transfer_Date', 'DESC']],
            limit: 5
        }); 

        // --- 5. SUMMARY COUNTS ---
        const companyItems = await Product.count({ where: { P_Type: 'Company' } });
        const otherItems = await Product.count({ where: { P_Type: 'Other' } });
        const productionStock = await Inventory.sum('Qty', { where: { Location: 'Production' } }) || 0;
        const salesStock = await Inventory.sum('Qty', { where: { Location: 'Shop' } }) || 0;
        const alertsCount = alerts.length;

        // --- FINAL RESPONSE ---
        res.json({
            success: true,
            stockLevel: stockLevelData,
            distribution,
            alerts: alerts.slice(0, 5),
            transfers: transfers,
            summary: {
                companyItems,
                otherItems,
                productionStock,
                salesStock,
                alertsCount
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
                [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('inventories.Qty')), 0), 'stockCount']
            ],
            include: [{
                model: Inventory,
                as: 'inventories',
                attributes: []
            }],
            group: ['Product.P_ID']
        });
        res.json(products);
    } catch (err) {
        console.error("Get Products Error:", err);
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

// 6. Get Product Inventory by Location
const getProductLocationInventory = async (req, res) => {
    try {
        const { productId } = req.params;
        const inventories = await Inventory.findAll({
            attributes: ['Location', 'Qty'],
            where: { P_ID: productId }
        });
        
        const result = {
            'Main_Warehouse': 0,
            'Production': 0,
            'Shop': 0
        };
        
        inventories.forEach(inv => {
            if (inv.Location && result.hasOwnProperty(inv.Location)) {
                result[inv.Location] += parseFloat(inv.Qty) || 0;
            }
        });
        
        res.json(result);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// 7. Get Product Unit Conversions (for card/packet calculations)
const getProductUnitConversions = async (req, res) => {
    try {
        const { productId } = req.params;
        
        const units = await UnitConversion.findAll({
            where: { P_ID: productId },
            attributes: ['U_ID', 'Unit_Name', 'Unit_Conversion', 'Is_Base_Unit', 'Display_Order'],
            order: [['Display_Order', 'ASC']]
        });

        if (units.length === 0) {
            return res.json({
                success: true,
                units: [],
                baseUnit: 'Unit',
                message: 'No unit conversions found for this product'
            });
        }

        // Find base unit
        const baseUnit = units.find(u => u.Is_Base_Unit) || units[0];

        res.json({
            success: true,
            units: units.map(u => ({
                U_ID: u.U_ID,
                name: u.Unit_Name,
                conversion: parseFloat(u.Unit_Conversion),
                isBase: u.Is_Base_Unit
            })),
            baseUnit: {
                name: baseUnit.Unit_Name,
                conversion: parseFloat(baseUnit.Unit_Conversion)
            }
        });
    } catch (err) {
        console.error("Get Unit Conversions Error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
};

module.exports = { 
    getDashboardStats, 
    getProducts, 
    addProduct, 
    deleteProduct, 
    updateProduct, 
    getProductLocationInventory,
    getProductUnitConversions
};