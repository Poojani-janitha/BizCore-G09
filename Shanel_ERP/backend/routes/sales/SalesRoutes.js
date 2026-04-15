const express = require('express');
const router = express.Router();
const {searchProducts,allUnits,getBaseUnitQty} = require('../../controllers/sales/SalesController')

 router.get('/search',searchProducts);
 router.get('/units', allUnits);
 router.get('/base-unit', getBaseUnitQty);

 module.exports = router;