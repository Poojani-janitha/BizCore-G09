const axios = require('axios');

async function testPayroll() {
    try {
        const selectedMonth = '2026-05';
        const [year, month] = selectedMonth.split('-');
        const firstDay = `${year}-${month}-01`;
        const lastDay = new Date(year, month, 0).toISOString().split('T')[0];

        const [empRes, payRes, attRes] = await Promise.all([
            axios.get(`http://localhost:5000/api/hr/employees`, { params: { status: 'Active' } }),
            axios.get(`http://localhost:5000/api/hr/payroll`, { params: { month, year } }),
            axios.get(`http://localhost:5000/api/hr/attendance`, { params: { from: firstDay, to: lastDay } })
        ]);

        const employees = empRes.data.data;
        const attendances = attRes.data.data;
        
        console.log(`Employees: ${employees.length}, Attendances: ${attendances.length}`);
        
        const statsMap = {};
        attendances.forEach(att => {
            const id = att.Employee_ID;
            if (!statsMap[id]) statsMap[id] = { daysWorked: 0, totalOtHours: 0, totalTeaCost: 0, totalCards: 0 };

            if (att.Status === 'Present') {
                statsMap[id].daysWorked += 1;
                statsMap[id].totalOtHours += parseFloat(att.Overtime_Hours || 0);
                
                // TEA COST LOGIC
                let teaCost = 0;
                const role = att.Employee?.Role || 'Staff';
                if (att.Check_In_Time && att.Check_Out_Time && !role.toLowerCase().includes('cashier')) {
                    const [inH, inM] = att.Check_In_Time.split(':').map(Number);
                    const [outH, outM] = att.Check_Out_Time.split(':').map(Number);
                    const workedHours = ((outH * 60 + outM) - (inH * 60 + inM)) / 60;
                    if (workedHours >= 4) {
                        const outMinutes = outH * 60 + outM;
                        teaCost = outMinutes > (18 * 60) ? 450 : 60;
                    }
                }
                statsMap[id].totalTeaCost += teaCost;
                statsMap[id].totalCards += parseInt(att.Cards_Produced || 0);
            }
        });

        const emp1 = employees.find(e => e.Employee_ID === 1);
        if (emp1) {
            console.log(`Emp 1 stats:`, statsMap[1]);
        }
        
    } catch (e) {
        console.error(e.message);
    }
}
testPayroll();
