# Test Case Writing - Visual Guide

## 1️⃣ BASIC STRUCTURE

```
┌─────────────────────────────────────────┐
│  TEST FILE (ProductList.test.jsx)       │
├─────────────────────────────────────────┤
│                                         │
│  IMPORTS                                │
│  ├─ describe, it, expect (vitest)      │
│  ├─ render, screen (testing-library)   │
│  └─ @testing-library/jest-dom          │
│                                         │
│  describe("Test Group") {               │
│    ├─ it("Test 1") { ... }             │
│    ├─ it("Test 2") { ... }             │
│    └─ it("Test 3") { ... }             │
│  }                                      │
│                                         │
└─────────────────────────────────────────┘
```

---

## 2️⃣ INSIDE EACH TEST (ARRANGE-ACT-ASSERT)

```
it("should do something", () => {
  
  // ARRANGE - SETUP
  ┌─────────────────────────────────┐
  │ Create fake data                │
  │ Create test component           │
  │ Define what to test             │
  └─────────────────────────────────┘
  const data = [...];
  const Component = () => (...);
  
  
  // ACT - EXECUTE
  ┌─────────────────────────────────┐
  │ Render component                │
  │ Show on virtual screen          │
  │ Simulate user actions           │
  └─────────────────────────────────┘
  render(<Component />);
  
  
  // ASSERT - VERIFY
  ┌─────────────────────────────────┐
  │ Check if things exist           │
  │ Check if values are correct     │
  │ Confirm expected behavior       │
  └─────────────────────────────────┘
  expect(screen.getByText('...')).toBeInTheDocument();
  
});
```

---

## 3️⃣ FINDING ELEMENTS (Most Common)

| Function | Use Case | Example |
|----------|----------|---------|
| `getByText()` | Find by text content | `screen.getByText('Login')` |
| `getByPlaceholderText()` | Find input by placeholder | `screen.getByPlaceholderText('Username')` |
| `getByRole()` | Find by role (button, link, etc) | `screen.getByRole('button')` |
| `getByLabelText()` | Find by label | `screen.getByLabelText('Email')` |
| `getByTestId()` | Find by test ID | `screen.getByTestId('submit-btn')` |
| `getAllByText()` | Find ALL matching | `screen.getAllByText('Item')` |

---

## 4️⃣ ASSERTIONS (How to Check)

| Assertion | Meaning | Example |
|-----------|---------|---------|
| `toBeInTheDocument()` | Element exists | `expect(btn).toBeInTheDocument()` |
| `toBeVisible()` | Element is visible | `expect(text).toBeVisible()` |
| `toHaveTextContent()` | Has certain text | `expect(btn).toHaveTextContent('Click')` |
| `toBe()` | Exact match | `expect(5).toBe(5)` |
| `toBeGreaterThan()` | Number comparison | `expect(10).toBeGreaterThan(5)` |
| `not.` | Negate | `expect(x).not.toBeInTheDocument()` |

---

## 5️⃣ SIMPLE STEP-BY-STEP EXAMPLE

### ✅ STEP 1: Write imports
```javascript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
```

### ✅ STEP 2: Create describe block
```javascript
describe('My First Test', () => {
  // Tests go here
});
```

### ✅ STEP 3: Write one test
```javascript
it('should display heading', () => {
  // Test code goes here
});
```

### ✅ STEP 4: Create component to test
```javascript
const MyComponent = () => (
  <h1>Hello World</h1>
);
```

### ✅ STEP 5: Render it
```javascript
render(<MyComponent />);
```

### ✅ STEP 6: Check it
```javascript
expect(screen.getByText('Hello World')).toBeInTheDocument();
```

---

## 6️⃣ COMPLETE FIRST TEST

```javascript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

describe('My First Test', () => {
  
  it('should show a heading', () => {
    
    // 1. ARRANGE - Create component
    const Component = () => <h1>Welcome</h1>;
    
    // 2. ACT - Render it
    render(<Component />);
    
    // 3. ASSERT - Check it
    expect(screen.getByText('Welcome')).toBeInTheDocument();
  });

});
```

---

## 7️⃣ TESTING PRODUCTS (Your Real Use Case)

```javascript
describe('Products List', () => {
  
  it('should display products', () => {
    
    // 1. ARRANGE - Fake data
    const products = [
      { name: 'Soap', price: 50 },
      { name: 'Shampoo', price: 100 }
    ];
    
    // 2. ARRANGE - Component
    const ProductList = () => (
      <ul>
        {products.map(p => (
          <li key={p.name}>{p.name} - {p.price}</li>
        ))}
      </ul>
    );
    
    // 3. ACT - Render
    render(<ProductList />);
    
    // 4. ASSERT - Check product 1
    expect(screen.getByText(/Soap/)).toBeInTheDocument();
    
    // 5. ASSERT - Check product 2
    expect(screen.getByText(/Shampoo/)).toBeInTheDocument();
  });

});
```

---

## 8️⃣ RUN YOUR TEST

```bash
# Run once
npm test -- --run

# Run in watch mode (auto-reruns when you change file)
npm test

# Run with UI dashboard
npm run test:ui
```

---

## ❓ QUICK QUESTIONS & ANSWERS

**Q: Why use `describe`?**  
A: Groups related tests together. Makes it organized.

**Q: What's `render`?**  
A: Shows your React component on a virtual screen so tests can check it.

**Q: What's `screen`?**  
A: Virtual screen object. Use it to find and check elements.

**Q: What if I want to test a button click?**  
A: Use `fireEvent` or `userEvent` (more advanced).

**Q: What if component needs data from API?**  
A: Mock the API (we'll cover this next).

**Q: How do I run just one test?**  
A: `npm test -- ProductList.test.jsx`

---

## 📝 YOUR TEMPLATE (Copy & Paste)

```javascript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

describe('YOUR TEST TITLE', () => {
  
  it('should do something', () => {
    
    // ARRANGE
    const Component = () => (
      <div>Your component here</div>
    );
    
    // ACT
    render(<Component />);
    
    // ASSERT
    expect(screen.getByText('Your text')).toBeInTheDocument();
  });

});
```

---

**Now you know how to write tests! 🎉**
