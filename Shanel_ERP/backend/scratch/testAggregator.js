const { getSalesDashboardAggregator } = require('../controllers/salesManagement/SalesManagementController_FIXED');

const req = {
    query: { period: 'thisMonth', trendType: 'daily' }
};

const res = {
    status(code) {
        console.log('Status code:', code);
        return this;
    },
    json(data) {
        console.log('Response JSON:', JSON.stringify(data, null, 2));
        return this;
    }
};

async function test() {
    try {
        await getSalesDashboardAggregator(req, res);
    } catch (err) {
        console.error('Aggregator execution crashed:', err);
    }
    process.exit(0);
}

test();
