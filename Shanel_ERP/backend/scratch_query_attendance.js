const { Attendance } = require('./models/index');

async function testQuery() {
    try {
        const rows = await Attendance.findAll();
        console.log("Total attendance rows:", rows.length);
        if (rows.length > 0) {
            console.log("Sample:", rows[rows.length - 1].toJSON());
        }
    } catch (error) {
        console.error(error);
    }
}

testQuery();
