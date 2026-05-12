/**
 * SIMPLE TEST CASE TUTORIAL
 * How to write a test case like TC-INV-001
 */

// ============================================
// STEP 1: IMPORTS (What we need to use)
// ============================================

// vitest = Testing framework (like a tool to run tests)
import { describe, it, expect, vi } from 'vitest';

// React Testing Library = Tools to test React components
import { render, screen } from '@testing-library/react';

// React Router = Component wrapper for routing
import { BrowserRouter } from 'react-router-dom';

// CSS testing helpers
import '@testing-library/jest-dom';


// ============================================
// STEP 2: ORGANIZE THE TEST
// ============================================

// describe() = Create a group/section for related tests
// Think of it like: "Here are all tests for Product List"
describe('Inventory - Company Products List', () => {
  
  // it() = One single test case
  // Think of it like: "Test this one thing"
  it('should display products in a table', () => {
    // Your test code goes here
  });

  it('should have search functionality', () => {
    // Another test code
  });

});


// ============================================
// STEP 3: TEST STRUCTURE (ARRANGE-ACT-ASSERT)
// ============================================

describe('Product List Tests', () => {
  
  it('should display product data in table', () => {
    
    // STEP A: ARRANGE (Setup - prepare what you need)
    // ================================================
    // Create fake data to test with
    const products = [
      {
        id: 1,
        name: 'Product 1',
        price: 100,
        stock: 50
      },
      {
        id: 2,
        name: 'Product 2',
        price: 200,
        stock: 30
      }
    ];

    // Create a test component (dummy component)
    const TestComponent = () => {
      return (
        <div>
          <h1>Products</h1>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Price</th>
                <th>Stock</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.price}</td>
                  <td>{p.stock}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    };

    // STEP B: ACT (Run the test - display the component)
    // ==================================================
    // render() = Show the component on the test screen
    // screen = Virtual screen to check what's displayed
    render(
      <BrowserRouter>
        <TestComponent />
      </BrowserRouter>
    );

    // STEP C: ASSERT (Check - verify results)
    // =====================================
    // Use expect() to check if things are correct

    // Check 1: Heading exists
    expect(screen.getByText('Products')).toBeInTheDocument();
    
    // Check 2: Product name exists
    expect(screen.getByText('Product 1')).toBeInTheDocument();
    
    // Check 3: Price exists
    expect(screen.getByText('100')).toBeInTheDocument();
    
    // Check 4: Multiple elements (e.g., all table rows)
    const rows = screen.getAllByRole('row');
    expect(rows.length).toBe(3); // 1 header + 2 products
  });

});


// ============================================
// STEP 4: COMMON ASSERTIONS (How to check)
// ============================================

describe('Common Assertions', () => {

  it('shows different assertion examples', () => {
    // Render a component
    const Component = () => (
      <div>
        <h1>Hello</h1>
        <input placeholder="Search..." />
        <button>Click me</button>
      </div>
    );

    render(<Component />);

    // ASSERTIONS - Different ways to check things:

    // 1. Check if text/heading exists
    expect(screen.getByText('Hello')).toBeInTheDocument();

    // 2. Check if placeholder exists
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();

    // 3. Check if button exists
    expect(screen.getByRole('button')).toBeInTheDocument();

    // 4. Check if element has certain text
    expect(screen.getByRole('button')).toHaveTextContent('Click me');

    // 5. Check if element is visible
    expect(screen.getByText('Hello')).toBeVisible();

    // 6. Check multiple elements (get all buttons, links, etc)
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBe(1);

    // 7. Check if something does NOT exist
    expect(screen.queryByText('Goodbye')).not.toBeInTheDocument();

    // 8. Check numbers/values
    expect(5).toBe(5);
    expect(10).toBeGreaterThan(5);
    expect(3).toBeLessThan(5);
  });

});


// ============================================
// STEP 5: FULL SIMPLE EXAMPLE
// ============================================

describe('Product Search Feature', () => {

  it('should search and filter products', () => {
    
    // ARRANGE
    const products = [
      { id: 1, name: 'Apple', category: 'Fruit' },
      { id: 2, name: 'Banana', category: 'Fruit' },
      { id: 3, name: 'Carrot', category: 'Vegetable' }
    ];

    const SearchComponent = () => {
      const [search, setSearch] = React.useState('');
      const filtered = products.filter(p => 
        p.name.toLowerCase().includes(search.toLowerCase())
      );

      return (
        <div>
          <input 
            placeholder="Search products..."
            onChange={(e) => setSearch(e.target.value)}
          />
          <ul>
            {filtered.map(p => (
              <li key={p.id}>{p.name}</li>
            ))}
          </ul>
        </div>
      );
    };

    // ACT
    render(<SearchComponent />);

    // ASSERT
    // Check: All 3 products visible initially
    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.getByText('Banana')).toBeInTheDocument();
    expect(screen.getByText('Carrot')).toBeInTheDocument();

    // Check: Search box exists
    expect(screen.getByPlaceholderText('Search products...')).toBeInTheDocument();
  });

});


// ============================================
// STEP 6: KEY FUNCTIONS EXPLAINED
// ============================================

/*

IMPORTS:
--------
describe() - Group multiple tests together
it() - Write one test case
expect() - Check if something is true

render() - Display a React component for testing
screen - Virtual screen object to find elements

FINDING ELEMENTS (screen.getByXXX):
----------------------------------
screen.getByText('text') - Find by text content
screen.getByPlaceholderText('text') - Find by placeholder
screen.getByRole('button') - Find by role (button, link, etc)
screen.getByLabelText('label') - Find by label text
screen.getByTestId('id') - Find by test ID (if you add it to component)

Getting Multiple Elements:
--------------------------
screen.getAllByText() - Get ALL elements with this text
screen.getAllByRole() - Get ALL buttons, links, etc

ASSERTIONS (expect().toXXX):
---------------------------
.toBeInTheDocument() - Element exists in DOM
.toBeVisible() - Element is visible
.toHaveTextContent('text') - Has this text
.toHaveAttribute('attr', 'value') - Has this attribute
.toBe() - Equals exactly
.toEqual() - Deep equals
.toBeGreaterThan() - Math greater than
.not. - Negate any assertion (e.g., .not.toBeInTheDocument())

*/
