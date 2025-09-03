import React from 'react';
import { Container, Paper, Box } from '@mui/material';
import RequestPasswordResetForm from './components/RequestPasswordResetForm';
import { useNavigate } from 'react-router-dom';

const RequestPasswordResetPage: React.FC = () => {
  const navigate = useNavigate();

  const handleBackToLogin = () => {
    navigate('/auth');
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <RequestPasswordResetForm onBackToLogin={handleBackToLogin} />
        </Paper>
      </Box>
    </Container>
  );
};

export default RequestPasswordResetPage;
