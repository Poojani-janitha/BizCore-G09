const axios = require('axios');

async function testAttendance() {
    try {
        const payload = {
            records: [
                {
                    Employee_ID: 1,
                    Attendance_Date: new Date().toISOString().split('T')[0],
                    Check_In_Time: '08:00',
                    Check_Out_Time: '17:00',
                    Total_Hours: 9,
                    Status: 'Present',
                    Is_Late: false,
                    Late_Minutes: 0,
                    Is_Overtime: false,
                    Overtime_Hours: 0,
                    Marked_By: 'Manual'
                }
            ]
        };
        const response = await axios.post('http://localhost:5000/api/hr/attendance/bulk', payload);
        console.log(response.data);
    } catch (error) {
        console.error(error.response ? error.response.data : error.message);
    }
}

testAttendance();
