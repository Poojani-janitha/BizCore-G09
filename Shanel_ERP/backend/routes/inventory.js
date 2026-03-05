const express = require("express");
const router = express.Router();
const { getDashboardStats, getProducts, addProduct, deleteProduct, updateProduct } = require("../controllers/inventoryController");

router.get("/dashboard-stats", getDashboardStats);
router.get("/products", getProducts);
router.post("/products", addProduct);
router.delete("/products/:id", deleteProduct);
router.put("/products/:id", updateProduct);

module.exports = router;
