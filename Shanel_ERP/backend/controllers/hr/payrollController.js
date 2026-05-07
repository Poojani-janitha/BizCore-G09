const {
    SalaryStructure,
    Payroll,
    AdvanceSalary,
    AdvanceRepayment,
    Employee,
    AttendanceSummary
} = require('../../models/index');
const { findEmployeeByParam } = require('../../utils/hrEmployeeLookup');

// --- Salary structure ---
const getSalaryStructures = async (req, res) => {
    try {
        const { employeeId, status } = req.query;
        const where = {};
        if (employeeId) {
            const emp = await findEmployeeByParam(employeeId);
            if (!emp) {
                return res.status(404).json({ success: false, message: 'Employee not found' });
            }
            where.Employee_ID = emp.Employee_ID;
        }
        if (status) where.Status = status;

        const rows = await SalaryStructure.findAll({
            where,
            include: [
                {
                    model: Employee,
                    as: 'Employee',
                    attributes: ['Employee_ID', 'Employee_Code', 'Full_Name']
                }
            ],
            order: [['Effective_From_Date', 'DESC']]
        });

        return res.status(200).json({ success: true, count: rows.length, data: rows });
    } catch (error) {
        console.error('getSalaryStructures error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch salary structures',
            error: error.message
        });
    }
};

const createSalaryStructure = async (req, res) => {
    try {
        const payload = { ...req.body };
        if (!payload.Employee_ID || !payload.Salary_Type || !payload.Effective_From_Date) {
            return res.status(400).json({
                success: false,
                message: 'Employee_ID, Salary_Type, Effective_From_Date are required'
            });
        }

        const created = await SalaryStructure.create(payload);
        return res.status(201).json({ success: true, data: created });
    } catch (error) {
        console.error('createSalaryStructure error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to create salary structure',
            error: error.message
        });
    }
};

const updateSalaryStructure = async (req, res) => {
    try {
        const row = await SalaryStructure.findByPk(req.params.salaryId);
        if (!row) {
            return res.status(404).json({ success: false, message: 'Salary structure not found' });
        }

        const payload = { ...req.body };
        delete payload.Salary_ID;
        delete payload.Created_At;

        await row.update(payload);
        return res.status(200).json({ success: true, data: row });
    } catch (error) {
        console.error('updateSalaryStructure error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update salary structure',
            error: error.message
        });
    }
};

// --- Payroll ---
const getPayrolls = async (req, res) => {
    try {
        const { employeeId, year, month, status } = req.query;
        const where = {};
        if (employeeId) {
            const emp = await findEmployeeByParam(employeeId);
            if (!emp) {
                return res.status(404).json({ success: false, message: 'Employee not found' });
            }
            where.Employee_ID = emp.Employee_ID;
        }
        if (year) where.Pay_Period_Year = parseInt(year, 10);
        if (month) where.Pay_Period_Month = parseInt(month, 10);
        if (status) where.Payment_Status = status;

        const rows = await Payroll.findAll({
            where,
            include: [
                {
                    model: Employee,
                    as: 'Employee',
                    attributes: ['Employee_ID', 'Employee_Code', 'Full_Name', 'Department']
                }
            ],
            order: [
                ['Pay_Period_Year', 'DESC'],
                ['Pay_Period_Month', 'DESC']
            ]
        });

        return res.status(200).json({ success: true, count: rows.length, data: rows });
    } catch (error) {
        console.error('getPayrolls error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch payroll',
            error: error.message
        });
    }
};

const getPayrollById = async (req, res) => {
    try {
        const row = await Payroll.findByPk(req.params.payrollId, {
            include: [
                {
                    model: Employee,
                    as: 'Employee',
                    attributes: ['Employee_ID', 'Employee_Code', 'Full_Name', 'Department', 'EPF_Eligible', 'ETF_Eligible']
                }
            ]
        });
        if (!row) {
            return res.status(404).json({ success: false, message: 'Payroll not found' });
        }

        const repayments = await AdvanceRepayment.findAll({
            where: { Payroll_ID: row.Payroll_ID },
            include: [{ model: AdvanceSalary, as: 'Advance', attributes: ['Advance_ID', 'Advance_Amount', 'Balance'] }]
        });

        return res.status(200).json({ success: true, data: row, advanceRepayments: repayments });
    } catch (error) {
        console.error('getPayrollById error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch payroll',
            error: error.message
        });
    }
};

const createPayroll = async (req, res) => {
    try {
        const body = req.body;
        if (
            !body.Employee_ID ||
            !body.Pay_Period_Month ||
            !body.Pay_Period_Year ||
            body.Gross_Salary == null ||
            body.Total_Deductions == null ||
            body.Net_Salary == null
        ) {
            return res.status(400).json({
                success: false,
                message:
                    'Employee_ID, Pay_Period_Month, Pay_Period_Year, Gross_Salary, Total_Deductions, Net_Salary are required'
            });
        }

        const dup = await Payroll.findOne({
            where: {
                Employee_ID: body.Employee_ID,
                Pay_Period_Month: body.Pay_Period_Month,
                Pay_Period_Year: body.Pay_Period_Year
            }
        });
        if (dup) {
            return res.status(409).json({
                success: false,
                message: 'Payroll already exists for this employee and period'
            });
        }

        const created = await Payroll.create(body);
        return res.status(201).json({ success: true, data: created });
    } catch (error) {
        console.error('createPayroll error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to create payroll',
            error: error.message
        });
    }
};

const updatePayroll = async (req, res) => {
    try {
        const row = await Payroll.findByPk(req.params.payrollId);
        if (!row) {
            return res.status(404).json({ success: false, message: 'Payroll not found' });
        }

        const payload = { ...req.body };
        delete payload.Payroll_ID;
        delete payload.Generated_At;

        await row.update(payload);
        return res.status(200).json({ success: true, data: row });
    } catch (error) {
        console.error('updatePayroll error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update payroll',
            error: error.message
        });
    }
};

/**
 * Suggested figures from active salary structure + attendance summary (same month/year).
 * Does not persist; client can POST /payroll with adjusted numbers.
 */
const computePayrollDraft = async (req, res) => {
    try {
        const { employeeId, month, year } = req.query;
        if (!employeeId || !month || !year) {
            return res.status(400).json({
                success: false,
                message: 'employeeId, month, year query params are required'
            });
        }

        const emp = await findEmployeeByParam(employeeId);
        if (!emp) {
            return res.status(404).json({ success: false, message: 'Employee not found' });
        }

        const m = parseInt(month, 10);
        const y = parseInt(year, 10);

        const ss = await SalaryStructure.findOne({
            where: { Employee_ID: emp.Employee_ID, Status: 'Active' },
            order: [['Effective_From_Date', 'DESC']]
        });

        const att = await AttendanceSummary.findOne({
            where: { Employee_ID: emp.Employee_ID, Month: m, Year: y }
        });

        let basic = 0;
        let teaAllowance = 0;
        let attendanceBonus = 0;
        let otEarnings = 0;

        if (ss) {
            basic = parseFloat(ss.Monthly_Base_Salary) || 0;
            if (ss.Salary_Type === 'Daily_Rate') {
                const rate = parseFloat(ss.Daily_Rate) || 0;
                const present = att ? att.Present_Days || 0 : 0;
                basic = rate * present;
            }
            teaAllowance = (parseFloat(ss.Tea_Allowance_Daily) || 0) * (att ? att.Present_Days || 0 : 0);
            if (att && att.Attendance_Bonus_Eligible) {
                attendanceBonus = parseFloat(ss.Attendance_Bonus_Amount) || parseFloat(att.Attendance_Bonus_Amount) || 0;
            }
            const otHours = att ? parseFloat(att.Total_Overtime_Hours) || 0 : 0;
            const otRate = parseFloat(ss.OT_Rate_Per_Hour) || 0;
            otEarnings = otHours * otRate;
        }

        const gross =
            basic +
            teaAllowance +
            attendanceBonus +
            otEarnings +
            (parseFloat(req.query.productionEarnings) || 0) +
            (parseFloat(req.query.otherAllowances) || 0);

        let epfEmp = 0;
        let etfEmp = 0;
        let epfEr = 0;
        let etfEr = 0;

        if (emp.EPF_Eligible && basic > 0) {
            epfEmp = +(basic * 0.08).toFixed(2);
            epfEr = +(basic * 0.12).toFixed(2);
        }
        if (emp.ETF_Eligible && basic > 0) {
            etfEmp = +(basic * 0.03).toFixed(2);
            etfEr = +(basic * 0.03).toFixed(2);
        }

        const activeAdvances = await AdvanceSalary.findAll({
            where: { Employee_ID: emp.Employee_ID, Status: 'Active' }
        });
        let advanceDeduction = 0;
        activeAdvances.forEach((a) => {
            advanceDeduction += parseFloat(a.Monthly_Deduction_Amount) || 0;
        });

        const otherDeductions = parseFloat(req.query.otherDeductions) || 0;
        const totalDeductions = +(epfEmp + etfEmp + advanceDeduction + otherDeductions).toFixed(2);
        const netSalary = +(gross - totalDeductions).toFixed(2);

        return res.status(200).json({
            success: true,
            employee: {
                Employee_ID: emp.Employee_ID,
                Employee_Code: emp.Employee_Code,
                Full_Name: emp.Full_Name,
                EPF_Eligible: emp.EPF_Eligible,
                ETF_Eligible: emp.ETF_Eligible
            },
            salaryStructure: ss,
            attendanceSummary: att,
            suggestion: {
                Basic_Salary: +basic.toFixed(2),
                Production_Earnings: parseFloat(req.query.productionEarnings) || 0,
                Overtime_Earnings: +otEarnings.toFixed(2),
                Attendance_Bonus: +attendanceBonus.toFixed(2),
                Tea_Allowance: +teaAllowance.toFixed(2),
                Other_Allowances: parseFloat(req.query.otherAllowances) || 0,
                Gross_Salary: +gross.toFixed(2),
                EPF_Employee_Deduction: epfEmp,
                ETF_Employee_Deduction: etfEmp,
                Advance_Deduction: +advanceDeduction.toFixed(2),
                Other_Deductions: otherDeductions,
                Total_Deductions: totalDeductions,
                Net_Salary: netSalary,
                EPF_Employer_Contribution: epfEr,
                ETF_Employer_Contribution: etfEr,
                Pay_Period_Month: m,
                Pay_Period_Year: y
            }
        });
    } catch (error) {
        console.error('computePayrollDraft error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to compute draft',
            error: error.message
        });
    }
};

// --- Advances ---
const getAdvances = async (req, res) => {
    try {
        const { employeeId, status } = req.query;
        const where = {};
        if (employeeId) {
            const emp = await findEmployeeByParam(employeeId);
            if (!emp) {
                return res.status(404).json({ success: false, message: 'Employee not found' });
            }
            where.Employee_ID = emp.Employee_ID;
        }
        if (status) where.Status = status;

        const rows = await AdvanceSalary.findAll({
            where,
            include: [
                {
                    model: Employee,
                    as: 'Employee',
                    attributes: ['Employee_ID', 'Employee_Code', 'Full_Name']
                }
            ],
            order: [['Advance_Date', 'DESC']]
        });

        return res.status(200).json({ success: true, count: rows.length, data: rows });
    } catch (error) {
        console.error('getAdvances error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch advances',
            error: error.message
        });
    }
};

const createAdvance = async (req, res) => {
    try {
        const body = req.body;
        if (
            !body.Employee_ID ||
            body.Advance_Amount == null ||
            !body.Advance_Date ||
            !body.Repayment_Months ||
            body.Monthly_Deduction_Amount == null ||
            body.Balance == null
        ) {
            return res.status(400).json({
                success: false,
                message:
                    'Employee_ID, Advance_Amount, Advance_Date, Repayment_Months, Monthly_Deduction_Amount, Balance are required'
            });
        }

        const created = await AdvanceSalary.create(body);
        return res.status(201).json({ success: true, data: created });
    } catch (error) {
        console.error('createAdvance error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to create advance',
            error: error.message
        });
    }
};

const updateAdvance = async (req, res) => {
    try {
        const row = await AdvanceSalary.findByPk(req.params.advanceId);
        if (!row) {
            return res.status(404).json({ success: false, message: 'Advance not found' });
        }

        const payload = { ...req.body };
        delete payload.Advance_ID;
        delete payload.Created_At;

        await row.update(payload);
        return res.status(200).json({ success: true, data: row });
    } catch (error) {
        console.error('updateAdvance error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update advance',
            error: error.message
        });
    }
};

const getAdvanceRepayments = async (req, res) => {
    try {
        const rows = await AdvanceRepayment.findAll({
            where: { Advance_ID: req.params.advanceId },
            include: [{ model: Payroll, as: 'Payroll', attributes: ['Payroll_ID', 'Pay_Period_Month', 'Pay_Period_Year'] }],
            order: [['Deduction_Date', 'DESC']]
        });

        return res.status(200).json({ success: true, count: rows.length, data: rows });
    } catch (error) {
        console.error('getAdvanceRepayments error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch repayments',
            error: error.message
        });
    }
};

const recordAdvanceRepayment = async (req, res) => {
    try {
        const { Payroll_ID, Deduction_Amount, Deduction_Date, Balance_After } = req.body;
        if (Payroll_ID == null || Deduction_Amount == null || !Deduction_Date || Balance_After == null) {
            return res.status(400).json({
                success: false,
                message: 'Payroll_ID, Deduction_Amount, Deduction_Date, Balance_After are required'
            });
        }

        const advance = await AdvanceSalary.findByPk(req.params.advanceId);
        if (!advance) {
            return res.status(404).json({ success: false, message: 'Advance not found' });
        }

        const payroll = await Payroll.findByPk(Payroll_ID);
        if (!payroll) {
            return res.status(404).json({ success: false, message: 'Payroll not found' });
        }

        const repayment = await AdvanceRepayment.create({
            Advance_ID: advance.Advance_ID,
            Payroll_ID,
            Deduction_Amount,
            Deduction_Date,
            Balance_After
        });

        const totalRepaid = parseFloat(advance.Total_Repaid) + parseFloat(Deduction_Amount);
        let newStatus = advance.Status;
        if (parseFloat(Balance_After) <= 0) {
            newStatus = 'Fully_Paid';
        }

        await advance.update({
            Total_Repaid: totalRepaid,
            Balance: Balance_After,
            Status: newStatus
        });

        return res.status(201).json({ success: true, data: repayment, advance });
    } catch (error) {
        console.error('recordAdvanceRepayment error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to record repayment',
            error: error.message
        });
    }
};

module.exports = {
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
};
