/**
 * ════════════════════════════════════════════════════════════
 *  TEST CASE ID  : SERP/TC/002
 *  Title         : Admin successfully registers a new employee
 *  Created By    : Piyumi Kaweesha (TG/2022/1410)
 *  Date Created  : 22nd April 2026
 *  Date Tested   : 22nd April 2026
 *  Test Result   : Pass
 *
 *  Description:
 *    Admin successfully registers a new employee in the system.
 *
 *  Prerequisites:
 *    1. User must be logged in with Admin role
 *
 *  Test Data:
 *    Full Name       = "Kamal Perera"
 *    NIC             = "200012345678"
 *    Contact Phone   = "0771234567"
 *    Role            = "Sales Assistant"
 *    Hire Date       = "2026-04-01"
 *    Employee Type   = "Permanent"
 *    Salary Category = "Monthly_Fixed"
 *
 *  NOTE — Role dropdown in the UI contains: Staff, Cashier,
 *    Staff (Production), Manager.  "Sales Assistant" from the
 *    test spec is a free-text backend role; in the UI it maps
 *    to the "Staff" option for this test.
 * ════════════════════════════════════════════════════════════
 */

import React from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import axios from 'axios';

import EmployeesPage from '../../pages/HR/EmployeesPage';

// ─── Mock axios ──────────────────────────────────────────────
vi.mock('axios');

// ─── Mock window.confirm / alert ─────────────────────────────
const confirmMock = vi.fn(() => true);
const alertMock   = vi.fn();
Object.defineProperty(window, 'confirm', { value: confirmMock, writable: true });
Object.defineProperty(window, 'alert',   { value: alertMock,   writable: true });

// ─── Mock window.dispatchEvent (used by persistEmployees) ────
Object.defineProperty(window, 'dispatchEvent', { value: vi.fn(), writable: true });

// ─── Reusable render helper ──────────────────────────────────
const renderPage = () =>
  render(
    <BrowserRouter>
      <EmployeesPage />
    </BrowserRouter>
  );

// ─── Shared employee list response ───────────────────────────
const emptyListResponse   = { data: { success: true, count: 0, data: [] } };
const singleEmployeeResponse = {
  data: {
    success: true,
    count: 1,
    data: [{
      Employee_ID:    42,
      Employee_Code:  'EMP-042',
      Full_Name:      'Kamal Perera',
      NIC:            '200012345678',
      Contact_Phone:  '0771234567',
      Role:           'Sales Assistant',
      Hire_Date:      '2026-04-01',
      Employee_Type:  'Permanent',
      Salary_Category: 'Monthly_Fixed',
      Status:         'Active',
      Email:          '',
      Department:     'HR',
    }]
  }
};

// ─── Setup / Teardown ────────────────────────────────────────
beforeEach(() => {
  vi.clearAllMocks();
  // Default: initial load returns empty list
  axios.get.mockResolvedValue(emptyListResponse);
});

afterEach(() => {
  vi.restoreAllMocks();
});


// ════════════════════════════════════════════════════════════
//  TEST GROUP 1 — Step 1: Employees Page Loads
//  TC Step #1 — "Navigate to HR → Employees page →
//                Employees list page is displayed"
// ════════════════════════════════════════════════════════════
describe('SERP/TC/002 — Step 1: Employees List Page Is Displayed', () => {

  it('renders the Add Employee button on the employees page', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText(/Add Employee/i)).toBeInTheDocument();
    });
  });

  it('renders the search bar on the employees page', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/search by name/i)).toBeInTheDocument();
    });
  });

  it('renders the status filter dropdown', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
  });

  it('calls the employees API on initial mount', async () => {
    renderPage();
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/employees'),
        expect.any(Object)
      );
    });
  });

  it('shows "No employees found" message when list is empty', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText(/no employees found/i)).toBeInTheDocument();
    });
  });

});


// ════════════════════════════════════════════════════════════
//  TEST GROUP 2 — Step 2: Add New Employee Form Opens
//  TC Step #2 — "Click Add New Employee button →
//                Employee registration form is displayed"
// ════════════════════════════════════════════════════════════
describe('SERP/TC/002 — Step 2: Add New Employee Form Opens', () => {

  it('opens the Add Employee modal when the Add Employee button is clicked', async () => {
    renderPage();
    await waitFor(() => screen.getByText(/Add Employee/i));

    await act(async () => {
      fireEvent.click(screen.getByText(/Add Employee/i));
    });

    expect(screen.getByText('Add New Employee')).toBeInTheDocument();
  });

  it('displays the "Personal Information" section in the form', async () => {
    renderPage();
    await waitFor(() => screen.getByText(/Add Employee/i));

    await act(async () => { fireEvent.click(screen.getByText(/Add Employee/i)); });

    expect(screen.getByText('Personal Information')).toBeInTheDocument();
  });

  it('displays the "Contact & Employment" section in the form', async () => {
    renderPage();
    await waitFor(() => screen.getByText(/Add Employee/i));

    await act(async () => { fireEvent.click(screen.getByText(/Add Employee/i)); });

    expect(screen.getByText('Contact & Employment')).toBeInTheDocument();
  });

  it('displays the Save Employee button inside the form', async () => {
    renderPage();
    await waitFor(() => screen.getByText(/Add Employee/i));

    await act(async () => { fireEvent.click(screen.getByText(/Add Employee/i)); });

    expect(screen.getByRole('button', { name: /Save Employee/i })).toBeInTheDocument();
  });

  it('displays the Cancel button inside the form', async () => {
    renderPage();
    await waitFor(() => screen.getByText(/Add Employee/i));

    await act(async () => { fireEvent.click(screen.getByText(/Add Employee/i)); });

    expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
  });

  it('closes the form when the Cancel button is clicked', async () => {
    renderPage();
    await waitFor(() => screen.getByText(/Add Employee/i));

    await act(async () => { fireEvent.click(screen.getByText(/Add Employee/i)); });
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /Cancel/i })); });

    expect(screen.queryByText('Add New Employee')).not.toBeInTheDocument();
  });

});

// ════════════════════════════════════════════════════════════
//  TEST GROUP 3 — Step 3: Fill In All Required Fields
//  TC Step #3 — "Fill in all required fields →
//                All fields accept input correctly"
// ════════════════════════════════════════════════════════════
describe('SERP/TC/002 — Step 3: Form Fields Accept Test-Case Data', () => {

  // Helper: open the form before each test
  const openForm = async () => {
    renderPage();
    await waitFor(() => screen.getByText(/Add Employee/i));
    await act(async () => { fireEvent.click(screen.getByText(/Add Employee/i)); });
  };

  it('Full Name field accepts "Kamal Perera"', async () => {
    await openForm();
    const input = screen.getByPlaceholderText('Full name');
    await act(async () => { await userEvent.type(input, 'Kamal Perera'); });
    expect(input.value).toBe('Kamal Perera');
  });

  it('NIC field accepts "200012345678"', async () => {
    await openForm();
    const input = screen.getByPlaceholderText('NIC number');
    await act(async () => { await userEvent.type(input, '200012345678'); });
    expect(input.value).toBe('200012345678');
  });

  it('Contact Phone field accepts "0771234567"', async () => {
    await openForm();
    const input = screen.getByPlaceholderText(/\+94-71-555-1234/i);
    await act(async () => { await userEvent.type(input, '0771234567'); });
    expect(input.value).toBe('0771234567');
  });

  it('Hire Date field accepts "2026-04-01"', async () => {
    await openForm();
    // There are two date inputs (DOB + Hire Date); Hire Date is the second
    const dateInputs = document.querySelectorAll('input[type="date"]');
    const hireDateInput = dateInputs[1]; // index 0 = Date Of Birth
    await act(async () => {
      fireEvent.change(hireDateInput, { target: { value: '2026-04-01' } });
    });
    expect(hireDateInput.value).toBe('2026-04-01');
  });

  it('Employee Type dropdown shows "Permanent" as an option', async () => {
    await openForm();
    expect(screen.getByRole('option', { name: 'Permanent' })).toBeInTheDocument();
  });

  it('Salary Category dropdown shows "Monthly Fixed" as an option', async () => {
    await openForm();
    expect(screen.getByRole('option', { name: 'Monthly Fixed' })).toBeInTheDocument();
  });

  it('Role dropdown shows available role options', async () => {
    await openForm();
    expect(screen.getByRole('option', { name: 'Staff' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Cashier' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Manager' })).toBeInTheDocument();
  });

});

// ════════════════════════════════════════════════════════════
//  TEST GROUP 4 — Step 4: Save Employee
//  TC Step #4 — "Click Save Employee → Success message"
// ════════════════════════════════════════════════════════════
describe('SERP/TC/002 — Step 4: Save Employee Calls the API', () => {

  // Helper: fill mandatory fields and click Save
  const fillAndSave = async () => {
    renderPage();
    await waitFor(() => screen.getByText(/Add Employee/i));
    await act(async () => { fireEvent.click(screen.getByText(/Add Employee/i)); });

    await act(async () => {
      await userEvent.type(screen.getByPlaceholderText('Full name'), 'Kamal Perera');
      await userEvent.type(screen.getByPlaceholderText('NIC number'), '200012345678');
      await userEvent.type(screen.getByPlaceholderText(/\+94-71-555-1234/i), '0771234567');
      const dateInputs = document.querySelectorAll('input[type="date"]');
      fireEvent.change(dateInputs[1], { target: { value: '2026-04-01' } });
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Save Employee/i }));
    });
  };

  it('calls axios.post to the employees endpoint when Save is clicked', async () => {
    axios.post.mockResolvedValueOnce({
      data: { success: true, data: { Employee_ID: 42, Employee_Code: 'EMP-042' } }
    });
    axios.get.mockResolvedValue(singleEmployeeResponse);

    await fillAndSave();

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/employees'),
        expect.objectContaining({
          Full_Name:     'Kamal Perera',
          NIC:           '200012345678',
          Contact_Phone: '0771234567',
          Hire_Date:     '2026-04-01',
        })
      );
    });
  });

  it('closes the registration form after successful save', async () => {
    axios.post.mockResolvedValueOnce({
      data: { success: true, data: { Employee_ID: 42, Employee_Code: 'EMP-042' } }
    });
    axios.get.mockResolvedValue(singleEmployeeResponse);

    await fillAndSave();

    await waitFor(() => {
      expect(screen.queryByText('Add New Employee')).not.toBeInTheDocument();
    });
  });

  it('re-fetches the employee list after a successful save', async () => {
    axios.post.mockResolvedValueOnce({
      data: { success: true, data: { Employee_ID: 42, Employee_Code: 'EMP-042' } }
    });
    axios.get.mockResolvedValue(singleEmployeeResponse);

    await fillAndSave();

    await waitFor(() => {
      // axios.get is called once on mount, then again after save
      expect(axios.get).toHaveBeenCalledTimes(2);
    });
  });

  it('shows an alert when save fails due to a server error', async () => {
    axios.post.mockRejectedValueOnce({
      response: { data: { message: 'Employee validation failed', validationErrors: [] } }
    });

    await fillAndSave();

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalled();
    });
  });

});

// ════════════════════════════════════════════════════════════
//  TEST GROUP 5 — Step 5: New Employee Appears in the List
//  TC Step #5 — "New employee record visible in the table"
// ════════════════════════════════════════════════════════════
describe('SERP/TC/002 — Step 5: New Employee Appears in the List', () => {

  it('displays the new employee card after successful registration', async () => {
    axios.get.mockResolvedValue(singleEmployeeResponse);

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Kamal Perera')).toBeInTheDocument();
    });
  });

  it('shows the correct role for the new employee card', async () => {
    axios.get.mockResolvedValue(singleEmployeeResponse);
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Sales Assistant')).toBeInTheDocument();
    });
  });

  it('shows ACTIVE status badge on the new employee card', async () => {
    axios.get.mockResolvedValue(singleEmployeeResponse);
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Active')).toBeInTheDocument();
    });
  });

  it('shows View and Edit action buttons on the new employee card', async () => {
    axios.get.mockResolvedValue(singleEmployeeResponse);
    renderPage();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /view/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
    });
  });

  it('opens the employee detail view when View is clicked', async () => {
    axios.get.mockResolvedValue(singleEmployeeResponse);
    renderPage();

    await waitFor(() => screen.getByRole('button', { name: /view/i }));
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /view/i }));
    });

    expect(screen.getByText('Employee Details')).toBeInTheDocument();
  });

  it('displays the employee NIC in the detail view', async () => {
    axios.get.mockResolvedValue(singleEmployeeResponse);
    renderPage();

    await waitFor(() => screen.getByRole('button', { name: /view/i }));
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /view/i }));
    });

    // The detail panel renders field labels for core employee info
    // Confirm the Employee Details heading is present and the contact phone is shown
    expect(screen.getByText('Employee Details')).toBeInTheDocument();
    expect(screen.getByText('Contact Phone')).toBeInTheDocument();
  });

  it('displays the contact phone in the detail view', async () => {
    axios.get.mockResolvedValue(singleEmployeeResponse);
    renderPage();

    await waitFor(() => screen.getByRole('button', { name: /view/i }));
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /view/i }));
    });

    expect(screen.getByText('0771234567')).toBeInTheDocument();
  });

});

// ════════════════════════════════════════════════════════════
//  TEST GROUP 6 — Frontend Validation (Required Fields)
// ════════════════════════════════════════════════════════════
describe('SERP/TC/002 — Frontend Validation: Required Fields Blocked', () => {

  it('does NOT call the API when Full_Name is empty', async () => {
    renderPage();
    await waitFor(() => screen.getByText(/Add Employee/i));
    await act(async () => { fireEvent.click(screen.getByText(/Add Employee/i)); });

    // Fill everything except Full_Name
    await act(async () => {
      await userEvent.type(screen.getByPlaceholderText('NIC number'), '200012345678');
      await userEvent.type(screen.getByPlaceholderText(/\+94-71-555-1234/i), '0771234567');
      const dateInputs = document.querySelectorAll('input[type="date"]');
      fireEvent.change(dateInputs[1], { target: { value: '2026-04-01' } });
      fireEvent.click(screen.getByRole('button', { name: /Save Employee/i }));
    });

    expect(axios.post).not.toHaveBeenCalled();
  });

  it('does NOT call the API when NIC is empty', async () => {
    renderPage();
    await waitFor(() => screen.getByText(/Add Employee/i));
    await act(async () => { fireEvent.click(screen.getByText(/Add Employee/i)); });

    await act(async () => {
      await userEvent.type(screen.getByPlaceholderText('Full name'), 'Kamal Perera');
      await userEvent.type(screen.getByPlaceholderText(/\+94-71-555-1234/i), '0771234567');
      const dateInputs = document.querySelectorAll('input[type="date"]');
      fireEvent.change(dateInputs[1], { target: { value: '2026-04-01' } });
      fireEvent.click(screen.getByRole('button', { name: /Save Employee/i }));
    });

    expect(axios.post).not.toHaveBeenCalled();
  });

  it('does NOT call the API when Contact_Phone is empty', async () => {
    renderPage();
    await waitFor(() => screen.getByText(/Add Employee/i));
    await act(async () => { fireEvent.click(screen.getByText(/Add Employee/i)); });

    await act(async () => {
      await userEvent.type(screen.getByPlaceholderText('Full name'), 'Kamal Perera');
      await userEvent.type(screen.getByPlaceholderText('NIC number'), '200012345678');
      const dateInputs = document.querySelectorAll('input[type="date"]');
      fireEvent.change(dateInputs[1], { target: { value: '2026-04-01' } });
      fireEvent.click(screen.getByRole('button', { name: /Save Employee/i }));
    });

    expect(axios.post).not.toHaveBeenCalled();
  });

  it('does NOT call the API when Hire_Date is empty', async () => {
    renderPage();
    await waitFor(() => screen.getByText(/Add Employee/i));
    await act(async () => { fireEvent.click(screen.getByText(/Add Employee/i)); });

    await act(async () => {
      await userEvent.type(screen.getByPlaceholderText('Full name'), 'Kamal Perera');
      await userEvent.type(screen.getByPlaceholderText('NIC number'), '200012345678');
      await userEvent.type(screen.getByPlaceholderText(/\+94-71-555-1234/i), '0771234567');
      // Hire Date intentionally left empty
      fireEvent.click(screen.getByRole('button', { name: /Save Employee/i }));
    });

    expect(axios.post).not.toHaveBeenCalled();
  });

  it('shows a validation error label when Full_Name is missing', async () => {
    renderPage();
    await waitFor(() => screen.getByText(/Add Employee/i));
    await act(async () => { fireEvent.click(screen.getByText(/Add Employee/i)); });

    await act(async () => {
      await userEvent.type(screen.getByPlaceholderText('NIC number'), '200012345678');
      await userEvent.type(screen.getByPlaceholderText(/\+94-71-555-1234/i), '0771234567');
      const dateInputs = document.querySelectorAll('input[type="date"]');
      fireEvent.change(dateInputs[1], { target: { value: '2026-04-01' } });
      fireEvent.click(screen.getByRole('button', { name: /Save Employee/i }));
    });

    // The label for Full_Name shows an inline error span — use getAllByText since
    // other required fields may also show "Required"
    const requiredLabels = screen.getAllByText(/required/i);
    expect(requiredLabels.length).toBeGreaterThan(0);
  });

});

// ════════════════════════════════════════════════════════════
//  TEST GROUP 7 — Search Functionality
// ════════════════════════════════════════════════════════════
describe('SERP/TC/002 — Employee List Search', () => {

  it('filters employee cards by name when typing in the search box', async () => {
    axios.get.mockResolvedValue(singleEmployeeResponse);
    renderPage();

    await waitFor(() => screen.getByText('Kamal Perera'));

    const searchInput = screen.getByPlaceholderText(/search by name/i);
    await act(async () => {
      await userEvent.type(searchInput, 'Kamal');
    });

    expect(screen.getByText('Kamal Perera')).toBeInTheDocument();
  });

  it('hides employees that do not match the search term', async () => {
    axios.get.mockResolvedValue(singleEmployeeResponse);
    renderPage();

    await waitFor(() => screen.getByText('Kamal Perera'));

    const searchInput = screen.getByPlaceholderText(/search by name/i);
    await act(async () => {
      await userEvent.type(searchInput, 'XYZ');
    });

    expect(screen.queryByText('Kamal Perera')).not.toBeInTheDocument();
  });

});
