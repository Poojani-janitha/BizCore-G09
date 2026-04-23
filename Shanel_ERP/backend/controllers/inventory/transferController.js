const { StockTransfer, Product, Inventory } = require('../../models/index');
const sequelize = require('../../config/db');

const getTransferHistory = async (req, res) => {
    try {
        let transfers = [];
        let metrics = {
            totalTransfers: 0,
            pending: 0,
            completedToday: 0,
            totalItems: 0
        };

        // Try to fetch from database, but gracefully handle if table doesn't exist
        try {
            transfers = await StockTransfer.findAll({
                order: [['Created_At', 'DESC'], ['Transfer_Date', 'DESC']],
            });

            metrics = {
                totalTransfers: transfers.length,
                pending: transfers.filter(t => t.Status === 'Pending').length,
                completedToday: transfers.filter(t => t.Status === 'Completed').length,
                totalItems: transfers.reduce((sum, t) => sum + (parseFloat(t.Qty) || 0), 0)
            };
        } catch (dbError) {
            console.error('Database Query Error:', dbError.message);
            // Return empty data structure if table doesn't exist yet
            transfers = [];
        }

        res.json({ success: true, transfers, metrics });
    } catch (error) {
        console.error('Transfer History Error:', error.message);
        res.status(500).json({ success: false, message: error.message || 'Failed to fetch transfer history' });
    }
};

const createTransfer = async (req, res) => {
    const { P_ID, Qty, From_Location, To_Location, Transferred_By } = req.body;
    const t = await sequelize.transaction();

    try {
        // 1. Check if source has enough stock
        const sourceStock = await Inventory.findOne({
            where: { P_ID, Location: From_Location },
            transaction: t
        });

        if (!sourceStock || parseFloat(sourceStock.Qty) < parseFloat(Qty)) {
            throw new Error(`Insufficient stock in ${From_Location}`);
        }

        // 2. Subtract from Source
        await sourceStock.update({ Qty: parseFloat(sourceStock.Qty) - parseFloat(Qty) }, { transaction: t });

        // 3. Add to Destination (Find or Create)
        const [destStock] = await Inventory.findOrCreate({
            where: { P_ID, Location: To_Location, PR_ID: null },
            defaults: { Qty: 0 },
            transaction: t
        });
        await destStock.update({ Qty: parseFloat(destStock.Qty) + parseFloat(Qty) }, { transaction: t });

        // 4. Record the Transfer History
        const newTransfer = await StockTransfer.create({
            P_ID,
            Qty: parseFloat(Qty),
            From_Location,
            To_Location,
            Transferred_By,
            Status: 'Completed',
            Transfer_Date: new Date().toISOString().split('T')[0]
        }, { transaction: t });

        await t.commit();
        res.status(201).json({ success: true, message: "Transfer successful!", data: newTransfer });

    } catch (error) {
        await t.rollback();
        res.status(400).json({ success: false, message: error.message });
    }
};

const updateTransfer = async (req, res) => {
    const { ST_ID } = req.params;
    const { P_ID, Qty, From_Location, To_Location, Transferred_By } = req.body;
    const t = await sequelize.transaction();

    try {
        // 1. Find the existing transfer
        const existingTransfer = await StockTransfer.findByPk(ST_ID);
        if (!existingTransfer) {
            return res.status(404).json({ success: false, message: "Transfer not found" });
        }

        const oldQty = parseFloat(existingTransfer.Qty);
        const newQty = parseFloat(Qty);
        const qtyDifference = newQty - oldQty;

        // 2. Revert the old transfer first
        const oldSourceStock = await Inventory.findOne({
            where: { P_ID: existingTransfer.P_ID, Location: existingTransfer.From_Location },
            transaction: t
        });
        if (oldSourceStock) {
            await oldSourceStock.update({ Qty: parseFloat(oldSourceStock.Qty) + oldQty }, { transaction: t });
        }

        const oldDestStock = await Inventory.findOne({
            where: { P_ID: existingTransfer.P_ID, Location: existingTransfer.To_Location },
            transaction: t
        });
        if (oldDestStock) {
            await oldDestStock.update({ Qty: parseFloat(oldDestStock.Qty) - oldQty }, { transaction: t });
        }

        // 3. Apply the new transfer
        const sourceStock = await Inventory.findOne({
            where: { P_ID, Location: From_Location },
            transaction: t
        });

        if (!sourceStock || parseFloat(sourceStock.Qty) < newQty) {
            throw new Error(`Insufficient stock in ${From_Location}`);
        }

        await sourceStock.update({ Qty: parseFloat(sourceStock.Qty) - newQty }, { transaction: t });

        const [destStock] = await Inventory.findOrCreate({
            where: { P_ID, Location: To_Location, PR_ID: null },
            defaults: { Qty: 0 },
            transaction: t
        });
        await destStock.update({ Qty: parseFloat(destStock.Qty) + newQty }, { transaction: t });

        // 4. Update the transfer record
        await existingTransfer.update({
            P_ID,
            Qty: newQty,
            From_Location,
            To_Location,
            Transferred_By
        }, { transaction: t });

        await t.commit();
        res.status(200).json({ success: true, message: "Transfer updated successfully!", data: existingTransfer });

    } catch (error) {
        await t.rollback();
        res.status(400).json({ success: false, message: error.message });
    }
};

module.exports = { getTransferHistory, createTransfer, updateTransfer };