const { Attendance, AttendanceSummary, Employee } = require('../../models/index');
const { Op } = require('sequelize');
const { findEmployeeByParam } = require('../../utils/hrEmployeeLookup');

const getAttendance = async (req, res) => {
    try {
        const { employeeId, from, to, status } = req.query;
        const where = {};

        if (employeeId) {
            const emp = await findEmployeeByParam(employeeId);
            if (!emp) {
                return res.status(404).json({ success: false, message: 'Employee not found' });
            }
            where.Employee_ID = emp.Employee_ID;
        }
        if (from && to) {
            where.Attendance_Date = { [Op.between]: [from, to] };
        } else if (from) {
            where.Attendance_Date = { [Op.gte]: from };
        } else if (to) {
            where.Attendance_Date = { [Op.lte]: to };
        }
        if (status) where.Status = status;

        const rows = await Attendance.findAll({
            where,
            include: [
                {
                    model: Employee,
                    as: 'Employee',
                    attributes: ['Employee_ID', 'Employee_Code', 'Full_Name']
                }
            ],
            order: [['Attendance_Date', 'DESC']]
        });

        return res.status(200).json({ success: true, count: rows.length, data: rows });
    } catch (error) {
        console.error('getAttendance error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch attendance',
            error: error.message
        });
    }
};

const upsertAttendance = async (req, res) => {
    try {
        const {
            Employee_ID,
            employeeCode,
            Attendance_Date,
            Check_In_Time,
            Check_Out_Time,
            Total_Hours,
            Status,
            Is_Late,
            Late_Minutes,
            Is_Overtime,
            Overtime_Hours,
            Marked_By,
            Notes,
            Created_By
        } = req.body;

        let empId = Employee_ID;
        if (!empId && employeeCode) {
            const emp = await findEmployeeByParam(employeeCode);
            if (!emp) {
                return res.status(404).json({ success: false, message: 'Employee not found' });
            }
            empId = emp.Employee_ID;
        }

        if (!empId || !Attendance_Date || !Status) {
            return res.status(400).json({
                success: false,
                message: 'Employee_ID (or employeeCode), Attendance_Date, Status are required'
            });
        }

        const existing = await Attendance.findOne({
            where: { Employee_ID: empId, Attendance_Date }
        });

        const values = {
            Check_In_Time: Check_In_Time || null,
            Check_Out_Time: Check_Out_Time || null,
            Total_Hours: Total_Hours ?? null,
            Status,
            Is_Late: Is_Late ?? false,
            Late_Minutes: Late_Minutes ?? 0,
            Is_Overtime: Is_Overtime ?? false,
            Overtime_Hours: Overtime_Hours ?? 0,
            Marked_By: Marked_By || 'Manual',
            Notes: Notes || null,
            Created_By: Created_By || null
        };

        let created = false;
        if (existing) {
            await existing.update(values);
        } else {
            created = true;
            await Attendance.create({
                Employee_ID: empId,
                Attendance_Date,
                ...values
            });
        }

        const fresh = await Attendance.findOne({
            where: { Employee_ID: empId, Attendance_Date },
            include: [{ model: Employee, as: 'Employee', attributes: ['Employee_Code', 'Full_Name'] }]
        });

        return res.status(created ? 201 : 200).json({
            success: true,
            created,
            data: fresh
        });
    } catch (error) {
        console.error('upsertAttendance error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to save attendance',
            error: error.message
        });
    }
};

const bulkAttendance = async (req, res) => {
    try {
        const { records } = req.body;
        if (!Array.isArray(records) || records.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'records array is required'
            });
        }

        const results = [];
        for (const rec of records) {
            let empId = rec.Employee_ID;
            if (!empId && rec.employeeCode) {
                const emp = await findEmployeeByParam(rec.employeeCode);
                if (!emp) {
                    results.push({ ok: false, error: 'Employee not found', rec });
                    continue;
                }
                empId = emp.Employee_ID;
            }
            if (!empId || !rec.Attendance_Date || !rec.Status) {
                results.push({ ok: false, error: 'Missing Employee_ID/Attendance_Date/Status', rec });
                continue;
            }

            const ex = await Attendance.findOne({
                where: { Employee_ID: empId, Attendance_Date: rec.Attendance_Date }
            });
            const vals = {
                Check_In_Time: rec.Check_In_Time || null,
                Check_Out_Time: rec.Check_Out_Time || null,
                Total_Hours: rec.Total_Hours ?? null,
                Status: rec.Status,
                Is_Late: rec.Is_Late ?? false,
                Late_Minutes: rec.Late_Minutes ?? 0,
                Is_Overtime: rec.Is_Overtime ?? false,
                Overtime_Hours: rec.Overtime_Hours ?? 0,
                Marked_By: rec.Marked_By || 'Manual',
                Notes: rec.Notes || null,
                Created_By: rec.Created_By || null
            };
            if (ex) await ex.update(vals);
            else {
                await Attendance.create({
                    Employee_ID: empId,
                    Attendance_Date: rec.Attendance_Date,
                    ...vals
                });
            }
            results.push({ ok: true, Employee_ID: empId, Attendance_Date: rec.Attendance_Date });
        }

        return res.status(200).json({ success: true, results });
    } catch (error) {
        console.error('bulkAttendance error:', error);
        return res.status(500).json({
            success: false,
            message: 'Bulk attendance failed',
            error: error.message
        });
    }
};

const updateAttendance = async (req, res) => {
    try {
        const row = await Attendance.findByPk(req.params.attendanceId);
        if (!row) {
            return res.status(404).json({ success: false, message: 'Attendance record not found' });
        }

        const payload = { ...req.body };
        delete payload.Attendance_ID;
        delete payload.Created_At;

        await row.update(payload);
        return res.status(200).json({ success: true, data: row });
    } catch (error) {
        console.error('updateAttendance error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update attendance',
            error: error.message
        });
    }
};

const getAttendanceSummaries = async (req, res) => {
    try {
        const { employeeId, year, month } = req.query;
        const where = {};
        if (employeeId) {
            const emp = await findEmployeeByParam(employeeId);
            if (!emp) {
                return res.status(404).json({ success: false, message: 'Employee not found' });
            }
            where.Employee_ID = emp.Employee_ID;
        }
        if (year) where.Year = parseInt(year, 10);
        if (month) where.Month = parseInt(month, 10);

        const rows = await AttendanceSummary.findAll({
            where,
            include: [
                {
                    model: Employee,
                    as: 'Employee',
                    attributes: ['Employee_ID', 'Employee_Code', 'Full_Name']
                }
            ],
            order: [
                ['Year', 'DESC'],
                ['Month', 'DESC']
            ]
        });

        return res.status(200).json({ success: true, count: rows.length, data: rows });
    } catch (error) {
        console.error('getAttendanceSummaries error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch summaries',
            error: error.message
        });
    }
};

const upsertAttendanceSummary = async (req, res) => {
    try {
        const {
            Employee_ID,
            employeeCode,
            Month,
            Year,
            Total_Working_Days,
            Present_Days,
            Absent_Days,
            Leave_Days,
            Half_Days,
            Late_Days,
            Total_Overtime_Hours,
            Attendance_Bonus_Eligible,
            Attendance_Bonus_Amount,
            Summary_Date
        } = req.body;

        let empId = Employee_ID;
        if (!empId && employeeCode) {
            const emp = await findEmployeeByParam(employeeCode);
            if (!emp) {
                return res.status(404).json({ success: false, message: 'Employee not found' });
            }
            empId = emp.Employee_ID;
        }

        if (!empId || !Month || !Year || !Total_Working_Days || !Summary_Date) {
            return res.status(400).json({
                success: false,
                message: 'Employee_ID, Month, Year, Total_Working_Days, Summary_Date are required'
            });
        }

        const summaryVals = {
            Total_Working_Days,
            Present_Days: Present_Days ?? 0,
            Absent_Days: Absent_Days ?? 0,
            Leave_Days: Leave_Days ?? 0,
            Half_Days: Half_Days ?? 0,
            Late_Days: Late_Days ?? 0,
            Total_Overtime_Hours: Total_Overtime_Hours ?? 0,
            Attendance_Bonus_Eligible: Attendance_Bonus_Eligible ?? false,
            Attendance_Bonus_Amount: Attendance_Bonus_Amount ?? 0,
            Summary_Date
        };

        let row = await AttendanceSummary.findOne({
            where: { Employee_ID: empId, Month, Year }
        });
        if (row) await row.update(summaryVals);
        else {
            row = await AttendanceSummary.create({
                Employee_ID: empId,
                Month,
                Year,
                ...summaryVals
            });
        }

        return res.status(200).json({ success: true, data: row });
    } catch (error) {
        console.error('upsertAttendanceSummary error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to save attendance summary',
            error: error.message
        });
    }
};

const deleteAttendance = async (req, res) => {
    try {
        const { attendanceId } = req.params;
        const row = await Attendance.findByPk(attendanceId);
        if (!row) {
            return res.status(404).json({ success: false, message: 'Attendance record not found' });
        }
        await row.destroy();
        return res.status(200).json({ success: true, message: 'Attendance record deleted' });
    } catch (error) {
        console.error('deleteAttendance error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete attendance',
            error: error.message
        });
    }
};

module.exports = {
    getAttendance,
    upsertAttendance,
    bulkAttendance,
    updateAttendance,
    getAttendanceSummaries,
    upsertAttendanceSummary,
    deleteAttendance
};
