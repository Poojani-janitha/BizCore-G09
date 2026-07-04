const { EmployeeLeave } = require('./models/index');

async function alterTable() {
    try {
        console.log("Altering EMPLOYEE_LEAVE table...");
        await EmployeeLeave.sync({ alter: true });
        console.log("Table altered successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Error altering table:", error);
        process.exit(1);
    }
}

alterTable();
