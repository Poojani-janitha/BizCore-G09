const sequelize = require('../../config/db');
const { Product, UnitConversion, Sale,Inventory, Customer } = require('../../models/index');
const { Op, where } = require('sequelize');

const searchProducts = async (req, res) => {

    try {

        const { q, Limit = 10 } = req.query;


        if (!q || q.trim() === '') {
            return res.status(200).json({
                success: true,
                message: "query is empty",
                products: [],
            })
        }

        const searchTerm = q.trim();


        const products = await Product.findAll({
            where: {
                [Op.or]: [
                    { P_Name: { [Op.like]: `${searchTerm}%` } },
                    { P_Code: { [Op.like]: `${searchTerm}%` } }
                ]
            }, attributes: [
                'P_ID',
                'P_Name',
                'P_Code',
                'P_Type',
                'Base_Unit',
                'Status',
                'Cost_Price',
                'Retail_Price',
                'Wholesale_Price',
                'Min_Stock',
                'Tax_Rate',
                'Image_Path'

            ], limit: parseFloat(Limit),
            order: [['P_Name', 'ASC']]




        })

        const formateData = products.map((p) => {
            return {
                p_id: p.P_ID,
                p_name: p.P_Name,
                p_code: p.P_Code,
                p_type: p.P_Type,
                base_unit: p.Base_Unit,
                status: p.Status,
                cost_price: parseFloat(p.Cost_Price),
                retail_price: parseFloat(p.Retail_Price),
                wholesale_price: parseFloat(p.Wholesale_Price),
                min_stock: parseFloat(p.Min_Stock),
                tax_rate: parseFloat(p.Tax_Rate),
                image_path: p.Image_Path
            }
        })

        //show retrive data in the console
        console.log("Search Products Result:", formateData);

        return res.status(200).json({

            success: true,
            products: formateData,
            count: formateData.length
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "server error while searching products",
            error: error.message
        })



    }
}

//for the dropdown in the POS
const allUnits = async (req, res) => {
    try {
        const { productId } = req.query;
        console.log('Fetching units for product ID:', productId);
        
        const units = await UnitConversion.findAll({
            where: {
                P_ID: productId
            },
            attributes: [
                'Unit_Name',
                'Is_Base_Unit',
                'Unit_Conversion'
            ],
            order: [['Display_Order', 'ASC']],
            raw: true
        });

        console.log('Units found:', units);

        return res.status(200).json({
            success: true,
            units: units
        });

    } catch (error) {
        console.error('Units fetch error:', error);
        return res.status(500).json({
            success: false,
            message: "server error while fetching units",
            error: error.message
        });
    }
};


// For converting a given unit to the base unit quantity for a specific product
const getBaseUnitQty = async (req, res) => {
    try {
        const { productId, unitName } = req.query;

        const conversion = await UnitConversion.findOne({
            where: {
                P_ID: productId,
                Unit_Name: unitName
            },
            raw: true
        });

        if (conversion) {
            return res.json({
                success: true,
                conversionQty: parseFloat(conversion.Unit_Convwersion),
                isBase: conversion.Is_Base_Unit
            });
        }

        return res.json({
            success: false,
            message: "No conversion found"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const generateInvoiceNo = async (req, res) => {
     try {
            let newInvoiceNo; 
            const lastSale = await Sale.findOne({
                order: [['Created_At', 'DESC']]
            });

            if (lastSale) {
                const lastInvoiceNo = lastSale.Invoice_No;
                const numericPart = parseInt(lastInvoiceNo.replace(/\D/g, ''));
                const newNumericPart = numericPart + 1;
                newInvoiceNo = `INV-${new Date().getFullYear()}-${newNumericPart.toString().padStart(6, '0')}`;
            } else {
                newInvoiceNo = `INV-${new Date().getFullYear()}-000001`;
            }
            
            console.log("Generated Invoice No:", newInvoiceNo);

            return res.status(200).json({
                invoiceNo: newInvoiceNo,
                success: true,
                message: "Invoice number generated successfully"
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Error generating invoice number",
                error: error.message
            });
        }

   
}

//post sales data from POS to backend
const postSalesData = async (req, res) => {
    try {
        const { cutomer, items, invoiceDetails, paymentDetails, action } = req.body;

        console.log("Received Sales Data:", {
            cutomer,
            items,
            invoiceDetails,
            paymentDetails,
            action
        });

        // Validate customer data
        if (!cutomer || !cutomer.c_id) {
            return res.status(400).json({
                success: false,
                message: "Customer data is required with valid customer ID"
            });
        }

        // Validate items
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "At least one item is required in the sale"
            });
        }

        // Validate invoice details
        if (!invoiceDetails || !invoiceDetails.invoiceNo) {
            return res.status(400).json({
                success: false,
                message: "Invoice details with valid invoice number are required"
            });
        }

        

        // Get current date/time as fallback if not provided
        const now = new Date();
        const saleDate = invoiceDetails?.invoiceDate || now.toISOString().split('T')[0];
        const saleTime = invoiceDetails?.invoiceTime || now.toTimeString().split(' ')[0];

        // Create sale with the invoice number passed from frontend
        const sale = await Sale.create({
            Invoice_No: invoiceDetails.invoiceNo,
            C_ID: cutomer.c_id,
            Sale_Date: saleDate,
            Sale_Time: saleTime,
            Location: 'Shop',
            Sale_Type: 'Retail',
            Price_Level: 'Retail',
            Subtotal: invoiceDetails.subTotal,
            Discount_Percentage: 0,
            Discount_Amount: invoiceDetails.discountAmount,
            Tax_Rate: 0,
            Tax_Amount: invoiceDetails.taxTotal,
            Total_Amount: invoiceDetails.finalTotal,
            Payment_Status: 'Paid',
            Paid_Amount: paymentDetails.Payment_Amount,
            Bill_Printed: false,
            Status: 'Active'
        });

        return res.status(200).json({
            success: true,
            message: "Sales data processed successfully",
            invoiceNo: sale.Invoice_No,
            saleId: sale.Sale_Id
        });

    } catch (error) {
        console.error("Error in postSalesData:", error);
        res.status(500).json({
            success: false,
            message: "Error processing sales data",
            error: error.message
        });
    }
}


//  get the quntity of product in the inventory 
const getProductQuntity = async (req, res) => {
    try{
        const { productId } = req.params;
        console.log('Fetching quantity for product:', productId);
        
        const invetoryRecords = await Inventory.findAll({
            where:{
                P_ID:productId,
                Location:'Shop'
            },
            attributes:[
                [sequelize.fn('SUM', sequelize.col('Qty')), 'totalQty'  ]
            ]
        });

        const totalQty = parseFloat(invetoryRecords[0]?.dataValues?.totalQty) || 0;
        console.log(`Total quantity for product ID ${productId}:`, totalQty);

        res.status(200).json({
            success:true,
            productId: productId,
           totalQty: totalQty 
        });

    }catch(error){
        console.error("Error fetching product quantity from inventory:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching product quantity"
        });
    }
};


//get all sales for recent activity log in the POS
const getAllSales = async (req, res) => {
    try {
        const sales = await Sale.findAll({
            where: { 
                Status: 'Active',
                Sale_Date: {
                    [Op.gte]: new Date(new Date().setDate(new Date().getDate() - 7)) // Last 7 days
                }
            },
            attributes: [
               
                'Invoice_No',
                'C_ID',
                'Sale_Date',
                'Sale_Time',
                'Total_Amount',
                'Paid_Amount',
                'Payment_Status'
            ],include: [{
                model: Customer,
                attributes: ['C_Name']
            }], order: [['Created_At', 'DESC']]

            });


            const formateData = sales.map((s) => {
                return {
                    invoice_no: s.Invoice_No,
                    c_id: s.C_ID,
                    customer_name: s.Customer?.C_Name || 'Unknown',
                    sale_date: s.Sale_Date,
                    sale_time: s.Sale_Time,
                    total_amount: parseFloat(s.Total_Amount),
                    balance: parseFloat(s.Total_Amount) - parseFloat(s.Paid_Amount),
                    payment_status: s.Payment_Status
                }
            }
            );
          
        return res.status(200).json({
            success: true,
            count: sales.length,
            data: formateData

        });
    } catch (error) {
        console.error('getAllSales error: ', error);
        return res.status(500).json({
            success: false,
            message: 'server error while fetching sales',
            error: error.message
        })
    }

}         
module.exports = { searchProducts, allUnits, getBaseUnitQty, postSalesData, generateInvoiceNo ,getProductQuntity,getAllSales};

