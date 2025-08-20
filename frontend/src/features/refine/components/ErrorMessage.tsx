import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => {
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center',
      height: '100%',
      gap: 2,
      p: 3
    }}>
      <Typography variant="h6" color="error" align="center">
        Ошибка
      </Typography>
      <Typography variant="body2" color="text.secondary" align="center">
        {message}
      </Typography>
      {onRetry && (
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={onRetry}
          sx={{ mt: 2 }}
        >
          Попробовать снова
        </Button>
      )}
    </Box>
  );
};

export default ErrorMessage;
