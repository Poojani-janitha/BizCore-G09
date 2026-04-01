const { Production, Product, Inventory } = require('../../models/index');
const sequelize = require('../../config/db');

// 1. Get All Active WIP Batches
exports.getProductionData = async (req, res) => {
    try {
        const wipData = await Production.findAll({
            where: { Status: ['In_Progress', 'Quality_Check', 'Approved'] },
            include: [{ model: Product, attributes: ['P_Name'] }],
            order: [['Created_At', 'DESC']]
        });

        const formattedWip = wipData.map(item => {
            let completionVal = 0;
            if (item.Status === 'In_Progress') completionVal = 50;
            else if (item.Status === 'Quality_Check') completionVal = 85;
            else if (item.Status === 'Approved' || item.Status === 'Completed') completionVal = 100;

            return {
                PR_ID: item.PR_ID,
                P_ID: item.P_ID,
                Batch_No: item.Batch_No,
                P_Name: item.Product ? item.Product.P_Name : 'Unknown',
                Total_Qty_Produced: item.Total_Qty_Produced,
                Status: item.Status,
                Completion: completionVal,
                Exp_Date: item.Exp_Date
            };
        });

        res.status(200).json({ success: true, wip: formattedWip });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 2. Start New Production (Add WIP)
exports.startProduction = async (req, res) => {
    try {
        const { P_ID, Batch_No, Total_Qty_Produced, Exp_Date } = req.body;
        const newBatch = await Production.create({
            P_ID,
            Batch_No,
            Total_Qty_Produced,
            Production_Date: new Date(),
            Exp_Date,
            Status: 'In_Progress'
        });
        res.status(201).json({ success: true, data: newBatch });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 3. Update Status (Progress) or Complete & Add to Stock
exports.updateProductionStatus = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { id } = req.params;
        const { status } = req.body;
        const batch = await Production.findByPk(id, { transaction: t });

        if (!batch) throw new Error("Batch not found");

        // Status එක Approved නම් පමණක් Stock එක වැඩි කරන්න
        if (status === 'Approved' && batch.Status !== 'Approved') {
            const [inventory] = await Inventory.findOrCreate({
                where: { P_ID: batch.P_ID, Location: 'Main_Warehouse' },
                defaults: { Qty: 0 },
                transaction: t
            });
            await inventory.update({ Qty: parseFloat(inventory.Qty) + parseFloat(batch.Total_Qty_Produced) }, { transaction: t });
        }

        await batch.update({ Status: status }, { transaction: t });
        await t.commit();
        res.json({ success: true, message: "Production updated and Stock synced!" });
    } catch (error) {
        await t.rollback();
        res.status(500).json({ success: false, message: error.message });
    }
};

// 4. Delete Batch
exports.deleteProduction = async (req, res) => {
    try {
        await Production.destroy({ where: { PR_ID: req.params.id } });
        res.json({ success: true, message: "Batch deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};