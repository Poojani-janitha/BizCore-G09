const { Sequelize, Op } = require('sequelize');
const FiscalPeriod = require('../../models/finance/FiscalPeriod');
const AccountChart = require('../../models/finance/AccountChart');
const JournalEntryLine = require('../../models/finance/JournalEntryLine');
const JournalEntry = require('../../models/finance/JournalEntry');
const databaseCon = require('../../config/db');

class FiscalPeriodController {
    // Get all fiscal periods
    async getAllPeriods(req, res) {
        try {
            const periods = await FiscalPeriod.findAll({
                order: [['Start_Date', 'DESC']]
            });
            return res.status(200).json({
                success: true,
                data: periods
            });
        } catch (error) {
            console.error('Error fetching fiscal periods:', error);
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Create a new fiscal period
    async createPeriod(req, res) {
        try {
            const { name, start, end, status } = req.body;
            const period = await FiscalPeriod.create({
                Period_Name: name,
                Start_Date: start,
                End_Date: end,
                Status: status || 'OPEN'
            });
            return res.status(201).json({
                success: true,
                data: period
            });
        } catch (error) {
            console.error('Error creating fiscal period:', error);
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Update period status
    async updateStatus(req, res) {
        const transaction = await databaseCon.transaction();

        try {
            const { id } = req.params;
            const { status } = req.body;
            
            const period = await FiscalPeriod.findByPk(id, { transaction });
            if (!period) {
                await transaction.rollback();
                return res.status(404).json({
                    success: false,
                    message: 'Period not found'
                });
            }

            let accountsUpdated = 0;

            // ── When closing a period, calculate Balance Brought Forward ──
            if (status === 'CLOSED' && period.Status !== 'CLOSED') {
                // Ensure a subsequent fiscal period exists
                const nextPeriod = await FiscalPeriod.findOne({
                    where: {
                        Start_Date: { [Op.gt]: period.Start_Date }
                    },
                    transaction
                });

                if (!nextPeriod) {
                    await transaction.rollback();
                    return res.status(400).json({
                        success: false,
                        message: 'Cannot close this fiscal period because the next fiscal period has not been created yet. Please create a new period first.'
                    });
                }

                accountsUpdated = await this._calculateBalanceBroughtForward(period, transaction);
            }

            period.Status = status;
            await period.save({ transaction });

            await transaction.commit();

            return res.status(200).json({
                success: true,
                message: status === 'CLOSED'
                    ? `Period closed successfully. Balance Brought Forward updated for ${accountsUpdated} accounts.`
                    : `Period status updated to ${status}`,
                accountsUpdated
            });
        } catch (error) {
            await transaction.rollback();
            console.error('Error updating period status:', error);
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // ── Private: Calculate and store Balance Brought Forward ──────────────────
    async _calculateBalanceBroughtForward(period, transaction) {
        const endDate = period.End_Date;

        // Fetch all permanent (balance sheet) accounts: Asset=1, Liability=2, Equity=3
        const accounts = await AccountChart.findAll({
            where: {
                Type_ID: { [Op.in]: [1, 2, 3] },
                Is_Active: true
            },
            transaction
        });

        // Aggregate net (Debit - Credit) per account from journal entries up to the period end date
        const balances = await JournalEntryLine.findAll({
            attributes: [
                'Account_ID',
                [Sequelize.fn('SUM', Sequelize.col('Debit_Amount')), 'Total_Debit'],
                [Sequelize.fn('SUM', Sequelize.col('Credit_Amount')), 'Total_Credit']
            ],
            include: [{
                model: JournalEntry,
                as: 'JournalEntry',
                attributes: [],
                where: {
                    Entry_Date: { [Op.lte]: endDate },
                    Status: 'Posted'
                }
            }],
            where: {
                Account_ID: { [Op.in]: accounts.map(a => a.Account_ID) }
            },
            group: ['Account_ID'],
            raw: true,
            transaction
        });

        // Build a lookup map: Account_ID -> { totalDebit, totalCredit }
        const balanceMap = {};
        balances.forEach(b => {
            balanceMap[b.Account_ID] = {
                totalDebit: parseFloat(b.Total_Debit) || 0,
                totalCredit: parseFloat(b.Total_Credit) || 0
            };
        });

        // Update each account's Balance_Brought_Forward
        let updatedCount = 0;
        for (const account of accounts) {
            const entry = balanceMap[account.Account_ID] || { totalDebit: 0, totalCredit: 0 };
            let balanceBF = 0;

            // Assets are debit-normal: balance = Debit - Credit
            if (account.Type_ID === 1) {
                balanceBF = entry.totalDebit - entry.totalCredit;
            }
            // Liabilities and Equity are credit-normal: balance = Credit - Debit
            else {
                balanceBF = entry.totalCredit - entry.totalDebit;
            }

            await AccountChart.update(
                { Balance_Brought_Forward: balanceBF.toFixed(2) },
                { where: { Account_ID: account.Account_ID }, transaction }
            );
            updatedCount++;
        }

        console.log(`✅ Balance Brought Forward updated for ${updatedCount} accounts (period: ${period.Period_Name})`);
        return updatedCount;
    }
}

module.exports = new FiscalPeriodController();

