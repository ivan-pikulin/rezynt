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

  // Если аутентификация еще загружается, показываем загрузку
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

  // Если пользователь не аутентифицирован, перенаправляем на страницу входа
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // Если нужно показать онбординг, не загружаем резюме и перенаправляем на стартовую страницу
  if (shouldShowOnboarding) {
    return <Navigate to="/start" replace />;
  }

  // Если данные о резюме еще загружаются, показываем загрузку
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

  // Если у пользователя есть резюме, перенаправляем на страницу резюме
  if (resumes && Array.isArray(resumes) && resumes.length > 0) {
    return <Navigate to="/resumes" replace />;
  }

  // Если у пользователя нет резюме, перенаправляем на стартовую страницу
  return <Navigate to="/start" replace />;
};

export default HomeRedirect;
