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

        // Normalize status for frontend consistency
        const normalizedRows = rows.map(row => {
            const data = row.toJSON();
            if (!data.Status) data.Status = 'Active';
            return data;
        });

        return res.status(200).json({
            success: true,
            count: normalizedRows.length,
            data: normalizedRows
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

// Helper function to validate all employee fields according to model
const validateEmployeeFields = async (payload) => {
    const errors = [];

    // REQUIRED FIELDS
    if (!payload.Full_Name || String(payload.Full_Name).trim() === '') {
        errors.push({ path: 'Full_Name', message: 'Full_Name is required and cannot be empty' });
    } else if (String(payload.Full_Name).length > 200) {
        errors.push({ path: 'Full_Name', message: 'Full_Name must not exceed 200 characters' });
    }

    if (!payload.Contact_Phone || String(payload.Contact_Phone).trim() === '') {
        errors.push({ path: 'Contact_Phone', message: 'Contact_Phone is required and cannot be empty' });
    } else if (!/^\d{7,20}$/.test(String(payload.Contact_Phone).replace(/\D/g, ''))) {
        errors.push({ path: 'Contact_Phone', message: 'Contact_Phone must be 7-20 digits' });
    }

    if (!payload.Hire_Date || String(payload.Hire_Date).trim() === '') {
        errors.push({ path: 'Hire_Date', message: 'Hire_Date is required and cannot be empty' });
    } else if (isNaN(new Date(payload.Hire_Date).getTime())) {
        errors.push({ path: 'Hire_Date', message: 'Hire_Date must be a valid date (YYYY-MM-DD)' });
    }

    if (!payload.Role || String(payload.Role).trim() === '') {
        errors.push({ path: 'Role', message: 'Role is required and cannot be empty' });
    } else if (String(payload.Role).length > 100) {
        errors.push({ path: 'Role', message: 'Role must not exceed 100 characters' });
    }

    if (!payload.Salary_Category || String(payload.Salary_Category).trim() === '') {
        errors.push({ path: 'Salary_Category', message: 'Salary_Category is required and cannot be empty' });
    } else if (!['Monthly_Fixed', 'Daily_Rate', 'Production_Based', 'Hybrid'].includes(payload.Salary_Category)) {
        errors.push({ 
            path: 'Salary_Category', 
            message: 'Salary_Category must be one of: Monthly_Fixed, Daily_Rate, Production_Based, Hybrid' 
        });
    }

    // ENUM FIELDS - Nullable but must be valid value if provided
    if (payload.Gender && payload.Gender !== '' && !['Male', 'Female', 'Other'].includes(payload.Gender)) {
        errors.push({ path: 'Gender', message: 'Gender must be one of: Male, Female, Other' });
    }

    if (payload.Marital_Status && payload.Marital_Status !== '' && !['Single', 'Married', 'Divorced', 'Widowed'].includes(payload.Marital_Status)) {
        errors.push({ path: 'Marital_Status', message: 'Marital_Status must be one of: Single, Married, Divorced, Widowed' });
    }

    if (payload.Employee_Type && payload.Employee_Type !== '' && !['Permanent', 'Contract', 'Casual', 'Intern'].includes(payload.Employee_Type)) {
        errors.push({ path: 'Employee_Type', message: 'Employee_Type must be one of: Permanent, Contract, Casual, Intern' });
    }

    if (payload.Status && payload.Status !== '' && !['Active', 'On_Leave', 'Suspended', 'Resigned', 'Terminated', 'Inactive'].includes(payload.Status)) {
        errors.push({ path: 'Status', message: 'Status must be one of: Active, On_Leave, Suspended, Resigned, Terminated, Inactive' });
    }

    // DATE FIELDS - Nullable but must be valid if provided
    const dateFields = ['Date_Of_Birth', 'Confirmation_Date', 'Resignation_Date', 'Termination_Date'];
    dateFields.forEach(field => {
        if (payload[field] && payload[field] !== '' && payload[field] !== 'Invalid date') {
            if (isNaN(new Date(payload[field]).getTime())) {
                errors.push({ path: field, message: `${field} must be a valid date (YYYY-MM-DD)` });
            }
        }
    });

    // OPTIONAL TEXT FIELDS - Length validation
    if (payload.NIC && String(payload.NIC).length > 20) {
        errors.push({ path: 'NIC', message: 'NIC must not exceed 20 characters' });
    }

    if (payload.Email && String(payload.Email).trim() !== '') {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.Email)) {
            errors.push({ path: 'Email', message: 'Email must be a valid email address' });
        } else if (String(payload.Email).length > 100) {
            errors.push({ path: 'Email', message: 'Email must not exceed 100 characters' });
        }
    }

    if (payload.Contact_Phone_2 && String(payload.Contact_Phone_2).trim() !== '') {
        if (!/^\d{7,20}$/.test(String(payload.Contact_Phone_2).replace(/\D/g, ''))) {
            errors.push({ path: 'Contact_Phone_2', message: 'Contact_Phone_2 must be 7-20 digits' });
        }
    }

    if (payload.Emergency_Contact_Phone && String(payload.Emergency_Contact_Phone).trim() !== '') {
        if (!/^\d{7,20}$/.test(String(payload.Emergency_Contact_Phone).replace(/\D/g, ''))) {
            errors.push({ path: 'Emergency_Contact_Phone', message: 'Emergency_Contact_Phone must be 7-20 digits' });
        }
    }

    // BOOLEAN FIELDS
    if (payload.EPF_Eligible !== undefined && payload.EPF_Eligible !== null) {
        if (!['Yes', 'No', true, false].includes(payload.EPF_Eligible)) {
            errors.push({ path: 'EPF_Eligible', message: 'EPF_Eligible must be Yes, No, true, or false' });
        }
    }

    if (payload.ETF_Eligible !== undefined && payload.ETF_Eligible !== null) {
        if (!['Yes', 'No', true, false].includes(payload.ETF_Eligible)) {
            errors.push({ path: 'ETF_Eligible', message: 'ETF_Eligible must be Yes, No, true, or false' });
        }
    }

    // UNIQUENESS CHECKS
    if (payload.NIC && payload.NIC !== '') {
        const existingNIC = await Employee.findOne({ where: { NIC: payload.NIC } });
        if (existingNIC) {
            errors.push({ path: 'NIC', message: 'NIC must be unique (already exists in database)' });
        }
    }

    if (payload.Email && String(payload.Email).trim() !== '') {
        const existingEmail = await Employee.findOne({ where: { Email: payload.Email } });
        if (existingEmail) {
            errors.push({ path: 'Email', message: 'Email must be unique (already exists in database)' });
        }
    }

    return errors;
};

const createEmployee = async (req, res) => {
    try {
        const payload = { ...req.body };
        console.log('🔄 CREATE EMPLOYEE - Incoming payload keys:', Object.keys(payload));

        // Step 1: Validate all fields according to model
        const validationErrors = await validateEmployeeFields(payload);
        if (validationErrors.length > 0) {
            console.log('⚠️  Validation failed with errors:', validationErrors);
            return res.status(400).json({
                success: false,
                message: 'Employee validation failed',
                validationErrors
            });
        }

        // Step 2: Remove fields not in the model
        delete payload.Department;
        delete payload.image;
        
        // Step 3: Clean and convert data types
        // Convert empty strings to null for date fields
        const dateFields = ['Hire_Date', 'Confirmation_Date', 'Date_Of_Birth', 'Resignation_Date', 'Termination_Date'];
        dateFields.forEach(field => {
            if (payload[field] === '' || payload[field] === 'Invalid date') {
                payload[field] = null;
            }
        });
        
        // Convert empty strings to null for ENUM fields
        const enumFields = ['Gender', 'Marital_Status', 'Employee_Type', 'Status'];
        enumFields.forEach(field => {
            if (payload[field] === '') {
                payload[field] = null;
            }
        });
        
        // Convert boolean-like strings to actual booleans
        if (payload.EPF_Eligible === 'Yes') payload.EPF_Eligible = true;
        if (payload.EPF_Eligible === 'No') payload.EPF_Eligible = false;
        if (payload.ETF_Eligible === 'Yes') payload.ETF_Eligible = true;
        if (payload.ETF_Eligible === 'No') payload.ETF_Eligible = false;
        
        console.log('📝 Cleaned payload, creating employee...');

        // Step 4: Create with a temporary code (required by the model's NOT NULL constraint)
        const tempCode = `PENDING-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        payload.Employee_Code = tempCode;

        const created = await Employee.create(payload);
        console.log('✅ Employee created with ID:', created.Employee_ID);

        // Step 5: Update with the real Employee_Code based on the generated ID
        const realCode = `EMP-${String(created.Employee_ID).padStart(3, '0')}`;
        await created.update({ Employee_Code: realCode });
        console.log('✅ Employee code updated to:', realCode);

        return res.status(201).json({ 
            success: true, 
            message: 'Employee created successfully',
            data: created 
        });
    } catch (error) {
        console.error('❌ createEmployee error:', error.message);
        if (error.errors) {
            console.error('🔍 Database validation errors:');
            error.errors.forEach(err => {
                console.error(`  - ${err.path}: ${err.message}`);
            });
        }
        return res.status(500).json({
            success: false,
            message: 'Failed to create employee',
            error: error.message,
            validationErrors: error.errors ? error.errors.map(e => ({ path: e.path, message: e.message })) : null
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

        // Force update using raw SQL with explicit ID to bypass any Sequelize instance issues
        await Employee.sequelize.query(
            'UPDATE EMPLOYEE SET Status = :status, Updated_At = :now WHERE Employee_ID = :id',
            {
                replacements: { 
                    status: Status, 
                    id: employee.Employee_ID, 
                    now: new Date() 
                },
                type: Employee.sequelize.QueryTypes.UPDATE
            }
        );

        return res.status(200).json({ 
            success: true, 
            message: `Employee status updated to ${Status}`
        });
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

        // Force update using raw query to ensure persistence
        await Employee.sequelize.query(
            'UPDATE EMPLOYEE SET Status = "Inactive", Updated_At = NOW() WHERE Employee_ID = :id',
            {
                replacements: { id: employee.Employee_ID },
                type: Employee.sequelize.QueryTypes.UPDATE
            }
        );

        return res.status(200).json({ 
            success: true, 
            message: 'Employee successfully marked as Inactive in database' 
        });
    } catch (error) {
        console.error('deleteEmployee error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to deactivate employee',
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
