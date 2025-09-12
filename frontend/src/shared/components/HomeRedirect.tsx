import React from 'react';
import { Navigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import { useResumes } from '../../features/resumes/hooks/useResumes';
import { useAuthContext } from '../contexts/AuthContext';
import { useOnboarding } from '../hooks/useOnboarding';
import GradientSpinnerAnimation from './GradientSpinnerAnimation';

const HomeRedirect: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading, user } = useAuthContext();
  const { shouldShowOnboarding } = useOnboarding(user);
  const { resumes, isLoading: resumesLoading } = useResumes();

  // If authentication is still loading, show loading
  if (authLoading) {
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
  }

  // If user is not authenticated, redirect to start page for guest flow
  if (!isAuthenticated) {
    return <Navigate to="/start" replace />;
  }

  // If onboarding needs to be shown, don't load resumes and redirect to start page
  if (shouldShowOnboarding) {
    return <Navigate to="/start" replace />;
  }

  // If resume data is still loading, show loading
  if (resumesLoading) {
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
  }

  // If user has resumes, redirect to resumes page
  if (resumes && Array.isArray(resumes) && resumes.length > 0) {
    return <Navigate to="/resumes" replace />;
  }

  // If user has no resumes, redirect to start page
  return <Navigate to="/start" replace />;
};

export default HomeRedirect;
