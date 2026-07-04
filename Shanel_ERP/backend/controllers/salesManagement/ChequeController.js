const sequelize = require('../../config/db');
const { Op } = require('sequelize');
const { Cheque, Customer, Payment, Sale, PaymentAllocation } = require('../../models/index');

// Expiry threshold: cheques pending for more than this many days are considered Expiring Soon
const EXPIRY_THRESHOLD_DAYS = 5;

/**
 * getAllCheques()
 * GET /api/sales-management/cheques
 * Returns cheques filtered by status tab
 * Query: status = Pending | Cleared | Bounced | Expired | all
 */
const getAllCheques = async (req, res) => {
    try {
        const { status = 'all', page = 1, limit = 20, query } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        const where = {};
        if (status !== 'all') {
            where.Cheque_Status = status;
        }

        if (query && query.trim()) {
            where[Op.or] = [
                { Cheque_No: { [Op.like]: `%${query.trim()}%` } },
                { '$Customer.C_Name$': { [Op.like]: `%${query.trim()}%` } }
            ];
        }

        const { count, rows } = await Cheque.findAndCountAll({
            where,
            include: [
                {
                    model: Customer,
                    as: 'Customer',
                    attributes: ['C_ID', 'C_Name', 'Customer_Code', 'Phone1']
                },
                {
                    model: Payment,
                    as: 'Payment',
                    attributes: ['Pay_ID', 'Receipt_No', 'Payment_Date'],
                    include: [
                        {
                            model: PaymentAllocation,
                            as: 'Allocations',
                            attributes: ['Alloc_ID', 'Sale_ID', 'Allocated_Amount'],
                            include: [
                                {
                                    model: Sale,
                                    as: 'Sale',
                                    attributes: ['Sale_Id', 'Invoice_No', 'Total_Amount']
                                }
                            ]
                        }
                    ]
                }
            ],
            order: [['Cheque_Date', 'ASC']],
            limit: parseInt(limit),
            offset,
            subQuery: false
        });

        // Enrich with "expiring soon" flag
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const expirySoon = new Date(today);
        expirySoon.setDate(expirySoon.getDate() + EXPIRY_THRESHOLD_DAYS);

        const enriched = rows.map(ch => {
            const c = ch.toJSON();
            const chequeDate = new Date(c.Cheque_Date);
            c.isExpiringSoon = c.Cheque_Status === 'Pending' && chequeDate <= expirySoon && chequeDate >= today;
            c.isPastDue = c.Cheque_Status === 'Pending' && chequeDate < today;
            return c;
        });

        return res.status(200).json({
            success: true,
            data: enriched,
            pagination: {
                total: count,
                page: parseInt(page),
                pages: Math.ceil(count / parseInt(limit)),
                limit: parseInt(limit)
            },
            message: 'Cheques fetched successfully'
        });

    } catch (error) {
        console.error('❌ Error fetching cheques:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch cheques', error: error.message });
    }
};

/**
 * getChequesSummary()
 * GET /api/sales-management/cheques/summary
 * Returns counts/amounts for dashboard tiles
 */
const getChequesSummary = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const expirySoon = new Date(today);
        expirySoon.setDate(expirySoon.getDate() + EXPIRY_THRESHOLD_DAYS);

        // Expiry threshold: 180 days ago
        const expiredThreshold = new Date(today);
        expiredThreshold.setDate(expiredThreshold.getDate() - 180);

        const [pendingAll, cleared, bounced] = await Promise.all([
            Cheque.findAll({
                where: { Cheque_Status: 'Pending' },
                attributes: ['Cheque_ID', 'Amount', 'Cheque_Date'],
                raw: true
            }),
            Cheque.findAll({
                where: { Cheque_Status: 'Cleared' },
                attributes: ['Cheque_ID', 'Amount'],
                raw: true
            }),
            Cheque.findAll({
                where: { Cheque_Status: 'Bounced' },
                attributes: ['Cheque_ID', 'Amount'],
                raw: true
            })
        ]);

        const expiredCount = pendingAll.filter(c => new Date(c.Cheque_Date) < expiredThreshold).length;
        const expiredTotal = pendingAll.filter(c => new Date(c.Cheque_Date) < expiredThreshold).reduce((s, c) => s + parseFloat(c.Amount || 0), 0);

        const activePendingCount = pendingAll.filter(c => new Date(c.Cheque_Date) >= expiredThreshold).length;
        const activePendingTotal = pendingAll.filter(c => new Date(c.Cheque_Date) >= expiredThreshold).reduce((s, c) => s + parseFloat(c.Amount || 0), 0);

        const expiringSoonCheques = pendingAll.filter(c => {
            const chequeDate = new Date(c.Cheque_Date);
            return chequeDate >= today && chequeDate <= expirySoon;
        });

        return res.status(200).json({
            success: true,
            data: {
                pending: {
                    count: activePendingCount,
                    total: activePendingTotal
                },
                cleared: {
                    count: cleared.length,
                    total: cleared.reduce((s, c) => s + parseFloat(c.Amount || 0), 0)
                },
                expiringSoon: {
                    count: expiringSoonCheques.length,
                    total: expiringSoonCheques.reduce((s, c) => s + parseFloat(c.Amount || 0), 0)
                },
                bounced: {
                    count: bounced.length,
                    total: bounced.reduce((s, c) => s + parseFloat(c.Amount || 0), 0)
                },
                expired: {
                    count: expiredCount,
                    total: expiredTotal
                }
            },
            message: 'Cheque summary fetched successfully'
        });

    } catch (error) {
        console.error('❌ Error fetching cheque summary:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch cheque summary', error: error.message });
    }
};

/**
 * clearCheque()
 * POST /api/sales-management/cheques/:id/clear
 * Marks a cheque as Cleared (Pending → Cleared)
 * This is the point it becomes real bank balance.
 * No change to customer balance or invoice status — those were settled on receipt.
 */
const clearCheque = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { id } = req.params;
        const { userId } = req.body;

        const cheque = await Cheque.findByPk(id, { transaction: t });
        if (!cheque) {
            await t.rollback();
            return res.status(404).json({ success: false, message: 'Cheque not found' });
        }
        if (cheque.Cheque_Status !== 'Pending') {
            await t.rollback();
            return res.status(400).json({
                success: false,
                message: `Cannot clear a cheque with status "${cheque.Cheque_Status}". Only Pending cheques can be cleared.`
            });
        }

        await cheque.update({
            Cheque_Status: 'Cleared',
            Cleared_Date: new Date(),
            Cleared_By: userId || null
        }, { transaction: t });

        await t.commit();

        console.log(`✅ Cheque #${cheque.Cheque_No} cleared by user ${userId}`);

        return res.status(200).json({
            success: true,
            message: `Cheque ${cheque.Cheque_No} cleared successfully`,
            data: cheque
        });

    } catch (error) {
        await t.rollback();
        console.error('❌ Error clearing cheque:', error);
        return res.status(500).json({ success: false, message: 'Failed to clear cheque', error: error.message });
    }
};

/**
 * bounceCheque()
 * POST /api/sales-management/cheques/:id/bounce
 * Records a cheque bounce. Per spec:
 *   - Cheque_Status → Bounced
 *   - Re-opens exactly the invoice(s) this cheque was allocated to (via Payment_Allocation)
 *     → restores Balance_Due, re-opens Payment_Status to Partially_Paid/Unpaid
 *   - Increases customer.Current_Balance by the cheque amount
 *   - Logs audit trail
 */
const bounceCheque = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { id } = req.params;
        const { reason, userId } = req.body;

        if (!reason || reason.trim() === '') {
            await t.rollback();
            return res.status(400).json({ success: false, message: 'Bounce reason is required' });
        }

        const cheque = await Cheque.findByPk(id, {
            transaction: t,
            include: [
                {
                    model: Payment,
                    as: 'Payment',
                    include: [
                        {
                            model: PaymentAllocation,
                            as: 'Allocations',
                            include: [{ model: Sale, as: 'Sale' }]
                        }
                    ]
                }
            ]
        });

        if (!cheque) {
            await t.rollback();
            return res.status(404).json({ success: false, message: 'Cheque not found' });
        }
        if (cheque.Cheque_Status === 'Bounced') {
            await t.rollback();
            return res.status(400).json({ success: false, message: 'Cheque is already bounced' });
        }

        // Mark cheque as bounced
        await cheque.update({
            Cheque_Status: 'Bounced',
            Bounced_Date: new Date(),
            Bounced_By: userId || null,
            Bounced_Reason: reason.trim()
        }, { transaction: t });

        // Re-open affected invoices via Payment_Allocation
        const allocations = cheque.Payment?.Allocations || [];
        let totalToRestore = 0;

        for (const alloc of allocations) {
            const allocAmt = parseFloat(alloc.Allocated_Amount) || 0;
            totalToRestore += allocAmt;

            if (alloc.Sale) {
                const sale = alloc.Sale;
                const newBalanceDue = Math.min(
                    parseFloat(sale.Total_Amount),
                    parseFloat(sale.Balance_Due) + allocAmt
                );
                const newPaidAmount = Math.max(0, parseFloat(sale.Total_Amount) - newBalanceDue);

                let newPaymentStatus = 'Unpaid';
                if (newPaidAmount > 0 && newBalanceDue > 0) {
                    newPaymentStatus = 'Partially_Paid';
                } else if (newBalanceDue <= 0) {
                    newPaymentStatus = 'Paid';
                }

                await Sale.update(
                    {
                        Balance_Due: newBalanceDue,
                        Paid_Amount: newPaidAmount,
                        Payment_Status: newPaymentStatus
                    },
                    { where: { Sale_Id: sale.Sale_Id }, transaction: t }
                );
            }
        }

        // If no allocations found, use cheque amount directly to restore customer balance
        const amountToRestore = allocations.length > 0 ? totalToRestore : parseFloat(cheque.Amount);

        // Increase customer balance
        if (cheque.C_ID && amountToRestore > 0) {
            await Customer.increment('Current_Balance', {
                by: amountToRestore,
                where: { C_ID: cheque.C_ID },
                transaction: t
            });
        }

        await t.commit();

        console.log(`✅ Cheque #${cheque.Cheque_No} bounced. Restored balance: Rs.${amountToRestore}`);

        return res.status(200).json({
            success: true,
            message: `Cheque ${cheque.Cheque_No} marked as bounced. Customer balance restored by Rs.${amountToRestore}.`,
            data: {
                chequeId: id,
                chequeNo: cheque.Cheque_No,
                amountRestored: amountToRestore,
                invoicesReopened: allocations.length
            }
        });

    } catch (error) {
        await t.rollback();
        console.error('❌ Error bouncing cheque:', error);
        return res.status(500).json({ success: false, message: 'Failed to bounce cheque', error: error.message });
    }
};

module.exports = { getAllCheques, getChequesSummary, clearCheque, bounceCheque };
