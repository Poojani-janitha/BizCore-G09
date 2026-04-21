const express = require("express");
const router = express.Router();
const db = require("../config/db");

//Get Dashbpard charts data
router.get("/dashboard-stats", async (req, res) => {
  try {
    //Get data from sql view
    const [stockLevel] = await db.query(
      `SELECT P_Name as name, Stock_Qty as current, Min_Stock as min, (Stock_Qty - Min_Stock) as gap
      FROM v_current_stock
      WHERE Min_Stock > 0 
      ORDER BY gap ASC
      LIMIT 5`,
    );

    //Get distribution for Pie Chart
    const [distribution] = await db.query(
      `SELECT P_Type as name, COUNT(*) as value 
      FROM PRODUCT GROUP BY P_Type`,
    );

    //Fetch active alerts from STOCK_ALERT_LOGS table
    const [alerts] = await db.query(`
            SELECT p.P_Name as name, a.Alert_Type as type, a.Current_Stock as current, a.Min_Stock as min, a.Status
            FROM STOCK_ALERT_LOGS a
            JOIN PRODUCT p ON a.P_ID = p.P_ID
            WHERE a.Status = 'Active'
            ORDER BY a.Alert_Date DESC LIMIT 3
        `);

    //Fetch latest transfer from STOCK_TRANSFER
    const [transfers] = await db.query(`
            SELECT p.P_Name as name, t.From_Location, t.To_Location, t.Qty, t.Status, t.Transfer_Date
            FROM STOCK_TRANSFER t
            JOIN PRODUCT p ON t.P_ID = p.P_ID
            ORDER BY t.Transfer_Date DESC LIMIT 3
        `);
    
        const [[{ activeProducts }]] = await db.query('SELECT COUNT(*) as activeProducts FROM PRODUCT');
        const [[{ alertsCount }]] = await db.query('SELECT COUNT(*) as alertsCount FROM STOCK_ALERT_LOGS WHERE Status = "Active"');
        const [[{ productionStock }]] = await db.query('SELECT SUM(Qty) as productionStock FROM INVENTORY WHERE Location = "Production"');
        const [[{ storeStock }]] = await db.query('SELECT SUM(Qty) as storeStock FROM INVENTORY WHERE Location = "Store"');

    res.json({ 
        stockLevel, 
        distribution, 
        alerts, 
        transfers,
        summary: {
            activeProducts,
            alertsCount,
            productionStock: productionStock || 0, // Handle null case
            storeStock: storeStock || 0, // Handle null case
            pendingOrders: 1 // Hardcoded for now until you build the Order module
        }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error", detail: err.message });
  }
});
module.exports = router;
