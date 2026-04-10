const express = require('express');
const router = express.Router();
const {searchProducts} = require('../../controllers/sales/SalesController')

 router.get('/search',searchProducts);

 module.exports = router;