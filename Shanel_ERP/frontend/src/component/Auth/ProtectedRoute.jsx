import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated, getUserType } from '../../utils/auth';

/**
 * ProtectedRoute
 * @param {string[]} allowedRoles  — if empty/undefined, any authenticated user can access
 * @param {ReactNode} children
 */
const ProtectedRoute = ({ allowedRoles, children }) => {
    if (!isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && allowedRoles.length > 0) {
        const userType = getUserType();
        if (!allowedRoles.includes(userType)) {
            // User is authenticated but doesn't have the right role → back to their own home
            return <Navigate to="/home" replace />;
        }
    }

    return children;
};

export default ProtectedRoute;
