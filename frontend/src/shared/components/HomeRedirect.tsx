import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import { useAuthContext } from '../contexts/AuthContext';
import { useOnboarding } from '../hooks/useOnboarding';
import GradientSpinnerAnimation from './GradientSpinnerAnimation';

const HomeRedirect: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading, user } = useAuthContext();
  const { shouldShowOnboarding } = useOnboarding(user);
  const navigate = useNavigate();
  const [hasNavigated, setHasNavigated] = useState(false);

  useEffect(() => {
    // Prevent multiple navigations
    if (hasNavigated) {
      return;
    }

    // If authentication is still loading, don't navigate yet
    if (authLoading) {
      return;
    }

    // If user is not authenticated, redirect to start page for guest flow
    if (!isAuthenticated) {
      setHasNavigated(true);
      navigate('/start', { replace: true });
      return;
    }

    // If onboarding needs to be shown, redirect to start page
    if (shouldShowOnboarding) {
      setHasNavigated(true);
      navigate('/start', { replace: true });
      return;
    }

    // For authenticated users who have completed onboarding,
    // redirect to their resume editor (each user has one resume)
    setHasNavigated(true);
    navigate('/refine', { replace: true });
  }, [authLoading, isAuthenticated, shouldShowOnboarding, hasNavigated, navigate]);

  // Always show loading while determining where to redirect
  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      justifyContent: 'center',
      alignItems: 'center',
      bgcolor: '#f5f6fa'
    }}>
      <GradientSpinnerAnimation size={40} />
    </Box>
  );
};

export default HomeRedirect;
