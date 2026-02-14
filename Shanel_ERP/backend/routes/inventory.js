const express = require("express");
const router = express.Router();
const db = require('../config/db');

//Get Dashbpard charts data
router.get('/dashboard-stats', async (req, res) => {
    try{
        //Get data from sql view
        const [stockLevel] = await db.query('SELECT P_Name as name, Stock_Qty as current, Min_Stock as min FROM v_current_stock LIMIT 6');

        //Get distribution for Pie Chart
        const [distribution] = await db.query('SELECT P_Type as name, COUNT(*) as value FROM PRODUCT GROUP BY P_Type');

        res.json({ stockLevel, distribution });
    }catch(err){
        res.status(500).json({ error: err.message });
    }
});
module.exports = router;