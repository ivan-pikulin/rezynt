import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import DownloadIcon from '@mui/icons-material/Download';
import LockIcon from '@mui/icons-material/Lock';
import CircularProgress from '@mui/material/CircularProgress';
import ProModal from './ProModal';

interface DownloadOptionsProps {
  onExportPDF?: () => Promise<void>;
  isExporting?: boolean;
}

const DownloadOptions: React.FC<DownloadOptionsProps> = ({ onExportPDF, isExporting = false }) => {
  const [isProModalOpen, setIsProModalOpen] = useState(false);

  const handleWatermarkedDownload = async () => {
    try {
      if (onExportPDF) {
        await onExportPDF();
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
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
            cursor: isExporting ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            opacity: isExporting ? 0.7 : 0.6,
            '&:hover': {
              transform: isExporting ? 'none' : 'translateY(-4px)',
              boxShadow: isExporting ? '0 2px 8px rgba(0,0,0,0.1)' : '0 8px 25px rgba(0,0,0,0.15)',
              opacity: isExporting ? 0.7 : 0.8
            }
          }}
          onClick={isExporting ? undefined : handleWatermarkedDownload}
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
            {isExporting ? (
              <CircularProgress 
                size={64} 
                sx={{ 
                  color: '#757575',
                  mb: 2
                }} 
              />
            ) : (
              <DownloadIcon sx={{ 
                fontSize: 64, 
                color: '#757575',
                mb: 2
              }} />
            )}
            <Typography 
              variant="h5" 
              component="h2" 
              sx={{ 
                mb: 2,
                fontWeight: 600,
                color: '#757575'
              }}
            >
              {isExporting ? 'Generating PDF...' : 'Watermarked Download'}
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                mb: 3,
                color: '#757575'
              }}
            >
              {isExporting ? 'Please wait while we prepare your resume' : 'Download your resume with watermarks'}
            </Typography>
            <Button 
              variant="outlined" 
              size="large"
              disabled={isExporting}
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
                },
                '&:disabled': {
                  borderColor: '#bdbdbd',
                  color: '#bdbdbd'
                }
              }}
            >
              {isExporting ? 'Processing...' : 'Download'}
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