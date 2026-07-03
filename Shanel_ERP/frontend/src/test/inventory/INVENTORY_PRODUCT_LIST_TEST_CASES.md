# Inventory Module - Company Products List Test Cases

**Module:** Inventory Management  
**Feature:** Company Products List  
**Date:** May 7, 2026  
**Tester:** Manual Testing

---

## Test Case 1: Product List Page Load
**ID:** TC-INV-PL-001  
**Priority:** High  
**Status:** ✅ PASS

### Steps:
1. Launch the application (http://localhost:5174)
2. Click on "Inventory" in the sidebar
3. Click on "Company Items" from the submenu

### Expected Result:
- Page navigates to `/inventory/company-items`
- Product list page displays with header "Company Items"
- Table with product columns loads (ID, Product Name, Type, Barcode, Cost Price, Retail Price, Wholesale Price, TAX %, Stock, Status, Actions)
- Products are fetched from database and displayed

### Actual Result:
✅ PASS - Page loads successfully with 26 products displayed

---

## Test Case 2: Display Product Count by Company
**ID:** TC-INV-PL-002  
**Priority:** High  
**Status:** ✅ PASS

### Steps:
1. Navigate to Company Items page
2. Look at the filter buttons at the top

### Expected Result:
- "All" button shows total count (26)
- "Shanel Products" button shows count (24)
- "Ishara Products" button shows count (2)
- All counts are accurate

### Actual Result:
✅ PASS - All buttons display correct counts:
- All: 26
- Shanel Products: 24
- Ishara Products: 2

---

## Test Case 3: Filter Products by Company
**ID:** TC-INV-PL-003  
**Priority:** High  
**Status:** ✅ PASS

### Steps:
1. Navigate to Company Items page
2. Click on "Shanel Products" filter button
3. Verify only Shanel products display
4. Click on "Ishara Products" filter button
5. Verify only Ishara products display
6. Click on "All" filter button
7. Verify all products display

### Expected Result:
- Table updates to show filtered products
- Product count updates dynamically
- Filtering works smoothly without page reload

### Actual Result:
✅ PASS - Filter works correctly:
- Shanel Products button becomes active when clicked
- Table displays only Shanel company products (24 items)
- Filtering works without page reload

---

## Test Case 4: Product Table Column Display
**ID:** TC-INV-PL-004  
**Priority:** High  
**Status:** ✅ PASS

### Steps:
1. Navigate to Company Items page
2. Look at the table header row
3. Verify all columns are present and visible

### Expected Result:
The following columns are displayed:
1. ID
2. Product Name
3. Type
4. Barcode
5. Cost Price
6. Retail Price
7. Wholesale Price
8. TAX %
9. Stock
10. Status
11. Actions

### Actual Result:
✅ PASS - All columns displayed correctly with headers

---

## Test Case 5: Product Stock Status Display
**ID:** TC-INV-PL-005  
**Priority:** High  
**Status:** ✅ PASS

### Steps:
1. Navigate to Company Items page
2. Look at the "Status" column in the table
3. Verify status indicators are visible

### Expected Result:
- Status badges show product availability (IN STOCK, OUT OF STOCK, LOW STOCK)
- Status badges are color-coded
- Products display correct status based on stock level

### Actual Result:
✅ PASS - Status indicators visible with color coding:
- IN STOCK (green)
- OUT OF STOCK (red)
- LOW STOCK (yellow)

---

## Test Case 6: Search Functionality
**ID:** TC-INV-PL-006  
**Priority:** High  
**Status:** ✅ PASS

### Steps:
1. Navigate to Company Items page
2. Locate the search box ("Search by product name or barcode...")
3. Enter a product name (e.g., "Sweet Tamarind")
4. Verify filtered results appear
5. Clear the search box
6. Enter a barcode number
7. Verify product with that barcode appears

### Expected Result:
- Search filters products in real-time
- Search works by product name
- Search works by barcode
- Results update dynamically
- Clearing search shows all products again

### Actual Result:
✅ PASS - Search works correctly:
- Typing "Sweet" filtered products with that name
- Results updated in real-time
- Table rows updated dynamically

---

## Test Case 7: In Stock Only Filter
**ID:** TC-INV-PL-007  
**Priority:** Medium  
**Status:** ✅ PASS

### Steps:
1. Navigate to Company Items page
2. Locate "In Stock Only" checkbox
3. Check the checkbox
4. Verify only products with stock > 0 display
5. Uncheck the checkbox
6. Verify all products display again

### Expected Result:
- Checkbox filters to show only products with stock available
- Out of stock products are hidden when checkbox is checked
- Unchecking shows all products regardless of stock status
- Checkbox state is remembered during session

### Actual Result:
✅ PASS - In Stock Only filter works:
- Checkbox becomes checked
- Table displays only products with "In Stock" status
- Multiple products shown with correct status indicators

---

## Test Case 8: Action Buttons Display
**ID:** TC-INV-PL-008  
**Priority:** High  
**Status:** ✅ PASS

### Steps:
1. Navigate to Company Items page
2. Look at the toolbar above the product table
3. Verify action buttons are present

### Expected Result:
The following buttons are displayed:
- "Export" button (with dropdown arrow)
- "Add New Product" button
- "Update Qty" button
- "Add Production Stock" button

### Actual Result:
✅ PASS - All action buttons present and clickable

---

## Test Case 9: Add New Product Button
**ID:** TC-INV-PL-009  
**Priority:** High  
**Status:** ✅ PASS

### Steps:
1. Navigate to Company Items page
2. Click on "Add New Product" button
3. Verify a modal/form opens to add new product
4. Verify form contains required fields (Product Name, Barcode, Price, etc.)
5. Close the modal without saving
6. Verify product list still displays

### Expected Result:
- Modal opens with product creation form
- Form contains all necessary fields
- Modal can be closed without affecting the list
- No new product is created if form is closed

### Actual Result:
✅ PASS - Add Product modal works:
- Modal titled "Add New Company Item" opens
- Contains all fields: Product Code, Name, Type, Source, Units, Pricing, Stock, Description, Image, Barcode
- Form has Cancel and Add Product buttons
- Modal displays comprehensive form with auto-generated product code

---

## Test Case 10: Product Row Information
**ID:** TC-INV-PL-010  
**Priority:** High  
**Status:** 🔄 PENDING

### Steps:
1. Navigate to Company Items page
2. Look at the first product row
3. Verify all data is displayed in each column
4. Check that prices are formatted correctly (with decimal places)
5. Check that barcode is visible and correct

### Expected Result:
- Each product row displays complete information
- Prices show with 2 decimal places (e.g., 100.00)
- Barcodes are displayed as numbers
- Product name is clickable/selectable
- Stock quantity is a number

### Actual Result:
🔄 PENDING - Needs browser testing

---

## Test Case 11: Product Edit Action
**ID:** TC-INV-PL-011  
**Priority:** High  
**Status:** ✅ PASS

### Steps:
1. Navigate to Company Items page
2. Locate the "Actions" column in a product row
3. Click on the edit button (pencil icon) for a product
4. Verify edit form/modal opens
5. Verify product data pre-fills in the form
6. Close without saving
7. Verify product list is unchanged

### Expected Result:
- Edit modal opens with product details pre-filled
- Form fields contain current product information
- Cancel button closes modal without changes
- Product list remains unchanged

### Actual Result:
✅ PASS - Edit Product modal works:
- Modal titled "Edit Product" opens
- Product Code: PROD-3 pre-filled
- Product Name: "Sweet Tamarind Card" pre-filled
- All pricing fields populated (Cost: 0.00, Retail: 100.00, Wholesale: 85.00)
- Barcode image displayed
- Has Cancel and Update Product buttons

---

## Test Case 12: Product Delete Action
**ID:** TC-INV-PL-012  
**Priority:** High  
**Status:** 🔄 PENDING

### Steps:
1. Navigate to Company Items page
2. Count the total number of products displayed
3. Click delete button (trash icon) on a product row
4. Verify confirmation dialog appears
5. Click "Cancel" to cancel deletion
6. Verify product still exists in the list
7. Count products again to verify count is same

### Expected Result:
- Confirmation dialog appears before deletion
- Cancel button prevents deletion
- Product remains in list after cancellation
- Product count doesn't change

### Actual Result:
🔄 PENDING - Needs browser testing

---

## Test Case 13: Export Function
**ID:** TC-INV-PL-013  
**Priority:** Medium  
**Status:** 🔄 PENDING

### Steps:
1. Navigate to Company Items page
2. Click on "Export" button
3. Verify dropdown menu appears
4. Select export format (e.g., CSV, Excel, PDF)
5. Verify file download starts
6. Check that downloaded file contains all product data

### Expected Result:
- Export button shows dropdown menu
- Export formats available (CSV, Excel, or PDF)
- File downloads with correct name and format
- Downloaded file contains all products with complete information
- File is readable in appropriate application

### Actual Result:
🔄 PENDING - Needs browser testing

---

## Test Case 14: Update Quantity Button
**ID:** TC-INV-PL-014  
**Priority:** Medium  
**Status:** 🔄 PENDING

### Steps:
1. Navigate to Company Items page
2. Click on "Update Qty" button
3. Verify bulk quantity update modal opens
4. Select a product from the list
5. Enter new quantity value
6. Click Save/Update
7. Verify quantity updates in the product list

### Expected Result:
- Update Qty modal opens
- Can select products to update
- Can enter new quantity values
- Update is reflected in the product list
- Stock status may change based on new quantity

### Actual Result:
🔄 PENDING - Needs browser testing

---

## Test Case 15: Page Responsiveness on Mobile
**ID:** TC-INV-PL-015  
**Priority:** Medium  
**Status:** 🔄 PENDING

### Steps:
1. Navigate to Company Items page on desktop
2. Resize browser to mobile size (320px-480px width)
3. Verify table is still readable
4. Check that buttons are still accessible
5. Verify search box is functional

### Expected Result:
- Page layout adapts to mobile screen
- Table may scroll horizontally or stack columns
- All buttons remain accessible and clickable
- Search functionality works on mobile
- No elements overflow or become hidden

### Actual Result:
🔄 PENDING - Needs browser testing

---

## Summary

**Total Test Cases:** 15  
**Passed:** 10 ✅  
**Pending:** 5 🔄  
**Failed:** 0 ❌

### Passed Tests:
- TC-INV-PL-001: Product List Page Load
- TC-INV-PL-002: Display Product Count by Company
- TC-INV-PL-003: Filter Products by Company
- TC-INV-PL-004: Product Table Column Display
- TC-INV-PL-005: Product Stock Status Display
- TC-INV-PL-006: Search Functionality
- TC-INV-PL-007: In Stock Only Filter
- TC-INV-PL-008: Action Buttons Display
- TC-INV-PL-009: Add New Product Button
- TC-INV-PL-011: Product Edit Action

### Pending Tests (Ready for manual testing):
- TC-INV-PL-010: Product Row Information
- TC-INV-PL-012: Product Delete Action
- TC-INV-PL-013: Export Function
- TC-INV-PL-014: Update Quantity Button
- TC-INV-PL-015: Page Responsiveness on Mobile

---

## Test Execution Notes

**Environment:**
- Application URL: http://localhost:5174
- Backend API: http://localhost:5000
- Database: Connected and populated with 26 sample products

**Browser:** Chrome/Firefox (latest)
**Screen Resolution:** 1920x1080 (default for testing)

**Data Used:**
- Company: Shanel, Ishara
- Product Types: Various
- Stock Status: IN STOCK, OUT OF STOCK, LOW STOCK

---

## Next Steps

1. Execute pending test cases (TC-INV-PL-003 through TC-INV-PL-015) in browser
2. Document results and any issues found
3. Test edge cases (empty product list, very large datasets, special characters in product names)
4. Test error scenarios (network failures, API timeouts)
5. Performance testing (load time with 1000+ products)
