const db = require("../config/db");

// Get Dashboard charts data
const getDashboardStats = async (req, res) => {
  try {
    const [stockLevel] = await db.query(
      `SELECT P_Name as name, Stock_Qty as current, Min_Stock as min, (Stock_Qty - Min_Stock) as gap
      FROM v_current_stock
      WHERE Min_Stock > 0 
      ORDER BY gap ASC
      LIMIT 5`
    );

    const [distribution] = await db.query(
      `SELECT P_Type as name, COUNT(*) as value 
      FROM PRODUCT GROUP BY P_Type`
    );

    const [alerts] = await db.query(`
      SELECT p.P_Name as name, a.Alert_Type as type, a.Current_Stock as current, a.Min_Stock as min, a.Status
      FROM STOCK_ALERT_LOGS a
      JOIN PRODUCT p ON a.P_ID = p.P_ID
      WHERE a.Status = 'Active'
      ORDER BY a.Alert_Date DESC LIMIT 3
    `);

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
        productionStock: productionStock || 0,
        storeStock: storeStock || 0,
        pendingOrders: 1
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error", detail: err.message });
  }
};

// Fetch all products with detailed pricing and stock
const getProducts = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        p.P_ID as id, 
        p.P_Name as name, 
        p.P_Type as type, 
        p.Barcode as barcode, 
        p.Cost_Price as costPrice, 
        p.Wholesale_Price as wholesalePrice, 
        p.Retail_Price as retailPrice, 
        p.Min_Stock as minStock, 
        p.Status as status,
        COALESCE(SUM(i.Qty), 0) as stockCount
      FROM PRODUCT p
      LEFT JOIN INVENTORY i ON p.P_ID = i.P_ID
      GROUP BY p.P_ID
    `);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ message: "Database error", detail: err.message });
  }
};

module.exports = { getDashboardStats, getProducts };
