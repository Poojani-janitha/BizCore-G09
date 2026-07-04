const JournalEntry = require('../../models/finance/JournalEntry');
const JournalEntryLine = require('../../models/finance/JournalEntryLine');
const AccountChart = require('../../models/finance/AccountChart');
const FiscalPeriod = require('../../models/finance/FiscalPeriod');
const { Sequelize, Op } = require('sequelize');
const sequelize = require('../../config/db');

class JournalEntryController {
    // Get all journal entries
    async getAllJournalEntries(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;
            const { startDate, endDate } = req.query;

            const openPeriod = await FiscalPeriod.findOne({
                where: { Status: 'OPEN' }
            });

            const whereClause = {};
            if (openPeriod) {
                if (startDate && endDate) {
                    const finalStart = startDate > openPeriod.Start_Date ? startDate : openPeriod.Start_Date;
                    const finalEnd = endDate < openPeriod.End_Date ? endDate : openPeriod.End_Date;
                    whereClause.Entry_Date = {
                        [Op.between]: [finalStart, finalEnd]
                    };
                } else {
                    whereClause.Entry_Date = {
                        [Op.between]: [openPeriod.Start_Date, openPeriod.End_Date]
                    };
                }
            } else {
                if (startDate && endDate) {
                    whereClause.Entry_Date = {
                        [Op.between]: [startDate, endDate]
                    };
                }
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

    // Create a new manual journal entry
    async createJournalEntry(req, res) {
        const transaction = await sequelize.transaction();

        try {
            const { Entry_Date, Description, lines } = req.body;

            if (!Entry_Date || !Description || !lines || lines.length < 2) {
                throw new Error('Invalid journal entry data provided');
            }

            // Check if the entry date belongs to an open fiscal period
            const targetPeriod = await FiscalPeriod.findOne({
                where: {
                    Status: 'OPEN',
                    Start_Date: { [Op.lte]: Entry_Date },
                    End_Date: { [Op.gte]: Entry_Date }
                },
                transaction
            });

            if (!targetPeriod) {
                throw new Error('Entry date must be within an open fiscal period');
            }

            const totalDebit = lines.reduce((sum, line) => sum + parseFloat(line.Debit_Amount || 0), 0);
            const totalCredit = lines.reduce((sum, line) => sum + parseFloat(line.Credit_Amount || 0), 0);

            if (Math.abs(totalDebit - totalCredit) > 0.01) {
                throw new Error('Total Debit must equal Total Credit');
            }

            const journalNumber = await this.generateJournalNumber('JE', transaction);

            const newJournalEntry = await JournalEntry.create({
                Journal_No: journalNumber,
                Entry_Date: Entry_Date,
                Entry_Type: 'Manual',
                Reference_Type: 'Manual Entry',
                Description: Description,
                Total_Debit: totalDebit,
                Total_Credit: totalCredit,
                Status: 'Posted'
            }, { transaction });

            const newLines = lines.map((line, index) => ({
                Journal_ID: newJournalEntry.Journal_ID,
                Account_ID: line.Account_ID,
                Line_Number: index + 1,
                Debit_Amount: line.Debit_Amount || 0,
                Credit_Amount: line.Credit_Amount || 0,
                Description: line.Description || ''
            }));

            await JournalEntryLine.bulkCreate(newLines, { transaction });

            for (const line of newLines) {
                await this.updateAccountBalance(
                    line.Account_ID,
                    line.Debit_Amount,
                    line.Credit_Amount,
                    transaction
                );
            }

            await transaction.commit();

            return res.status(201).json({
                success: true,
                message: 'Journal entry created successfully',
                data: {
                    journalId: newJournalEntry.Journal_ID,
                    journalNo: journalNumber
                }
            });

        } catch (error) {
            await transaction.rollback();
            console.error('Error creating journal entry:', error);
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Helper: update account balance
    async updateAccountBalance(accountId, debitAmount, creditAmount, transaction) {
        const account = await AccountChart.findOne({
            where: { Account_ID: accountId },
            transaction
        });

        if (!account) {
            throw new Error(`Account ${accountId} not found`);
        }

        let balanceChange = 0;
        switch (account.Account_Type) {
            case 'Asset':
            case 'Expense':
                balanceChange = debitAmount - creditAmount;
                break;
            case 'Liability':
            case 'Equity':
            case 'Revenue':
                balanceChange = creditAmount - debitAmount;
                break;
        }

        await AccountChart.update(
            { Current_Balance: sequelize.literal(`Current_Balance + ${balanceChange}`) },
            { where: { Account_ID: accountId }, transaction }
        );
    }

    // Helper: generate journal number
    async generateJournalNumber(prefix, transaction) {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const date = String(today.getDate()).padStart(2, '0');
        const datePrefix = `${prefix}-${year}${month}${date}`;

        const lastEntry = await JournalEntry.findOne({
            where: {
                Journal_No: { [Op.like]: `${datePrefix}-%` }
            },
            order: [['Journal_ID', 'DESC']],
            attributes: ['Journal_No'],
            transaction
        });

        if (!lastEntry) {
            return `${datePrefix}-001`;
        }

        const lastNumber = parseInt(lastEntry.Journal_No.split('-').pop(), 10);
        const nextNumber = String(lastNumber + 1).padStart(3, '0');
        return `${datePrefix}-${nextNumber}`;
    }
}

module.exports = new JournalEntryController();
