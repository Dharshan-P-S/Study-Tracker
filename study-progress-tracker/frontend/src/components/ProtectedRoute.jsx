import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const { user } = useAuth();

  // If there's a user, show the page they're trying to access (Outlet).
  // Otherwise, redirect them to the /login page.
  return user ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;