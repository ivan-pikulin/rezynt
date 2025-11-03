import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box } from '@mui/material';
import GradientSpinnerAnimation from './GradientSpinnerAnimation';
import { useAuthContext } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true 
}) => {
  const { isAuthenticated, isLoading, user } = useAuthContext();
  const location = useLocation();

  if (isLoading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
      >
        <GradientSpinnerAnimation size={40} />
      </Box>
    );
  }

  if (requireAuth && !isAuthenticated) {
    // Save current path for redirect after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!requireAuth && isAuthenticated && user?.is_registered) {
    // If user is authenticated AND registered, redirect away from auth pages
    // Guest users (not registered) should still be able to access login/signup
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
