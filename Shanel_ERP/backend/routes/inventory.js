const express = require("express");
const router = express.Router();
const { getDashboardStats, getProducts } = require("../controllers/inventoryController");

router.get("/dashboard-stats", getDashboardStats);
router.get("/products", getProducts);

module.exports = router;
