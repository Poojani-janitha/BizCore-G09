const express = require('express');
const router = express.Router();
const { uploadHrDocument } = require('../../middleware/hrUploadMiddleware');
const { getHrDbHealth } = require('../../controllers/hr/healthController');

const {
    getEmployees,
    getEmployeeById,
    createEmployee,
    updateEmployee,
    updateEmployeeStatus,
    deleteEmployee,
    linkUserToEmployee,
    getEmployeeDocuments,
    addEmployeeDocument,
    deleteEmployeeDocument
} = require('../../controllers/hr/employeeController');

const {
    getLeaves,
    getLeaveById,
    createLeave,
    updateLeave,
    approveLeave,
    rejectLeave
} = require('../../controllers/hr/leaveController');

const {
    getAttendance,
    upsertAttendance,
    bulkAttendance,
    updateAttendance,
    getAttendanceSummaries,
    upsertAttendanceSummary
} = require('../../controllers/hr/attendanceController');

const {
    getSalaryStructures,
    createSalaryStructure,
    updateSalaryStructure,
    getPayrolls,
    getPayrollById,
    createPayroll,
    updatePayroll,
    computePayrollDraft,
    getAdvances,
    createAdvance,
    updateAdvance,
    getAdvanceRepayments,
    recordAdvanceRepayment
} = require('../../controllers/hr/payrollController');

router.get('/health', getHrDbHealth);

// --- Employees & documents ---
router.get('/employees', getEmployees);
router.get('/employees/:employeeId', getEmployeeById);
router.post('/employees', createEmployee);
router.put('/employees/:employeeId', updateEmployee);
router.patch('/employees/:employeeId/status', updateEmployeeStatus);
router.delete('/employees/:employeeId', deleteEmployee);
router.post('/employees/:employeeId/link-user', linkUserToEmployee);
router.get('/employees/:employeeId/documents', getEmployeeDocuments);
router.post(
    '/employees/:employeeId/documents',
    uploadHrDocument.single('file'),
    addEmployeeDocument
);
router.delete('/employees/:employeeId/documents/:documentId', deleteEmployeeDocument);

// --- Leave ---
router.get('/leaves', getLeaves);
router.get('/leaves/:leaveId', getLeaveById);
router.post('/leaves', createLeave);
router.put('/leaves/:leaveId', updateLeave);
router.patch('/leaves/:leaveId/approve', approveLeave);
router.patch('/leaves/:leaveId/reject', rejectLeave);

// --- Attendance (summaries before :attendanceId) ---
router.get('/attendance/summaries', getAttendanceSummaries);
router.post('/attendance/summaries', upsertAttendanceSummary);
router.get('/attendance', getAttendance);
router.post('/attendance', upsertAttendance);
router.post('/attendance/bulk', bulkAttendance);
router.put('/attendance/:attendanceId', updateAttendance);

// --- Salary structure ---
router.get('/salary-structure', getSalaryStructures);
router.post('/salary-structure', createSalaryStructure);
router.put('/salary-structure/:salaryId', updateSalaryStructure);

// --- Payroll (specific paths before :payrollId) ---
router.get('/payroll/draft', computePayrollDraft);
router.get('/payroll', getPayrolls);
router.get('/payroll/:payrollId', getPayrollById);
router.post('/payroll', createPayroll);
router.put('/payroll/:payrollId', updatePayroll);

// --- Advances ---
router.get('/advances/:advanceId/repayments', getAdvanceRepayments);
router.post('/advances/:advanceId/repayments', recordAdvanceRepayment);
router.get('/advances', getAdvances);
router.post('/advances', createAdvance);
router.put('/advances/:advanceId', updateAdvance);

module.exports = router;
