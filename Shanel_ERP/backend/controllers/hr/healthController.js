const sequelize = require('../../config/db');
const { Employee } = require('../../models/index');

/**
 * Verifies DB connectivity and that the HR EMPLOYEE table is readable.
 */
const getHrDbHealth = async (req, res) => {
    try {
        await sequelize.authenticate();
        const employeeRowCount = await Employee.count();

        return res.status(200).json({
            success: true,
            database: sequelize.config.database,
            employeeRowCount
        });
    } catch (err) {
        console.error('getHrDbHealth error:', err);
        return res.status(500).json({
            success: false,
            message: 'HR database check failed',
            error: err.message
        });
    }
};

module.exports = { getHrDbHealth };
