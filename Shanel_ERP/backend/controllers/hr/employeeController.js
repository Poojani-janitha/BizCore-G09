const path = require('path');
const {
    Employee,
    EmployeeDocument,
    User
} = require('../../models/index');
const { Op } = require('sequelize');
const { findEmployeeByParam } = require('../../utils/hrEmployeeLookup');

const getEmployees = async (req, res) => {
    try {
        const { department, status, search } = req.query;
        const where = {};
        if (department) where.Department = department;
        if (status) where.Status = status;
        if (search && String(search).trim()) {
            const q = `%${String(search).trim()}%`;
            where[Op.or] = [
                { Full_Name: { [Op.like]: q } },
                { Employee_Code: { [Op.like]: q } },
                { NIC: { [Op.like]: q } },
                { Contact_Phone: { [Op.like]: q } },
                { Email: { [Op.like]: q } }
            ];
        }

        const rows = await Employee.findAll({
            where,
            order: [['Full_Name', 'ASC']]
        });

        return res.status(200).json({
            success: true,
            count: rows.length,
            data: rows
        });
    } catch (error) {
        console.error('getEmployees error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch employees',
            error: error.message
        });
    }
};

const getEmployeeById = async (req, res) => {
    try {
        const employee = await findEmployeeByParam(req.params.employeeId);
        if (!employee) {
            return res.status(404).json({ success: false, message: 'Employee not found' });
        }

        const linkedUser = await User.findOne({
            where: { Employee_ID: employee.Employee_ID },
            attributes: ['User_ID', 'Username', 'Email', 'User_Type', 'Status']
        });

        return res.status(200).json({
            success: true,
            data: employee,
            linkedUser
        });
    } catch (error) {
        console.error('getEmployeeById error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch employee',
            error: error.message
        });
    }
};

const createEmployee = async (req, res) => {
    try {
        const payload = { ...req.body };

        if (!payload.Full_Name || !payload.Contact_Phone || !payload.Hire_Date || !payload.Role || !payload.Department || !payload.Salary_Category) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: Full_Name, Contact_Phone, Hire_Date, Role, Department, Salary_Category'
            });
        }

        // 1. Create with a temporary code (required by the model's NOT NULL constraint)
        const tempCode = `PENDING-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        payload.Employee_Code = tempCode;

        const created = await Employee.create(payload);

        // 2. Immediately update with the real code based on the generated Employee_ID
        // We use padStart(3, '0') to maintain the EMP-023 format
        const realCode = `EMP-${String(created.Employee_ID).padStart(3, '0')}`;
        await created.update({ Employee_Code: realCode });

        return res.status(201).json({ success: true, data: created });
    } catch (error) {
        console.error('createEmployee error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to create employee',
            error: error.message
        });
    }
};

const updateEmployee = async (req, res) => {
    try {
        const employee = await findEmployeeByParam(req.params.employeeId);
        if (!employee) {
            return res.status(404).json({ success: false, message: 'Employee not found' });
        }

        const immutable = ['Employee_ID', 'Created_At'];
        const payload = { ...req.body };
        immutable.forEach((k) => delete payload[k]);

        await employee.update(payload);
        return res.status(200).json({ success: true, data: employee });
    } catch (error) {
        console.error('updateEmployee error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update employee',
            error: error.message
        });
    }
};

const updateEmployeeStatus = async (req, res) => {
    try {
        const { Status } = req.body;
        if (!Status) {
            return res.status(400).json({ success: false, message: 'Status is required' });
        }

        const employee = await findEmployeeByParam(req.params.employeeId);
        if (!employee) {
            return res.status(404).json({ success: false, message: 'Employee not found' });
        }

        await employee.update({ Status });
        return res.status(200).json({ success: true, data: employee });
    } catch (error) {
        console.error('updateEmployeeStatus error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update status',
            error: error.message
        });
    }
};

const linkUserToEmployee = async (req, res) => {
    try {
        const { User_ID } = req.body;
        if (!User_ID) {
            return res.status(400).json({ success: false, message: 'User_ID is required' });
        }

        const employee = await findEmployeeByParam(req.params.employeeId);
        if (!employee) {
            return res.status(404).json({ success: false, message: 'Employee not found' });
        }

        const user = await User.findByPk(User_ID);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        await user.update({ Employee_ID: employee.Employee_ID });
        return res.status(200).json({ success: true, message: 'User linked to employee', data: user });
    } catch (error) {
        console.error('linkUserToEmployee error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to link user',
            error: error.message
        });
    }
};

const getEmployeeDocuments = async (req, res) => {
    try {
        const employee = await findEmployeeByParam(req.params.employeeId);
        if (!employee) {
            return res.status(404).json({ success: false, message: 'Employee not found' });
        }

        const docs = await EmployeeDocument.findAll({
            where: { Employee_ID: employee.Employee_ID },
            order: [['Created_At', 'DESC']]
        });

        return res.status(200).json({ success: true, count: docs.length, data: docs });
    } catch (error) {
        console.error('getEmployeeDocuments error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch documents',
            error: error.message
        });
    }
};

const addEmployeeDocument = async (req, res) => {
    try {
        const employee = await findEmployeeByParam(req.params.employeeId);
        if (!employee) {
            return res.status(404).json({ success: false, message: 'Employee not found' });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'File is required' });
        }

        const {
            Document_Type,
            Document_Name,
            Upload_Date,
            Expiry_Date,
            Notes,
            Uploaded_By
        } = req.body;

        if (!Document_Type || !Document_Name) {
            return res.status(400).json({
                success: false,
                message: 'Document_Type and Document_Name are required'
            });
        }

        const relativePath = path.join('hr-documents', req.file.filename);
        const doc = await EmployeeDocument.create({
            Employee_ID: employee.Employee_ID,
            Document_Type,
            Document_Name,
            File_Path: relativePath.replace(/\\/g, '/'),
            File_Size: req.file.size,
            Upload_Date: Upload_Date || null,
            Expiry_Date: Expiry_Date || null,
            Notes: Notes || null,
            Uploaded_By: Uploaded_By ? parseInt(Uploaded_By, 10) : null
        });

        return res.status(201).json({ success: true, data: doc });
    } catch (error) {
        console.error('addEmployeeDocument error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to upload document',
            error: error.message
        });
    }
};

const deleteEmployeeDocument = async (req, res) => {
    try {
        const doc = await EmployeeDocument.findByPk(req.params.documentId);
        if (!doc) {
            return res.status(404).json({ success: false, message: 'Document not found' });
        }

        await doc.destroy();
        return res.status(200).json({ success: true, message: 'Document removed' });
    } catch (error) {
        console.error('deleteEmployeeDocument error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete document',
            error: error.message
        });
    }
};

const deleteEmployee = async (req, res) => {
    try {
        const employee = await findEmployeeByParam(req.params.employeeId);
        if (!employee) {
            return res.status(404).json({ success: false, message: 'Employee not found' });
        }

        // Unlink any user account before delete to avoid FK issues and stale link.
        await User.update(
            { Employee_ID: null },
            { where: { Employee_ID: employee.Employee_ID } }
        );

        await employee.destroy();
        return res.status(200).json({ success: true, message: 'Employee deleted successfully' });
    } catch (error) {
        console.error('deleteEmployee error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete employee',
            error: error.message
        });
    }
};

module.exports = {
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
};
