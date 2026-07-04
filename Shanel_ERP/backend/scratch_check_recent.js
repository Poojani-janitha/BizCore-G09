const { Attendance } = require('./models/index');

async function checkRecent() {
    try {
        const rows = await Attendance.findAll({
            limit: 5,
            order: [['Updated_At', 'DESC']]
        });
        console.log("Most recent updates:");
        rows.forEach(r => {
            console.log(r.toJSON());
        });
    } catch (e) {
        console.error(e);
    }
}
checkRecent();
