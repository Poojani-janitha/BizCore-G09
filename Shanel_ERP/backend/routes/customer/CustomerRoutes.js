const express = require('express');
const router = express.Router();
const {
	getAllCustomers,
	getCustomerById,
	searchCustomers,
	saveCustomer,
	// Sales Management Module extensions
	getCustomersPaginated,
	getCustomerDetail,
	getCustomerStatement,
	updateCustomer
} = require('../../controllers/customer/CustomerController');

// Sales Management Module — new routes (placed above dynamic routes to avoid interception)
router.get('/paginated', getCustomersPaginated);
router.get('/:id/detail', getCustomerDetail);
router.get('/:id/statement', getCustomerStatement);
router.put('/:id', updateCustomer);

// Existing routes — DO NOT CHANGE
router.get('/', getAllCustomers);
router.get('/search', searchCustomers);
router.get('/:id', getCustomerById);
router.post('/', saveCustomer);

module.exports = router;
