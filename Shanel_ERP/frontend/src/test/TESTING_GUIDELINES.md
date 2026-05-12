# Testing Guidelines for BizCore / Shanel ERP

## Purpose
This document explains how to write, organize, and review test cases for the full project.
It is meant to help the team keep frontend and backend behavior stable while the ERP system keeps growing.

## Current Testing Status
At the moment, the project does not have a complete automated test setup.
- Frontend does not yet include a test runner script.
- Backend still uses the default placeholder test script.

That means this guide is both a working standard and a setup plan for the team.

## Recommended Test Stack
### Frontend
Use:
- Vitest
- React Testing Library
- @testing-library/jest-dom
- MSW for API mocking if needed

Use frontend tests for:
- Component rendering
- User interactions
- Conditional UI
- Form validation
- API call handling at component level

### Backend
Use:
- Jest
- Supertest
- A test database or isolated mock database
- Mocked Sequelize or mocked service functions when unit testing logic

Use backend tests for:
- API endpoints
- Validation rules
- Database writes and reads
- Error handling
- Authentication and authorization

## What We Should Test
We should test behavior, not implementation details.

Good test targets:
- A button opens the correct modal
- A dropdown only shows valid items
- A form blocks invalid values
- A table shows the correct filtered rows
- An API returns the expected response
- A production stage changes correctly after update

Avoid tests that are too fragile:
- CSS-only checks unless the layout is critical
- Internal state checks when visible behavior is enough
- Snapshot-heavy tests for complex dynamic pages

## Test Levels
### 1. Unit Tests
Test one function, one rule, or one small component behavior.
Examples:
- Stock status calculation
- Filtering logic
- Validation helper functions
- Barcode generation rules

### 2. Component Tests
Test one React component in isolation.
Examples:
- Product modal renders correct fields
- Production modal shows only allowed products
- Search bar filters rows
- Stage badge shows the correct label

### 3. Integration Tests
Test how multiple parts work together.
Examples:
- Submit product form and refresh list
- Start a production batch and update the table
- Add stock and confirm the list updates

### 4. API Tests
Test backend routes directly.
Examples:
- GET products returns valid data
- POST production start saves a batch
- PUT update quantity changes stock correctly
- DELETE product removes the record

### 5. End-to-End Tests
Optional, but valuable for critical business flows.
Examples:
- Login
- Create product
- Start production batch
- Update stock
- Complete approval flow

## How to Write a Test Case
A good test case should always have:
- Title
- Goal
- Input data
- Steps or action
- Expected result

Simple format:
- Arrange: set up data
- Act: trigger the action
- Assert: check the result

Example:
- Arrange a production modal with mocked API data
- Act open the modal
- Assert only valid products are visible in the dropdown

## Naming Convention
Use clear names that describe the user behavior.

Good names:
- should show only company products in production dropdown
- should display Start for newly created production batch
- should block saving when quantity is zero
- should open add product modal when Add New Product is clicked

Bad names:
- test1
- modal check
- inventory stuff

## Folder Structure Suggestion
A clean structure helps the team find tests quickly.

### Frontend Example
- `src/__tests__/`
- `src/components/__tests__/`
- `src/pages/Inventory/__tests__/`
- `src/component/Inventory/Production/__tests__/`

### Backend Example
- `tests/`
- `tests/routes/`
- `tests/controllers/`
- `tests/models/`

## Frontend Testing Rules
### 1. Test visible behavior
If the user can see it or click it, it is a good test target.

Examples:
- Search input filters table rows
- Company filter tabs switch the shown products
- Production modal only loads valid items
- Stage badge changes when status changes

### 2. Mock API calls
Do not call the real backend in normal component tests.
Mock axios or use MSW.

### 3. Keep tests small
One test should usually check one behavior.
If a test gets long, split it into smaller tests.

### 4. Focus on edge cases
Test not only the normal path, but also the failure path.

Examples:
- empty list
- loading state
- API error
- invalid form input
- no matching search result

## Backend Testing Rules
### 1. Test route behavior
Every important route should have at least a success test and one failure test.

### 2. Test validation
If the endpoint rejects bad input, write a test for it.

Examples:
- empty product name
- negative quantity
- duplicate batch number
- invalid product type

### 3. Test database impact
If the request should create or update a record, confirm the result.

Examples:
- product saved in database
- stock count updated
- production status changed

### 4. Test auth rules
If a route requires login or roles, test access control.

Examples:
- unauthenticated user gets denied
- cashier cannot call admin-only route
- production staff can open production route

## Project-Specific Test Areas
### Inventory Module
Important test cases:
- product list loads correctly
- product filter by type works
- search by name, code, or barcode works
- company source filter shows Shanel and Ishara correctly
- add product form validates required fields
- update quantity modal saves stock properly
- delete product asks for confirmation

### Production Module
Important test cases:
- start new batch modal opens
- dropdown only shows Company products that are not Ishara products
- batch number duplicate is rejected
- quantity must be greater than zero
- production date and expiry date validation works
- stage label shows Start for newly created batch
- stage changes from Start to In Progress to Quality Check to Approved
- approve action updates the batch correctly

### Sales Module
Important test cases:
- search products for sale works
- cart totals update correctly
- discount and tax calculations are correct
- payment creates the right sale record
- stock reduces after sale

### Finance Module
Important test cases:
- expense add/edit/delete works
- income add/edit/delete works
- journal entry balances correctly
- account charts load and filter correctly

### Customer Module
Important test cases:
- customer creation validates input
- search and filters work
- credit transaction updates balance correctly
- customer notifications load properly

### User / Auth Module
Important test cases:
- login succeeds with valid credentials
- login fails with bad password
- protected routes redirect when unauthorized
- role-based access works

## Example Test Cases for Inventory
### 1. Production Modal Dropdown
Goal:
- Show only Company products that are not Ishara products.

Expected:
- Raw products are excluded
- Other products are excluded
- Company products with Ishara flag enabled are excluded
- Only allowed Company products appear in the dropdown

### 2. Production Stage Label
Goal:
- Show the correct stage name in the production table.

Expected:
- Newly started batch shows Start
- Batch in progress shows In Progress
- Quality check batch shows Quality Check
- Approved batch shows Approved

### 3. Product Search
Goal:
- Search should filter by product name, code, or barcode.

Expected:
- Matching rows remain visible
- Non-matching rows are hidden
- Empty search shows all matching type rows

### 4. Update Quantity
Goal:
- Save a new quantity for a selected product.

Expected:
- Quantity greater than zero is accepted
- Invalid quantity is rejected
- Table refreshes after save

## Sample Frontend Test Pattern
```jsx
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import axios from 'axios';
import ProductionModal from '../ProductionModal';

vi.mock('axios');

describe('ProductionModal', () => {
  it('shows only allowed company products', async () => {
    axios.get.mockResolvedValueOnce({
      data: [
        { id: 1, name: 'A', type: 'Company', isIsharaProduct: false },
        { id: 2, name: 'B', type: 'Company', isIsharaProduct: true },
        { id: 3, name: 'C', type: 'Raw', isIsharaProduct: false }
      ]
    });

    render(<ProductionModal show={true} onHide={() => {}} refreshData={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText('A')).toBeInTheDocument();
      expect(screen.queryByText('B')).not.toBeInTheDocument();
      expect(screen.queryByText('C')).not.toBeInTheDocument();
    });
  });
});
```

## Sample Backend Test Pattern
```js
const request = require('supertest');
const app = require('../server');

describe('GET /api/inventory/products', () => {
  it('returns the product list', async () => {
    const res = await request(app).get('/api/inventory/products');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
```

## Mocking Rules
### Mock these in frontend tests
- axios
- react-router-dom navigation
- window.alert
- window.confirm
- file uploads
- download links
- charts if they are not the thing being tested

### Mock these in backend unit tests
- database queries when testing logic only
- external APIs
- email services
- payment gateways
- file system writes if not required by the test

## Edge Cases the Team Should Not Forget
- empty result lists
- loading state
- API failure state
- duplicate values
- zero quantity
- negative quantity
- missing product code
- missing barcode
- invalid date range
- unauthorized access
- rejected production approval

## Minimum Test Coverage Recommendation
For each major module, write at least:
- 1 render test
- 1 success flow test
- 1 failure/validation test
- 1 permission or access test if applicable

For critical flows like production and inventory stock movement, add more tests.

## Suggested Order for the Team
Start testing in this order:
1. Inventory product list and filters
2. Production start flow
3. Quantity update flow
4. Sales flow
5. Finance flow
6. Customer credit flow
7. Auth and permissions

## Team Workflow
When writing a new feature:
- Write the test case first if possible
- Add the feature code
- Run the tests
- Fix any failures
- Review edge cases

When fixing a bug:
- Add a failing test that reproduces the bug
- Fix the code
- Re-run the test
- Keep the regression test in the repo

## Final Notes
- Test behavior that matters to users and business rules.
- Keep tests small and readable.
- Mock what you do not want to hit for real.
- Focus on inventory, production, stock movement, and validation because those are core ERP risks.

If the team wants, the next step is to add the actual test setup files and write the first test suite for the inventory module.
