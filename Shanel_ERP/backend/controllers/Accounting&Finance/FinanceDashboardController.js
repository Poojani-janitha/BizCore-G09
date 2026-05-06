const { Sequelize, Op } = require('sequelize');
const Income = require('../../models/finance/Income');
const Expense = require('../../models/finance/Expense');
const AccountChart = require('../../models/finance/AccountChart');

class FinanceDashboardController {
    async getDashboardStats(req, res) {
        try {
            const now = new Date();
            const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

            // 1. Current Month Summaries
            const [currentIncome, lastIncome, currentExpense, lastExpense] = await Promise.all([
                Income.sum('Amount', { where: { Income_Date: { [Op.gte]: currentMonthStart } } }),
                Income.sum('Amount', { where: { Income_Date: { [Op.between]: [lastMonthStart, lastMonthEnd] } } }),
                Expense.sum('Amount', { where: { Expense_Date: { [Op.gte]: currentMonthStart } } }),
                Expense.sum('Amount', { where: { Expense_Date: { [Op.between]: [lastMonthStart, lastMonthEnd] } } })
            ]);

            const received = parseFloat(currentIncome) || 0;
            const prevReceived = parseFloat(lastIncome) || 0;
            const paid = parseFloat(currentExpense) || 0;
            const prevPaid = parseFloat(lastExpense) || 0;

            const receivedChange = prevReceived === 0 ? 100 : ((received - prevReceived) / prevReceived) * 100;
            const paidChange = prevPaid === 0 ? 100 : ((paid - prevPaid) / prevPaid) * 100;

            // 2. Cash Flow Chart Data (Last 6 months)
            const cashFlow = [];
            for (let i = 5; i >= 0; i--) {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const monthName = d.toLocaleString('default', { month: 'short' });
                const start = new Date(d.getFullYear(), d.getMonth(), 1);
                const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);

                const [inc, exp] = await Promise.all([
                    Income.sum('Amount', { where: { Income_Date: { [Op.between]: [start, end] } } }),
                    Expense.sum('Amount', { where: { Expense_Date: { [Op.between]: [start, end] } } })
                ]);

                cashFlow.push({
                    month: monthName,
                    income: parseFloat(inc) || 0,
                    expense: parseFloat(exp) || 0
                });
            }

            // 3. Distribution Data
            const incomeDist = await Income.findAll({
                attributes: [
                    'Income_Category',
                    [Sequelize.fn('SUM', Sequelize.col('Amount')), 'total']
                ],
                group: ['Income_Category'],
                order: [[Sequelize.literal('total'), 'DESC']],
                limit: 5
            });

            const expenseDist = await Expense.findAll({
                attributes: [
                    'Expense_Category',
                    [Sequelize.fn('SUM', Sequelize.col('Amount')), 'total']
                ],
                group: ['Expense_Category'],
                order: [[Sequelize.literal('total'), 'DESC']],
                limit: 5
            });

            res.status(200).json({
                success: true,
                summary: {
                    received: { amount: received, percentage: receivedChange.toFixed(1) },
                    paid: { amount: paid, percentage: paidChange.toFixed(1) },
                    net: { amount: received - paid, percentage: (receivedChange - paidChange).toFixed(1) }
                },
                cashFlow,
                distribution: {
                    income: incomeDist.map(d => ({ name: d.Income_Category, value: parseFloat(d.get('total')) })),
                    expense: expenseDist.map(d => ({ name: d.Expense_Category, value: parseFloat(d.get('total')) }))
                }
            });

        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = new FinanceDashboardController();
