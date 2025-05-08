import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface PrivateRouteProps {
  children: React.ReactElement;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { userName } = useAuth();

  if (!userName) {
    // Not logged in - redirect to login page
    return <Navigate to="/login" replace />;
  }

  // Logged in - render children
  return children;
};
