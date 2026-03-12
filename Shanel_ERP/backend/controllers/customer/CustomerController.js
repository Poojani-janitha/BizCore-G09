const Customer = require('../../models/customer/customer');
const { Op, where } = require('sequelize');


//get all customers
const getAllCustomers = async (req, res) => {
    try {
        const customers = await Customer.findAll({
            where: { Status: 'Active' },
            attributes: [

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
            error: error.message
        })


    }
}

const searchCustomers = async (req, res) => {
    try {
        const { q, limit = 10 } = req.query;


        //validate search term
        if (!q || q.trim() === '') {
            return res.status(422).json({
                success: false,
                message: "query is empty",
                error: "EMPTY_QUERY"

            })
        }

        const searchTerm = q.trim();

        const customer = await Customer.findAll({

            where: {
                Status: 'Active',
                [Op.or]: [
                    { C_Name: { [Op.like]: `%${searchTerm}%` } },
                    { Phone1: { [Op.like]: `%${searchTerm}%` } },
                    { Phone2: { [Op.like]: `%${searchTerm}` } },
                    { Customer_Code: { [Op.like]: `%${searchTerm}` } }
                ]
            }, attributes: [
                'C_ID',
                'Customer_Code',
                'C_Name',
                'Phone1',
                'Phone2',
                'Email',
                'Address',
                'City',
                'Customer_Type',
                'Price_Level',
                'Credit_Allowed',
                'Credit_Limit',
                'Current_Balance',
                'Payment_Terms',
                'Status',
                'Last_Purchase_Date',


            ], limit: parseInt(limit),
            order: [['C_Name', 'ASC']],

        });

        const formateData = customer.map((c) => {

            const creditLimit = parseFloat(c.Credit_Limit) || 0;
            const currentBalance = parseFloat(c.CurrentBalance) || 0;
            const availableCredit = creditLimit - currentBalance;


            //credit allowed logic
            let creditStatus = 'NOT_ALLOWED'
            if (c.Credit_Allowed) {
                if (c.Current_Balance >= c.Credit_Limit) {
                    creditStatus = 'LIMITE_REACHED';
                } else if (c.Current_Balance >= c.Credit_Limit * 0.8) {
                    creditStatus = 'NEAR_LIMIT';
                } else {
                    creditStatus = 'CREDIT_ALLOWED'
                }
            }
                return {
                    c_id: c.C_ID,
                    customer_code: c.Customer_Code,
                    c_name: c.C_Name,
                    phone1: c.Phone1,
                    phone2: c.Phone2,
                    email: c.Email,
                    address: c.Address,
                    city: c.City,
                    customer_type: c.Customer_Type,
                    price_level: c.Price_Level,
                    credit_allowed: c.Credit_Allowed,
                    credit_limit: creditLimit,
                    current_balance: currentBalance,
                    available_credit: availableCredit,
                    credit_status: creditStatus,
                    payment_terms: c.Payment_Terms,
                    last_purchase_date: c.Last_Purchase_Date,

                }

            

        })
        return res.status(200).json({
            success: true,
            count: formateData.length,
            customers: formateData,
        });
    } catch (error) {
        console.error("error in the server", error);
        return res.status(500).json({
            success: false,
            error: "SERVER_ERROR",
            message: "Something went wrong"
        })
    }

}


module.exports = { getAllCustomers, getCustomerById, searchCustomers };