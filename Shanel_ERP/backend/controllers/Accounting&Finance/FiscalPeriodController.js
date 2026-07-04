const { Sequelize, Op } = require('sequelize');
const FiscalPeriod = require('../../models/finance/FiscalPeriod');
const AccountChart = require('../../models/finance/AccountChart');
const JournalEntryLine = require('../../models/finance/JournalEntryLine');
const JournalEntry = require('../../models/finance/JournalEntry');
const databaseCon = require('../../config/db');
const bcrypt = require('bcrypt');
const User = require('../../models/user/User');

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

                // First, create the closing journal entries to transfer temporary balances to Retained Earnings
                await this._createClosingJournalEntry(period, transaction);

                // Then calculate balance brought forward for balance sheet accounts (which now includes the closing entries)
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

    // ── Private: Create closing journal entry to transfer profit/loss to Retained Earnings ──
    async _createClosingJournalEntry(period, transaction) {
        // Delete existing closing entry for this period if any exists to allow clean re-closing / idempotency
        const existingClosing = await JournalEntry.findOne({
            where: {
                Entry_Type: 'Closing',
                Reference_Type: 'FiscalPeriod',
                Reference_ID: period.Period_ID
            },
            transaction
        });
        if (existingClosing) {
            await JournalEntryLine.destroy({
                where: { Journal_ID: existingClosing.Journal_ID },
                transaction
            });
            await existingClosing.destroy({ transaction });
        }

        // Fetch all active Revenue (4) and Expense (5) accounts
        const tempAccounts = await AccountChart.findAll({
            where: {
                Type_ID: { [Op.in]: [4, 5] },
                Is_Active: true
            },
            transaction
        });

        const tempAccountMap = {};
        tempAccounts.forEach(acc => {
            tempAccountMap[acc.Account_ID] = acc;
        });

        // Calculate net balance for each account during the closed period
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
                    Entry_Date: { [Op.between]: [period.Start_Date, period.End_Date] },
                    Status: 'Posted',
                    Entry_Type: { [Op.ne]: 'Closing' }
                }
            }],
            where: {
                Account_ID: {
                    [Op.in]: tempAccounts.map(acc => acc.Account_ID)
                }
            },
            group: ['Account_ID'],
            raw: true,
            transaction
        });

        // If there are no journal entries, there's nothing to close
        if (balances.length === 0) {
            console.log(`No balances to close for period ${period.Period_Name}.`);
            return;
        }

        // Find the Retained Earnings account
        let retainedEarningsAccount = await AccountChart.findOne({
            where: { Account_Code: '3002' },
            transaction
        });
        if (!retainedEarningsAccount) {
            retainedEarningsAccount = await AccountChart.findOne({
                where: { Account_Name: { [Op.like]: '%Retained Earnings%' } },
                transaction
            });
        }
        if (!retainedEarningsAccount) {
            throw new Error('Retained Earnings account (Code: 3002) not found in the chart of accounts.');
        }

        // Generate Closing Journal Entry
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const dateStr = String(today.getDate()).padStart(2, '0');
        const datePrefix = `CLS-${year}${month}${dateStr}`;

        const lastEntry = await JournalEntry.findOne({
            where: {
                Journal_No: {
                    [Op.like]: `${datePrefix}-%`
                }
            },
            order: [['Journal_ID', 'DESC']],
            attributes: ['Journal_No'],
            transaction
        });

        let nextNum = '001';
        if (lastEntry) {
            const lastNumber = parseInt(lastEntry.Journal_No.split('-').pop(), 10);
            nextNum = String(lastNumber + 1).padStart(3, '0');
        }
        const journalNumber = `${datePrefix}-${nextNum}`;

        const journalEntry = await JournalEntry.create({
            Journal_No: journalNumber,
            Entry_Date: period.End_Date,
            Entry_Type: 'Closing',
            Reference_Type: 'FiscalPeriod',
            Reference_ID: period.Period_ID,
            Description: `Closing entry for fiscal period: ${period.Period_Name}`,
            Total_Debit: 0,
            Total_Credit: 0,
            Status: 'Posted',
            Posted_By: null,
            Posted_Date: new Date(),
            Created_By: null
        }, { transaction });

        let totalDebit = 0;
        let totalCredit = 0;
        let journalLineNumber = 1;
        const closingLines = [];

        balances.forEach(b => {
            const acc = tempAccountMap[b.Account_ID];
            if (!acc) return;

            const totalDebitAmt = parseFloat(b.Total_Debit) || 0;
            const totalCreditAmt = parseFloat(b.Total_Credit) || 0;

            if (acc.Type_ID === 4) { // Revenue (Credit normal)
                const netCredit = totalCreditAmt - totalDebitAmt;
                if (netCredit > 0) {
                    closingLines.push({
                        Journal_ID: journalEntry.Journal_ID,
                        Account_ID: acc.Account_ID,
                        Line_Number: journalLineNumber++,
                        Debit_Amount: netCredit,
                        Credit_Amount: 0,
                        Description: `Close revenue account ${acc.Account_Name} to Retained Earnings`
                    });
                    totalDebit += netCredit;
                } else if (netCredit < 0) {
                    closingLines.push({
                        Journal_ID: journalEntry.Journal_ID,
                        Account_ID: acc.Account_ID,
                        Line_Number: journalLineNumber++,
                        Debit_Amount: 0,
                        Credit_Amount: Math.abs(netCredit),
                        Description: `Close revenue account ${acc.Account_Name} to Retained Earnings`
                    });
                    totalCredit += Math.abs(netCredit);
                }
            } else if (acc.Type_ID === 5) { // Expense (Debit normal)
                const netDebit = totalDebitAmt - totalCreditAmt;
                if (netDebit > 0) {
                    closingLines.push({
                        Journal_ID: journalEntry.Journal_ID,
                        Account_ID: acc.Account_ID,
                        Line_Number: journalLineNumber++,
                        Debit_Amount: 0,
                        Credit_Amount: netDebit,
                        Description: `Close expense account ${acc.Account_Name} to Retained Earnings`
                    });
                    totalCredit += netDebit;
                } else if (netDebit < 0) {
                    closingLines.push({
                        Journal_ID: journalEntry.Journal_ID,
                        Account_ID: acc.Account_ID,
                        Line_Number: journalLineNumber++,
                        Debit_Amount: Math.abs(netDebit),
                        Credit_Amount: 0,
                        Description: `Close expense account ${acc.Account_Name} to Retained Earnings`
                    });
                    totalDebit += Math.abs(netDebit);
                }
            }
        });

        const netProfitLoss = totalDebit - totalCredit;
        if (netProfitLoss > 0) {
            closingLines.push({
                Journal_ID: journalEntry.Journal_ID,
                Account_ID: retainedEarningsAccount.Account_ID,
                Line_Number: journalLineNumber++,
                Debit_Amount: 0,
                Credit_Amount: netProfitLoss,
                Description: `Transfer net profit for period ${period.Period_Name} to Retained Earnings`
            });
            totalCredit += netProfitLoss;
        } else if (netProfitLoss < 0) {
            closingLines.push({
                Journal_ID: journalEntry.Journal_ID,
                Account_ID: retainedEarningsAccount.Account_ID,
                Line_Number: journalLineNumber++,
                Debit_Amount: Math.abs(netProfitLoss),
                Credit_Amount: 0,
                Description: `Transfer net loss for period ${period.Period_Name} to Retained Earnings`
            });
            totalDebit += Math.abs(netProfitLoss);
        }

        if (closingLines.length === 0) {
            await journalEntry.destroy({ transaction });
            console.log(`No non-zero balances to close for period ${period.Period_Name}.`);
            return;
        }

        await JournalEntryLine.bulkCreate(closingLines, { transaction });

        journalEntry.Total_Debit = totalDebit;
        journalEntry.Total_Credit = totalCredit;
        await journalEntry.save({ transaction });

        console.log(`✅ Created closing journal entry ${journalNumber} with ${closingLines.length} lines.`);
    }

    // Authenticate delete request and retrieve all transactions for the period
    async authenticateDelete(req, res) {
        try {
            const { id } = req.params;
            const { password } = req.body;

            if (!password) {
                return res.status(400).json({
                    success: false,
                    message: 'Admin password is required'
                });
            }

            const period = await FiscalPeriod.findByPk(id);
            if (!period) {
                return res.status(404).json({
                    success: false,
                    message: 'Period not found'
                });
            }

            if (period.Status === 'OPEN') {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot delete an OPEN fiscal period. You must close the period first.'
                });
            }

            // Find admin user
            const adminUser = await User.findOne({ where: { Username: 'admin' } });
            if (!adminUser) {
                return res.status(404).json({
                    success: false,
                    message: 'Admin user not found'
                });
            }

            // Compare password
            const isValid = await bcrypt.compare(password, adminUser.Password_Hash);
            if (!isValid) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid admin password'
                });
            }

            // Retrieve all journal entries in the period
            const entries = await JournalEntry.findAll({
                where: {
                    Entry_Date: {
                        [Op.between]: [period.Start_Date, period.End_Date]
                    },
                    Status: 'Posted'
                },
                include: [{
                    model: JournalEntryLine,
                    as: 'Lines',
                    include: [{
                        model: AccountChart,
                        as: 'Account',
                        attributes: ['Account_Name', 'Account_Code']
                    }]
                }],
                order: [['Entry_Date', 'ASC'], ['Journal_No', 'ASC']]
            });

            return res.status(200).json({
                success: true,
                message: 'Authentication successful',
                data: {
                    periodName: period.Period_Name,
                    startDate: period.Start_Date,
                    endDate: period.End_Date,
                    transactions: entries
                }
            });

        } catch (error) {
            console.error('Error authenticating period delete:', error);
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Delete a fiscal period
    async deletePeriod(req, res) {
        const transaction = await databaseCon.transaction();
        try {
            const { id } = req.params;
            const period = await FiscalPeriod.findByPk(id, { transaction });
            if (!period) {
                await transaction.rollback();
                return res.status(404).json({
                    success: false,
                    message: 'Period not found'
                });
            }

            if (period.Status === 'OPEN') {
                await transaction.rollback();
                return res.status(400).json({
                    success: false,
                    message: 'Cannot delete an OPEN fiscal period. You must close the period first.'
                });
            }

            // Delete closing journal entries associated with the deleted period, if any
            const existingClosing = await JournalEntry.findOne({
                where: {
                    Entry_Type: 'Closing',
                    Reference_Type: 'FiscalPeriod',
                    Reference_ID: period.Period_ID
                },
                transaction
            });
            if (existingClosing) {
                await JournalEntryLine.destroy({
                    where: { Journal_ID: existingClosing.Journal_ID },
                    transaction
                });
                await existingClosing.destroy({ transaction });
            }

            // Delete the period itself
            await period.destroy({ transaction });

            // Find the new latest CLOSED fiscal period to recalculate Balance_Brought_Forward
            const newLatestClosedPeriod = await FiscalPeriod.findOne({
                where: { Status: 'CLOSED' },
                order: [['End_Date', 'DESC']],
                transaction
            });

            if (newLatestClosedPeriod) {
                await this._calculateBalanceBroughtForward(newLatestClosedPeriod, transaction);
            } else {
                // If no closed periods remain, reset all Balance_Brought_Forward to 0.00
                await AccountChart.update(
                    { Balance_Brought_Forward: 0.00 },
                    { where: {}, transaction }
                );
            }

            await transaction.commit();
            return res.status(200).json({
                success: true,
                message: 'Fiscal period deleted successfully.'
            });
        } catch (error) {
            await transaction.rollback();
            console.error('Error deleting fiscal period:', error);
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = new FiscalPeriodController();

