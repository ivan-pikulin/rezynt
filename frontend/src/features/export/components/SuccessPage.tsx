import React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';

interface SuccessPageProps {
  onBackToStart?: () => void;
}

const SuccessPage: React.FC<SuccessPageProps> = ({ onBackToStart }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBackToStart) {
      onBackToStart();
    } else {
      navigate('/export');
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      bgcolor: '#f5f6fa',
      justifyContent: 'center',
      alignItems: 'center',
      p: { xs: 2, sm: 3, md: 4 }
    }}>
              {/* Congratulations card */}
      <Card sx={{
        maxWidth: { xs: '100%', sm: 500, md: 600 },
        width: '100%',
        textAlign: 'center',
        borderRadius: { xs: 0, sm: '12px' },
        boxShadow: { xs: 'none', sm: '0 8px 32px rgba(0, 0, 0, 0.1)' },
        bgcolor: 'white',
        position: 'relative',
        overflow: 'visible'
      }}>
        <CardContent sx={{
          p: { xs: 3, sm: 4, md: 5 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3
        }}>
          {/* Success icon */}
          <Box sx={{
            position: 'relative',
            mb: 2
          }}>
            <Box sx={{
              width: { xs: 80, sm: 100, md: 120 },
              height: { xs: 80, sm: 100, md: 120 },
              borderRadius: '50%',
              bgcolor: '#4caf50',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(76, 175, 80, 0.3)',
              animation: 'pulse 2s infinite'
            }}>
              <CheckCircleIcon sx={{
                fontSize: { xs: 48, sm: 60, md: 72 },
                color: 'white'
              }} />
            </Box>
          </Box>

          {/* Title */}
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 700,
              color: '#2c3e50',
              fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' },
              mb: 1
            }}
          >
            Download Complete!
          </Typography>

          {/* Description */}
          <Typography
            variant="body1"
            sx={{
              fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
              color: '#666',
              lineHeight: 1.6,
              mb: 4,
              maxWidth: '90%'
            }}
          >
            Your resume is ready to connect you with your next opportunity.
          </Typography>

          {/* Back button */}
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
            sx={{
              borderRadius: '8px',
              px: { xs: 3, sm: 4 },
              py: { xs: 1.5, sm: 2 },
              fontSize: { xs: '0.875rem', sm: '1rem' },
              fontWeight: 500,
              textTransform: 'none',
              borderColor: '#ddd',
              color: '#666',
              minHeight: { xs: 44, sm: 48 },
              '&:hover': {
                borderColor: '#999',
                bgcolor: '#f8f9fa'
              }
            }}
          >
            Back
          </Button>
        </CardContent>
      </Card>

              {/* CSS animation for pulsing */}
      <style>
        {`
          @keyframes pulse {
            0% {
              transform: scale(1);
              box-shadow: 0 4px 20px rgba(76, 175, 80, 0.3);
            }
            50% {
              transform: scale(1.05);
              box-shadow: 0 6px 30px rgba(76, 175, 80, 0.4);
            }
            100% {
              transform: scale(1);
              box-shadow: 0 4px 20px rgba(76, 175, 80, 0.3);
            }
          }
        `}
      </style>
    </Box>
  );
};

export default SuccessPage;
