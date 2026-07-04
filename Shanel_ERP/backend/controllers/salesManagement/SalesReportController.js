const sequelize = require('../../config/db');
const { Op } = require('sequelize');
const { Sale, SaleItem, Product, Customer, Payment, Inventory, UnitConversion } = require('../../models/index');

/**
 * getSalesSummaryReport
 * Daily, Monthly, or Annual sales aggregates
 */
const getSalesSummaryReport = async (req, res) => {
    try {
        const { type = 'daily', startDate, endDate } = req.query;
        let dateFilter = { Status: 'Active' };

        if (startDate && endDate) {
            dateFilter.Sale_Date = { [Op.between]: [startDate, endDate] };
        }

        if (type === 'daily') {
            // Group by Sale_Date directly
            const sales = await Sale.findAll({
                where: dateFilter,
                attributes: [
                    ['Sale_Date', 'Period'],
                    [sequelize.fn('COUNT', sequelize.col('Sale_Id')), 'Total_Orders'],
                    [sequelize.fn('SUM', sequelize.col('Total_Amount')), 'Total_Revenue'],
                    [sequelize.fn('SUM', sequelize.col('Discount_Amount')), 'Total_Discount'],
                    [sequelize.fn('SUM', sequelize.col('Tax_Amount')), 'Total_Tax']
                ],
                group: ['Sale_Date'],
                order: [['Sale_Date', 'DESC']],
                raw: true
            });

            return res.status(200).json({ success: true, data: sales });
        } else if (type === 'monthly') {
            const sales = await Sale.findAll({
                where: dateFilter,
                attributes: [
                    [sequelize.fn('DATE_FORMAT', sequelize.col('Sale_Date'), '%Y-%m'), 'Period'],
                    [sequelize.fn('COUNT', sequelize.col('Sale_Id')), 'Total_Orders'],
                    [sequelize.fn('SUM', sequelize.col('Total_Amount')), 'Total_Revenue'],
                    [sequelize.fn('SUM', sequelize.col('Discount_Amount')), 'Total_Discount'],
                    [sequelize.fn('SUM', sequelize.col('Tax_Amount')), 'Total_Tax']
                ],
                group: [sequelize.fn('DATE_FORMAT', sequelize.col('Sale_Date'), '%Y-%m')],
                order: [[sequelize.fn('DATE_FORMAT', sequelize.col('Sale_Date'), '%Y-%m'), 'DESC']],
                raw: true
            });

            return res.status(200).json({ success: true, data: sales });
        } else {
            // Annual
            const sales = await Sale.findAll({
                where: dateFilter,
                attributes: [
                    [sequelize.fn('YEAR', sequelize.col('Sale_Date')), 'Period'],
                    [sequelize.fn('COUNT', sequelize.col('Sale_Id')), 'Total_Orders'],
                    [sequelize.fn('SUM', sequelize.col('Total_Amount')), 'Total_Revenue'],
                    [sequelize.fn('SUM', sequelize.col('Discount_Amount')), 'Total_Discount'],
                    [sequelize.fn('SUM', sequelize.col('Tax_Amount')), 'Total_Tax']
                ],
                group: [sequelize.fn('YEAR', sequelize.col('Sale_Date'))],
                order: [[sequelize.fn('YEAR', sequelize.col('Sale_Date')), 'DESC']],
                raw: true
            });

            return res.status(200).json({ success: true, data: sales });
        }
    } catch (error) {
        console.error('Error in getSalesSummaryReport:', error);
        return res.status(500).json({ success: false, message: 'Server error loading report', error: error.message });
    }
};

/**
 * getProductWiseSalesReport
 */
const getProductWiseSalesReport = async (req, res) => {
    try {
        const { startDate, endDate, category } = req.query;
        const saleFilter = { Status: 'Active' };
        if (startDate && endDate) {
            saleFilter.Sale_Date = { [Op.between]: [startDate, endDate] };
        }

        const productFilter = {};
        if (category && category !== 'all') {
            productFilter.P_Type = category;
        }

        const items = await SaleItem.findAll({
            where: { Status: 'Active' },
            include: [
                {
                    model: Sale,
                    as: 'Sale',
                    where: saleFilter,
                    on: sequelize.literal('`SaleItem`.`Sale_ID` = `Sale`.`Sale_Id`'),
                    attributes: []
                },
                {
                    model: Product,
                    as: 'Product',
                    where: productFilter,
                    attributes: ['P_Code', 'P_Name', 'P_Type']
                },
                {
                    model: UnitConversion,
                    as: 'UnitConversion',
                    attributes: ['Unit_Name']
                }
            ],
            attributes: [
                'P_ID',
                [sequelize.fn('SUM', sequelize.col('Quantity')), 'Total_Qty_Sold'],
                [sequelize.fn('SUM', sequelize.col('Line_Total')), 'Total_Revenue']
            ],
            group: [
                'P_ID', 
                'Product.P_ID', 
                'Product.P_Code', 
                'Product.P_Name', 
                'Product.P_Type', 
                'UnitConversion.U_ID', 
                'UnitConversion.Unit_Name'
            ],
            order: [[sequelize.fn('SUM', sequelize.col('Line_Total')), 'DESC']],
            raw: true
        });

        // Map clean formatting
        const formatted = items.map(item => ({
            P_Code: item['Product.P_Code'] || '—',
            P_Name: item['Product.P_Name'] || '—',
            P_Type: item['Product.P_Type'] || '—',
            Purchased_Unit: item['UnitConversion.Unit_Name'] || '—',
            Total_Qty_Sold: parseFloat(item.Total_Qty_Sold) || 0,
            Total_Revenue: parseFloat(item.Total_Revenue) || 0
        }));

        return res.status(200).json({ success: true, data: formatted });
    } catch (error) {
        console.error('Error in getProductWiseSalesReport:', error);
        return res.status(500).json({ success: false, message: 'Server error loading report', error: error.message });
    }
};

/**
 * getTopSellingProductsReport
 */
const getTopSellingProductsReport = async (req, res) => {
    try {
        const { startDate, endDate, limit = 10 } = req.query;
        const saleFilter = { Status: 'Active' };
        if (startDate && endDate) {
            saleFilter.Sale_Date = { [Op.between]: [startDate, endDate] };
        }

        const items = await SaleItem.findAll({
            where: { Status: 'Active' },
            include: [
                {
                    model: Sale,
                    as: 'Sale',
                    where: saleFilter,
                    on: sequelize.literal('`SaleItem`.`Sale_ID` = `Sale`.`Sale_Id`'),
                    attributes: []
                },
                {
                    model: Product,
                    as: 'Product',
                    attributes: ['P_Code', 'P_Name', 'P_Type']
                },
                {
                    model: UnitConversion,
                    as: 'UnitConversion',
                    attributes: ['Unit_Name']
                }
            ],
            attributes: [
                'P_ID',
                [sequelize.fn('SUM', sequelize.col('Quantity')), 'Total_Qty_Sold'],
                [sequelize.fn('SUM', sequelize.col('Line_Total')), 'Total_Revenue']
            ],
            group: [
                'P_ID', 
                'Product.P_ID', 
                'Product.P_Code', 
                'Product.P_Name', 
                'Product.P_Type', 
                'UnitConversion.U_ID', 
                'UnitConversion.Unit_Name'
            ],
            order: [[sequelize.fn('SUM', sequelize.col('Quantity')), 'DESC']],
            limit: parseInt(limit),
            raw: true
        });

        const formatted = items.map(item => ({
            P_Code: item['Product.P_Code'] || '—',
            P_Name: item['Product.P_Name'] || '—',
            P_Type: item['Product.P_Type'] || '—',
            Purchased_Unit: item['UnitConversion.Unit_Name'] || '—',
            Total_Qty_Sold: parseFloat(item.Total_Qty_Sold) || 0,
            Total_Revenue: parseFloat(item.Total_Revenue) || 0
        }));

        return res.status(200).json({ success: true, data: formatted });
    } catch (error) {
        console.error('Error in getTopSellingProductsReport:', error);
        return res.status(500).json({ success: false, message: 'Server error loading report', error: error.message });
    }
};

const getSlowMovingProductsReport = async (req, res) => {
    try {
        const { days = 30 } = req.query;
        const thresholdDate = new Date();
        thresholdDate.setDate(thresholdDate.getDate() - parseInt(days));

        // Get total stock from Inventory
        const inventoryStock = await Inventory.findAll({
            attributes: [
                'P_ID',
                [sequelize.fn('SUM', sequelize.col('Qty')), 'Total_Stock']
            ],
            group: ['P_ID'],
            raw: true
        });

        const stockMap = {};
        inventoryStock.forEach(inv => {
            stockMap[inv.P_ID] = parseFloat(inv.Total_Stock) || 0;
        });

        // Get sales count in last N days
        const salesLastNDays = await SaleItem.findAll({
            where: { Status: 'Active' },
            include: [{
                model: Sale,
                as: 'Sale',
                where: {
                    Status: 'Active',
                    Sale_Date: { [Op.gte]: thresholdDate }
                },
                on: sequelize.literal('`SaleItem`.`Sale_ID` = `Sale`.`Sale_Id`'),
                attributes: []
            }],
            attributes: [
                'P_ID',
                'U_ID',
                [sequelize.fn('SUM', sequelize.col('Quantity')), 'Total_Sold']
            ],
            group: ['P_ID', 'U_ID'],
            raw: true
        });

        const salesMap = {};
        salesLastNDays.forEach(sale => {
            const key = `${sale.P_ID}_${sale.U_ID}`;
            salesMap[key] = parseFloat(sale.Total_Sold) || 0;
        });

        // Get all product-unit combinations
        const unitConversions = await UnitConversion.findAll({
            include: [{
                model: Product,
                as: 'Product',
                attributes: ['P_ID', 'P_Code', 'P_Name', 'P_Type']
            }],
            raw: true
        });

        const reportData = unitConversions.map(uc => {
            const pId = uc.P_ID;
            const uId = uc.U_ID;
            const pCode = uc['Product.P_Code'] || '—';
            const pName = uc['Product.P_Name'] || '—';
            const pType = uc['Product.P_Type'] || '—';
            const unitName = uc.Unit_Name || '—';
            const conv = parseFloat(uc.Unit_Conversion) || 1;

            const qtySold = salesMap[`${pId}_${uId}`] || 0;
            const baseStock = stockMap[pId] || 0;
            const currentStockInUnit = baseStock / conv;

            return {
                P_Code: pCode,
                P_Name: pName,
                P_Type: pType,
                Purchased_Unit: unitName,
                Qty_Sold_Last_N_Days: qtySold,
                Current_Stock: parseFloat(currentStockInUnit.toFixed(2))
            };
        });

        // Filter: Zero or low sale activity, and has current stock
        const filtered = reportData.filter(item => item.Qty_Sold_Last_N_Days < 5 && item.Current_Stock > 0);
        filtered.sort((a, b) => b.Current_Stock - a.Current_Stock); // overstock risk: highest current stock first

        return res.status(200).json({ success: true, data: filtered });
    } catch (error) {
        console.error('Error in getSlowMovingProductsReport:', error);
        return res.status(500).json({ success: false, message: 'Server error loading report', error: error.message });
    }
};

/**
 * getCustomerWiseSalesReport
 */
const getCustomerWiseSalesReport = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const saleFilter = { Status: 'Active' };
        if (startDate && endDate) {
            saleFilter.Sale_Date = { [Op.between]: [startDate, endDate] };
        }

        const report = await Sale.findAll({
            where: saleFilter,
            include: [{
                model: Customer,
                as: 'Customer',
                attributes: ['C_Name', 'Customer_Code']
            }],
            attributes: [
                'C_ID',
                [sequelize.fn('SUM', sequelize.col('Total_Amount')), 'Total_Revenue'],
                [sequelize.fn('COUNT', sequelize.col('Sale_Id')), 'Invoice_Count'],
                [sequelize.fn('AVG', sequelize.col('Total_Amount')), 'Avg_Order_Value']
            ],
            group: ['C_ID', 'Customer.C_ID', 'Customer.C_Name', 'Customer.Customer_Code'],
            order: [[sequelize.fn('SUM', sequelize.col('Total_Amount')), 'DESC']],
            raw: true
        });

        const formatted = report.map(item => ({
            Customer_Code: item['Customer.Customer_Code'] || '—',
            Customer_Name: item['Customer.C_Name'] || 'Walking Customer',
            Invoice_Count: parseInt(item.Invoice_Count) || 0,
            Total_Revenue: parseFloat(item.Total_Revenue) || 0,
            Avg_Order_Value: parseFloat(item.Avg_Order_Value) || 0
        }));

        return res.status(200).json({ success: true, data: formatted });
    } catch (error) {
        console.error('Error in getCustomerWiseSalesReport:', error);
        return res.status(500).json({ success: false, message: 'Server error loading report', error: error.message });
    }
};

/**
 * getOutstandingBalancesReport
 */
const getOutstandingBalancesReport = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0,0,0,0);

        // Get all unpaid sales
        const dueSales = await Sale.findAll({
            where: {
                Status: 'Active',
                Balance_Due: { [Op.gt]: 0 }
            },
            include: [{
                model: Customer,
                as: 'Customer',
                attributes: ['C_ID', 'C_Name', 'Customer_Code', 'Phone1']
            }],
            raw: true
        });

        // Group by Customer
        const customersMap = {};

        dueSales.forEach(sale => {
            const cId = sale.C_ID;
            const cName = sale['Customer.C_Name'] || 'Walking Customer';
            const cCode = sale['Customer.Customer_Code'] || '—';
            const contactInfo = sale['Customer.Phone1'] || '—';

            if (!customersMap[cId]) {
                customersMap[cId] = {
                    Customer_Code: cCode,
                    Customer_Name: cName,
                    Contact_Info: contactInfo,
                    Total_Outstanding: 0,
                    Current: 0,
                    Overdue_30_60: 0,
                    Overdue_60_90: 0,
                    Overdue_90: 0
                };
            }

            const bal = parseFloat(sale.Balance_Due) || 0;
            customersMap[cId].Total_Outstanding += bal;

            if (!sale.Due_Date) {
                // Not specified, categorize as current
                customersMap[cId].Current += bal;
            } else {
                const dueDate = new Date(sale.Due_Date);
                const diffTime = today.getTime() - dueDate.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays <= 30) {
                    customersMap[cId].Current += bal;
                } else if (diffDays <= 60) {
                    customersMap[cId].Overdue_30_60 += bal;
                } else if (diffDays <= 90) {
                    customersMap[cId].Overdue_60_90 += bal;
                } else {
                    customersMap[cId].Overdue_90 += bal;
                }
            }
        });

        const result = Object.values(customersMap);
        result.sort((a, b) => b.Total_Outstanding - a.Total_Outstanding);

        return res.status(200).json({ success: true, data: result });
    } catch (error) {
        console.error('Error in getOutstandingBalancesReport:', error);
        return res.status(500).json({ success: false, message: 'Server error loading report', error: error.message });
    }
};

/**
 * getPaymentMethodReport
 */
const getPaymentMethodReport = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const where = { Status: 'Active' };

        if (startDate && endDate) {
            where.Payment_Date = { [Op.between]: [startDate, endDate] };
        }

        const payments = await Payment.findAll({
            where,
            attributes: [
                ['Payment_Date', 'Period'],
                [sequelize.fn('SUM', sequelize.col('Cash_Amount')), 'Cash_Collections'],
                [sequelize.fn('SUM', sequelize.col('Bank_Transfer_Amount')), 'Bank_Collections'],
                [sequelize.fn('SUM', sequelize.col('Cheque_Amount')), 'Cheque_Collections'],
                [sequelize.fn('SUM', sequelize.col('Credit_Amount')), 'Credit_Generated'],
                [sequelize.fn('SUM', sequelize.col('Payment_Amount')), 'Total_Collections']
            ],
            group: ['Payment_Date'],
            order: [['Payment_Date', 'DESC']],
            raw: true
        });

        const formatted = payments.map(p => ({
            Period: p.Period,
            Cash_Collections: parseFloat(p.Cash_Collections) || 0,
            Bank_Collections: parseFloat(p.Bank_Collections) || 0,
            Cheque_Collections: parseFloat(p.Cheque_Collections) || 0,
            Credit_Generated: parseFloat(p.Credit_Generated) || 0,
            Total_Collections: parseFloat(p.Total_Collections) || 0
        }));

        return res.status(200).json({ success: true, data: formatted });
    } catch (error) {
        console.error('Error in getPaymentMethodReport:', error);
        return res.status(500).json({ success: false, message: 'Server error loading report', error: error.message });
    }
};

/**
 * getDueCollectionReport
 */
const getDueCollectionReport = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const where = { Status: 'Active' };

        if (startDate && endDate) {
            where.Payment_Date = { [Op.between]: [startDate, endDate] };
        }

        // Query payments made after sale invoice creation
        const collections = await Payment.findAll({
            where,
            include: [{
                model: Sale,
                as: 'Sale',
                where: {
                    Status: 'Active',
                    Sale_Date: { [Op.lt]: sequelize.col('Payment.Payment_Date') }
                },
                include: [{
                    model: Customer,
                    as: 'Customer',
                    attributes: ['C_Name']
                }]
            }],
            order: [['Payment_Date', 'DESC']],
            raw: true
        });

        const formatted = collections.map(c => ({
            Payment_Date: c.Payment_Date,
            Receipt_No: c.Receipt_No || `RCPT-${c.Pay_ID}`,
            Invoice_No: c['Sale.Invoice_No'] || '—',
            Customer_Name: c['Sale.Customer.C_Name'] || 'Walking Customer',
            Original_Sale_Date: c['Sale.Sale_Date'],
            Payment_Method: c.Payment_Method,
            Amount_Collected: parseFloat(c.Payment_Amount) || 0
        }));

        return res.status(200).json({ success: true, data: formatted });
    } catch (error) {
        console.error('Error in getDueCollectionReport:', error);
        return res.status(500).json({ success: false, message: 'Server error loading report', error: error.message });
    }
};

module.exports = {
    getSalesSummaryReport,
    getProductWiseSalesReport,
    getTopSellingProductsReport,
    getSlowMovingProductsReport,
    getCustomerWiseSalesReport,
    getOutstandingBalancesReport,
    getPaymentMethodReport,
    getDueCollectionReport
};
