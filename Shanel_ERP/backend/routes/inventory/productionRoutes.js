const express = require('express');
const router = express.Router();
const productionController = require('../../controllers/inventory/productionController');

//Define endpoint
router.get('/stock-overview', productionController.getProductionData);

module.exports = router;