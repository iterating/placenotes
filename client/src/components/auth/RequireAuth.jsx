import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const RequireAuth = ({ children }) => {
  const location = useLocation();
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);

  if (!isAuthenticated) {
    // Redirect to login but save the attempted URL
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return children;
};

export default RequireAuth;
