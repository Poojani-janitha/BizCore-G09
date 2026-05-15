// auth.js — centralised localStorage helpers for user identity

export const getUserType = () => localStorage.getItem('user_type') || null;

export const getModules = () => {
    try {
        return JSON.parse(localStorage.getItem('modules') || '[]');
    } catch {
        return [];
    }
};

export const getFullName = () => localStorage.getItem('fullName') || 'User';

export const getUserId = () => localStorage.getItem('userId') || null;

export const isAuthenticated = () => !!localStorage.getItem('token');

export const hasModule = (moduleKey) => getModules().includes(moduleKey);

export const isAdmin    = () => getUserType() === 'Admin';
export const isManager  = () => getUserType() === 'Manager';
export const isCashier  = () => getUserType() === 'Cashier';
