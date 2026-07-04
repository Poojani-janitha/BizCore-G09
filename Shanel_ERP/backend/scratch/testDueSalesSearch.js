const { getDueSalesFixed } = require('../controllers/salesManagement/SalesManagementController_FIXED');

const req = {
    query: { page: 1, limit: 20, query: 'Priyanka' }
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
        console.log('Running test due sales search query for customer "Anusha"...');
        await getDueSalesFixed(req, res);
    } catch (err) {
        console.error('Test execution crashed:', err);
    }
    process.exit(0);
}

test();
