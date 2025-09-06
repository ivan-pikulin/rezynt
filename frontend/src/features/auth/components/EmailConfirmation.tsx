import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { COLORS } from '../../../shared/theme/theme';

interface EmailConfirmationProps {
  status: 'success' | 'error';
  message?: string;
  error?: string;
}

const EmailConfirmation: React.FC<EmailConfirmationProps> = ({ 
  status, 
  message, 
  error 
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleGoToLogin = () => {
    navigate('/login');
  };

  const handleGoToHome = () => {
    navigate('/');
  };

  return (
    <Box sx={{ textAlign: 'center' }}>
      {status === 'success' ? (
        <>
          <CheckCircleIcon 
            sx={{ 
              fontSize: 64, 
              color: COLORS.success.main, 
              mb: 2 
            }} 
          />
          <Typography variant="h5" component="h2" gutterBottom>
            {t('auth.emailConfirmation.success.title')}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {message || t('auth.emailConfirmation.success.message')}
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={handleGoToLogin}
            sx={{ 
              mr: 2,
              bgcolor: COLORS.primary.main,
              '&:hover': {
                bgcolor: COLORS.primary.dark
              }
            }}
          >
            {t('auth.emailConfirmation.success.loginButton')}
          </Button>
        </>
      ) : (
        <>
          <ErrorIcon 
            sx={{ 
              fontSize: 64, 
              color: COLORS.error.main, 
              mb: 2 
            }} 
          />
          <Typography variant="h5" component="h2" gutterBottom>
            {t('auth.emailConfirmation.error.title')}
          </Typography>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error || message || t('auth.emailConfirmation.error.message')}
          </Alert>
          <Button
            variant="contained"
            size="large"
            onClick={handleGoToHome}
            sx={{ 
              mr: 2,
              bgcolor: COLORS.primary.main,
              '&:hover': {
                bgcolor: COLORS.primary.dark
              }
            }}
          >
            {t('auth.emailConfirmation.error.homeButton')}
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={handleGoToLogin}
            sx={{
              borderColor: COLORS.primary.main,
              color: COLORS.primary.main,
              '&:hover': {
                borderColor: COLORS.primary.dark,
                color: COLORS.primary.dark,
                bgcolor: COLORS.primary.light
              }
            }}
          >
            {t('auth.emailConfirmation.error.loginButton')}
          </Button>
        </>
      )}
    </Box>
  );
};

export default EmailConfirmation;
