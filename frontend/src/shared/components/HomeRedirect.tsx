import React from 'react';
import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { useResumes } from '../../features/resumes/hooks/useResumes';
import { useAuthContext } from '../contexts/AuthContext';
import { useOnboarding } from '../hooks/useOnboarding';

const HomeRedirect: React.FC = () => {
  const { t } = useTranslation();
  const { isAuthenticated, isLoading: authLoading, user } = useAuthContext();
  const { shouldShowOnboarding } = useOnboarding(user);
  const { resumes, isLoading: resumesLoading } = useResumes();

  // If authentication is still loading, show loading
  if (authLoading) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center',
        alignItems: 'center',
        bgcolor: '#f5f6fa'
      }}>
        <CircularProgress size={40} />
        <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
          {t('common.loading')}
        </Typography>
      </Box>
    );
  }

  // If user is not authenticated, redirect to login page
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
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
        flexDirection: 'column', 
        justifyContent: 'center',
        alignItems: 'center',
        bgcolor: '#f5f6fa'
      }}>
        <CircularProgress size={40} />
        <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
          {t('common.loadingResumes')}
        </Typography>
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
