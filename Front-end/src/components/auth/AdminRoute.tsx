import React from 'react';
import AdminProtectedRoute from './AdminProtectedRoute';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => (
  <AdminProtectedRoute>{children}</AdminProtectedRoute>
);

export default AdminRoute;

