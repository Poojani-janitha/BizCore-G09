const { Product, Inventory, Production, UnitConversion, StockTransfer } = require('../../models/index');
const sequelize = require('../../config/db');
const { Op } = require('sequelize');

// 1. Get Dashboard Stats
const getDashboardStats = async (req, res) => {
    try {
        // --- 1. STOCK LEVELS (For Bar Chart) - TOP 15 CRITICAL ITEMS ---
        // Show only top 15 products (critical/low stock) instead of all products
        // This prevents chart overcrowding and focuses on actionable items
        const stockLevelData = await Product.findAll({
            attributes: [
                ['P_Name', 'name'], 
                ['Min_Stock', 'min'],
                ['P_ID', 'productId'],
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
            order: [
                // Prioritize products closest to or below minimum stock
                [sequelize.literal('(COALESCE(SUM(inventories.Qty), 0) - Min_Stock)'), 'ASC']
            ],
            limit: 15, // Show only top 15 most critical items
            subQuery: false,
            raw: true
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

// 1.5 Get All Stock Levels with Pagination & Filtering
const getAllStockLevels = async (req, res) => {
    try {
        // Query parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const sortBy = req.query.sortBy || 'gap'; // 'gap', 'stock', 'name'
        const filterType = req.query.type; // filter by product type
        const offset = (page - 1) * limit;

        // Build where clause
        const whereClause = {
            Min_Stock: { [Op.gt]: 0 }
        };
        if (filterType) {
            whereClause.P_Type = filterType;
        }

        // Get total count
        const totalCount = await Product.count({ where: whereClause });

        // Sort mapping
        const sortMap = {
            'gap': [sequelize.literal('(COALESCE(SUM(inventories.Qty), 0) - Min_Stock)'), 'ASC'],
            'stock': [sequelize.literal('COALESCE(SUM(inventories.Qty), 0)'), 'ASC'],
            'name': [['P_Name', 'ASC']]
        };

        // Fetch paginated results
        const stockLevels = await Product.findAll({
            attributes: [
                ['P_ID', 'productId'],
                ['P_Name', 'name'], 
                ['P_Code', 'code'],
                ['P_Type', 'type'],
                ['Min_Stock', 'minStock'],
                ['Max_Stock', 'maxStock'],
                ['Status', 'status'],
                [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('inventories.Qty')), 0), 'currentStock']
            ],
            include: [{
                model: Inventory,
                as: 'inventories',
                attributes: [],
                required: false
            }],
            where: whereClause,
            group: ['Product.P_ID'],
            order: [sortMap[sortBy] || sortMap['gap']],
            limit: limit,
            offset: offset,
            subQuery: false,
            raw: true
        });

        res.json({
            success: true,
            data: stockLevels,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalCount / limit),
                pageSize: limit,
                totalRecords: totalCount
            }
        });
    } catch (err) {
        console.error("Get All Stock Levels Error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// 2. Fetch All Products (with joined Stock Count)
const getProducts = async (req, res) => {
    try {
        const products = await Product.findAll({
            attributes: [
                ['P_ID', 'id'], 
                ['P_Code', 'code'],
                ['P_Name', 'name'],
                ['P_Name_Sinhala', 'nameSinhala'],
                ['P_Type', 'type'], 
                ['Base_Unit', 'baseUnit'],
                ['Barcode', 'barcode'],
                ['Barcode_Type', 'barcodeType'],
                ['Cost_Price', 'costPrice'],
                ['Wholesale_Price', 'wholesalePrice'],
                ['Retail_Price', 'retailPrice'],
                ['Tax_Rate', 'taxRate'],
                ['Min_Stock', 'minStock'],
                ['Max_Stock', 'maxStock'],
                ['Reorder_Level', 'reorderLevel'],
                ['Category', 'category'],
                ['Subcategory', 'subcategory'],
                ['Description', 'description'],
                ['Image_Path', 'imagePath'],
                ['Weight', 'weight'],
                ['Weight_Unit', 'weightUnit'],
                ['Auto_Generate_Barcode', 'autoGenerateBarcode'],
                ['Is_Ishara_Product', 'isIsharaProduct'],
                ['Created_By', 'createdBy'],
                ['Status', 'status'],
                ['Created_At', 'createdAt'],
                ['Updated_At', 'updatedAt'],
                [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('inventories.Qty')), 0), 'stockCount']
            ],
            include: [{
                model: Inventory,
                as: 'inventories',
                attributes: [],
                required: false
            }],
            group: ['Product.P_ID'],
            raw: true
        });
        
        // Fetch units for each product
        const productsWithUnits = await Promise.all(
            products.map(async (product) => {
                const units = await UnitConversion.findAll({
                    attributes: [
                        ['U_ID', 'id'],
                        ['Unit_Name', 'unitName'],
                        ['Unit_Conversion', 'conversionRate'],
                        ['Is_Base_Unit', 'isBaseUnit']
                    ],
                    where: { P_ID: product.id },
                    raw: true
                });
                return { ...product, units };
            })
        );
        
        res.json(productsWithUnits);
    } catch (err) {
        console.error("Get Products Error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// 3. Add Product
const addProduct = async (req, res) => {
    try {
        // Debug log
        console.log("AddProduct Request Body:", req.body);
        console.log("Barcode value:", req.body.barcode);
        console.log("File received:", req.file);

        // Parse units if it's a string (from FormData)
        let units = [];
        if (req.body.units) {
            try {
                units = typeof req.body.units === 'string' ? JSON.parse(req.body.units) : req.body.units;
            } catch (e) {
                console.error("Error parsing units:", e);
                units = [];
            }
        }

        const isIsharaProduct = req.body.isIsharaProduct === 'true' || req.body.isIsharaProduct === true;

        // Transform camelCase field names to database column names
        const productData = {
            P_Code: req.body.code,
            P_Name: req.body.name,
            P_Name_Sinhala: req.body.nameSinhala,
            P_Type: req.body.type,
            Base_Unit: req.body.baseUnit,
            Cost_Price: parseFloat(req.body.costPrice) || 0,
            Retail_Price: parseFloat(req.body.retailPrice) || 0,
            Wholesale_Price: parseFloat(req.body.wholesalePrice) || 0,
            Min_Stock: parseFloat(req.body.minStock) || 0,
            Max_Stock: parseFloat(req.body.maxStock) || null,
            Reorder_Level: parseFloat(req.body.reorderLevel) || null,
            Tax_Rate: parseFloat(req.body.taxRate) || 0,
            Category: req.body.category,
            Subcategory: req.body.subcategory,
            Description: req.body.description,
            Image_Path: req.file ? `/uploads/${req.file.filename}` : req.body.imagePath,
            Weight: parseFloat(req.body.weight) || null,
            Weight_Unit: req.body.weightUnit,
            Barcode: req.body.barcode,
            Barcode_Type: req.body.barcodeType,
            Auto_Generate_Barcode: req.body.autoGenerateBarcode === 'true' || req.body.autoGenerateBarcode === true,
            Is_Ishara_Product: isIsharaProduct,
            Created_By: req.body.createdBy,
            // Status will default to "In Stock" as per model definition
        };

        const newProduct = await Product.create(productData);
        
        // Create base unit record
        await UnitConversion.create({
            P_ID: newProduct.P_ID,
            Unit_Name: req.body.baseUnit,
            Unit_Conversion: 1.0,
            Is_Base_Unit: true
        });
        
        // Handle alternative unit conversions if provided
        if (Array.isArray(units) && units.length > 0) {
            const unitPromises = units.map(unit => 
                UnitConversion.create({
                    P_ID: newProduct.P_ID,
                    Unit_Name: unit.unitName,
                    Unit_Conversion: parseFloat(unit.conversionRate),
                    Is_Base_Unit: false
                })
            );
            await Promise.all(unitPromises);
        }

        // Create inventory entry if initial quantity provided (for supplier items and Ishara products)
        const initialQty = parseFloat(req.body.initialQty) || 0;
        let inventoryLocation = null;
        
        // Determine inventory location based on product type
        if (req.body.type === 'Other') {
            inventoryLocation = 'Shop';
        } else if (req.body.type === 'Raw') {
            inventoryLocation = 'Production';
        } else if (req.body.type === 'Company' && isIsharaProduct) {
            // Ishara products (Company items that skip production)
            inventoryLocation = 'Shop';
        }
        
        if (inventoryLocation && initialQty > 0) {
            await Inventory.create({
                P_ID: newProduct.P_ID,
                Location: inventoryLocation,
                Qty: initialQty,
                Last_Updated: new Date()
            });
            console.log(`✓ Created inventory entry for product ${newProduct.P_ID} with quantity ${initialQty} at location ${inventoryLocation}`);
        }
        
        res.status(201).json({ success: true, message: "Product created!", data: newProduct });
    } catch (err) {
        res.status(500).json({ success: false, message: "Creation failed", error: err.message });
    }
};

// 4. Update Product
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Parse units if it's a string (from FormData)
        let units = [];
        if (req.body.units) {
            try {
                units = typeof req.body.units === 'string' ? JSON.parse(req.body.units) : req.body.units;
            } catch (e) {
                console.error("Error parsing units:", e);
                units = [];
            }
        }
        
        const isIsharaProduct = req.body.isIsharaProduct === 'true' || req.body.isIsharaProduct === true;

        // Transform camelCase field names to database column names
        const updateData = {
            P_Code: req.body.code,
            P_Name: req.body.name,
            P_Name_Sinhala: req.body.nameSinhala,
            P_Type: req.body.type,
            Base_Unit: req.body.baseUnit,
            Cost_Price: parseFloat(req.body.costPrice) || 0,
            Retail_Price: parseFloat(req.body.retailPrice) || 0,
            Wholesale_Price: parseFloat(req.body.wholesalePrice) || 0,
            Min_Stock: parseFloat(req.body.minStock) || 0,
            Max_Stock: parseFloat(req.body.maxStock) || null,
            Reorder_Level: parseFloat(req.body.reorderLevel) || null,
            Tax_Rate: parseFloat(req.body.taxRate) || 0,
            Category: req.body.category,
            Subcategory: req.body.subcategory,
            Description: req.body.description,
            Image_Path: req.file ? `/uploads/${req.file.filename}` : req.body.imagePath,
            Weight: parseFloat(req.body.weight) || null,
            Weight_Unit: req.body.weightUnit,
            Barcode: req.body.barcode,
            Barcode_Type: req.body.barcodeType,
            Auto_Generate_Barcode: req.body.autoGenerateBarcode === 'true' || req.body.autoGenerateBarcode === true,
            Is_Ishara_Product: isIsharaProduct
            // Status is NOT updated as it's calculated dynamically based on stock levels
        };

        await Product.update(updateData, { where: { P_ID: id } });
        
        // Handle unit conversions
        if (req.body.units !== undefined) {
            // Delete existing units for this product
            await UnitConversion.destroy({ where: { P_ID: id } });
            
            // Create base unit record
            await UnitConversion.create({
                P_ID: id,
                Unit_Name: req.body.baseUnit,
                Unit_Conversion: 1.0,
                Is_Base_Unit: true
            });
            
            // Create alternative unit records if any are provided
            if (Array.isArray(units) && units.length > 0) {
                const unitPromises = units.map(unit => 
                    UnitConversion.create({
                        P_ID: id,
                        Unit_Name: unit.unitName,
                        Unit_Conversion: parseFloat(unit.conversionRate),
                        Is_Base_Unit: false
                    })
                );
                await Promise.all(unitPromises);
            }
        }

        // Update inventory for supplier items and Ishara products if initialQty provided
        const initialQty = parseFloat(req.body.initialQty);
        let inventoryLocation = null;
        
        // Determine inventory location based on product type
        if (req.body.type === 'Other') {
            inventoryLocation = 'Shop';
        } else if (req.body.type === 'Raw') {
            inventoryLocation = 'Production';
        } else if (req.body.type === 'Company' && isIsharaProduct) {
            // Ishara products (Company items that skip production)
            inventoryLocation = 'Shop';
        }
        
        if (inventoryLocation && initialQty >= 0) {
            // Find existing inventory for this product at the correct location
            const existingInventory = await Inventory.findOne({
                where: { P_ID: id, Location: inventoryLocation }
            });

            if (existingInventory) {
                // Update existing inventory
                await Inventory.update(
                    { Qty: initialQty, Last_Updated: new Date() },
                    { where: { P_ID: id, Location: inventoryLocation } }
                );
                console.log(`✓ Updated inventory for product ${id} to quantity ${initialQty} at location ${inventoryLocation}`);
            } else if (initialQty > 0) {
                // Create new inventory if doesn't exist and qty > 0
                await Inventory.create({
                    P_ID: id,
                    Location: inventoryLocation,
                    Qty: initialQty,
                    Last_Updated: new Date()
                });
                console.log(`✓ Created inventory entry for product ${id} with quantity ${initialQty} at location ${inventoryLocation}`);
            }
        }
        
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

// Get Available Base Units
const getAvailableBaseUnits = async (req, res) => {
    try {
        const units = await UnitConversion.findAll({
            attributes: [[sequelize.fn('DISTINCT', sequelize.col('Unit_Name')), 'Unit_Name']],
            where: { Is_Base_Unit: true },
            raw: true
        });
        
        res.json({
            success: true,
            units: units.map(u => u.Unit_Name).sort()
        });
    } catch (err) {
        console.error("Get Available Base Units Error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// Get Available Alternative Units
const getAvailableAlternativeUnits = async (req, res) => {
    try {
        const units = await UnitConversion.findAll({
            attributes: [[sequelize.fn('DISTINCT', sequelize.col('Unit_Name')), 'Unit_Name']],
            where: { Is_Base_Unit: false },
            raw: true
        });
        
        res.json({
            success: true,
            units: units.map(u => u.Unit_Name).sort()
        });
    } catch (err) {
        console.error("Get Available Alternative Units Error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
};

module.exports = { 
    getDashboardStats, 
    getAllStockLevels,
    getProducts, 
    addProduct, 
    deleteProduct, 
    updateProduct, 
    getProductLocationInventory,
    getProductUnitConversions,
    getAvailableBaseUnits,
    getAvailableAlternativeUnits
};
