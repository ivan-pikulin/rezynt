import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { useNavigate } from 'react-router-dom';
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
            Email подтвержден!
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {message || 'Ваш email успешно подтвержден. Теперь вы можете войти в систему.'}
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={handleGoToLogin}
            sx={{ mr: 2 }}
          >
            Войти
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
            Ошибка подтверждения
          </Typography>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error || message || 'Произошла ошибка при подтверждении email. Попробуйте еще раз.'}
          </Alert>
          <Button
            variant="contained"
            size="large"
            onClick={handleGoToStart}
            sx={{ mr: 2 }}
          >
            На главную
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={handleGoToLogin}
          >
            Войти
          </Button>
        </>
      )}
    </Box>
  );
};

export default EmailConfirmation;
