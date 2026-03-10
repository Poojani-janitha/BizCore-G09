const Customer = require('../../models/customer/customer');
const { Op, where } = require('sequelize');


//get all customers
const getAllCustomers = async (req, res) => {
    try {
        const customers = await Customer.findAll({
            where: { Status: 'Active' },
            attribute: [

                'C_ID',
                'Customer_Code',
                'C_Name',
                'Phone1',
                'Customer_Type',
                'Price_Level',
                'Credit_Allowed',
                'Current_Balance',
                'Credit_Limit',
                'Status'
            ], order: [['C_Name', 'ASC']]
        })

        return res.status(200).json({
            success: true,
            count: customers.length,
            data: customers

        });
    } catch (error) {
        console.error('gellAllCustomer error: ', error);
        return res.status(500).json({
            success: false,
            message: 'server error while fetching customer',
            error: error.message
        })
    }
};

const getCustomerById = async (req, res) => {
    try {
        const customer = await Customer.findOne({
            where: {
                Customer_Code: req.params.id,
                Status: 'Active'
            }
        })

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'customer not found'

            })
        }

        return res.status(200).json({
            success: true,
            data: customer
        })
    } catch (error) {

        console.error('getCustomerById error: ', error);
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: console.error.message
        })


    }
}

module.exports = { getAllCustomers, getCustomerById };