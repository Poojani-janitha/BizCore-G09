const db = require("../config/db");

// Get Production Stock Overview
const getStockOverview = async (req, res) => {
  try {
    // Fetch work in progress (production data)
    const [wip] = await db.query(`
      SELECT 
        PR_ID,
        Batch_No,
        P_ID,
        p.P_Name,
        Total_Qty_Produced,
        Completion,
        Status,
        Created_Date
      FROM PRODUCTION_RECORD pr
      JOIN PRODUCT p ON pr.P_ID = p.P_ID
      WHERE pr.Status IN ('In_Progress', 'Quality_Check', 'Approved')
      ORDER BY pr.Created_Date DESC
    `);

    res.json({
      success: true,
      wip: wip || []
    });
  } catch (error) {
    console.error("Error fetching production stock overview:", error);
    res.status(500).json({ 
      success: false,
      message: "Database error", 
      detail: error.message 
    });
  }
};

// Start New Production Batch
const startProduction = async (req, res) => {
  const { P_ID, Batch_No, Total_Qty_Produced, Exp_Date } = req.body;

  try {
    const query = `
      INSERT INTO PRODUCTION_RECORD 
      (P_ID, Batch_No, Total_Qty_Produced, Exp_Date, Status, Completion, Created_Date) 
      VALUES (?, ?, ?, ?, 'In_Progress', 0, NOW())
    `;

    await db.query(query, [P_ID, Batch_No, Total_Qty_Produced, Exp_Date]);

    res.status(201).json({ 
      success: true,
      message: "Production batch started successfully!" 
    });
  } catch (error) {
    console.error("Error starting production:", error);
    res.status(500).json({ 
      success: false,
      message: "Database insertion failed", 
      detail: error.message 
    });
  }
};

// Update Production Status
const updateProductionStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const query = `UPDATE PRODUCTION_RECORD SET Status = ? WHERE PR_ID = ?`;
    await db.query(query, [status, id]);

    res.json({ 
      success: true,
      message: "Production status updated successfully!" 
    });
  } catch (error) {
    console.error("Error updating production status:", error);
    res.status(500).json({ 
      success: false,
      message: "Database update failed", 
      detail: error.message 
    });
  }
};

module.exports = { 
  getStockOverview, 
  startProduction, 
  updateProductionStatus 
};
