// Mock all the models BEFORE importing the controller
jest.mock('../../models/index', () => ({
  Product: { findAll: jest.fn() },
  UnitConversion: { findAll: jest.fn(), findOne: jest.fn() },
  Sale: { findOne: jest.fn(), create: jest.fn(), findAll: jest.fn() },
  Inventory: { findOne: jest.fn() },
  Customer: { findByPk: jest.fn() },
  Payment: { create: jest.fn() },
  SaleItem: { bulkCreate: jest.fn() },
  CreditTranscation: { create: jest.fn() },
  StockMovement: { create: jest.fn() },
}));

jest.mock('../../config/db', () => ({
  transaction: jest.fn()
}));

jest.mock('sequelize', () => ({
  Op: {
    like: 'like',
    or: 'or',
    gte: 'gte'
  },
  where: jest.fn()
}));

// Import all required models (these will be the mocked versions)
const { 
  Product, 
  Sale, 
  Inventory, 
  UnitConversion, 
  Customer,
  Payment,
  SaleItem,
  CreditTranscation,
  StockMovement
} = require('../../models/index');

const sequelize = require('../../config/db');

const {
  searchProducts,
  allUnits,
  generateInvoiceNo,
  getProductQuntity,
  getAllSales,
  updateBillPrintStatus,
  postSalesData
} = require('../../controllers/sales/SalesController');

// ─── Helper: fake req and res ───────────────────────────────
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

// ════════════════════════════════════════════════
// TEST GROUP 1: searchProducts
// ════════════════════════════════════════════════
describe('searchProducts', () => {

  test('returns empty array when query is empty', async () => {
    const req = { query: { q: '' } };
    const res = mockRes();

    await searchProducts(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      products: []
    }));
  });

  test('returns products when searched by English name', async () => {

    // Mock the Product data
    Product.findAll.mockResolvedValue([
      {
        P_ID: 1, P_Name: 'Rice', P_Code: 'R001', P_Type: 'Grocery',
        Base_Unit: 'kg', Status: 'Active', Cost_Price: '100',
        Retail_Price: '120', Wholesale_Price: '110',
        Min_Stock: '5', Tax_Rate: '0', Image_Path: null
      }
    ]);

    const req = { query: { q: 'Rice' } };
    const res = mockRes();

    await searchProducts(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      count: 1
    }));
  });

  test('returns 500 on database error', async () => {
    Product.findAll.mockRejectedValue(new Error('DB connection failed'));

    const req = { query: { q: 'Rice' } };
    const res = mockRes();

    await searchProducts(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false
    }));
  });

});

// ════════════════════════════════════════════════
// TEST GROUP 2: generateInvoiceNo
// ════════════════════════════════════════════════
describe('generateInvoiceNo', () => {

  test('generates INV-YYYY-000001 when no previous sales', async () => {
    Sale.findOne.mockResolvedValue(null);

    const req = {};
    const res = mockRes();

    await generateInvoiceNo(req, res);

    const currentYear = new Date().getFullYear();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      invoiceNo: `INV-${currentYear}-000001`
    }));
  });

  test('increments invoice number from last sale', async () => {
    const currentYear = new Date().getFullYear();
    Sale.findOne.mockResolvedValue({ Invoice_No: `INV-${currentYear}-000005` });

    const req = {};
    const res = mockRes();

    await generateInvoiceNo(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      invoiceNo: `INV-${currentYear}-000006`
    }));
  });

});

// ════════════════════════════════════════════════
// TEST GROUP 3: getProductQuntity
// ════════════════════════════════════════════════
describe('getProductQuntity', () => {

  test('returns combined shop and production quantity', async () => {
    Inventory.findOne
      .mockResolvedValueOnce({ Qty: '50' })
      .mockResolvedValueOnce({ Qty: '30' });

    const req = { params: { productId: '1' } };
    const res = mockRes();

    await getProductQuntity(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      shopQty: 50,
      productionQty: 30,
      totalQty: 80
    }));
  });

  test('returns 0 when product not in inventory', async () => {
    Inventory.findOne.mockResolvedValue(null);

    const req = { params: { productId: '999' } };
    const res = mockRes();

    await getProductQuntity(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      totalQty: 0
    }));
  });

});

// ════════════════════════════════════════════════
// TEST GROUP 4: updateBillPrintStatus
// ════════════════════════════════════════════════
describe('updateBillPrintStatus', () => {

  test('returns 400 if no invoiceNo provided', async () => {
    const req = { params: {}, body: { printed: true } };
    const res = mockRes();

    await updateBillPrintStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('returns 404 if sale not found', async () => {
    Sale.findOne.mockResolvedValue(null);

    const req = { params: { invoiceNo: 'INV-2025-000099' }, body: { printed: true } };
    const res = mockRes();

    await updateBillPrintStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('updates bill print status successfully', async () => {
    const mockSale = {
      Bill_Print_Count: 0,
      First_Print_Date: null,
      update: jest.fn().mockResolvedValue(true)
    };
    Sale.findOne.mockResolvedValue(mockSale);

    const req = { params: { invoiceNo: 'INV-2025-000001' }, body: { printed: true } };
    const res = mockRes();

    await updateBillPrintStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(mockSale.update).toHaveBeenCalled();
  });

});

// ════════════════════════════════════════════════
// TEST GROUP 5: postSalesData
// ════════════════════════════════════════════════

// ── Reusable fake data ──────────────────────────

const mockTransaction = {
  commit: jest.fn().mockResolvedValue(true),
  rollback: jest.fn().mockResolvedValue(true),
};

// A minimal valid request body — used as base for all tests
const validBody = () => ({
  customer: { c_id: 1 },
  items: [
    {
      p_id: 10,
      p_name: 'Rice',
      p_code: 'R001',
      p_unit: 'kg',
      quntity: 2,
      unit_price: 100,
      discount: 0,
      subTotal: 200,
      tax: 0,
      taxAmount: 0,
      total: 200,
    }
  ],
  invoiceDetails: {
    invoiceNo: 'INV-2026-000001',
    invoiceDate: '2026-05-13',
    invoiceTime: '10:00:00',
    finalTotal: 200,
    subTotal: 200,
    discountPercentage: 0,
    discountAmount: 0,
    taxTotal: 0,
    location: 'Shop'
  },
  paymentDetails: {
    Payment_Method: 'Cash',
    Payment_Amount: 200,
    Cash_Tendered: 200,
    Applied_Value: 200,
    Change: 0,
    Credit_Amount: 0,
    Keep_Balance: false
  },
  saleType: 'Retail',
  priceLevel: 'Retail',
  location: 'Shop'
});

// A fake customer object returned by Customer.findByPk
const mockCustomer = () => ({
  Current_Balance: '0',
  update: jest.fn().mockResolvedValue(true)
});

// A fake inventory record
const mockInventory = () => ({
  Qty: '100',
  decrement: jest.fn().mockResolvedValue(true)
});

// A fake sale record created by Sale.create
const mockSale = () => ({
  Sale_Id: 1,
  Invoice_No: 'INV-2026-000001'
});

// A fake unit conversion record
const mockUnit = () => ({
  U_ID: 1,
  Unit_Conversion: '1',
  Is_Base_Unit: true
});

// ── Setup: reset all mocks before each test ─────
beforeEach(() => {
  jest.clearAllMocks();
  sequelize.transaction.mockResolvedValue(mockTransaction);
});

describe('postSalesData', () => {

  // ─────────────────────────────────────────────
  // TEST 1: No authenticated user → 401
  // ─────────────────────────────────────────────
  test('returns 401 if no authenticated user', async () => {
    const req = {
      body: validBody(),
      user: null
    };
    const res = mockRes();

    await postSalesData(req, res);

    expect(mockTransaction.rollback).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: 'Authenticated user id is required'
    }));
  });

  // ─────────────────────────────────────────────
  // TEST 2: No customer data → 400
  // ─────────────────────────────────────────────
  test('returns 400 if customer data is missing', async () => {
    const body = validBody();
    body.customer = null;

    const req = { body, user: { sub: 'user-123' } };
    const res = mockRes();

    await postSalesData(req, res);

    expect(mockTransaction.rollback).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Customer data is required'
    }));
  });

  // ─────────────────────────────────────────────
  // TEST 3: Empty cart → 400
  // ─────────────────────────────────────────────
  test('returns 400 if cart is empty', async () => {
    const body = validBody();
    body.items = [];

    const req = { body, user: { sub: 'user-123' } };
    const res = mockRes();

    await postSalesData(req, res);

    expect(mockTransaction.rollback).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Cart cannot be empty'
    }));
  });

  // ─────────────────────────────────────────────
  // TEST 4: Customer not found in DB → 500
  // ─────────────────────────────────────────────
  test('returns 500 if customer not found in DB', async () => {
    Sale.create.mockResolvedValue(mockSale());
    Payment.create.mockResolvedValue({ Pay_ID: 1 });
    Customer.findByPk.mockResolvedValue(null);

    const req = { body: validBody(), user: { sub: 'user-123' } };
    const res = mockRes();

    await postSalesData(req, res);

    expect(mockTransaction.rollback).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Customer profile not found'
    }));
  });

  // ─────────────────────────────────────────────
  // TEST 5: Item not found in inventory → 500
  // ─────────────────────────────────────────────
  test('returns 500 if item not found in inventory', async () => {
    Sale.create.mockResolvedValue(mockSale());
    Payment.create.mockResolvedValue({ Pay_ID: 1 });
    Customer.findByPk.mockResolvedValue(mockCustomer());
    UnitConversion.findOne.mockResolvedValue(mockUnit());
    Inventory.findOne.mockResolvedValue(null);

    const req = { body: validBody(), user: { sub: 'user-123' } };
    const res = mockRes();

    await postSalesData(req, res);

    expect(mockTransaction.rollback).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: expect.stringContaining('not found in Shop inventory')
    }));
  });

  // ─────────────────────────────────────────────
  // TEST 6: Insufficient stock → 500
  // ─────────────────────────────────────────────
  test('returns 500 if insufficient stock', async () => {
    Sale.create.mockResolvedValue(mockSale());
    Payment.create.mockResolvedValue({ Pay_ID: 1 });
    Customer.findByPk.mockResolvedValue(mockCustomer());
    UnitConversion.findOne.mockResolvedValue(mockUnit());
    Inventory.findOne.mockResolvedValue({ Qty: '1', decrement: jest.fn() });

    const req = { body: validBody(), user: { sub: 'user-123' } };
    const res = mockRes();

    await postSalesData(req, res);

    expect(mockTransaction.rollback).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: expect.stringContaining('Insufficient stock')
    }));
  });

  // ─────────────────────────────────────────────
  // TEST 7: ✅ Fully paid cash sale — SUCCESS
  // ─────────────────────────────────────────────
  test('processes a fully paid cash sale successfully', async () => {
    Sale.create.mockResolvedValue(mockSale());
    Payment.create.mockResolvedValue({ Pay_ID: 1 });
    Customer.findByPk.mockResolvedValue(mockCustomer());
    UnitConversion.findOne.mockResolvedValue(mockUnit());
    Inventory.findOne.mockResolvedValue(mockInventory());
    StockMovement.create.mockResolvedValue({});
    SaleItem.bulkCreate.mockResolvedValue([]);

    const req = { body: validBody(), user: { sub: 'user-123' } };
    const res = mockRes();

    await postSalesData(req, res);

    expect(mockTransaction.commit).toHaveBeenCalled();
    expect(mockTransaction.rollback).not.toHaveBeenCalled();

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      message: 'Sale processed successfully',
      invoiceNo: 'INV-2026-000001'
    }));
  });

  // ─────────────────────────────────────────────
  // TEST 8: ✅ Partially paid sale
  // ─────────────────────────────────────────────
  test('sets payment status to Partially_Paid when underpaid', async () => {
    const body = validBody();
    body.paymentDetails.Payment_Amount = 100;

    Sale.create.mockImplementation(async (data) => {
      expect(data.Payment_Status).toBe('Partially_Paid');
      expect(data.Balance_Due).toBe(100);
      return mockSale();
    });

    Payment.create.mockResolvedValue({ Pay_ID: 1 });
    Customer.findByPk.mockResolvedValue(mockCustomer());
    UnitConversion.findOne.mockResolvedValue(mockUnit());
    Inventory.findOne.mockResolvedValue(mockInventory());
    StockMovement.create.mockResolvedValue({});
    SaleItem.bulkCreate.mockResolvedValue([]);

    const req = { body, user: { sub: 'user-123' } };
    const res = mockRes();

    await postSalesData(req, res);

    expect(mockTransaction.commit).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  // ─────────────────────────────────────────────
  // TEST 9: ✅ Unpaid sale
  // ─────────────────────────────────────────────
  test('sets payment status to Unpaid when nothing paid', async () => {
    const body = validBody();
    body.paymentDetails.Payment_Amount = 0;

    Sale.create.mockImplementation(async (data) => {
      expect(data.Payment_Status).toBe('Unpaid');
      expect(data.Balance_Due).toBe(200);
      return mockSale();
    });

    Payment.create.mockResolvedValue({ Pay_ID: 1 });
    Customer.findByPk.mockResolvedValue(mockCustomer());
    UnitConversion.findOne.mockResolvedValue(mockUnit());
    Inventory.findOne.mockResolvedValue(mockInventory());
    StockMovement.create.mockResolvedValue({});
    SaleItem.bulkCreate.mockResolvedValue([]);

    const req = { body, user: { sub: 'user-123' } };
    const res = mockRes();

    await postSalesData(req, res);

    expect(mockTransaction.commit).toHaveBeenCalled();
  });

  // ─────────────────────────────────────────────
  // TEST 10: ✅ Credit taken scenario
  // ─────────────────────────────────────────────
  test('creates credit transaction when credit is taken', async () => {
    const body = validBody();
    body.paymentDetails.Credit_Amount = 200;
    body.paymentDetails.Payment_Amount = 0;

    const customer = mockCustomer();
    Sale.create.mockResolvedValue(mockSale());
    Payment.create.mockResolvedValue({ Pay_ID: 1 });
    Customer.findByPk.mockResolvedValue(customer);
    CreditTranscation.create.mockResolvedValue({});
    UnitConversion.findOne.mockResolvedValue(mockUnit());
    Inventory.findOne.mockResolvedValue(mockInventory());
    StockMovement.create.mockResolvedValue({});
    SaleItem.bulkCreate.mockResolvedValue([]);

    const req = { body, user: { sub: 'user-123' } };
    const res = mockRes();

    await postSalesData(req, res);

    expect(CreditTranscation.create).toHaveBeenCalledWith(
      expect.objectContaining({
        Transaction_Type: 'Credit_Taken',
        Amount: 200
      }),
      expect.anything()
    );

    expect(customer.update).toHaveBeenCalledWith(
      { Current_Balance: 200 },
      expect.anything()
    );

    expect(mockTransaction.commit).toHaveBeenCalled();
  });

  // ─────────────────────────────────────────────
  // TEST 11: ✅ Overpayment with Keep Balance
  // ─────────────────────────────────────────────
  test('handles overpayment with Keep_Balance correctly', async () => {
    const body = validBody();
    body.paymentDetails.Payment_Amount = 300;
    body.paymentDetails.Keep_Balance = true;

    const customer = mockCustomer();
    Sale.create.mockResolvedValue(mockSale());
    Payment.create.mockResolvedValue({ Pay_ID: 1 });
    Customer.findByPk.mockResolvedValue(customer);
    CreditTranscation.create.mockResolvedValue({});
    UnitConversion.findOne.mockResolvedValue(mockUnit());
    Inventory.findOne.mockResolvedValue(mockInventory());
    StockMovement.create.mockResolvedValue({});
    SaleItem.bulkCreate.mockResolvedValue([]);

    const req = { body, user: { sub: 'user-123' } };
    const res = mockRes();

    await postSalesData(req, res);

    expect(CreditTranscation.create).toHaveBeenCalledWith(
      expect.objectContaining({
        Transaction_Type: 'Credit_Paid',
        Amount: 100
      }),
      expect.anything()
    );

    expect(customer.update).toHaveBeenCalledWith(
      { Current_Balance: -100 },
      expect.anything()
    );

    expect(mockTransaction.commit).toHaveBeenCalled();
  });

});