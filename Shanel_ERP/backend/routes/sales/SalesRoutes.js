const express = require('express');
const router = express.Router();
const {searchProducts,allUnits,getBaseUnitQty,generateInvoiceNo, postSalesData,getProductQuntity,getAllSales} = require('../../controllers/sales/SalesController')

 router.get('/search',searchProducts);
 router.get('/units', allUnits);
 router.get('/base-unit', getBaseUnitQty);
 router.get('/generate-invoice-no', generateInvoiceNo);
 router.post('/', postSalesData);
 router.get('/product-quantity/:productId', getProductQuntity);
 router.get('/all', getAllSales);

 module.exports = router;