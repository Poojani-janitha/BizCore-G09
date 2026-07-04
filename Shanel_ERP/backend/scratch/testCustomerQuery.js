const { getCustomersPaginated } = require('../controllers/customer/CustomerController');

const req = {
    query: { page: 1, limit: 20 }
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
        console.log('Running test query...');
        await getCustomersPaginated(req, res);
    } catch (err) {
        console.error('Test execution crashed:', err);
    }
    process.exit(0);
}

test();
