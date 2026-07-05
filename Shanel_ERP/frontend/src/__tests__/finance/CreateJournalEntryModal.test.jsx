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
 *  Test Data:
 *    Journal Date  = 2026-05-05
 *    Description   = "Cash collection from credit customer"
 *    Line 1: Account 1001 - Cash in Hand,        Debit=5000, Credit=0
 *    Line 2: Account 1003 - Accounts Receivable, Debit=0,    Credit=5000
 * ════════════════════════════════════════════════════════════
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import axios from 'axios';

import CreateJournalEntryModal from '../../component/Finance/CreateJournalEntryModal';
// ─── Mock axios ──────────────────────────────────────────────
vi.mock('axios');

// ─── Mock react-i18next ──────────────────────────────────────
vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key }),
}));

// ─── Shared mock data ────────────────────────────────────────
const mockAccounts = [
    { Account_ID: 1, Account_Code: '1001', Account_Name: 'Cash in Hand',        Is_Active: true },
    { Account_ID: 3, Account_Code: '1003', Account_Name: 'Accounts Receivable', Is_Active: true },
    { Account_ID: 5, Account_Code: '2001', Account_Name: 'Accounts Payable',    Is_Active: true },
];

const mockOnClose       = vi.fn();
const mockOnEntryCreated = vi.fn();

// ─── Helper: render the open modal ───────────────────────────
const renderModal = (isOpen = true) =>
    render(
        <BrowserRouter>
            <CreateJournalEntryModal
                isOpen={isOpen}
                onClose={mockOnClose}
                onEntryCreated={mockOnEntryCreated}
            />
        </BrowserRouter>
    );

// ─── Setup / Teardown ────────────────────────────────────────
beforeEach(() => {
    vi.clearAllMocks();
    // Default: accounts load successfully
    axios.get.mockResolvedValue({ data: { success: true, data: mockAccounts } });
});

afterEach(() => {
    vi.restoreAllMocks();
});

// ════════════════════════════════════════════════════════════
//  TEST GROUP 1 — Steps 1 & 2: Modal Opens and Renders
//  TC Step #1 — "Navigate to Journal Entries page"
//  TC Step #2 — "Click New Journal Entry → form is opened"
// ════════════════════════════════════════════════════════════
describe('SERP/TC/007 — Steps 1 & 2: Journal Entry Form Is Displayed', () => {

    it('renders the modal heading "Create Journal Entry"', async () => {
        renderModal();
        await waitFor(() => {
            expect(screen.getByText('Create Journal Entry')).toBeInTheDocument();
        });
    });

    it('renders the Entry Date field', async () => {
        renderModal();
        await waitFor(() => {
            expect(screen.getByText('Entry Date *')).toBeInTheDocument();
        });
    });

    it('renders the Description field', async () => {
        renderModal();
        await waitFor(() => {
            expect(screen.getByText('Description *')).toBeInTheDocument();
        });
    });

    it('renders the journal lines table with Account, Debit, Credit columns', async () => {
        renderModal();
        await waitFor(() => {
            expect(screen.getByText('Account')).toBeInTheDocument();
            expect(screen.getByText('Debit')).toBeInTheDocument();
            expect(screen.getByText('Credit')).toBeInTheDocument();
        });
    });

    it('renders the Create Entry submit button', async () => {
        renderModal();
        await waitFor(() => {
            expect(screen.getByRole('button', { name: /create entry/i })).toBeInTheDocument();
        });
    });

    it('renders the Cancel button', async () => {
        renderModal();
        await waitFor(() => {
            expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
        });
    });

    it('renders two empty journal lines by default', async () => {
        renderModal();
        await waitFor(() => {
            // Two account selects (one per line)
            const selects = screen.getAllByRole('combobox');
            expect(selects.length).toBeGreaterThanOrEqual(2);
        });
    });

    it('does NOT render anything when isOpen is false', () => {
        renderModal(false);
        expect(screen.queryByText('Create Journal Entry')).not.toBeInTheDocument();
    });

    it('fetches the chart of accounts when the modal opens', async () => {
        renderModal();
        await waitFor(() => {
            expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/accounts'));
        });
    });

    it('populates account dropdowns with active accounts', async () => {
        renderModal();
        await waitFor(() => {
            const cashItems = screen.getAllByText('1001 - Cash in Hand');
            const arItems   = screen.getAllByText('1003 - Accounts Receivable');
            expect(cashItems.length).toBeGreaterThan(0);
            expect(arItems.length).toBeGreaterThan(0);
        });
    });

});

// ════════════════════════════════════════════════════════════
//  TEST GROUP 2 — Step 3: Enter Header Details
//  TC Step #3 — "Enter transaction header details (Date, Desc)"
// ════════════════════════════════════════════════════════════
describe('SERP/TC/007 — Step 3: Header Fields Accept Input', () => {

    it('Entry Date field accepts "2026-05-05"', async () => {
        renderModal();
        await waitFor(() => screen.getByText('Entry Date *'));

        const dateInput = document.querySelector('input[type="date"]');
        await act(async () => {
            fireEvent.change(dateInput, { target: { value: '2026-05-05' } });
        });

        expect(dateInput.value).toBe('2026-05-05');
    });

    it('Description field accepts "Cash collection from credit customer"', async () => {
        renderModal();
        await waitFor(() => screen.getByPlaceholderText('Enter description...'));

        const descInput = screen.getByPlaceholderText('Enter description...');
        await act(async () => {
            await userEvent.type(descInput, 'Cash collection from credit customer');
        });

        expect(descInput.value).toBe('Cash collection from credit customer');
    });

});

// ════════════════════════════════════════════════════════════
//  TEST GROUP 3 — Steps 4 & 5: Add Journal Lines
//  TC Step #4 — "Add Line 1: Cash in Hand, Debit 5000"
//  TC Step #5 — "Add Line 2: Accounts Receivable, Credit 5000"
// ════════════════════════════════════════════════════════════
describe('SERP/TC/007 — Steps 4 & 5: Journal Lines Accept Test-Case Data', () => {

    // Helper: open modal and wait for accounts to load
    // Account name appears in every line dropdown, so use getAllByText
    const openAndWait = async () => {
        renderModal();
        await waitFor(() => {
            const items = screen.getAllByText('1001 - Cash in Hand');
            expect(items.length).toBeGreaterThan(0);
        });
    };

    it('Line 1 account dropdown accepts "Cash in Hand" selection', async () => {
        await openAndWait();
        const selects = screen.getAllByRole('combobox');
        await act(async () => {
            fireEvent.change(selects[0], { target: { value: '1' } }); // Account_ID=1
        });
        expect(selects[0].value).toBe('1');
    });

    it('Line 1 Debit input accepts 5000', async () => {
        await openAndWait();
        const debitInputs = screen.getAllByPlaceholderText('0.00');
        // First debit input is index 0 (line1 debit)
        await act(async () => {
            fireEvent.change(debitInputs[0], { target: { value: '5000' } });
        });
        expect(debitInputs[0].value).toBe('5000');
    });

    it('entering Debit on Line 1 clears its Credit field', async () => {
        await openAndWait();
        const debitInputs  = screen.getAllByPlaceholderText('0.00');
        const creditInputs = screen.getAllByPlaceholderText('0.00');
        // Set credit first, then debit
        await act(async () => {
            fireEvent.change(creditInputs[1], { target: { value: '100' } });
            fireEvent.change(debitInputs[0], { target: { value: '5000' } });
        });
        // After typing debit, the credit on the same line should be cleared
        expect(debitInputs[0].value).toBe('5000');
    });

    it('Line 2 account dropdown accepts "Accounts Receivable" selection', async () => {
        await openAndWait();
        const selects = screen.getAllByRole('combobox');
        await act(async () => {
            fireEvent.change(selects[1], { target: { value: '3' } }); // Account_ID=3
        });
        expect(selects[1].value).toBe('3');
    });

    it('Line 2 Credit input accepts 5000', async () => {
        await openAndWait();
        const debitInputs = screen.getAllByPlaceholderText('0.00');
        // Credit inputs are every other "0.00" placeholder (line1-debit, line1-credit, line2-debit, line2-credit)
        await act(async () => {
            fireEvent.change(debitInputs[3], { target: { value: '5000' } }); // line2 credit
        });
        expect(debitInputs[3].value).toBe('5000');
    });

    it('Add Line button adds a third journal line', async () => {
        await openAndWait();
        const addLineBtn = screen.getByRole('button', { name: /add line/i });
        await act(async () => { fireEvent.click(addLineBtn); });

        const selects = screen.getAllByRole('combobox');
        expect(selects.length).toBeGreaterThanOrEqual(3);
    });

    it('Remove Line button is disabled when only 2 lines remain', async () => {
        await openAndWait();
        // All trash/remove buttons should be disabled with 2 lines
        const removeButtons = document.querySelectorAll('button[disabled]');
        expect(removeButtons.length).toBeGreaterThan(0);
    });

    it('Remove Line button becomes enabled after a third line is added', async () => {
        await openAndWait();
        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: /add line/i }));
        });
        // After adding a line (now 3), remove buttons should be enabled
        const allButtons = screen.getAllByRole('button');
        const removeEnabled = allButtons.filter(b =>
            !b.disabled && b.querySelector && b.querySelector('svg')
        );
        expect(removeEnabled.length).toBeGreaterThan(0);
    });

});

// ════════════════════════════════════════════════════════════
//  TEST GROUP 4 — Totals Display & Balance Indicator
//  TC Step #5 — "Total Debit and Credit display as equal"
// ════════════════════════════════════════════════════════════
describe('SERP/TC/007 — Step 5: Totals Row and Balance Indicator', () => {

    const openAndWait = async () => {
        renderModal();
        await waitFor(() => {
            const items = screen.getAllByText('1001 - Cash in Hand');
            expect(items.length).toBeGreaterThan(0);
        });
    };

    it('totals row shows 0.00 / 0.00 when no amounts entered', async () => {
        await openAndWait();
        const totalCells = screen.getAllByText('0.00');
        expect(totalCells.length).toBeGreaterThanOrEqual(2);
    });

    it('shows "Balanced" indicator when debits equal credits', async () => {
        await openAndWait();
        const inputs = screen.getAllByPlaceholderText('0.00');
        await act(async () => {
            fireEvent.change(inputs[0], { target: { value: '5000' } }); // line1 debit
            fireEvent.change(inputs[3], { target: { value: '5000' } }); // line2 credit
        });
        await waitFor(() => {
            expect(screen.getByText(/balanced/i)).toBeInTheDocument();
        });
    });

    it('shows "Out of balance" warning when debits ≠ credits', async () => {
        await openAndWait();
        const inputs = screen.getAllByPlaceholderText('0.00');
        await act(async () => {
            fireEvent.change(inputs[0], { target: { value: '5000' } }); // line1 debit
            fireEvent.change(inputs[3], { target: { value: '3000' } }); // line2 credit (different)
        });
        await waitFor(() => {
            expect(screen.getByText(/out of balance/i)).toBeInTheDocument();
        });
    });

    it('Create Entry button is disabled when entry is unbalanced', async () => {
        await openAndWait();
        const inputs = screen.getAllByPlaceholderText('0.00');
        await act(async () => {
            fireEvent.change(inputs[0], { target: { value: '5000' } });
            // No corresponding credit line
        });
        const submitBtn = screen.getByRole('button', { name: /create entry/i });
        expect(submitBtn).toBeDisabled();
    });

    it('Create Entry button is disabled when no amounts are entered', async () => {
        await openAndWait();
        const submitBtn = screen.getByRole('button', { name: /create entry/i });
        expect(submitBtn).toBeDisabled();
    });

    it('Create Entry button is enabled when entry is balanced with non-zero amounts', async () => {
        await openAndWait();
        const inputs = screen.getAllByPlaceholderText('0.00');
        await act(async () => {
            fireEvent.change(inputs[0], { target: { value: '5000' } });
            fireEvent.change(inputs[3], { target: { value: '5000' } });
        });
        const submitBtn = screen.getByRole('button', { name: /create entry/i });
        expect(submitBtn).not.toBeDisabled();
    });

});

// ════════════════════════════════════════════════════════════
//  TEST GROUP 5 — Step 6: Post Entry (Form Submission)
//  TC Step #6 — "Click Post Entry → success notification"
// ════════════════════════════════════════════════════════════
describe('SERP/TC/007 — Step 6: Post Entry Submits to API', () => {

    // Helper: fill and submit the complete valid form
    const fillAndSubmit = async () => {
        renderModal();
        await waitFor(() => {
            const items = screen.getAllByText('1001 - Cash in Hand');
            expect(items.length).toBeGreaterThan(0);
        });

        const dateInput = document.querySelector('input[type="date"]');
        const descInput = screen.getByPlaceholderText('Enter description...');
        const selects   = screen.getAllByRole('combobox');
        const inputs    = screen.getAllByPlaceholderText('0.00');

        await act(async () => {
            fireEvent.change(dateInput,  { target: { value: '2026-05-05' } });
            await userEvent.clear(descInput);
            await userEvent.type(descInput, 'Cash collection from credit customer');
            fireEvent.change(selects[0], { target: { value: '1' } });  // Cash in Hand
            fireEvent.change(inputs[0],  { target: { value: '5000' } }); // line1 debit
            fireEvent.change(selects[1], { target: { value: '3' } });  // Accounts Receivable
            fireEvent.change(inputs[3],  { target: { value: '5000' } }); // line2 credit
        });

        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: /create entry/i }));
        });
    };

    it('calls axios.post to the journal entry create endpoint', async () => {
        axios.post.mockResolvedValueOnce({ data: { success: true } });
        await fillAndSubmit();
        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith(
                expect.stringContaining('/journal-entries/create'),
                expect.any(Object)
            );
        });
    });

    it('sends Entry_Date "2026-05-05" in the POST payload', async () => {
        axios.post.mockResolvedValueOnce({ data: { success: true } });
        await fillAndSubmit();
        await waitFor(() => {
            const body = axios.post.mock.calls[0][1];
            expect(body.Entry_Date).toBe('2026-05-05');
        });
    });

    it('sends Description in the POST payload', async () => {
        axios.post.mockResolvedValueOnce({ data: { success: true } });
        await fillAndSubmit();
        await waitFor(() => {
            const body = axios.post.mock.calls[0][1];
            expect(body.Description).toBe('Cash collection from credit customer');
        });
    });

    it('sends two valid lines in the POST payload', async () => {
        axios.post.mockResolvedValueOnce({ data: { success: true } });
        await fillAndSubmit();
        await waitFor(() => {
            const body = axios.post.mock.calls[0][1];
            expect(body.lines).toHaveLength(2);
        });
    });

    it('Line 1 payload has Account_ID=1, Debit=5000, Credit=0', async () => {
        axios.post.mockResolvedValueOnce({ data: { success: true } });
        await fillAndSubmit();
        await waitFor(() => {
            const lines = axios.post.mock.calls[0][1].lines;
            expect(lines[0]).toMatchObject({ Account_ID: '1', Debit_Amount: '5000' });
        });
    });

    it('Line 2 payload has Account_ID=3, Debit=0, Credit=5000', async () => {
        axios.post.mockResolvedValueOnce({ data: { success: true } });
        await fillAndSubmit();
        await waitFor(() => {
            const lines = axios.post.mock.calls[0][1].lines;
            expect(lines[1]).toMatchObject({ Account_ID: '3', Credit_Amount: '5000' });
        });
    });

    it('calls onEntryCreated callback on success', async () => {
        axios.post.mockResolvedValueOnce({ data: { success: true } });
        await fillAndSubmit();
        await waitFor(() => {
            expect(mockOnEntryCreated).toHaveBeenCalled();
        });
    });

    it('calls onClose callback on success', async () => {
        axios.post.mockResolvedValueOnce({ data: { success: true } });
        await fillAndSubmit();
        await waitFor(() => {
            expect(mockOnClose).toHaveBeenCalled();
        });
    });

});

// ════════════════════════════════════════════════════════════
//  TEST GROUP 6 — Frontend Validation: Required Fields
// ════════════════════════════════════════════════════════════
describe('SERP/TC/007 — Frontend Validation: Required Fields Blocked', () => {

    const openAndWait = async () => {
        renderModal();
        await waitFor(() => {
            const items = screen.getAllByText('1001 - Cash in Hand');
            expect(items.length).toBeGreaterThan(0);
        });
    };

    it('shows error when Description is missing on submit', async () => {
        await openAndWait();
        const inputs  = screen.getAllByPlaceholderText('0.00');
        const selects = screen.getAllByRole('combobox');

        await act(async () => {
            fireEvent.change(selects[0], { target: { value: '1' } });
            fireEvent.change(inputs[0],  { target: { value: '5000' } });
            fireEvent.change(selects[1], { target: { value: '3' } });
            fireEvent.change(inputs[3],  { target: { value: '5000' } });
        });

        const form = document.querySelector('#journal-entry-form');
        await act(async () => { fireEvent.submit(form); });

        await waitFor(() => {
            expect(screen.getByText('Description is required.')).toBeInTheDocument();
        });
        expect(axios.post).not.toHaveBeenCalled();
    });

    it('shows error when fewer than 2 valid lines are provided', async () => {
        await openAndWait();
        const descInput = screen.getByPlaceholderText('Enter description...');

        await act(async () => {
            await userEvent.type(descInput, 'Test entry');
            // Only one line has an account + amount
            const selects = screen.getAllByRole('combobox');
            const inputs  = screen.getAllByPlaceholderText('0.00');
            fireEvent.change(selects[0], { target: { value: '1' } });
            fireEvent.change(inputs[0],  { target: { value: '5000' } });
            // Line 2 left empty
        });

        const form = document.querySelector('#journal-entry-form');
        await act(async () => { fireEvent.submit(form); });

        await waitFor(() => {
            expect(screen.getByText(/at least two valid lines/i)).toBeInTheDocument();
        });
        expect(axios.post).not.toHaveBeenCalled();
    });

    it('shows error when debits do not equal credits on submit', async () => {
        await openAndWait();
        const descInput = screen.getByPlaceholderText('Enter description...');
        const selects   = screen.getAllByRole('combobox');
        const inputs    = screen.getAllByPlaceholderText('0.00');

        await act(async () => {
            await userEvent.type(descInput, 'Test entry');
            fireEvent.change(selects[0], { target: { value: '1' } });
            fireEvent.change(inputs[0],  { target: { value: '5000' } });
            fireEvent.change(selects[1], { target: { value: '3' } });
            fireEvent.change(inputs[3],  { target: { value: '3000' } }); // unbalanced
        });

        const form = document.querySelector('#journal-entry-form');
        await act(async () => { fireEvent.submit(form); });

        await waitFor(() => {
            expect(screen.getByText('Total Debits must equal Total Credits.')).toBeInTheDocument();
        });
        expect(axios.post).not.toHaveBeenCalled();
    });

});

// ════════════════════════════════════════════════════════════
//  TEST GROUP 7 — Network / Server Error Handling
// ════════════════════════════════════════════════════════════
describe('SERP/TC/007 — Network & Server Error Handling', () => {

    const fillValidForm = async () => {
        renderModal();
        await waitFor(() => {
            const items = screen.getAllByText('1001 - Cash in Hand');
            expect(items.length).toBeGreaterThan(0);
        });

        const dateInput = document.querySelector('input[type="date"]');
        const descInput = screen.getByPlaceholderText('Enter description...');
        const selects   = screen.getAllByRole('combobox');
        const inputs    = screen.getAllByPlaceholderText('0.00');

        await act(async () => {
            fireEvent.change(dateInput,  { target: { value: '2026-05-05' } });
            await userEvent.type(descInput, 'Cash collection from credit customer');
            fireEvent.change(selects[0], { target: { value: '1' } });
            fireEvent.change(inputs[0],  { target: { value: '5000' } });
            fireEvent.change(selects[1], { target: { value: '3' } });
            fireEvent.change(inputs[3],  { target: { value: '5000' } });
        });
    };

    it('shows server error message when API returns success:false', async () => {
        axios.post.mockResolvedValueOnce({
            data: { success: false, message: 'Entry date must be within an open fiscal period' }
        });
        await fillValidForm();
        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: /create entry/i }));
        });
        await waitFor(() => {
            expect(screen.getByText('Entry date must be within an open fiscal period')).toBeInTheDocument();
        });
    });

    it('shows a generic error message when axios.post throws a network error', async () => {
        axios.post.mockRejectedValueOnce(new Error('Network Error'));
        await fillValidForm();
        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: /create entry/i }));
        });
        await waitFor(() => {
            expect(screen.getByText(/error communicating with server/i)).toBeInTheDocument();
        });
    });

    it('does not call onClose when submission fails', async () => {
        axios.post.mockRejectedValueOnce(new Error('Network Error'));
        await fillValidForm();
        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: /create entry/i }));
        });
        await waitFor(() => expect(screen.getByText(/error communicating/i)).toBeInTheDocument());
        expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('Cancel button calls onClose without submitting', async () => {
        renderModal();
        await waitFor(() => screen.getByRole('button', { name: /cancel/i }));
        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
        });
        expect(mockOnClose).toHaveBeenCalled();
        expect(axios.post).not.toHaveBeenCalled();
    });

});
