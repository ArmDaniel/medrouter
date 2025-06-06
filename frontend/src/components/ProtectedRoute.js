import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, user } = useAuthStore((state) => ({
    isAuthenticated: state.isAuthenticated,
    user: state.user,
  }));

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // User is authenticated but does not have the required role
    // Redirect to a generic page or an "Unauthorized" page
    // For now, redirecting to home, but a dedicated unauthorized page would be better.
    return <Navigate to="/" replace />;
  }

  return <Outlet />; // Render child component if authenticated and authorized
};

export default ProtectedRoute;
