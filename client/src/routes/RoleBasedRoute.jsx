import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RoleBasedRoute({ allowedRoles }) {
    const { user, hasRole } = useAuth();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (!hasRole(allowedRoles)) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
}
