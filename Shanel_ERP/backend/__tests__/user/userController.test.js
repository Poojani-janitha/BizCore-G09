/**
 * ════════════════════════════════════════════════════════════
 *  TEST CASE ID  : SERP/TC/001
 *  Title         : Admin user successfully logs in
 *  Created By    : Prabashi Nuwani (TG/2022/1356)
 *  Date Created  : 20th April 2026
 *  Date Tested   : 20th April 2026
 *  Result        : Pass
 *
 *  Description:
 *    Admin user successfully logs in to the system and is
 *    redirected to the Admin Home Dashboard.
 *
 *  Prerequisites:
 *    1. System must be running (backend on port 5000, frontend on port 5173)
 *    2. Admin user account must exist in the database
 *
 *  Test Data:
 *    Email    = "admin@shanel.com"
 *    Password = "Admin@1234"
 *
 *  Test Scenario:
 *    Verify that an Admin user can log in with valid credentials
 *    and is redirected to the Admin Home Dashboard.
 * ════════════════════════════════════════════════════════════
 */

// ─── Mock models BEFORE importing the controller ────────────
jest.mock('../../models/index', () => ({
  User:             { findOne: jest.fn() },
  Module:           {},
  UserModuleAccess: { findAll: jest.fn() },
  UserToken:        { create: jest.fn() },
}));

jest.mock('../../config/db', () => ({
  transaction: jest.fn(),
}));

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash:    jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
}));

jest.mock('crypto', () => ({
  createHmac: jest.fn().mockReturnValue({
    update: jest.fn().mockReturnValue({
      digest: jest.fn().mockReturnValue('mocked_refresh_token'),
    }),
  }),
  randomBytes: jest.fn().mockReturnValue(Buffer.from('random')),
}));

// ─── Imports ─────────────────────────────────────────────────
const bcrypt   = require('bcrypt');
const jwt      = require('jsonwebtoken');
const { User, UserModuleAccess, UserToken } = require('../../models/index');
const sequelize = require('../../config/db');
const { loginUser } = require('../../controllers/user/userController');

// ─── Shared helpers ──────────────────────────────────────────

/** Creates a minimal mock res object */
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json   = jest.fn().mockReturnValue(res);
  return res;
};

/** Reusable mock DB transaction */
const mockTransaction = {
  commit:   jest.fn().mockResolvedValue(true),
  rollback: jest.fn().mockResolvedValue(true),
};

/** Active admin user returned by User.findOne */
const adminUser = {
  User_ID:               1,
  Username:              'admin@shanel.com',
  Password_Hash:         '$2b$12$hashedpassword',
  User_Type:             'Admin',
  Status:                'Active',
  Full_Name:             'Admin User',
  Failed_Login_Attempts: 0,
  Account_Locked_Until:  null,
  Last_Login:            null,
  update:                jest.fn().mockResolvedValue(true),
};

// ─── Setup ───────────────────────────────────────────────────
beforeEach(() => {
  jest.clearAllMocks();

  // Every test gets a fresh transaction
  sequelize.transaction.mockResolvedValue(mockTransaction);

  // JWT_SECRET must be present (controller throws without it)
  process.env.JWT_SECRET             = 'test_jwt_secret';
  process.env.REFRESH_TOKEN_SECRET   = 'test_refresh_secret';
});


// ════════════════════════════════════════════════════════════
//  TEST GROUP 1 — Positive Test Case (SERP/TC/001 Step-by-Step)
// ════════════════════════════════════════════════════════════
describe('SERP/TC/001 — Admin Login (Positive Test Case)', () => {

  // ── Step 1 & 2: Login page renders and credentials are accepted ──
  // (Covered in frontend test. Backend equivalent: controller receives
  //  valid credentials and authenticates successfully.)

  // ── Step 3: System authenticates and redirects ──────────────────
  test('Step 3 — returns 200 with access_token when valid admin credentials are submitted', async () => {
    // ARRANGE
    User.findOne.mockResolvedValue(adminUser);
    bcrypt.compare.mockResolvedValue(true);                     // password matches
    jwt.sign.mockReturnValue('mocked_access_token');
    bcrypt.hash.mockResolvedValue('hashed_refresh_token');
    UserModuleAccess.findAll.mockResolvedValue([]);              // no specific module restrictions
    UserToken.create.mockResolvedValue({});

    const req = {
      body: { username: 'admin@shanel.com', password: 'Admin@1234' },
      ip:      '127.0.0.1',
      headers: { 'user-agent': 'TestAgent/1.0' },
    };
    const res = mockRes();

    // ACT
    await loginUser(req, res);

    // ASSERT
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success:      true,
        access_token: 'mocked_access_token',
        user_type:    'Admin',
      })
    );
    expect(mockTransaction.commit).toHaveBeenCalled();
    expect(mockTransaction.rollback).not.toHaveBeenCalled();
  });

  // ── Step 4: Admin Home Dashboard is accessible ───────────────────
  test('Step 4 — response payload contains user_type "Admin" enabling dashboard redirect', async () => {
    // ARRANGE
    User.findOne.mockResolvedValue(adminUser);
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue('mocked_access_token');
    bcrypt.hash.mockResolvedValue('hashed_refresh_token');
    UserModuleAccess.findAll.mockResolvedValue([]);
    UserToken.create.mockResolvedValue({});

    const req = {
      body:    { username: 'admin@shanel.com', password: 'Admin@1234' },
      ip:      '127.0.0.1',
      headers: { 'user-agent': 'TestAgent/1.0' },
    };
    const res = mockRes();

    // ACT
    await loginUser(req, res);

    // ASSERT — The frontend uses user_type to pick the correct home route (/home → AdminHome)
    const responsePayload = res.json.mock.calls[0][0];
    expect(responsePayload.user_type).toBe('Admin');
    expect(responsePayload.access_token).toBeTruthy();
    expect(responsePayload.refresh_token).toBeTruthy();
    expect(responsePayload.full_name).toBe('Admin User');
  });

  // ── Full end-to-end assertion of all returned fields ────────────
  test('returns complete login response with all required fields', async () => {
    // ARRANGE
    User.findOne.mockResolvedValue(adminUser);
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue('mocked_access_token');
    bcrypt.hash.mockResolvedValue('hashed_refresh_token');
    UserModuleAccess.findAll.mockResolvedValue([]);
    UserToken.create.mockResolvedValue({});

    const req = {
      body:    { username: 'admin@shanel.com', password: 'Admin@1234' },
      ip:      '127.0.0.1',
      headers: { 'user-agent': 'TestAgent/1.0' },
    };
    const res = mockRes();

    // ACT
    await loginUser(req, res);

    // ASSERT
    const payload = res.json.mock.calls[0][0];
    expect(payload).toMatchObject({
      success:       true,
      access_token:  expect.any(String),
      refresh_token: expect.any(String),
      modules:       expect.any(Array),
      user_id:       1,
      username:      'admin@shanel.com',
      user_type:     'Admin',
      full_name:     'Admin User',
    });
  });

  // ── Failed_Login_Attempts is reset on success ────────────────────
  test('resets failed login attempts to 0 on successful login', async () => {
    // ARRANGE — simulate a user who previously had failed attempts
    const userWithAttempts = {
      ...adminUser,
      Failed_Login_Attempts: 3,
      update: jest.fn().mockResolvedValue(true),
    };
    User.findOne.mockResolvedValue(userWithAttempts);
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue('mocked_access_token');
    bcrypt.hash.mockResolvedValue('hashed_refresh_token');
    UserModuleAccess.findAll.mockResolvedValue([]);
    UserToken.create.mockResolvedValue({});

    const req = {
      body:    { username: 'admin@shanel.com', password: 'Admin@1234' },
      ip:      '127.0.0.1',
      headers: { 'user-agent': 'TestAgent/1.0' },
    };
    const res = mockRes();

    // ACT
    await loginUser(req, res);

    // ASSERT — update() was called to clear attempts and set Last_Login
    expect(userWithAttempts.update).toHaveBeenCalledWith(
      expect.objectContaining({ Failed_Login_Attempts: 0 }),
      expect.anything()
    );
  });

});


// ════════════════════════════════════════════════════════════
//  TEST GROUP 2 — Missing Credentials (Input Validation)
// ════════════════════════════════════════════════════════════
describe('SERP/TC/001 — Input Validation: Missing Credentials', () => {

  test('returns 400 when username is missing', async () => {
    const req = {
      body:    { username: '', password: 'Admin@1234' },
      ip:      '127.0.0.1',
      headers: {},
    };
    const res = mockRes();

    await loginUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
    expect(mockTransaction.rollback).toHaveBeenCalled();
  });

  test('returns 400 when password is missing', async () => {
    const req = {
      body:    { username: 'admin@shanel.com', password: '' },
      ip:      '127.0.0.1',
      headers: {},
    };
    const res = mockRes();

    await loginUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
  });

  test('returns 400 when both username and password are missing', async () => {
    const req = {
      body:    {},
      ip:      '127.0.0.1',
      headers: {},
    };
    const res = mockRes();

    await loginUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error:   'Username and password are required',
      })
    );
  });

});


// ════════════════════════════════════════════════════════════
//  TEST GROUP 3 — Invalid Credentials
// ════════════════════════════════════════════════════════════
describe('SERP/TC/001 — Invalid Credentials', () => {

  test('returns 401 when username does not exist in the system', async () => {
    // ARRANGE — no user found
    User.findOne.mockResolvedValue(null);

    const req = {
      body:    { username: 'unknown@shanel.com', password: 'Admin@1234' },
      ip:      '127.0.0.1',
      headers: {},
    };
    const res = mockRes();

    // ACT
    await loginUser(req, res);

    // ASSERT
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error:   'Invalid username or password',
      })
    );
    expect(mockTransaction.rollback).toHaveBeenCalled();
  });

  test('returns 401 when password is incorrect', async () => {
    // ARRANGE — user found but password does not match
    const userWithUpdate = { ...adminUser, update: jest.fn().mockResolvedValue(true) };
    User.findOne.mockResolvedValue(userWithUpdate);
    bcrypt.compare.mockResolvedValue(false);            // wrong password

    const req = {
      body:    { username: 'admin@shanel.com', password: 'WrongPassword' },
      ip:      '127.0.0.1',
      headers: {},
    };
    const res = mockRes();

    // ACT
    await loginUser(req, res);

    // ASSERT
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error:   'Invalid username or password',
      })
    );
  });

  test('increments Failed_Login_Attempts counter on wrong password', async () => {
    // ARRANGE
    const userWithAttempts = {
      ...adminUser,
      Failed_Login_Attempts: 1,
      update: jest.fn().mockResolvedValue(true),
    };
    User.findOne.mockResolvedValue(userWithAttempts);
    bcrypt.compare.mockResolvedValue(false);

    const req = {
      body:    { username: 'admin@shanel.com', password: 'WrongPassword' },
      ip:      '127.0.0.1',
      headers: {},
    };
    const res = mockRes();

    // ACT
    await loginUser(req, res);

    // ASSERT — attempts should be incremented to 2
    expect(userWithAttempts.update).toHaveBeenCalledWith(
      expect.objectContaining({ Failed_Login_Attempts: 2 }),
      expect.anything()
    );
  });

});


// ════════════════════════════════════════════════════════════
//  TEST GROUP 4 — Account Status Checks
// ════════════════════════════════════════════════════════════
describe('SERP/TC/001 — Account Status Checks', () => {

  test('returns 403 when admin account is Inactive', async () => {
    // ARRANGE
    const inactiveAdmin = { ...adminUser, Status: 'Inactive', update: jest.fn() };
    User.findOne.mockResolvedValue(inactiveAdmin);

    const req = {
      body:    { username: 'admin@shanel.com', password: 'Admin@1234' },
      ip:      '127.0.0.1',
      headers: {},
    };
    const res = mockRes();

    // ACT
    await loginUser(req, res);

    // ASSERT
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error:   'Account is inactive or suspended',
      })
    );
  });

  test('returns 403 when account is locked due to too many failed attempts', async () => {
    // ARRANGE — account locked until 15 min in future
    const lockedUser = {
      ...adminUser,
      Account_Locked_Until: new Date(Date.now() + 15 * 60 * 1000),
      update: jest.fn(),
    };
    User.findOne.mockResolvedValue(lockedUser);

    const req = {
      body:    { username: 'admin@shanel.com', password: 'Admin@1234' },
      ip:      '127.0.0.1',
      headers: {},
    };
    const res = mockRes();

    // ACT
    await loginUser(req, res);

    // ASSERT
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error:   'Account is locked. Try again later.',
      })
    );
  });

  test('locks account after 5 consecutive failed attempts', async () => {
    // ARRANGE — user already at 4 failed attempts
    const userAtLimit = {
      ...adminUser,
      Failed_Login_Attempts: 4,
      update: jest.fn().mockResolvedValue(true),
    };
    User.findOne.mockResolvedValue(userAtLimit);
    bcrypt.compare.mockResolvedValue(false);

    const req = {
      body:    { username: 'admin@shanel.com', password: 'WrongPassword' },
      ip:      '127.0.0.1',
      headers: {},
    };
    const res = mockRes();

    // ACT
    await loginUser(req, res);

    // ASSERT — update called with Account_Locked_Until set (not null)
    expect(userAtLimit.update).toHaveBeenCalledWith(
      expect.objectContaining({
        Failed_Login_Attempts: 5,
        Account_Locked_Until:  expect.any(Date),
      }),
      expect.anything()
    );
  });

});


// ════════════════════════════════════════════════════════════
//  TEST GROUP 5 — Token Generation
// ════════════════════════════════════════════════════════════
describe('SERP/TC/001 — Token Generation on Successful Login', () => {

  test('generates and stores a refresh token in UserToken table', async () => {
    // ARRANGE
    User.findOne.mockResolvedValue(adminUser);
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue('mocked_access_token');
    bcrypt.hash.mockResolvedValue('hashed_refresh_token');
    UserModuleAccess.findAll.mockResolvedValue([]);
    UserToken.create.mockResolvedValue({});

    const req = {
      body:    { username: 'admin@shanel.com', password: 'Admin@1234' },
      ip:      '192.168.1.10',
      headers: { 'user-agent': 'Mozilla/5.0' },
    };
    const res = mockRes();

    // ACT
    await loginUser(req, res);

    // ASSERT — a UserToken row is created with the correct user ID
    expect(UserToken.create).toHaveBeenCalledWith(
      expect.objectContaining({
        User_ID:     1,
        IP_Address:  '192.168.1.10',
        Device_Info: 'Mozilla/5.0',
      }),
      expect.anything()
    );
  });

  test('JWT access token is signed with correct user payload', async () => {
    // ARRANGE
    User.findOne.mockResolvedValue(adminUser);
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue('mocked_access_token');
    bcrypt.hash.mockResolvedValue('hashed_refresh_token');
    UserModuleAccess.findAll.mockResolvedValue([]);
    UserToken.create.mockResolvedValue({});

    const req = {
      body:    { username: 'admin@shanel.com', password: 'Admin@1234' },
      ip:      '127.0.0.1',
      headers: { 'user-agent': 'TestAgent' },
    };
    const res = mockRes();

    // ACT
    await loginUser(req, res);

    // ASSERT — jwt.sign called with correct sub, username, and user_type
    expect(jwt.sign).toHaveBeenCalledWith(
      expect.objectContaining({
        sub:       1,
        username:  'admin@shanel.com',
        user_type: 'Admin',
      }),
      'test_jwt_secret',
      expect.objectContaining({ expiresIn: '1h' })
    );
  });

});


// ════════════════════════════════════════════════════════════
//  TEST GROUP 6 — Server / DB Error Handling
// ════════════════════════════════════════════════════════════
describe('SERP/TC/001 — Server Error Handling', () => {

  test('returns 500 when database throws an unexpected error', async () => {
    // ARRANGE
    User.findOne.mockRejectedValue(new Error('DB connection lost'));

    const req = {
      body:    { username: 'admin@shanel.com', password: 'Admin@1234' },
      ip:      '127.0.0.1',
      headers: {},
    };
    const res = mockRes();

    // ACT
    await loginUser(req, res);

    // ASSERT
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
    expect(mockTransaction.rollback).toHaveBeenCalled();
  });

  test('returns 500 when JWT_SECRET environment variable is missing', async () => {
    // ARRANGE — remove the env variable
    delete process.env.JWT_SECRET;

    User.findOne.mockResolvedValue(adminUser);
    bcrypt.compare.mockResolvedValue(true);
    UserModuleAccess.findAll.mockResolvedValue([]);

    const req = {
      body:    { username: 'admin@shanel.com', password: 'Admin@1234' },
      ip:      '127.0.0.1',
      headers: {},
    };
    const res = mockRes();

    // ACT
    await loginUser(req, res);

    // ASSERT
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
  });

});
