const JournalEntry = require('../../models/finance/JournalEntry');
const JournalEntryLine = require('../../models/finance/JournalEntryLine');
const AccountChart = require('../../models/finance/AccountChart');

class JournalEntryController {
    // Get all journal entries
    async getAllJournalEntries(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;
            const { startDate, endDate } = req.query;

            const whereClause = {};
            if (startDate && endDate) {
                const { Op } = require('sequelize');
                whereClause.Entry_Date = {
                    [Op.between]: [startDate, endDate]
                };
            }

            const { count, rows } = await JournalEntry.findAndCountAll({
                where: whereClause,
                order: [['Entry_Date', 'DESC'], ['Journal_ID', 'DESC']],
                limit: limit,
                offset: offset
            });

            return res.status(200).json({
                success: true,
                data: rows,
                total: count,
                currentPage: page,
                totalPages: Math.ceil(count / limit)
            });
        } catch (error) {
            console.error('Error fetching journal entries:', error);
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Get journal entry details including lines
    async getJournalEntryDetails(req, res) {
        try {
            const { id } = req.params;
            const entry = await JournalEntry.findOne({
                where: { Journal_ID: id },
                include: [{
                    model: JournalEntryLine,
                    as: 'Lines',
                    include: [{
                        model: AccountChart,
                        attributes: ['Account_Name', 'Account_Code']
                    }]
                }]
            });

            if (!entry) {
                return res.status(404).json({
                    success: false,
                    message: 'Journal entry not found'
                });
            }

            return res.status(200).json({
                success: true,
                data: entry
            });
        } catch (error) {
            console.error('Error fetching journal entry details:', error);
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = new JournalEntryController();
