const express = require('express');
const router = express.Router();
const {searchProducts,allUnits,getBaseUnitQty,generateInvoiceNo, postSalesData} = require('../../controllers/sales/SalesController')

 router.get('/search',searchProducts);
 router.get('/units', allUnits);
 router.get('/base-unit', getBaseUnitQty);
 router.get('/generate-invoice-no', generateInvoiceNo);
 router.post('/', postSalesData);

 module.exports = router;