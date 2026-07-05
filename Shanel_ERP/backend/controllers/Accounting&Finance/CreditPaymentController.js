const { Sequelize, Op } = require('sequelize');
const sequelize = require('../../config/db');
const Income = require('../../models/finance/Income');
const JournalEntry = require('../../models/finance/JournalEntry');
const JournalEntryLine = require('../../models/finance/JournalEntryLine');
const AccountChart = require('../../models/finance/AccountChart');
const Customer = require('../../models/customer/customer');
const CreditTransaction = require('../../models/customer/CreditTranscation');
const Payment = require('../../models/sales/Payment');
const PaymentAllocation = require('../../models/sales/PaymentAllocation');
const Cheque = require('../../models/sales/Cheque');
const Sale = require('../../models/sales/Sales');
const { ACCOUNTS } = require('../../constants/Accounting/AccConstants');

// Helper: Get today's date in local timezone as YYYY-MM-DD
function getLocalDateString() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

class CreditPaymentController {

    // ─── RECEIVE CREDIT PAYMENT ───────────────────────────────────────────────
    async receiveCreditPayment(req, res) {
        const transaction = await sequelize.transaction();

        try {
            const {
                customerId,
                amount,
                paymentMethod,
                paymentDate,
                notes,
                // Bank Deposit fields
                bankName,
                depositSlipNo,
                depositedBy,
                depositDate,
                // Cheque fields
                chequeNo,
                chequeBank,
                chequeDate
            } = req.body;

            // ── Validate required fields ──
            if (!customerId || !amount || !paymentMethod) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields: customerId, amount, paymentMethod'
                });
            }

            const paymentAmount = parseFloat(amount);
            if (isNaN(paymentAmount) || paymentAmount <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Amount must be a positive number'
                });
            }

            // ── Validate customer exists ──
            const customer = await Customer.findByPk(customerId, { transaction });
            if (!customer) {
                return res.status(404).json({
                    success: false,
                    message: 'Customer not found'
                });
            }

            const currentBalance = parseFloat(customer.Current_Balance) || 0;
            if (currentBalance <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'This customer has no outstanding credit balance'
                });
            }

            if (paymentAmount > currentBalance) {
                return res.status(400).json({
                    success: false,
                    message: `Payment amount (${paymentAmount}) exceeds outstanding balance (${currentBalance})`
                });
            }

            // ── FIFO Allocation ──
            // 1. Get all Credit_Taken transactions for this customer
            const creditTaken = await CreditTransaction.findAll({
                where: {
                    Customer_ID: customerId,
                    Transaction_Type: 'Credit_Taken'
                },
                order: [['Transaction_Date', 'ASC'], ['Credit_Trans_ID', 'ASC']],
                transaction
            });

            // 2. Get all Credit_Paid transactions to calculate remaining amounts
            const creditPaid = await CreditTransaction.findAll({
                where: {
                    Customer_ID: customerId,
                    Transaction_Type: 'Credit_Paid'
                },
                transaction
            });

            // Calculate paid amounts per invoice Reference_No
            const paidByInvoice = {};
            creditPaid.forEach(payment => {
                const ref = payment.Reference_No;
                if (ref) {
                    paidByInvoice[ref] = (paidByInvoice[ref] || 0) + parseFloat(payment.Amount);
                }
            });

            // Filter outstanding ones
            const outstandingInvoices = creditTaken
                .map(ct => {
                    const totalAmount = parseFloat(ct.Amount);
                    const paidAmount = paidByInvoice[ct.Reference_No] || 0;
                    const remainingAmount = totalAmount - paidAmount;

                    return {
                        creditTransId: ct.Credit_Trans_ID,
                        referenceNo: ct.Reference_No,
                        totalAmount: totalAmount,
                        paidAmount: paidAmount,
                        remainingAmount: remainingAmount,
                        transactionDate: ct.Transaction_Date,
                        notes: ct.Notes,
                        Sale_ID: ct.Sale_ID,
                        record: ct
                    };
                })
                .filter(invoice => invoice.remainingAmount > 0);

            if (outstandingInvoices.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No outstanding bills found matching this customer credit'
                });
            }

            let remainingPaymentAmount = paymentAmount;
            let tempCustomerBalance = currentBalance;
            const allocatedRecords = [];
            let firstPaymentId = null;

            // Loop through outstanding invoices and allocate
            for (const invoice of outstandingInvoices) {
                if (remainingPaymentAmount <= 0) break;

                const allocateAmount = Math.min(remainingPaymentAmount, invoice.remainingAmount);
                tempCustomerBalance -= allocateAmount;

                // Create the Payment record in payment table
                const uniqueReceiptNo = `RCPT-CR-${invoice.Sale_ID || 'GEN'}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
                const paymentRecord = await Payment.create({
                    Sale_ID: invoice.Sale_ID || 0,
                    Payment_Date: paymentDate || getLocalDateString(),
                    Payment_Time: new Date().toTimeString().split(' ')[0],
                    Receipt_No: uniqueReceiptNo,
                    Status: 'Active',
                    Payment_Amount: allocateAmount,
                    Payment_Method: paymentMethod,
                    Invoice_Total: invoice.totalAmount,
                    Cash_Amount: paymentMethod === 'Cash' ? allocateAmount : null,
                    Cash_Tendered: paymentMethod === 'Cash' ? allocateAmount : null,
                    Cash_Change: paymentMethod === 'Cash' ? 0 : null,
                    // If cheque
                    Cheque_No: paymentMethod === 'Cheque' ? chequeNo : null,
                    Cheque_Date: paymentMethod === 'Cheque' ? chequeDate : null,
                    Cheque_Bank: paymentMethod === 'Cheque' ? chequeBank : null,
                    Cheque_Amount: paymentMethod === 'Cheque' ? allocateAmount : null,
                    Cheque_Status: paymentMethod === 'Cheque' ? 'Pending' : null,
                    // If bank transfer
                    Bank_Name: paymentMethod === 'Bank_Deposit' ? bankName : null,
                    Bank_Ref: paymentMethod === 'Bank_Deposit' ? depositSlipNo : null,
                    Bank_Transfer_Amount: paymentMethod === 'Bank_Deposit' ? allocateAmount : null,
                    Notes: notes || `FIFO Credit payment for ${invoice.referenceNo}`
                }, { transaction });

                if (!firstPaymentId) {
                    firstPaymentId = paymentRecord.Pay_ID;
                }

                // Create PaymentAllocation record
                await PaymentAllocation.create({
                    Pay_ID: paymentRecord.Pay_ID,
                    Sale_ID: invoice.Sale_ID || 0,
                    Allocated_Amount: allocateAmount,
                    Allocation_Type: 'FIFO'
                }, { transaction });

                // Update corresponding Sale record if applicable
                if (invoice.Sale_ID && invoice.Sale_ID > 0) {
                    const sale = await Sale.findByPk(invoice.Sale_ID, { transaction });
                    if (sale) {
                        const newPaidAmount = parseFloat(sale.Paid_Amount || 0) + allocateAmount;
                        const newBalanceDue = Math.max(0, parseFloat(sale.Total_Amount || 0) - newPaidAmount);
                        let newPaymentStatus = 'Paid';
                        if (newBalanceDue > 0) {
                            newPaymentStatus = newPaidAmount > 0 ? 'Partially_Paid' : 'Unpaid';
                        }
                        
                        await sale.update({
                            Paid_Amount: newPaidAmount,
                            Balance_Due: newBalanceDue,
                            Payment_Status: newPaymentStatus
                        }, { transaction });
                    }
                }

                // Build detailed notes with payment method info
                let detailedNotes = notes || `Credit payment received for invoice ${invoice.referenceNo}`;
                if (paymentMethod === 'Bank_Deposit' && bankName) {
                    detailedNotes += ` | Bank: ${bankName}, Slip: ${depositSlipNo || 'N/A'}, Date: ${depositDate || 'N/A'}`;
                } else if (paymentMethod === 'Cheque' && chequeNo) {
                    detailedNotes += ` | Cheque: ${chequeNo}, Bank: ${chequeBank || 'N/A'}, Date: ${chequeDate || 'N/A'}`;
                }

                // Create Credit_Paid record in credit_transactions
                const creditPaidRecord = await CreditTransaction.create({
                    Customer_ID: customerId,
                    Sale_ID: invoice.Sale_ID || null,
                    Pay_ID: paymentRecord.Pay_ID,
                    Transaction_Date: paymentDate || getLocalDateString(),
                    Transaction_Type: 'Credit_Paid',
                    Amount: allocateAmount,
                    Running_Balance: tempCustomerBalance,
                    Reference_No: invoice.referenceNo,
                    Notes: detailedNotes,
                    Created_By: null
                }, { transaction });

                allocatedRecords.push({
                    invoiceNo: invoice.referenceNo,
                    allocated: allocateAmount,
                    transId: creditPaidRecord.Credit_Trans_ID
                });

                remainingPaymentAmount -= allocateAmount;
            }

            // If the payment method is Cheque, create the single Cheque entity record
            if (paymentMethod === 'Cheque' && chequeNo && firstPaymentId) {
                await Cheque.create({
                    Pay_ID: firstPaymentId,
                    C_ID: customerId,
                    Cheque_No: chequeNo,
                    Bank: chequeBank || 'N/A',
                    Branch: 'N/A',
                    Cheque_Date: chequeDate || (paymentDate || getLocalDateString()),
                    Amount: paymentAmount,
                    Cheque_Status: 'Pending',
                    Notes: `FIFO Credit payment cheque for ${allocatedRecords.map(r => r.invoiceNo).join(', ')}`
                }, { transaction });
            }

            // ── Update customer's Current_Balance ──
            const newBalance = currentBalance - paymentAmount;
            await Customer.update(
                { Current_Balance: newBalance },
                { where: { C_ID: customerId }, transaction }
            );

            // ── Get accounting accounts for double-entry ──
            // DEBIT account: Cash/Bank/Cheque (based on payment method)
            const debitAccount = await this.getDebitAccount(paymentMethod, transaction);

            // CREDIT account: Accounts Receivable (1003)
            const arAccount = await AccountChart.findOne({
                where: { Account_Code: ACCOUNTS.ACCOUNTS_RECEIVABLE },
                transaction
            });

            if (!arAccount) {
                throw new Error(
                    `Accounts Receivable account (${ACCOUNTS.ACCOUNTS_RECEIVABLE}) not found. Please create it in the Chart of Accounts.`
                );
            }

            // Build list of allocated invoice numbers for reporting description
            const allocatedRefs = allocatedRecords.map(r => r.invoiceNo).join(', ');

            let finalNotes = notes || `Credit payment received for invoices: ${allocatedRefs}`;
            if (paymentMethod === 'Bank_Deposit' && bankName) {
                finalNotes += ` | Bank: ${bankName}, Slip: ${depositSlipNo || 'N/A'}`;
            } else if (paymentMethod === 'Cheque' && chequeNo) {
                finalNotes += ` | Cheque: ${chequeNo}, Bank: ${chequeBank || 'N/A'}`;
            }

            // ── Create Income record ──
            const income = await Income.create({
                Income_Date: paymentDate || getLocalDateString(),
                Income_Category: 'Sales',
                Amount: paymentAmount,
                Source: customer.C_Name,
                Description: finalNotes,
                Receipt_No: allocatedRefs.substring(0, 100),
                Account_ID: arAccount.Account_ID,
                Created_By: null,
                Created_At: new Date()
            }, { transaction });

            // ── Create Journal Entry (double-entry) ──
            const journalResult = await this.createCreditPaymentJournalEntry(
                income,
                customer,
                debitAccount,
                arAccount,
                paymentAmount,
                paymentMethod,
                allocatedRefs,
                transaction
            );

            await transaction.commit();

            return res.status(201).json({
                success: true,
                message: `Credit payment of Rs. ${paymentAmount.toFixed(2)} received and allocated via FIFO successfully`,
                data: {
                    allocations: allocatedRecords,
                    income: {
                        id: income.Income_ID,
                        amount: paymentAmount,
                        source: customer.C_Name
                    },
                    journal: journalResult
                }
            });

        } catch (error) {
            await transaction.rollback();
            console.error('Error receiving credit payment:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'An error occurred while processing the credit payment'
            });
        }
    }


    // ─── GET CUSTOMER CREDIT INFO ─────────────────────────────────────────────
    async getCustomerCreditInfo(req, res) {
        try {
            const { id } = req.params;

            const customer = await Customer.findByPk(id, {
                attributes: [
                    'C_ID', 'Customer_Code', 'C_Name', 'Phone1',
                    'Credit_Allowed', 'Credit_Limit', 'Current_Balance'
                ]
            });

            if (!customer) {
                return res.status(404).json({
                    success: false,
                    message: 'Customer not found'
                });
            }

            // Get recent credit transactions
            const recentTransactions = await CreditTransaction.findAll({
                where: { Customer_ID: id },
                order: [['Created_At', 'DESC']],
                limit: 20
            });

            return res.status(200).json({
                success: true,
                data: {
                    customer: {
                        id: customer.C_ID,
                        code: customer.Customer_Code,
                        name: customer.C_Name,
                        phone: customer.Phone1,
                        creditAllowed: customer.Credit_Allowed,
                        creditLimit: parseFloat(customer.Credit_Limit) || 0,
                        currentBalance: parseFloat(customer.Current_Balance) || 0
                    },
                    transactions: recentTransactions
                }
            });

        } catch (error) {
            console.error('Error fetching customer credit info:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Error fetching customer credit info'
            });
        }
    }


    // ─── GET OUTSTANDING INVOICES FOR A CUSTOMER ──────────────────────────────
    async getOutstandingInvoices(req, res) {
        try {
            const { customerId } = req.params;

            // Get all Credit_Taken transactions for this customer
            const creditTaken = await CreditTransaction.findAll({
                where: {
                    Customer_ID: customerId,
                    Transaction_Type: 'Credit_Taken'
                },
                attributes: ['Credit_Trans_ID', 'Reference_No', 'Amount', 'Transaction_Date', 'Running_Balance', 'Notes'],
                order: [['Transaction_Date', 'DESC']]
            });

            // Get all Credit_Paid transactions to calculate remaining amounts
            const creditPaid = await CreditTransaction.findAll({
                where: {
                    Customer_ID: customerId,
                    Transaction_Type: 'Credit_Paid'
                },
                attributes: ['Reference_No', 'Amount']
            });

            // Calculate paid amounts per invoice
            const paidByInvoice = {};
            creditPaid.forEach(payment => {
                const ref = payment.Reference_No;
                paidByInvoice[ref] = (paidByInvoice[ref] || 0) + parseFloat(payment.Amount);
            });

            // Build outstanding invoices list
            const outstandingInvoices = creditTaken
                .map(ct => {
                    const totalAmount = parseFloat(ct.Amount);
                    const paidAmount = paidByInvoice[ct.Reference_No] || 0;
                    const remainingAmount = totalAmount - paidAmount;

                    return {
                        creditTransId: ct.Credit_Trans_ID,
                        referenceNo: ct.Reference_No,
                        totalAmount: totalAmount,
                        paidAmount: paidAmount,
                        remainingAmount: remainingAmount,
                        transactionDate: ct.Transaction_Date,
                        notes: ct.Notes
                    };
                })
                .filter(invoice => invoice.remainingAmount > 0); // Only show unpaid/partially paid

            return res.status(200).json({
                success: true,
                data: outstandingInvoices
            });

        } catch (error) {
            console.error('Error fetching outstanding invoices:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Error fetching outstanding invoices'
            });
        }
    }


    // ─── HELPER: Create double-entry journal for credit payment ──────────────
    async createCreditPaymentJournalEntry(income, customer, debitAccount, creditAccount, amount, paymentMethod, referenceNo, transaction) {
        const journalNumber = await this.generateJournalNumber('CRP-JE');

        // Map payment method to a readable label
        const paymentMethodLabel = paymentMethod === 'Bank_Deposit' ? 'Bank Deposit' : paymentMethod;

        const description = `Credit payment received from ${customer.C_Name} - Invoice ${referenceNo} - ${paymentMethodLabel}`;

        const journalEntry = await JournalEntry.create({
            Journal_No: journalNumber,
            Entry_Date: income.Income_Date,
            Entry_Type: 'Auto',
            Reference_Type: 'CreditPayment',
            Reference_ID: income.Income_ID,
            Description: description,
            Total_Debit: amount,
            Total_Credit: amount,
            Status: 'Posted',
            Posted_By: null,
            Posted_Date: getLocalDateString(),
            Created_By: null
        }, { transaction });

        // Double-entry journal lines
        const journalLines = [
            {
                // DEBIT: Cash/Bank/Cheque — money received
                Journal_ID: journalEntry.Journal_ID,
                Account_ID: debitAccount.Account_ID,
                Line_Number: 1,
                Debit_Amount: amount,
                Credit_Amount: 0,
                Description: `${paymentMethodLabel} received from ${customer.C_Name} for invoice ${referenceNo}${
                    income.Description.includes('|') ? ` (${income.Description.split('|').slice(1).join('|').trim()})` : ''
                }`
            },
            {
                // CREDIT: Accounts Receivable — debt cleared
                Journal_ID: journalEntry.Journal_ID,
                Account_ID: creditAccount.Account_ID,
                Line_Number: 2,
                Debit_Amount: 0,
                Credit_Amount: amount,
                Description: `Accounts Receivable cleared for invoice ${referenceNo}`
            }
        ];

        await JournalEntryLine.bulkCreate(journalLines, { transaction });

        // Update account balances
        for (const line of journalLines) {
            await this.updateAccountBalance(
                line.Account_ID,
                line.Debit_Amount,
                line.Credit_Amount,
                transaction
            );
        }

        return {
            journalId: journalEntry.Journal_ID,
            journalNo: journalNumber,
            totalDebit: parseFloat(amount.toFixed(2)),
            totalCredit: parseFloat(amount.toFixed(2)),
            lines: journalLines.map(line => ({
                account: line.Account_ID,
                debit: parseFloat(parseFloat(line.Debit_Amount).toFixed(2)),
                credit: parseFloat(parseFloat(line.Credit_Amount).toFixed(2)),
                description: line.Description
            }))
        };
    }


    // ─── HELPER: Get debit account based on payment method ───────────────────
    async getDebitAccount(paymentMethod, transaction) {
        const debitAccountMap = {
            Cash: ACCOUNTS.CASH_IN_HAND,
            Bank_Deposit: ACCOUNTS.BANK_ACCOUNT_BOC,
            Cheque: ACCOUNTS.CHEQUES_IN_HAND
        };

        const accountCode = debitAccountMap[paymentMethod];
        if (!accountCode) {
            throw new Error(`Unsupported payment method: ${paymentMethod}`);
        }

        const account = await AccountChart.findOne({
            where: { Account_Code: accountCode },
            transaction
        });

        if (!account) {
            throw new Error(
                `Account code ${accountCode} not found for payment method ${paymentMethod}. Please create it in the Chart of Accounts.`
            );
        }

        return account;
    }


    // ─── HELPER: Update account balance ──────────────────────────────────────
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
            default:
                balanceChange = 0;
        }

        await AccountChart.update(
            {
                Current_Balance: Sequelize.literal(`Current_Balance + ${balanceChange}`)
            },
            {
                where: { Account_ID: accountId },
                transaction
            }
        );
    }


    // ─── HELPER: Generate journal number ─────────────────────────────────────
    async generateJournalNumber(prefix) {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const date = String(today.getDate()).padStart(2, '0');
        const datePrefix = `${prefix}-${year}${month}${date}`;

        const lastEntry = await JournalEntry.findOne({
            where: {
                Journal_No: {
                    [Op.like]: `${datePrefix}-%`
                }
            },
            order: [['Journal_ID', 'DESC']],
            attributes: ['Journal_No']
        });

        if (!lastEntry) {
            return `${datePrefix}-001`;
        }

        const lastNumber = parseInt(lastEntry.Journal_No.split('-').pop(), 10);
        const nextNumber = String(lastNumber + 1).padStart(3, '0');
        return `${datePrefix}-${nextNumber}`;
    }
}

module.exports = CreditPaymentController;
