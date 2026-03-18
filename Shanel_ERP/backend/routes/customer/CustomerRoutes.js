const express = require('express');
const router = express.Router();
const {
	getAllCustomers,
	getCustomerById,
	searchCustomers,
} = require('../../controllers/customer/CustomerController');

router.get('/', getAllCustomers);
router.get('/search', searchCustomers);
router.get('/:id', getCustomerById);

module.exports = router;
