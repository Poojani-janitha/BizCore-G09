const express = require('express');
const router = express.Router();
const financeDashboardController = require('../../controllers/Accounting&Finance/FinanceDashboardController');

router.get('/stats', (req, res) => financeDashboardController.getDashboardStats(req, res));

module.exports = router;
