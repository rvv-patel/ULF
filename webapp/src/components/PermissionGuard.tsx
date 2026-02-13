import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface PermissionGuardProps {
    permission: string;
    children?: React.ReactNode;
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({ permission, children }) => {
    const { hasPermission } = useAuth();

    if (!hasPermission(permission)) {
        return <Navigate to="/" replace />;
    }

    return <>{children || <Outlet />}</>;
};

export default PermissionGuard;
