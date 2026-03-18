const { Product, Inventory, Production } = require('../../models/index');

exports.getProductionData = async (req, res) => {
    try {
        // 1. Fetch Materials from Inventory + Join with Product
        const materialsData = await Inventory.findAll({
            where: { Location: 'Production' },
            include: [{
                model: Product,
                required: true, 
                attributes: ['P_Name', 'Base_Unit', 'Min_Stock']
            }]
        });

        // 2. Fetch WIP Batches from Production + Join with Product
        const wipData = await Production.findAll({
            where: { Status: ['In_Progress', 'Quality_Check'] },
            include: [{
                model: Product,
                attributes: ['P_Name']
            }]
        });

        // 3. FLATTENING THE DATA (This fixes the "Undefined" name error)
        const formattedMaterials = materialsData.map(item => ({
            P_ID: item.P_ID,
            P_Name: item.Product ? item.Product.P_Name : 'Unknown', 
            Qty: item.Qty,
            Base_Unit: item.Product ? item.Product.Base_Unit : '',
            Min_Stock: item.Product ? item.Product.Min_Stock : 0
        }));

        const formattedWip = wipData.map(item => {
            // Logic: If Status is Quality_Check, it's 90% done. If In_Progress, it's 50%.
            let percentage = 0;
            if (item.Status === 'Quality_Check') percentage = 90;
            else if (item.Status === 'In_Progress') percentage = 50;
            else if (item.Status === 'Completed') percentage = 100;

            return {
                Batch_No: item.Batch_No,
                P_Name: item.Product ? item.Product.P_Name : 'Unknown',
                Total_Qty_Produced: item.Total_Qty_Produced,
                Status: item.Status,
                Completion: percentage // Adding this new field
            };  
        });

        // 4. Send the clean, flat data to the frontend
        res.status(200).json({ 
            success: true, 
            materials: formattedMaterials, 
            wip: formattedWip 
        });

    } catch (error) {
        console.error("Controller Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};