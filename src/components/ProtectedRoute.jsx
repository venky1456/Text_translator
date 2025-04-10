import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token'); // Check if the user is logged in

  if (!token) {
    // If no token, redirect to the login page
    return <Navigate to="/login" replace />;
  }

  // If token exists, render the protected component
  return children;
};

export default ProtectedRoute;