import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import DownloadIcon from '@mui/icons-material/Download';
import LockIcon from '@mui/icons-material/Lock';
import ProModal from './ProModal';

const DownloadOptions: React.FC = () => {
  const [isProModalOpen, setIsProModalOpen] = useState(false);

  const handleWatermarkedDownload = () => {
    // Логика для загрузки с водяными знаками
    console.log('Downloading with watermarks');
  };

  const handleCleanDownload = () => {
    setIsProModalOpen(true);
  };

  const handleCloseProModal = () => {
    setIsProModalOpen(false);
  };

  return (
    <>
      <Box sx={{ 
        display: 'flex', 
        gap: 4, 
        maxWidth: 800,
        width: '100%'
      }}>
        {/* Watermarked Download */}
        <Card 
          sx={{ 
            flex: 1,
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            opacity: 0.6,
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
              opacity: 0.8
            }
          }}
          onClick={handleWatermarkedDownload}
        >
          <CardContent sx={{ 
            textAlign: 'center', 
            p: 4,
            height: 300,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <DownloadIcon sx={{ 
              fontSize: 64, 
              color: '#757575',
              mb: 2
            }} />
            <Typography 
              variant="h5" 
              component="h2" 
              sx={{ 
                mb: 2,
                fontWeight: 600,
                color: '#757575'
              }}
            >
              Watermarked Download
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                mb: 3,
                color: '#757575'
              }}
            >
              Download your resume with watermarks
            </Typography>
            <Button 
              variant="outlined" 
              size="large"
              sx={{
                borderRadius: '8px',
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'none',
                borderColor: '#757575',
                color: '#757575',
                '&:hover': {
                  borderColor: '#616161',
                  color: '#616161'
                }
              }}
            >
              Download
            </Button>
          </CardContent>
        </Card>

        {/* Clean Download */}
        <Card 
          sx={{ 
            flex: 1,
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            border: '2px solid #1976d2',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 8px 25px rgba(25, 118, 210, 0.3)'
            }
          }}
          onClick={handleCleanDownload}
        >
          <CardContent sx={{ 
            textAlign: 'center', 
            p: 4,
            height: 300,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <LockIcon sx={{ 
              fontSize: 64, 
              color: '#1976d2',
              mb: 2
            }} />
            <Typography 
              variant="h5" 
              component="h2" 
              sx={{ 
                mb: 2,
                fontWeight: 600,
                color: '#1976d2'
              }}
            >
              Clean Download
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                mb: 3,
                color: '#1976d2'
              }}
            >
              Download without watermarks (Pro feature)
            </Typography>
            <Button 
              variant="contained" 
              size="large"
              sx={{
                borderRadius: '8px',
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'none',
                bgcolor: '#1976d2',
                '&:hover': {
                  bgcolor: '#1565c0'
                }
              }}
            >
              Upgrade to Pro
            </Button>
          </CardContent>
        </Card>
      </Box>

      {/* Pro Modal */}
      <ProModal 
        open={isProModalOpen} 
        onClose={handleCloseProModal} 
      />
    </>
  );
};

export default DownloadOptions; 