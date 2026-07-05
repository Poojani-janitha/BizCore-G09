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
 *
 *  NOTE — Label association:
 *    LoginForm.jsx renders <label> tags without htmlFor / for attributes,
 *    so inputs are queried by type attribute (text / password) instead of
 *    getByLabelText. All queries accurately reflect the real DOM.
 * ════════════════════════════════════════════════════════════
 */

import React from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

import LoginForm from '../../pages/User/LoginForm';

// ─── Mock react-router-dom navigate ─────────────────────────
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// ─── Mock global fetch ───────────────────────────────────────
const mockFetch = vi.fn();
global.fetch = mockFetch;

// ─── Mock localStorage ───────────────────────────────────────
const localStorageMock = (() => {
  let store = {};
  return {
    getItem:    (key)        => store[key] ?? null,
    setItem:    (key, value) => { store[key] = String(value); },
    removeItem: (key)        => { delete store[key]; },
    clear:      ()           => { store = {}; },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// ─── Mock window.location.href (LoginForm does a hard redirect) ─
Object.defineProperty(window, 'location', {
  writable: true,
  value:    { href: '' },
});

// ─── Reusable render + input helpers ────────────────────────
// LoginForm uses <label> without htmlFor, so we query by input type.
const renderLoginForm = () =>
  render(
    <BrowserRouter>
      <LoginForm />
    </BrowserRouter>
  );

/** Returns the text (username) input */
const getUsernameInput = () =>
  document.querySelector('input[type="text"]');

/** Returns the password input */
const getPasswordInput = () =>
  document.querySelector('input[type="password"]');

// ─── Shared successful API response ─────────────────────────
const successResponse = {
  success:       true,
  access_token:  'mocked_access_token',
  refresh_token: 'mocked_refresh_token',
  modules:       ['inventory', 'sales', 'hr', 'finance'],
  user_id:       1,
  username:      'admin@shanel.com',
  user_type:     'Admin',
  full_name:     'Admin User',
};

// ════════════════════════════════════════════════════════════
//  Setup / Teardown
// ════════════════════════════════════════════════════════════
beforeEach(() => {
  vi.clearAllMocks();
  localStorageMock.clear();
  window.location.href = '';
});

afterEach(() => {
  vi.restoreAllMocks();
});


// ════════════════════════════════════════════════════════════
//  TEST GROUP 1 — Step 1: Login Page Renders Correctly
//  TC Step #1 — "Open the application in the browser →
//                Login page is displayed"
// ════════════════════════════════════════════════════════════
describe('SERP/TC/001 — Step 1: Login Page Is Displayed', () => {

  it('renders the login page heading "Login to BizCore"', () => {
    renderLoginForm();
    expect(screen.getByText('Login to BizCore')).toBeInTheDocument();
  });

  it('renders a Username label', () => {
    renderLoginForm();
    expect(screen.getByText('Username')).toBeInTheDocument();
  });

  it('renders a Password label', () => {
    renderLoginForm();
    expect(screen.getByText('Password')).toBeInTheDocument();
  });

  it('renders the Login button', () => {
    renderLoginForm();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('renders the username input as type="text"', () => {
    renderLoginForm();
    const input = getUsernameInput();
    expect(input).not.toBeNull();
    expect(input.type).toBe('text');
  });

  it('renders the password input as type="password" (masked)', () => {
    renderLoginForm();
    const input = getPasswordInput();
    expect(input).not.toBeNull();
    expect(input.type).toBe('password');
  });

});


// ════════════════════════════════════════════════════════════
//  TEST GROUP 2 — Step 2: Enter Valid Admin Credentials
//  TC Step #2 — "Enter valid Admin email and password →
//                Credentials accepted"
// ════════════════════════════════════════════════════════════
describe('SERP/TC/001 — Step 2: Admin Credentials Are Entered', () => {

  it('accepts typed value in the username field', async () => {
    renderLoginForm();
    const usernameInput = getUsernameInput();

    await act(async () => {
      await userEvent.type(usernameInput, 'admin@shanel.com');
    });

    expect(usernameInput.value).toBe('admin@shanel.com');
  });

  it('accepts typed value in the password field', async () => {
    renderLoginForm();
    const passwordInput = getPasswordInput();

    await act(async () => {
      await userEvent.type(passwordInput, 'Admin@1234');
    });

    expect(passwordInput.value).toBe('Admin@1234');
  });

  it('both fields hold the correct test-data values simultaneously', async () => {
    renderLoginForm();
    const usernameInput = getUsernameInput();
    const passwordInput = getPasswordInput();

    await act(async () => {
      await userEvent.type(usernameInput, 'admin@shanel.com');
      await userEvent.type(passwordInput, 'Admin@1234');
    });

    expect(usernameInput.value).toBe('admin@shanel.com');
    expect(passwordInput.value).toBe('Admin@1234');
  });

});


// ════════════════════════════════════════════════════════════
//  TEST GROUP 3 — Step 3: Click Login — System Authenticates
//  TC Step #3 — "Click the Login button →
//                System authenticates and redirects"
// ════════════════════════════════════════════════════════════
describe('SERP/TC/001 — Step 3: Login Button Authenticates Admin', () => {

  it('calls the login API endpoint with correct credentials on form submit', async () => {
    // ARRANGE
    mockFetch.mockResolvedValueOnce({ json: async () => successResponse });

    renderLoginForm();
    const loginButton = screen.getByRole('button', { name: /login/i });

    // ACT
    await act(async () => {
      await userEvent.type(getUsernameInput(), 'admin@shanel.com');
      await userEvent.type(getPasswordInput(), 'Admin@1234');
      fireEvent.click(loginButton);
    });

    // ASSERT — correct URL, method, and body
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/users/login',
        expect.objectContaining({
          method:  'POST',
          headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
          body:    JSON.stringify({
            username: 'admin@shanel.com',
            password: 'Admin@1234',
          }),
        })
      );
    });
  });

  it('stores access_token in localStorage on successful login', async () => {
    mockFetch.mockResolvedValueOnce({ json: async () => successResponse });
    renderLoginForm();

    await act(async () => {
      await userEvent.type(getUsernameInput(), 'admin@shanel.com');
      await userEvent.type(getPasswordInput(), 'Admin@1234');
      fireEvent.click(screen.getByRole('button', { name: /login/i }));
    });

    await waitFor(() => {
      expect(localStorageMock.getItem('token')).toBe('mocked_access_token');
    });
  });

  it('stores refresh_token in localStorage on successful login', async () => {
    mockFetch.mockResolvedValueOnce({ json: async () => successResponse });
    renderLoginForm();

    await act(async () => {
      await userEvent.type(getUsernameInput(), 'admin@shanel.com');
      await userEvent.type(getPasswordInput(), 'Admin@1234');
      fireEvent.click(screen.getByRole('button', { name: /login/i }));
    });

    await waitFor(() => {
      expect(localStorageMock.getItem('refresh_token')).toBe('mocked_refresh_token');
    });
  });

  it('stores user_type "Admin" in localStorage on successful login', async () => {
    mockFetch.mockResolvedValueOnce({ json: async () => successResponse });
    renderLoginForm();

    await act(async () => {
      await userEvent.type(getUsernameInput(), 'admin@shanel.com');
      await userEvent.type(getPasswordInput(), 'Admin@1234');
      fireEvent.click(screen.getByRole('button', { name: /login/i }));
    });

    await waitFor(() => {
      expect(localStorageMock.getItem('user_type')).toBe('Admin');
    });
  });

  it('stores full_name in localStorage on successful login', async () => {
    mockFetch.mockResolvedValueOnce({ json: async () => successResponse });
    renderLoginForm();

    await act(async () => {
      await userEvent.type(getUsernameInput(), 'admin@shanel.com');
      await userEvent.type(getPasswordInput(), 'Admin@1234');
      fireEvent.click(screen.getByRole('button', { name: /login/i }));
    });

    await waitFor(() => {
      expect(localStorageMock.getItem('fullName')).toBe('Admin User');
    });
  });

  it('stores modules list in localStorage on successful login', async () => {
    mockFetch.mockResolvedValueOnce({ json: async () => successResponse });
    renderLoginForm();

    await act(async () => {
      await userEvent.type(getUsernameInput(), 'admin@shanel.com');
      await userEvent.type(getPasswordInput(), 'Admin@1234');
      fireEvent.click(screen.getByRole('button', { name: /login/i }));
    });

    await waitFor(() => {
      expect(localStorageMock.getItem('modules')).toBe(
        JSON.stringify(['inventory', 'sales', 'hr', 'finance'])
      );
    });
  });

});


// ════════════════════════════════════════════════════════════
//  TEST GROUP 4 — Step 4: Admin Home Dashboard Is Displayed
//  TC Step #4 — "Observe the dashboard loaded →
//                Admin Home Dashboard displayed with sidebar"
// ════════════════════════════════════════════════════════════
describe('SERP/TC/001 — Step 4: Redirect to Admin Home Dashboard', () => {

  it('redirects to /home after successful admin login', async () => {
    // ARRANGE
    mockFetch.mockResolvedValueOnce({ json: async () => successResponse });
    renderLoginForm();

    // ACT
    await act(async () => {
      await userEvent.type(getUsernameInput(), 'admin@shanel.com');
      await userEvent.type(getPasswordInput(), 'Admin@1234');
      fireEvent.click(screen.getByRole('button', { name: /login/i }));
    });

    // ASSERT — LoginForm does window.location.href = '/home' to force
    //           a full page reload so the sidebar/header picks up localStorage
    await waitFor(() => {
      expect(window.location.href).toBe('/home');
    });
  });

  it('all required localStorage keys are set before redirect occurs', async () => {
    mockFetch.mockResolvedValueOnce({ json: async () => successResponse });
    renderLoginForm();

    await act(async () => {
      await userEvent.type(getUsernameInput(), 'admin@shanel.com');
      await userEvent.type(getPasswordInput(), 'Admin@1234');
      fireEvent.click(screen.getByRole('button', { name: /login/i }));
    });

    // Every key the sidebar / header depends on must be populated
    await waitFor(() => {
      expect(localStorageMock.getItem('token')).toBeTruthy();
      expect(localStorageMock.getItem('refresh_token')).toBeTruthy();
      expect(localStorageMock.getItem('user_type')).toBe('Admin');
      expect(localStorageMock.getItem('userId')).toBe('1');
      expect(localStorageMock.getItem('fullName')).toBe('Admin User');
      expect(window.location.href).toBe('/home');
    });
  });

});


// ════════════════════════════════════════════════════════════
//  TEST GROUP 5 — Negative: Invalid Credentials
// ════════════════════════════════════════════════════════════
describe('SERP/TC/001 — Negative: Invalid Credentials', () => {

  it('shows alert and does NOT redirect when credentials are wrong', async () => {
    mockFetch.mockResolvedValueOnce({
      json: async () => ({ success: false, error: 'Invalid username or password' }),
    });
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
    renderLoginForm();

    await act(async () => {
      await userEvent.type(getUsernameInput(), 'admin@shanel.com');
      await userEvent.type(getPasswordInput(), 'WrongPassword');
      fireEvent.click(screen.getByRole('button', { name: /login/i }));
    });

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith('Invalid username or password');
      expect(window.location.href).not.toBe('/home');
      expect(localStorageMock.getItem('token')).toBeNull();
    });

    alertMock.mockRestore();
  });

  it('shows alert and does NOT redirect when account is locked', async () => {
    mockFetch.mockResolvedValueOnce({
      json: async () => ({ success: false, error: 'Account is locked. Try again later.' }),
    });
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
    renderLoginForm();

    await act(async () => {
      await userEvent.type(getUsernameInput(), 'admin@shanel.com');
      await userEvent.type(getPasswordInput(), 'Admin@1234');
      fireEvent.click(screen.getByRole('button', { name: /login/i }));
    });

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith('Account is locked. Try again later.');
      expect(localStorageMock.getItem('token')).toBeNull();
    });

    alertMock.mockRestore();
  });

  it('shows alert and does NOT redirect when account is inactive', async () => {
    mockFetch.mockResolvedValueOnce({
      json: async () => ({ success: false, error: 'Account is inactive or suspended' }),
    });
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
    renderLoginForm();

    await act(async () => {
      await userEvent.type(getUsernameInput(), 'admin@shanel.com');
      await userEvent.type(getPasswordInput(), 'Admin@1234');
      fireEvent.click(screen.getByRole('button', { name: /login/i }));
    });

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith('Account is inactive or suspended');
      expect(localStorageMock.getItem('token')).toBeNull();
    });

    alertMock.mockRestore();
  });

});


// ════════════════════════════════════════════════════════════
//  TEST GROUP 6 — Negative: Empty Form Submission
// ════════════════════════════════════════════════════════════
describe('SERP/TC/001 — Negative: Empty Form Submission', () => {

  it('username input has the required attribute', () => {
    renderLoginForm();
    const input = getUsernameInput();
    expect(input).not.toBeNull();
    expect(input).toHaveAttribute('required');
  });

  it('password input has the required attribute', () => {
    renderLoginForm();
    const input = getPasswordInput();
    expect(input).not.toBeNull();
    expect(input).toHaveAttribute('required');
  });

  it('does NOT call the API when the form is submitted empty', async () => {
    renderLoginForm();

    await act(async () => {
      // Click submit without filling any fields
      fireEvent.click(screen.getByRole('button', { name: /login/i }));
    });

    // HTML5 required validation stops submission — fetch is never called
    expect(mockFetch).not.toHaveBeenCalled();
  });

});


// ════════════════════════════════════════════════════════════
//  TEST GROUP 7 — Network / Server Error Handling
// ════════════════════════════════════════════════════════════
describe('SERP/TC/001 — Network & Server Error Handling', () => {

  it('shows generic error alert when fetch throws a network error', async () => {
    // Simulate server unreachable (no internet / port 5000 down)
    mockFetch.mockRejectedValueOnce(new Error('Network Error'));
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
    renderLoginForm();

    await act(async () => {
      await userEvent.type(getUsernameInput(), 'admin@shanel.com');
      await userEvent.type(getPasswordInput(), 'Admin@1234');
      fireEvent.click(screen.getByRole('button', { name: /login/i }));
    });

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith('An error occurred during login');
      expect(localStorageMock.getItem('token')).toBeNull();
      expect(window.location.href).not.toBe('/home');
    });

    alertMock.mockRestore();
  });

  it('does not crash the page when the server is down', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Failed to fetch'));
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
    renderLoginForm();

    await act(async () => {
      await userEvent.type(getUsernameInput(), 'admin@shanel.com');
      await userEvent.type(getPasswordInput(), 'Admin@1234');
      fireEvent.click(screen.getByRole('button', { name: /login/i }));
    });

    // The login form must still be visible — no crash, no blank screen
    await waitFor(() => {
      expect(screen.getByText('Login to BizCore')).toBeInTheDocument();
    });

    alertMock.mockRestore();
  });

});
