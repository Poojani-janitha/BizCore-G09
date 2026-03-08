const express = require('express');
const router = express.Router();
// Placeholder for customer-related routes
// You can add routes for creating, retrieving, updating, and deleting customers here
 
router.get('/pos/customer/: id',getCoustomerById);
router.post('/pos/customer',createCustomer);
router.put('/pos/customer/: id',updateCustomer);
router.delete('/pos/customer/: id',deleteCustomer);