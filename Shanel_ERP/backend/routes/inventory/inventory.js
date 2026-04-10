const express = require("express");
const router = express.Router();
const { getDashboardStats, getProducts, addProduct, deleteProduct, updateProduct, getProductLocationInventory, getProductUnitConversions } = require("../../controllers/inventory/inventoryController");
const { createAdjsutment, getAdjustments, updateAdjustment, deleteAdjustment } = require("../../controllers/inventory/adjustmentController");
const { processReturn, getReturnLogs, searchInvoice, getInvoiceDetails } = require("../../controllers/inventory/returnController");

router.get("/dashboard-stats", getDashboardStats);
router.get("/products", getProducts);
router.get("/product/:productId/locations", getProductLocationInventory);
router.get("/product/:productId/units", getProductUnitConversions);
router.post("/products", addProduct);
router.delete("/products/:id", deleteProduct);
router.put("/products/:id", updateProduct);

// Stock Adjustment Routes
router.get("/adjustments", getAdjustments);
router.post("/adjustments/adjust", createAdjsutment);
router.put("/adjustments/:id", updateAdjustment);
router.delete("/adjustments/:id", deleteAdjustment);

// Product Return Routes
router.get("/returns", getReturnLogs);
router.post("/returns/process", processReturn);
router.get("/invoice/:invoiceNo", searchInvoice);
router.get("/invoice-details/:saleId", getInvoiceDetails);

module.exports = router;
