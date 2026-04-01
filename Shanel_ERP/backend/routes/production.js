const express = require("express");
const router = express.Router();
const { getStockOverview, startProduction, updateProductionStatus } = require("../controllers/productionController");

router.get("/stock-overview", getStockOverview);
router.post("/start", startProduction);
router.put("/update/:id", updateProductionStatus);

module.exports = router;
