import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { EmailConfirmationParams } from '../types/auth';

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
    navigate('/auth?mode=login');
  };

  const handleGoToStart = () => {
    navigate('/start');
  };

  return (
    <Box sx={{ textAlign: 'center' }}>
      {status === 'success' ? (
        <>
          <CheckCircleIcon 
            sx={{ 
              fontSize: 64, 
              color: 'success.main', 
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
            sx={{ mr: 2 }}
          >
            {t('auth.emailConfirmation.success.loginButton')}
          </Button>
        </>
      ) : (
        <>
          <ErrorIcon 
            sx={{ 
              fontSize: 64, 
              color: 'error.main', 
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
            onClick={handleGoToStart}
            sx={{ mr: 2 }}
          >
            {t('auth.emailConfirmation.error.homeButton')}
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={handleGoToLogin}
          >
            {t('auth.emailConfirmation.error.loginButton')}
          </Button>
        </>
      )}
    </Box>
  );
};

export default EmailConfirmation;
