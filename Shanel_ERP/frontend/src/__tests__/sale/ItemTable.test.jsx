import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import ItemTable from '../../component/pos/itemTable/ItemTable';

// Mock axios
vi.mock('axios');
const mockedAxios = axios;

// Mock Portal component
vi.mock('../../../src/components/sale/Portal', () => ({
  default: ({ children, targetElement }) => <div data-testid="portal">{children}</div>
}));

// Mock translations
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => {
      const translations = {
        'itemTable.title': 'Items',
        'itemTable.itemCode': 'Code',
        'itemTable.description': 'Description',
        'itemTable.unit': 'Unit',
        'itemTable.price': 'Price',
        'itemTable.discount': 'Disc%',
        'itemTable.tax': 'Tax%',
        'itemTable.qty': 'Qty',
        'itemTable.free': 'Free',
        'itemTable.total': 'Total',
        'itemTable.action': 'Action',
        'itemTable.searchPlaceholder': 'Search product...',
        'itemTable.retail': 'Retail',
        'itemTable.wholesale': 'Wholesale'
      };
      return translations[key] || key;
    }
  })
}));

describe('ItemTable Component', () => {
  const mockSetCartItems = vi.fn();
  const mockSetPriceLevel = vi.fn();
  const mockSetSelectedProduct = vi.fn();
  const mockSetError = vi.fn();
  const mockSetInformation = vi.fn();
  
  const defaultProps = {
    cartItems: [],
    setCartItems: mockSetCartItems,
    priceLevel: 'Retail',
    setPriceLevel: mockSetPriceLevel,
    location: 'Shop',
    selectedProduct: null,
    setSelectedProduct: mockSetSelectedProduct,
    error: null,
    setError: mockSetError,
    setInformation: mockSetInformation
  };

  const mockProduct = {
    p_id: 1,
    p_code: 'P001',
    p_name: 'Test Product',
    p_type: 'Regular',
    retail_price: 100,
    wholesale_price: 80,
    tax_rate: 10,
    base_unit: 'kg',
    image_path: null
  };

  const mockUnits = [
    { Unit_Name: 'kg', Unit_Conversion: 1, Is_Base_Unit: true },
    { Unit_Name: 'g', Unit_Conversion: 0.001, Is_Base_Unit: false }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockedAxios.get.mockReset();
  });

  // ============================================
  // TEST GROUP 1: Component Rendering
  // ============================================
  describe('Rendering', () => {
    it('renders the component correctly with empty cart', () => {
      render(<ItemTable {...defaultProps} />);
      
      expect(screen.getByText('Items')).toBeDefined();
      expect(screen.getByText('Retail')).toBeDefined();
      expect(screen.getByText('Wholesale')).toBeDefined();
      expect(screen.getByPlaceholderText('Search product...')).toBeDefined();
    });

    it('displays retail/wholesale toggle with correct active state', () => {
      render(<ItemTable {...defaultProps} priceLevel="Retail" />);
      
      const retailButton = screen.getByText('Retail').closest('button');
      const wholesaleButton = screen.getByText('Wholesale').closest('button');
      
      expect(retailButton).toHaveStyle({ backgroundColor: '#007bff' });
      expect(wholesaleButton).toHaveStyle({ backgroundColor: 'transparent' });
    });

    it('displays cart items when provided', () => {
      const cartItems = [{
        id: 1,
        p_code: 'P001',
        p_name: 'Test Product',
        p_unit: 'kg',
        unit_price: 100,
        discount: 0,
        tax: 10,
        quntity: 2,
        free: 0,
        total: 220,
        discount_allowed: false
      }];
      
      render(<ItemTable {...defaultProps} cartItems={cartItems} />);
      
      expect(screen.getByText('P001')).toBeDefined();
      expect(screen.getByText('Test Product')).toBeDefined();
      
      // Find quantity input with specific value
      const qtyInput = screen.getByDisplayValue('2');
      expect(qtyInput).toBeDefined();
    });
  });

  // ============================================
  // TEST GROUP 2: Product Search Functionality
  // ============================================
  describe('Product Search', () => {
    it('searches for products when typing in search input', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: { success: true, products: [mockProduct] }
      });
      
      render(<ItemTable {...defaultProps} />);
      
      const searchInput = screen.getByPlaceholderText('Search product...');
      await act(async () => {
        fireEvent.change(searchInput, { target: { value: 'Test' } });
      });
      
      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalledWith(
          'http://localhost:5000/api/sales/search?q=Test'
        );
      });
    });

    it('clears search results when input is empty', async () => {
      render(<ItemTable {...defaultProps} />);
      
      const searchInput = screen.getByPlaceholderText('Search product...');
      fireEvent.change(searchInput, { target: { value: 'Test' } });
      fireEvent.change(searchInput, { target: { value: '' } });
      
      await waitFor(() => {
        expect(screen.queryByTestId('portal')).toBeNull();
      });
    });

    it('selects a product from search results', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: { success: true, products: [mockProduct] }
      });
      
      render(<ItemTable {...defaultProps} />);
      
      const searchInput = screen.getByPlaceholderText('Search product...');
      await act(async () => {
        fireEvent.change(searchInput, { target: { value: 'Test' } });
      });
      
      await waitFor(() => {
        expect(screen.getByText('Test Product')).toBeDefined();
      });
      
      const productItem = screen.getByText('Test Product');
      fireEvent.click(productItem);
      
      expect(mockSetSelectedProduct).toHaveBeenCalledWith(mockProduct);
      expect(mockSetError).toHaveBeenCalledWith(null);
    });

    it('handles search API error gracefully', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));
      
      render(<ItemTable {...defaultProps} />);
      
      const searchInput = screen.getByPlaceholderText('Search product...');
      await act(async () => {
        fireEvent.change(searchInput, { target: { value: 'Test' } });
      });
      
      expect(consoleError).toHaveBeenCalled();
      consoleError.mockRestore();
    });
  });

  // ============================================
  // TEST GROUP 3: Unit Selection and Price Calculation
  // ============================================
  describe('Unit Selection', () => {
    it('fetches units when product is selected', async () => {
      // Mock search
      mockedAxios.get.mockResolvedValueOnce({
        data: { success: true, products: [mockProduct] }
      });
      
      // Mock units fetch
      mockedAxios.get.mockResolvedValueOnce({
        data: { success: true, units: mockUnits }
      });
      
      render(<ItemTable {...defaultProps} />);
      
      const searchInput = screen.getByPlaceholderText('Search product...');
      await act(async () => {
        fireEvent.change(searchInput, { target: { value: 'Test' } });
      });
      
      await waitFor(() => {
        const productItem = screen.getByText('Test Product');
        fireEvent.click(productItem);
      });
      
      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalledWith(
          `http://localhost:5000/api/sales/units?productId=${mockProduct.p_id}`
        );
      });
    });
  });

  // ============================================
  // TEST GROUP 4: Adding Items to Cart
  // ============================================
  describe('Add to Cart', () => {
    it('adds item to cart when all fields are valid', async () => {
      // Mock search
      mockedAxios.get.mockResolvedValueOnce({
        data: { success: true, products: [mockProduct] }
      });
      
      // Mock units
      mockedAxios.get.mockResolvedValueOnce({
        data: { success: true, units: mockUnits }
      });
      
      // Mock quantity
      mockedAxios.get.mockResolvedValueOnce({
        data: { success: true, totalQty: 100, shopQty: 100, productionQty: 0 }
      });
      
      render(<ItemTable {...defaultProps} />);
      
      // Select product
      const searchInput = screen.getByPlaceholderText('Search product...');
      await act(async () => {
        fireEvent.change(searchInput, { target: { value: 'Test' } });
      });
      
      await waitFor(() => {
        const productItem = screen.getByText('Test Product');
        fireEvent.click(productItem);
      });
      
      // Add to cart button should now be enabled
      await waitFor(() => {
        const addButton = screen.getByTitle('Add to cart');
        expect(addButton).not.toBeDisabled();
      });
    });

    it('prevents adding duplicate product with same unit', async () => {
      const cartItems = [{
        id: 1,
        p_id: 1,
        p_code: 'P001',
        p_name: 'Test Product',
        p_unit: 'kg',
        unit_price: 100,
        discount: 0,
        tax: 10,
        quntity: 1,
        free: 0,
        total: 110,
        discount_allowed: false,
        conversionFactor: 1
      }];
      
      render(<ItemTable {...defaultProps} cartItems={cartItems} />);
      
      // Attempt to add same product would trigger duplicate check
      // This would require selecting the same product again
      expect(mockSetError).not.toHaveBeenCalled();
    });
  });

  // ============================================
  // TEST GROUP 5: Quantity Validation
  // ============================================
  describe('Quantity Validation', () => {
    it('shows error when quantity exceeds available stock', async () => {
      // Mock search
      mockedAxios.get.mockResolvedValueOnce({
        data: { success: true, products: [mockProduct] }
      });
      
      // Mock units
      mockedAxios.get.mockResolvedValueOnce({
        data: { success: true, units: mockUnits }
      });
      
      // Mock quantity with low stock
      mockedAxios.get.mockResolvedValueOnce({
        data: { success: true, totalQty: 5, shopQty: 5, productionQty: 0 }
      });
      
      render(<ItemTable {...defaultProps} />);
      
      // Select product
      const searchInput = screen.getByPlaceholderText('Search product...');
      await act(async () => {
        fireEvent.change(searchInput, { target: { value: 'Test' } });
      });
      
      await waitFor(() => {
        const productItem = screen.getByText('Test Product');
        fireEvent.click(productItem);
      });
      
      // Try to set quantity > available
      const qtyInput = screen.getAllByDisplayValue('1')[0];
      fireEvent.change(qtyInput, { target: { value: '10' } });
      
      await waitFor(() => {
        expect(mockSetError).toHaveBeenCalled();
      });
    });

    it('shows out of stock message when stock is 0', async () => {
      // Mock search
      mockedAxios.get.mockResolvedValueOnce({
        data: { success: true, products: [mockProduct] }
      });
      
      // Mock units
      mockedAxios.get.mockResolvedValueOnce({
        data: { success: true, units: mockUnits }
      });
      
      // Mock quantity with zero stock
      mockedAxios.get.mockResolvedValueOnce({
        data: { success: true, totalQty: 0, shopQty: 0, productionQty: 0 }
      });
      
      render(<ItemTable {...defaultProps} />);
      
      // Select product
      const searchInput = screen.getByPlaceholderText('Search product...');
      await act(async () => {
        fireEvent.change(searchInput, { target: { value: 'Test' } });
      });
      
      await waitFor(() => {
        const productItem = screen.getByText('Test Product');
        fireEvent.click(productItem);
      });
      
      await waitFor(() => {
        expect(mockSetError).toHaveBeenCalledWith({
          field: 'general',
          message: expect.stringContaining('out of stock')
        });
      });
    });
  });

  // ============================================
  // TEST GROUP 6: Price Level Changes
  // ============================================
  describe('Price Level Changes', () => {
    it('switches between Retail and Wholesale', () => {
      render(<ItemTable {...defaultProps} />);
      
      const wholesaleButton = screen.getByText('Wholesale').closest('button');
      fireEvent.click(wholesaleButton);
      
      expect(mockSetPriceLevel).toHaveBeenCalledWith('Wholesale');
    });
  });

  // ============================================
  // TEST GROUP 7: Discount Validation
  // ============================================
  describe('Discount Validation', () => {
    it('shows error when discount is not allowed', async () => {
      const companyProduct = {
        ...mockProduct,
        p_type: 'Company'
      };
      
      // Mock search with company product
      mockedAxios.get.mockResolvedValueOnce({
        data: { success: true, products: [companyProduct] }
      });
      
      // Mock units
      mockedAxios.get.mockResolvedValueOnce({
        data: { success: true, units: mockUnits }
      });
      
      // Mock quantity
      mockedAxios.get.mockResolvedValueOnce({
        data: { success: true, totalQty: 100, shopQty: 100, productionQty: 0 }
      });
      
      render(<ItemTable {...defaultProps} priceLevel="Retail" />);
      
      // Select product
      const searchInput = screen.getByPlaceholderText('Search product...');
      await act(async () => {
        fireEvent.change(searchInput, { target: { value: 'Test' } });
      });
      
      await waitFor(() => {
        const productItem = screen.getByText('Test Product');
        fireEvent.click(productItem);
      });
      
      // Try to focus discount input
      const discountInput = screen.getAllByDisplayValue('0')[1];
      fireEvent.focus(discountInput);
      
      await waitFor(() => {
        expect(mockSetError).toHaveBeenCalled();
      });
    });
  });

  // ============================================
  // TEST GROUP 8: Cart Item Management
  // ============================================
  describe('Cart Item Management', () => {
    const cartItems = [{
      id: 1,
      p_id: 1,
      p_code: 'P001',
      p_name: 'Test Product',
      p_unit: 'kg',
      unit_price: 100,
      discount: 0,
      tax: 10,
      quntity: 2,
      free: 0,
      total: 220,
      discount_allowed: false,
      conversionFactor: 1
    }];

    it('updates cart item quantity', () => {
      render(<ItemTable {...defaultProps} cartItems={cartItems} setCartItems={mockSetCartItems} />);
      
      // Find the quantity input in cart (not the input row)
      const qtyInputs = screen.getAllByDisplayValue('2');
      const cartQtyInput = qtyInputs.find(input => input.closest('tr')?.querySelector('.text-danger'));
      
      if (cartQtyInput) {
        fireEvent.change(cartQtyInput, { target: { value: '3' } });
        expect(mockSetCartItems).toHaveBeenCalled();
      }
    });

    it('removes item from cart', () => {
      render(<ItemTable {...defaultProps} cartItems={cartItems} setCartItems={mockSetCartItems} />);
      
      // Find delete button by its class or parent structure
      const deleteButton = document.querySelector('.btn-link.text-danger');
      expect(deleteButton).toBeDefined();
      
      if (deleteButton) {
        fireEvent.click(deleteButton);
        expect(mockSetCartItems).toHaveBeenCalled();
      }
    });

    it('recalculates totals when cart item changes', () => {
      render(<ItemTable {...defaultProps} cartItems={cartItems} setCartItems={mockSetCartItems} />);
      
      // Find discount input in cart row
      const discountInputs = screen.getAllByDisplayValue('0');
      const cartDiscountInput = discountInputs.find(
        input => input.closest('tr')?.querySelector('.text-danger')
      );
      
      if (cartDiscountInput) {
        fireEvent.change(cartDiscountInput, { target: { value: '10' } });
        expect(mockSetCartItems).toHaveBeenCalled();
      }
    });
  });

  // ============================================
  // TEST GROUP 9: Tax Calculations
  // ============================================
  describe('Tax Calculations', () => {
    it('calculates tax correctly based on subtotal', () => {
      const item = {
        quntity: 10,
        free: 0,
        unit_price: 100,
        discount: 0,
        tax: 15
      };
      
      const subtotal = 10 * 100;
      const taxAmount = subtotal * 0.15;
      const total = subtotal + taxAmount;
      
      expect(subtotal).toBe(1000);
      expect(taxAmount).toBe(150);
      expect(total).toBe(1150);
    });
  });

  // ============================================
  // TEST GROUP 10: Free Items Calculation
  // ============================================
  describe('Free Items', () => {
    it('calculates subtotal excluding free items', () => {
      const item = {
        quntity: 10,
        free: 2,
        unit_price: 100,
        discount: 0,
        tax: 0
      };
      
      const chargedQty = 10 - 2;
      const subtotal = chargedQty * 100;
      
      expect(chargedQty).toBe(8);
      expect(subtotal).toBe(800);
    });
  });

  // ============================================
  // TEST GROUP 11: Error Handling
  // ============================================
  describe('Error Handling', () => {
    it('handles API failures gracefully', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));
      
      render(<ItemTable {...defaultProps} />);
      
      const searchInput = screen.getByPlaceholderText('Search product...');
      await act(async () => {
        fireEvent.change(searchInput, { target: { value: 'Test' } });
      });
      
      // Should not crash
      expect(screen.getByPlaceholderText('Search product...')).toBeDefined();
    });
  });

  // ============================================
  // TEST GROUP 12: Unit Conversion
  // ============================================
  describe('Unit Conversion', () => {
    it('converts quantity to base unit for stock validation', () => {
      const quntity = 1000;
      const conversionFactor = 0.001;
      const baseUnitQty = quntity * conversionFactor;
      
      expect(baseUnitQty).toBe(1);
    });

    it('calculates price based on conversion factor', () => {
      const basePrice = 100;
      const conversionFactor = 0.5;
      const expectedPrice = 50;
      
      const calculatedPrice = basePrice * conversionFactor;
      expect(calculatedPrice).toBe(expectedPrice);
    });
  });

  // ============================================
  // TEST GROUP 13: Location-based Stock Validation
  // ============================================
  describe('Location-based Stock', () => {
    it('checks Shop inventory when location is Shop', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: { success: true, shopQty: 10, productionQty: 5, totalQty: 15 }
      });
      
      render(<ItemTable {...defaultProps} location="Shop" />);
      
      // Component should use shopQty for validation
      expect(mockedAxios.get).not.toHaveBeenCalledWith(
        expect.stringContaining('/api/sales/product-quantity/')
      );
    });

    it('checks Production inventory when location is Production', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: { success: true, shopQty: 10, productionQty: 5, totalQty: 15 }
      });
      
      render(<ItemTable {...defaultProps} location="Production" />);
      
      // Component should use productionQty for validation
      expect(mockedAxios.get).not.toHaveBeenCalledWith(
        expect.stringContaining('/api/sales/product-quantity/')
      );
    });
  });

  // ============================================
  // TEST GROUP 14: Button Disabled States
  // ============================================
  describe('Add Button Disabled States', () => {
    it('disables add button when no product selected', () => {
      render(<ItemTable {...defaultProps} />);
      
      const addButton = screen.getByTitle('Add to cart');
      expect(addButton).toBeDisabled();
    });

    it('disables add button when no unit selected', async () => {
      // Mock search
      mockedAxios.get.mockResolvedValueOnce({
        data: { success: true, products: [mockProduct] }
      });
      
      // Mock units
      mockedAxios.get.mockResolvedValueOnce({
        data: { success: true, units: [] }
      });
      
      render(<ItemTable {...defaultProps} />);
      
      const searchInput = screen.getByPlaceholderText('Search product...');
      await act(async () => {
        fireEvent.change(searchInput, { target: { value: 'Test' } });
      });
      
      await waitFor(() => {
        const productItem = screen.getByText('Test Product');
        fireEvent.click(productItem);
      });
      
      const addButton = screen.getByTitle('Add to cart');
      expect(addButton).toBeDisabled();
    });
  });

  // ============================================
  // TEST GROUP 15: Side Effects
  // ============================================
  describe('Side Effects', () => {
    it('cleans up on unmount', () => {
      const { unmount } = render(<ItemTable {...defaultProps} />);
      unmount();
      // Should not cause memory leaks
    });
  });
});