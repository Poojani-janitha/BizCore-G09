const express = require('express');
const router = express.Router();
const productionController = require('../../controllers/inventory/productionController');

//Define endpoint
router.get('/stock-overview', productionController.getProductionData);
router.get('/next-batch-number', productionController.getNextBatchNumber);
router.post('/start', productionController.startProduction);
router.put('/:id', productionController.editProduction);
router.put('/update/:id', productionController.updateProductionStatus);
router.delete('/:id', productionController.deleteProduction);

module.exports = router;