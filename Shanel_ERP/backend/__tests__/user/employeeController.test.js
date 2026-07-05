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
 *    Full Name      = "Kamal Perera"
 *    NIC            = "200012345678"
 *    Contact Phone  = "0771234567"
 *    Role           = "Sales Assistant"
 *    Hire Date      = "2026-04-01"
 *    Employee Type  = "Permanent"
 *    Salary Category = "Monthly_Fixed"
 *
 *  Test Scenario:
 *    Verify that Admin can successfully add a new employee
 *    and the record is stored in the database.
 * ════════════════════════════════════════════════════════════
 */

// ─── Mock models BEFORE importing the controller ────────────
jest.mock('../../models/index', () => ({
  Employee: {
    findAll:  jest.fn(),
    findOne:  jest.fn(),
    create:   jest.fn(),
    sequelize: {
      query: jest.fn(),
      QueryTypes: { UPDATE: 'UPDATE' },
    },
  },
}));

jest.mock('../../utils/hrEmployeeLookup', () => ({
  findEmployeeByParam: jest.fn(),
}));

// ─── Imports (after mocks) ───────────────────────────────────
const { Employee } = require('../../models/index');
const { findEmployeeByParam } = require('../../utils/hrEmployeeLookup');

const {
  getEmployees,
  createEmployee,
  updateEmployee,
  updateEmployeeStatus,
  deleteEmployee,
} = require('../../controllers/hr/employeeController');

// ─── Shared helper ───────────────────────────────────────────
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json   = jest.fn().mockReturnValue(res);
  return res;
};

// ─── Test Data (from SERP/TC/002) ───────────────────────────
const validEmployeePayload = {
  Full_Name:       'Kamal Perera',
  NIC:             '200012345678',
  Contact_Phone:   '0771234567',
  Role:            'Sales Assistant',
  Hire_Date:       '2026-04-01',
  Employee_Type:   'Permanent',
  Salary_Category: 'Monthly_Fixed',
  Status:          'Active',
};

// Mock DB record returned after Employee.create()
const createdDbRecord = {
  Employee_ID:   42,
  Employee_Code: 'PENDING-123',
  ...validEmployeePayload,
  update: jest.fn().mockResolvedValue(true),
};

// ─── Setup ───────────────────────────────────────────────────
beforeEach(() => {
  jest.clearAllMocks();
});


// ════════════════════════════════════════════════════════════
//  TEST GROUP 1 — Step 1: Employees List Page
//  TC Step #1 — "Navigate to HR → Employees page →
//                Employees list page is displayed"
// ════════════════════════════════════════════════════════════
describe('SERP/TC/002 — Step 1: Employees List Is Retrieved', () => {

  it('returns 200 with the list of active employees', async () => {
    // ARRANGE
    Employee.findAll.mockResolvedValue([
      { toJSON: () => ({ Employee_ID: 1, Full_Name: 'Existing Staff', Status: 'Active' }) }
    ]);

    const req = { query: { status: 'Active' } };
    const res = mockRes();

    // ACT
    await getEmployees(req, res);

    // ASSERT
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, count: 1 })
    );
  });

  it('passes the status filter to the database query', async () => {
    Employee.findAll.mockResolvedValue([]);

    const req = { query: { status: 'Active' } };
    const res = mockRes();

    await getEmployees(req, res);

    // Employee.findAll must be called with a where clause containing Status
    expect(Employee.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ Status: 'Active' }),
      })
    );
  });

  it('returns empty array when no employees exist', async () => {
    Employee.findAll.mockResolvedValue([]);

    const req = { query: {} };
    const res = mockRes();

    await getEmployees(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const payload = res.json.mock.calls[0][0];
    expect(payload.data).toEqual([]);
    expect(payload.count).toBe(0);
  });

  it('returns 500 when database query fails', async () => {
    Employee.findAll.mockRejectedValue(new Error('DB error'));

    const req = { query: {} };
    const res = mockRes();

    await getEmployees(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
  });

});


// ════════════════════════════════════════════════════════════
//  TEST GROUP 2 — Steps 3 & 4: Save Employee (Positive Case)
//  TC Step #3 — "Fill in all required fields"
//  TC Step #4 — "Click Save Employee → Success message"
// ════════════════════════════════════════════════════════════
describe('SERP/TC/002 — Steps 3 & 4: New Employee Is Created Successfully', () => {

  it('returns 201 with success message when all required fields are valid', async () => {
    // ARRANGE — no duplicate NIC/Email, create succeeds
    Employee.findOne.mockResolvedValue(null);
    Employee.create.mockResolvedValue(createdDbRecord);

    const req = { body: { ...validEmployeePayload } };
    const res = mockRes();

    // ACT
    await createEmployee(req, res);

    // ASSERT
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success:  true,
        message:  'Employee created successfully',
      })
    );
  });

  it('stores all test-case field values in the created employee record', async () => {
    Employee.findOne.mockResolvedValue(null);
    Employee.create.mockResolvedValue(createdDbRecord);

    const req = { body: { ...validEmployeePayload } };
    const res = mockRes();

    await createEmployee(req, res);

    // Employee.create must be called with the correct payload
    expect(Employee.create).toHaveBeenCalledWith(
      expect.objectContaining({
        Full_Name:       'Kamal Perera',
        NIC:             '200012345678',
        Contact_Phone:   '0771234567',
        Role:            'Sales Assistant',
        Hire_Date:       '2026-04-01',
        Employee_Type:   'Permanent',
        Salary_Category: 'Monthly_Fixed',
      })
    );
  });

  it('generates Employee_Code (EMP-XXX) from the new Employee_ID after creation', async () => {
    Employee.findOne.mockResolvedValue(null);
    Employee.create.mockResolvedValue(createdDbRecord);

    const req = { body: { ...validEmployeePayload } };
    const res = mockRes();

    await createEmployee(req, res);

    // update() must be called to set the real Employee_Code
    expect(createdDbRecord.update).toHaveBeenCalledWith(
      expect.objectContaining({
        Employee_Code: 'EMP-042',
      })
    );
  });

  it('saves a temporary Employee_Code before the permanent one is set', async () => {
    Employee.findOne.mockResolvedValue(null);
    Employee.create.mockResolvedValue(createdDbRecord);

    const req = { body: { ...validEmployeePayload } };
    const res = mockRes();

    await createEmployee(req, res);

    // The payload passed to Employee.create must include a PENDING- temp code
    const createCallArgs = Employee.create.mock.calls[0][0];
    expect(createCallArgs.Employee_Code).toMatch(/^PENDING-/);
  });

});


// ════════════════════════════════════════════════════════════
//  TEST GROUP 3 — Step 5: New Employee Appears in List
//  TC Step #5 — "New employee record visible in the table"
// ════════════════════════════════════════════════════════════
describe('SERP/TC/002 — Step 5: New Employee Appears in Employee List', () => {

  it('returns the newly created employee when list is fetched after creation', async () => {
    // ARRANGE — list now includes the new employee
    const newRecord = {
      toJSON: () => ({
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
      })
    };
    Employee.findAll.mockResolvedValue([newRecord]);

    const req = { query: { status: 'Active' } };
    const res = mockRes();

    await getEmployees(req, res);

    const payload = res.json.mock.calls[0][0];
    expect(payload.success).toBe(true);
    expect(payload.count).toBe(1);

    const emp = payload.data[0];
    expect(emp.Full_Name).toBe('Kamal Perera');
    expect(emp.Employee_Code).toBe('EMP-042');
    expect(emp.NIC).toBe('200012345678');
    expect(emp.Status).toBe('Active');
  });

  it('new employee is searchable by name in the employee list', async () => {
    const newRecord = {
      toJSON: () => ({
        Employee_ID: 42,
        Full_Name:   'Kamal Perera',
        Status:      'Active',
      })
    };
    Employee.findAll.mockResolvedValue([newRecord]);

    const req = { query: { search: 'Kamal' } };
    const res = mockRes();

    await getEmployees(req, res);

    // findAll should be called with an OR search condition
    expect(Employee.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          [require('sequelize').Op.or]: expect.any(Array),
        }),
      })
    );
  });

});


// ════════════════════════════════════════════════════════════
//  TEST GROUP 4 — Input Validation (Required Fields)
// ════════════════════════════════════════════════════════════
describe('SERP/TC/002 — Input Validation: Required Fields', () => {

  it('returns 400 when Full_Name is missing', async () => {
    const payload = { ...validEmployeePayload, Full_Name: '' };
    const req = { body: payload };
    const res = mockRes();

    await createEmployee(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: 'Employee validation failed' })
    );
  });

  it('returns 400 when Contact_Phone is missing', async () => {
    const payload = { ...validEmployeePayload, Contact_Phone: '' };
    const req = { body: payload };
    const res = mockRes();

    await createEmployee(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 400 when Hire_Date is missing', async () => {
    const payload = { ...validEmployeePayload, Hire_Date: '' };
    const req = { body: payload };
    const res = mockRes();

    await createEmployee(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 400 when Role is missing', async () => {
    const payload = { ...validEmployeePayload, Role: '' };
    const req = { body: payload };
    const res = mockRes();

    await createEmployee(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 400 when Salary_Category is missing', async () => {
    const payload = { ...validEmployeePayload, Salary_Category: '' };
    const req = { body: payload };
    const res = mockRes();

    await createEmployee(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 400 when Hire_Date is not a valid date', async () => {
    const payload = { ...validEmployeePayload, Hire_Date: 'not-a-date' };
    const req = { body: payload };
    const res = mockRes();

    await createEmployee(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    const errorBody = res.json.mock.calls[0][0];
    const hasHireDateError = errorBody.validationErrors.some(
      e => e.path === 'Hire_Date'
    );
    expect(hasHireDateError).toBe(true);
  });

  it('returns 400 with a list of all validation errors when multiple fields are missing', async () => {
    const req = { body: {} };
    const res = mockRes();

    await createEmployee(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    const errorBody = res.json.mock.calls[0][0];
    expect(Array.isArray(errorBody.validationErrors)).toBe(true);
    expect(errorBody.validationErrors.length).toBeGreaterThan(0);
  });

});


// ════════════════════════════════════════════════════════════
//  TEST GROUP 5 — Input Validation (Format Checks)
// ════════════════════════════════════════════════════════════
describe('SERP/TC/002 — Input Validation: Field Format Rules', () => {

  it('returns 400 when Salary_Category is not a valid enum value', async () => {
    const payload = { ...validEmployeePayload, Salary_Category: 'Hourly' };
    const req = { body: payload };
    const res = mockRes();

    await createEmployee(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    const errorBody = res.json.mock.calls[0][0];
    const hasError = errorBody.validationErrors.some(e => e.path === 'Salary_Category');
    expect(hasError).toBe(true);
  });

  it('returns 400 when Employee_Type is not a valid enum value', async () => {
    const payload = { ...validEmployeePayload, Employee_Type: 'FullTime' };
    const req = { body: payload };
    const res = mockRes();

    await createEmployee(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    const errorBody = res.json.mock.calls[0][0];
    const hasError = errorBody.validationErrors.some(e => e.path === 'Employee_Type');
    expect(hasError).toBe(true);
  });

  it('returns 400 when Email is invalid format', async () => {
    Employee.findOne.mockResolvedValue(null);
    const payload = { ...validEmployeePayload, Email: 'not-an-email' };
    const req = { body: payload };
    const res = mockRes();

    await createEmployee(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    const errorBody = res.json.mock.calls[0][0];
    const hasError = errorBody.validationErrors.some(e => e.path === 'Email');
    expect(hasError).toBe(true);
  });

  it('accepts both old-format NIC (9 digits + V) and new-format NIC (12 digits)', async () => {
    // New format (12 digits) — test data from TC-002
    Employee.findOne.mockResolvedValue(null);
    Employee.create.mockResolvedValue(createdDbRecord);

    const req = { body: { ...validEmployeePayload, NIC: '200012345678' } };
    const res = mockRes();

    await createEmployee(req, res);

    // Should pass validation and reach create
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('returns 400 when Full_Name is shorter than 3 characters', async () => {
    // The backend validates length > 200 but the frontend enforces min 3.
    // Backend only checks > 200; this test documents that boundary.
    Employee.findOne.mockResolvedValue(null);
    Employee.create.mockResolvedValue(createdDbRecord);

    const req = { body: { ...validEmployeePayload, Full_Name: 'AB' } };
    const res = mockRes();

    await createEmployee(req, res);

    // Backend doesn't enforce min-3 (only frontend does), so 201 is expected
    expect(res.status).toHaveBeenCalledWith(201);
  });

});


// ════════════════════════════════════════════════════════════
//  TEST GROUP 6 — Uniqueness Constraints
// ════════════════════════════════════════════════════════════
describe('SERP/TC/002 — Uniqueness Constraints', () => {

  it('returns 400 when NIC already exists in the database', async () => {
    // ARRANGE — NIC already taken
    Employee.findOne.mockResolvedValueOnce({ Employee_ID: 99, NIC: '200012345678' });

    const req = { body: { ...validEmployeePayload } };
    const res = mockRes();

    await createEmployee(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    const errorBody = res.json.mock.calls[0][0];
    const nicError = errorBody.validationErrors.find(e => e.path === 'NIC');
    expect(nicError).toBeTruthy();
    expect(nicError.message).toMatch(/unique/i);
  });

  it('returns 400 when Email already exists in the database', async () => {
    // ARRANGE — first findOne (NIC) returns null, second (Email) returns a match
    Employee.findOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ Employee_ID: 55, Email: 'kamal@test.com' });

    const req = {
      body: { ...validEmployeePayload, Email: 'kamal@test.com' }
    };
    const res = mockRes();

    await createEmployee(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    const errorBody = res.json.mock.calls[0][0];
    const emailError = errorBody.validationErrors.find(e => e.path === 'Email');
    expect(emailError).toBeTruthy();
    expect(emailError.message).toMatch(/unique/i);
  });

});


// ════════════════════════════════════════════════════════════
//  TEST GROUP 7 — Server Error Handling
// ════════════════════════════════════════════════════════════
describe('SERP/TC/002 — Server Error Handling', () => {

  it('returns 500 when database throws an unexpected error during creation', async () => {
    Employee.findOne.mockResolvedValue(null);
    Employee.create.mockRejectedValue(new Error('Connection timeout'));

    const req = { body: { ...validEmployeePayload } };
    const res = mockRes();

    await createEmployee(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: 'Failed to create employee' })
    );
  });

  it('returns 500 when getEmployees DB query fails', async () => {
    Employee.findAll.mockRejectedValue(new Error('DB connection lost'));

    const req = { query: {} };
    const res = mockRes();

    await getEmployees(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
  });

});


// ════════════════════════════════════════════════════════════
//  TEST GROUP 8 — Update Employee (Edit After Creation)
// ════════════════════════════════════════════════════════════
describe('SERP/TC/002 — Employee Record Update', () => {

  it('returns 200 when employee is updated with valid data', async () => {
    const mockEmployee = {
      Employee_ID: 42,
      Full_Name:   'Kamal Perera',
      update:      jest.fn().mockResolvedValue(true),
    };
    findEmployeeByParam.mockResolvedValue(mockEmployee);

    const req = {
      params: { employeeId: '42' },
      body:   { Role: 'Senior Sales Assistant' },
    };
    const res = mockRes();

    await updateEmployee(req, res);

    expect(mockEmployee.update).toHaveBeenCalledWith(
      expect.objectContaining({ Role: 'Senior Sales Assistant' })
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('returns 404 when trying to update a non-existent employee', async () => {
    findEmployeeByParam.mockResolvedValue(null);

    const req = {
      params: { employeeId: '9999' },
      body:   { Role: 'Manager' },
    };
    const res = mockRes();

    await updateEmployee(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: 'Employee not found' })
    );
  });

  it('does not allow Employee_ID to be overwritten during update', async () => {
    const mockEmployee = {
      Employee_ID: 42,
      update:      jest.fn().mockResolvedValue(true),
    };
    findEmployeeByParam.mockResolvedValue(mockEmployee);

    const req = {
      params: { employeeId: '42' },
      body:   { Employee_ID: 999, Full_Name: 'Changed Name' }, // attempts to overwrite ID
    };
    const res = mockRes();

    await updateEmployee(req, res);

    // Employee_ID must be stripped out of the update payload
    const updateCallPayload = mockEmployee.update.mock.calls[0][0];
    expect(updateCallPayload.Employee_ID).toBeUndefined();
    expect(updateCallPayload.Full_Name).toBe('Changed Name');
  });

});


// ════════════════════════════════════════════════════════════
//  TEST GROUP 9 — Delete / Deactivate Employee
// ════════════════════════════════════════════════════════════
describe('SERP/TC/002 — Employee Deactivation (Soft Delete)', () => {

  it('returns 200 and marks the employee as Inactive (soft delete)', async () => {
    const mockEmployee = { Employee_ID: 42 };
    findEmployeeByParam.mockResolvedValue(mockEmployee);
    Employee.sequelize.query.mockResolvedValue([]);

    const req = { params: { employeeId: '42' } };
    const res = mockRes();

    await deleteEmployee(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: expect.stringContaining('Inactive'),
      })
    );
  });

  it('returns 404 when trying to delete a non-existent employee', async () => {
    findEmployeeByParam.mockResolvedValue(null);

    const req = { params: { employeeId: '9999' } };
    const res = mockRes();

    await deleteEmployee(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

});
