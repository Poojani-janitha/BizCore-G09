const sequelize = require('../../config/db');
const {Product,UnitConversion} = require('../../models/index');
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
                Status: 'Active',
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

        const formateData = products.map((p)=>{
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


        return res.status(200).json({
            
            success:true,
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

        return res.status(200).json({
            success: true,
            units: units
        });

    } catch (error) {
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
module.exports = {searchProducts, allUnits, getBaseUnitQty}

