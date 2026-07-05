/**
 * ════════════════════════════════════════════════════════════
 *  TEST CASE ID  : SERP/TC/007
 *  Title         : Posting a Balanced Journal Entry
 *  Created By    : Sahan Chamika (TG/2022/1383)
 *  Date Created  : 5th May 2026
 *  Date Tested   : 5th May 2026
 *  Test Result   : Pass
 *
 *  Description:
 *    Finance Manager successfully creates and posts a balanced
 *    journal entry in the system.
 *
 *  Prerequisites:
 *    1. User must be logged in with Admin or Finance Manager role.
 *    2. The current fiscal period must be active and open.
 *    3. Chart of Accounts must have active accounts set up.
 *
 *  Test Data:
 *    Journal Date  = 2026-05-05
 *    Description   = "Cash collection from credit customer"
 *    Line 1: Account 1001 - Cash in Hand,        Debit=5000, Credit=0
 *    Line 2: Account 1003 - Accounts Receivable, Debit=0,    Credit=5000
 * ════════════════════════════════════════════════════════════
 */

// ─── Mock all models BEFORE importing controller ────────────
jest.mock('../../models/finance/JournalEntry',     () => ({ findAndCountAll: jest.fn(), findOne: jest.fn(), create: jest.fn() }));
jest.mock('../../models/finance/JournalEntryLine', () => ({ bulkCreate: jest.fn() }));
jest.mock('../../models/finance/AccountChart',     () => ({ findOne: jest.fn(), update: jest.fn() }));
jest.mock('../../models/finance/FiscalPeriod',     () => ({ findOne: jest.fn() }));
jest.mock('../../config/db', () => ({
    transaction: jest.fn(),
    literal:     jest.fn((v) => v),
}));

const JournalEntry     = require('../../models/finance/JournalEntry');
const JournalEntryLine = require('../../models/finance/JournalEntryLine');
const AccountChart     = require('../../models/finance/AccountChart');
const FiscalPeriod     = require('../../models/finance/FiscalPeriod');
const sequelize        = require('../../config/db');
const controller       = require('../../controllers/Accounting&Finance/JournalEntryController');

// ─── Shared helpers ──────────────────────────────────────────
const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json   = jest.fn().mockReturnValue(res);
    return res;
};

const mockTransaction = {
    commit:   jest.fn().mockResolvedValue(true),
    rollback: jest.fn().mockResolvedValue(true),
};

// ─── Test data (from SERP/TC/007) ────────────────────────────
const validPayload = {
    Entry_Date:  '2026-05-05',
    Description: 'Cash collection from credit customer',
    lines: [
        { Account_ID: 1, Debit_Amount: 5000, Credit_Amount: 0,    Description: 'Cash in Hand' },
        { Account_ID: 3, Debit_Amount: 0,    Credit_Amount: 5000, Description: 'Accounts Receivable' },
    ],
};

const openFiscalPeriod = {
    Period_ID:  1,
    Period_Name: 'May 2026',
    Start_Date:  '2026-05-01',
    End_Date:    '2026-05-31',
    Status:      'OPEN',
};

const cashInHandAccount = {
    Account_ID:   1,
    Account_Code: '1001',
    Account_Name: 'Cash in Hand',
    Account_Type: 'Asset',
    Current_Balance: 10000,
};

const arAccount = {
    Account_ID:   3,
    Account_Code: '1003',
    Account_Name: 'Accounts Receivable',
    Account_Type: 'Asset',
    Current_Balance: 8000,
};

const createdEntry = {
    Journal_ID: 10,
    Journal_No: 'JE-20260505-001',
    Status:     'Posted',
};

// ─── Setup ───────────────────────────────────────────────────
beforeEach(() => {
    jest.clearAllMocks();
    sequelize.transaction.mockResolvedValue(mockTransaction);
});


// ════════════════════════════════════════════════════════════
//  TEST GROUP 1 — Steps 1 & 2: Journal Entries List Loads
//  TC Step #1 — "Navigate to Journal Entries → page displayed"
// ════════════════════════════════════════════════════════════
describe('SERP/TC/007 — Step 1: Journal Entries List Is Retrieved', () => {

    it('returns 200 with a list of journal entries', async () => {
        JournalEntry.findAndCountAll.mockResolvedValue({
            count: 1,
            rows:  [{ Journal_ID: 1, Journal_No: 'JE-001', Status: 'Posted' }],
        });
        const req = { query: { page: '1', limit: '10' } };
        const res = mockRes();

        await controller.getAllJournalEntries(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, total: 1 }));
    });

    it('returns empty list when no journal entries exist', async () => {
        JournalEntry.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });
        const req = { query: {} };
        const res = mockRes();

        await controller.getAllJournalEntries(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        const payload = res.json.mock.calls[0][0];
        expect(payload.data).toEqual([]);
        expect(payload.total).toBe(0);
    });

    it('returns 500 when database query fails', async () => {
        JournalEntry.findAndCountAll.mockRejectedValue(new Error('DB error'));
        const req = { query: {} };
        const res = mockRes();

        await controller.getAllJournalEntries(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
    });

    it('supports date-range filtering on the list', async () => {
        JournalEntry.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });
        const req = { query: { startDate: '2026-05-01', endDate: '2026-05-31' } };
        const res = mockRes();

        await controller.getAllJournalEntries(req, res);

        expect(JournalEntry.findAndCountAll).toHaveBeenCalledWith(
            expect.objectContaining({ where: expect.objectContaining({ Entry_Date: expect.any(Object) }) })
        );
    });

});


// ════════════════════════════════════════════════════════════
//  TEST GROUP 2 — Steps 3–6: Create Balanced Journal Entry
//  TC Step #3 — "Enter header details"
//  TC Step #4 — "Add Line 1: Cash in Hand, Debit 5000"
//  TC Step #5 — "Add Line 2: Accounts Receivable, Credit 5000"
//  TC Step #6 — "Click Post Entry → success notification"
// ════════════════════════════════════════════════════════════
describe('SERP/TC/007 — Steps 3–6: Balanced Journal Entry Is Posted Successfully', () => {

    const arrange = () => {
        FiscalPeriod.findOne.mockResolvedValue(openFiscalPeriod);
        JournalEntry.findOne.mockResolvedValue(null);   // no prior entry today
        JournalEntry.create.mockResolvedValue(createdEntry);
        JournalEntryLine.bulkCreate.mockResolvedValue([]);
        AccountChart.findOne
            .mockResolvedValueOnce(cashInHandAccount)
            .mockResolvedValueOnce(arAccount);
        AccountChart.update.mockResolvedValue([1]);
    };

    it('returns 201 with success message when a balanced entry is posted', async () => {
        arrange();
        const req = { body: validPayload };
        const res = mockRes();

        await controller.createJournalEntry(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ success: true, message: 'Journal entry created successfully' })
        );
    });

    it('response payload contains the generated journal number', async () => {
        arrange();
        const req = { body: validPayload };
        const res = mockRes();

        await controller.createJournalEntry(req, res);

        const payload = res.json.mock.calls[0][0];
        expect(payload.data.journalNo).toMatch(/^JE-\d{8}-\d{3}$/);
    });

    it('creates the journal entry record with Status "Posted"', async () => {
        arrange();
        const req = { body: validPayload };
        const res = mockRes();

        await controller.createJournalEntry(req, res);

        expect(JournalEntry.create).toHaveBeenCalledWith(
            expect.objectContaining({ Status: 'Posted', Entry_Date: '2026-05-05' }),
            expect.anything()
        );
    });

    it('stores the correct Total_Debit and Total_Credit on the entry', async () => {
        arrange();
        const req = { body: validPayload };
        const res = mockRes();

        await controller.createJournalEntry(req, res);

        expect(JournalEntry.create).toHaveBeenCalledWith(
            expect.objectContaining({ Total_Debit: 5000, Total_Credit: 5000 }),
            expect.anything()
        );
    });

    it('bulk-creates two journal entry lines', async () => {
        arrange();
        const req = { body: validPayload };
        const res = mockRes();

        await controller.createJournalEntry(req, res);

        const linesArg = JournalEntryLine.bulkCreate.mock.calls[0][0];
        expect(linesArg).toHaveLength(2);
    });

    it('Line 1 has Debit_Amount=5000 and Credit_Amount=0', async () => {
        arrange();
        const req = { body: validPayload };
        const res = mockRes();

        await controller.createJournalEntry(req, res);

        const linesArg = JournalEntryLine.bulkCreate.mock.calls[0][0];
        expect(linesArg[0]).toMatchObject({ Debit_Amount: 5000, Credit_Amount: 0 });
    });

    it('Line 2 has Debit_Amount=0 and Credit_Amount=5000', async () => {
        arrange();
        const req = { body: validPayload };
        const res = mockRes();

        await controller.createJournalEntry(req, res);

        const linesArg = JournalEntryLine.bulkCreate.mock.calls[0][0];
        expect(linesArg[1]).toMatchObject({ Debit_Amount: 0, Credit_Amount: 5000 });
    });

    it('commits the DB transaction on success', async () => {
        arrange();
        const req = { body: validPayload };
        const res = mockRes();

        await controller.createJournalEntry(req, res);

        expect(mockTransaction.commit).toHaveBeenCalled();
        expect(mockTransaction.rollback).not.toHaveBeenCalled();
    });

    it('stores the description "Cash collection from credit customer"', async () => {
        arrange();
        const req = { body: validPayload };
        const res = mockRes();

        await controller.createJournalEntry(req, res);

        expect(JournalEntry.create).toHaveBeenCalledWith(
            expect.objectContaining({ Description: 'Cash collection from credit customer' }),
            expect.anything()
        );
    });

});


// ════════════════════════════════════════════════════════════
//  TEST GROUP 3 — Step 7: Ledger Account Balances Updated
//  TC Step #7 — "Cash in Hand +5000, Accounts Receivable -5000"
// ════════════════════════════════════════════════════════════
describe('SERP/TC/007 — Step 7: Account Balances Updated After Posting', () => {

    it('calls AccountChart.update twice (once per line)', async () => {
        FiscalPeriod.findOne.mockResolvedValue(openFiscalPeriod);
        JournalEntry.findOne.mockResolvedValue(null);
        JournalEntry.create.mockResolvedValue(createdEntry);
        JournalEntryLine.bulkCreate.mockResolvedValue([]);
        AccountChart.findOne
            .mockResolvedValueOnce(cashInHandAccount)
            .mockResolvedValueOnce(arAccount);
        AccountChart.update.mockResolvedValue([1]);

        const req = { body: validPayload };
        const res = mockRes();

        await controller.createJournalEntry(req, res);

        expect(AccountChart.update).toHaveBeenCalledTimes(2);
    });

    it('increases Cash in Hand (Asset: debit increases balance)', async () => {
        FiscalPeriod.findOne.mockResolvedValue(openFiscalPeriod);
        JournalEntry.findOne.mockResolvedValue(null);
        JournalEntry.create.mockResolvedValue(createdEntry);
        JournalEntryLine.bulkCreate.mockResolvedValue([]);
        AccountChart.findOne
            .mockResolvedValueOnce(cashInHandAccount)
            .mockResolvedValueOnce(arAccount);
        AccountChart.update.mockResolvedValue([1]);

        const req = { body: validPayload };
        const res = mockRes();
        await controller.createJournalEntry(req, res);

        // First update call targets Cash in Hand (Account_ID: 1)
        // Asset: balanceChange = debit - credit = 5000 - 0 = +5000
        expect(AccountChart.update).toHaveBeenNthCalledWith(
            1,
            expect.objectContaining({ Current_Balance: expect.stringContaining('+') }),
            expect.objectContaining({ where: { Account_ID: 1 } })
        );
    });

    it('decreases Accounts Receivable (Asset: credit decreases balance)', async () => {
        FiscalPeriod.findOne.mockResolvedValue(openFiscalPeriod);
        JournalEntry.findOne.mockResolvedValue(null);
        JournalEntry.create.mockResolvedValue(createdEntry);
        JournalEntryLine.bulkCreate.mockResolvedValue([]);
        AccountChart.findOne
            .mockResolvedValueOnce(cashInHandAccount)
            .mockResolvedValueOnce(arAccount);
        AccountChart.update.mockResolvedValue([1]);

        const req = { body: validPayload };
        const res = mockRes();
        await controller.createJournalEntry(req, res);

        // Second update targets Accounts Receivable (Account_ID: 3)
        // Asset: balanceChange = 0 - 5000 = -5000
        expect(AccountChart.update).toHaveBeenNthCalledWith(
            2,
            expect.objectContaining({ Current_Balance: expect.stringContaining('-') }),
            expect.objectContaining({ where: { Account_ID: 3 } })
        );
    });

    it('returns 500 if an account is not found during balance update', async () => {
        FiscalPeriod.findOne.mockResolvedValue(openFiscalPeriod);
        JournalEntry.findOne.mockResolvedValue(null);
        JournalEntry.create.mockResolvedValue(createdEntry);
        JournalEntryLine.bulkCreate.mockResolvedValue([]);
        // First account found, second returns null → should trigger rollback
        AccountChart.findOne
            .mockResolvedValueOnce(cashInHandAccount)
            .mockResolvedValueOnce(null);

        const req = { body: validPayload };
        const res = mockRes();

        await controller.createJournalEntry(req, res);

        expect(mockTransaction.rollback).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(500);
    });

});


// ════════════════════════════════════════════════════════════
//  TEST GROUP 4 — Validation: Unbalanced Entry Rejected
// ════════════════════════════════════════════════════════════
describe('SERP/TC/007 — Validation: Unbalanced Entry Is Rejected', () => {

    it('returns 500 when Total Debit does not equal Total Credit', async () => {
        FiscalPeriod.findOne.mockResolvedValue(openFiscalPeriod);
        const unbalanced = {
            ...validPayload,
            lines: [
                { Account_ID: 1, Debit_Amount: 5000, Credit_Amount: 0 },
                { Account_ID: 3, Debit_Amount: 0,    Credit_Amount: 3000 }, // off by 2000
            ],
        };
        const req = { body: unbalanced };
        const res = mockRes();

        await controller.createJournalEntry(req, res);

        expect(mockTransaction.rollback).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ message: 'Total Debit must equal Total Credit' })
        );
    });

    it('returns 500 when fewer than 2 lines are provided', async () => {
        FiscalPeriod.findOne.mockResolvedValue(openFiscalPeriod);
        const singleLine = {
            ...validPayload,
            lines: [{ Account_ID: 1, Debit_Amount: 5000, Credit_Amount: 0 }],
        };
        const req = { body: singleLine };
        const res = mockRes();

        await controller.createJournalEntry(req, res);

        expect(mockTransaction.rollback).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(500);
    });

    it('returns 500 when Entry_Date is missing', async () => {
        const req = { body: { ...validPayload, Entry_Date: '' } };
        const res = mockRes();

        await controller.createJournalEntry(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ message: 'Invalid journal entry data provided' })
        );
    });

    it('returns 500 when Description is missing', async () => {
        const req = { body: { ...validPayload, Description: '' } };
        const res = mockRes();

        await controller.createJournalEntry(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ message: 'Invalid journal entry data provided' })
        );
    });

    it('returns 500 when lines array is empty', async () => {
        const req = { body: { ...validPayload, lines: [] } };
        const res = mockRes();

        await controller.createJournalEntry(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ message: 'Invalid journal entry data provided' })
        );
    });

});


// ════════════════════════════════════════════════════════════
//  TEST GROUP 5 — Validation: Fiscal Period Checks
// ════════════════════════════════════════════════════════════
describe('SERP/TC/007 — Validation: Fiscal Period Must Be Open', () => {

    it('returns 500 when no open fiscal period covers the entry date', async () => {
        FiscalPeriod.findOne.mockResolvedValue(null); // no matching OPEN period
        const req = { body: validPayload };
        const res = mockRes();

        await controller.createJournalEntry(req, res);

        expect(mockTransaction.rollback).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ message: 'Entry date must be within an open fiscal period' })
        );
    });

    it('queries for a fiscal period with Status OPEN covering the entry date', async () => {
        FiscalPeriod.findOne.mockResolvedValue(null);
        const req = { body: validPayload };
        const res = mockRes();

        await controller.createJournalEntry(req, res);

        expect(FiscalPeriod.findOne).toHaveBeenCalledWith(
            expect.objectContaining({
                where: expect.objectContaining({ Status: 'OPEN' }),
            })
        );
    });

});

// ════════════════════════════════════════════════════════════
//  TEST GROUP 6 — Journal Number Generation
// ════════════════════════════════════════════════════════════
describe('SERP/TC/007 — Journal Number Generation', () => {

    it('generates JE-YYYYMMDD-001 when no prior entries exist today', async () => {
        FiscalPeriod.findOne.mockResolvedValue(openFiscalPeriod);
        JournalEntry.findOne.mockResolvedValue(null); // no prior entry
        JournalEntry.create.mockResolvedValue(createdEntry);
        JournalEntryLine.bulkCreate.mockResolvedValue([]);
        AccountChart.findOne
            .mockResolvedValueOnce(cashInHandAccount)
            .mockResolvedValueOnce(arAccount);
        AccountChart.update.mockResolvedValue([1]);

        const req = { body: validPayload };
        const res = mockRes();

        await controller.createJournalEntry(req, res);

        const createCall = JournalEntry.create.mock.calls[0][0];
        expect(createCall.Journal_No).toMatch(/^JE-\d{8}-001$/);
    });

    it('increments journal number when a prior entry already exists today', async () => {
        FiscalPeriod.findOne.mockResolvedValue(openFiscalPeriod);
        const today = new Date();
        const pad2  = (n) => String(n).padStart(2, '0');
        const dateStr = `${today.getFullYear()}${pad2(today.getMonth()+1)}${pad2(today.getDate())}`;
        JournalEntry.findOne.mockResolvedValue({ Journal_No: `JE-${dateStr}-003` });
        JournalEntry.create.mockResolvedValue(createdEntry);
        JournalEntryLine.bulkCreate.mockResolvedValue([]);
        AccountChart.findOne
            .mockResolvedValueOnce(cashInHandAccount)
            .mockResolvedValueOnce(arAccount);
        AccountChart.update.mockResolvedValue([1]);

        const req = { body: validPayload };
        const res = mockRes();

        await controller.createJournalEntry(req, res);

        const createCall = JournalEntry.create.mock.calls[0][0];
        expect(createCall.Journal_No).toMatch(/^JE-\d{8}-004$/);
    });

});

// ════════════════════════════════════════════════════════════
//  TEST GROUP 7 — Get Journal Entry Details
// ════════════════════════════════════════════════════════════
describe('SERP/TC/007 — Get Journal Entry Details', () => {

    it('returns 200 with full entry details including lines', async () => {
        JournalEntry.findOne.mockResolvedValue({
            Journal_ID: 10,
            Journal_No: 'JE-20260505-001',
            Description: 'Cash collection from credit customer',
            Total_Debit: 5000,
            Total_Credit: 5000,
            Status: 'Posted',
            Lines: [
                { Account_ID: 1, Debit_Amount: 5000, Credit_Amount: 0 },
                { Account_ID: 3, Debit_Amount: 0,    Credit_Amount: 5000 },
            ],
        });
        const req = { params: { id: '10' } };
        const res = mockRes();

        await controller.getJournalEntryDetails(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    it('returns 404 when the journal entry does not exist', async () => {
        JournalEntry.findOne.mockResolvedValue(null);
        const req = { params: { id: '9999' } };
        const res = mockRes();

        await controller.getJournalEntryDetails(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ success: false, message: 'Journal entry not found' })
        );
    });

    it('returns 500 when database throws during detail fetch', async () => {
        JournalEntry.findOne.mockRejectedValue(new Error('DB error'));
        const req = { params: { id: '10' } };
        const res = mockRes();

        await controller.getJournalEntryDetails(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });

});

// ════════════════════════════════════════════════════════════
//  TEST GROUP 8 — Server / DB Error Handling
// ════════════════════════════════════════════════════════════
describe('SERP/TC/007 — Server Error Handling', () => {

    it('rolls back transaction and returns 500 when JournalEntry.create throws', async () => {
        FiscalPeriod.findOne.mockResolvedValue(openFiscalPeriod);
        JournalEntry.findOne.mockResolvedValue(null);
        JournalEntry.create.mockRejectedValue(new Error('Constraint error'));

        const req = { body: validPayload };
        const res = mockRes();

        await controller.createJournalEntry(req, res);

        expect(mockTransaction.rollback).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(500);
    });

    it('rolls back transaction and returns 500 when bulkCreate throws', async () => {
        FiscalPeriod.findOne.mockResolvedValue(openFiscalPeriod);
        JournalEntry.findOne.mockResolvedValue(null);
        JournalEntry.create.mockResolvedValue(createdEntry);
        JournalEntryLine.bulkCreate.mockRejectedValue(new Error('Insert error'));

        const req = { body: validPayload };
        const res = mockRes();

        await controller.createJournalEntry(req, res);

        expect(mockTransaction.rollback).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(500);
    });

});
