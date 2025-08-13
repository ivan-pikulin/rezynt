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
        flexDirection: { xs: 'column', md: 'row' }, // Вертикально на мобильных, горизонтально на десктопе
        gap: { xs: 2, sm: 3, md: 4 }, // Адаптивные отступы между карточками
        maxWidth: { xs: '100%', sm: 700, md: 800 }, // Уменьшаем максимальную ширину на мобильных
        width: '100%'
      }}>
        {/* Watermarked Download */}
        <Card 
          sx={{ 
            flex: 1,
            cursor: isExporting ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            opacity: isExporting ? 0.7 : 0.6,
            minHeight: { xs: 200, sm: 250, md: 300 }, // Адаптивная высота
            '&:hover': {
              transform: { xs: 'none', md: isExporting ? 'none' : 'translateY(-4px)' }, // Отключаем hover на мобильных
              boxShadow: { xs: '0 2px 8px rgba(0,0,0,0.1)', md: isExporting ? '0 2px 8px rgba(0,0,0,0.1)' : '0 8px 25px rgba(0,0,0,0.15)' },
              opacity: { xs: 0.6, md: isExporting ? 0.7 : 0.8 }
            },
            '&:active': {
              transform: { xs: 'scale(0.98)', md: isExporting ? 'none' : 'translateY(-4px)' }, // Touch feedback на мобильных
              boxShadow: { xs: '0 1px 4px rgba(0,0,0,0.1)', md: isExporting ? '0 2px 8px rgba(0,0,0,0.1)' : '0 8px 25px rgba(0,0,0,0.15)' }
            }
          }}
          onClick={isExporting ? undefined : handleWatermarkedDownload}
        >
          <CardContent sx={{ 
            textAlign: 'center', 
            p: { xs: 2.5, sm: 3, md: 4 }, // Адаптивные отступы
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            {isExporting ? (
              <CircularProgress 
                size={48} 
                sx={{ 
                  color: '#757575',
                  mb: { xs: 1.5, sm: 2 }
                }} 
              />
            ) : (
              <DownloadIcon sx={{ 
                fontSize: { xs: 48, sm: 56, md: 64 }, // Адаптивный размер иконки
                color: '#757575',
                mb: { xs: 1.5, sm: 2 }
              }} />
            )}
            <Typography 
              variant="h5" 
              component="h2" 
              sx={{ 
                mb: { xs: 1.5, sm: 2 },
                fontWeight: 600,
                color: '#757575',
                fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' } // Адаптивный размер шрифта
              }}
            >
              {isExporting ? 'Generating PDF...' : 'Watermarked Download'}
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                mb: { xs: 2, sm: 3 },
                color: '#757575',
                fontSize: { xs: '0.8rem', sm: '0.875rem', md: '1rem' } // Адаптивный размер шрифта
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
                px: { xs: 2.5, sm: 3, md: 4 }, // Адаптивные горизонтальные отступы
                py: { xs: 1, sm: 1.25, md: 1.5 }, // Адаптивные вертикальные отступы
                fontSize: { xs: '0.8rem', sm: '0.875rem', md: '1rem' },
                fontWeight: 600,
                textTransform: 'none',
                borderColor: '#757575',
                color: '#757575',
                minHeight: { xs: 40, sm: 44, md: 48 }, // Минимальная высота для touch
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
            minHeight: { xs: 200, sm: 250, md: 300 }, // Адаптивная высота
            '&:hover': {
              transform: { xs: 'none', md: 'translateY(-4px)' }, // Отключаем hover на мобильных
              boxShadow: { xs: '0 2px 8px rgba(25, 118, 210, 0.2)', md: '0 8px 25px rgba(25, 118, 210, 0.3)' }
            },
            '&:active': {
              transform: { xs: 'scale(0.98)', md: 'translateY(-4px)' }, // Touch feedback на мобильных
              boxShadow: { xs: '0 1px 4px rgba(25, 118, 210, 0.2)', md: '0 8px 25px rgba(25, 118, 210, 0.3)' }
            }
          }}
          onClick={handleCleanDownload}
        >
          <CardContent sx={{ 
            textAlign: 'center', 
            p: { xs: 2.5, sm: 3, md: 4 }, // Адаптивные отступы
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <LockIcon sx={{ 
              fontSize: { xs: 48, sm: 56, md: 64 }, // Адаптивный размер иконки
              color: '#1976d2',
              mb: { xs: 1.5, sm: 2 }
            }} />
            <Typography 
              variant="h5" 
              component="h2" 
              sx={{ 
                mb: { xs: 1.5, sm: 2 },
                fontWeight: 600,
                color: '#1976d2',
                fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' } // Адаптивный размер шрифта
              }}
            >
              Clean Download
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                mb: { xs: 2, sm: 3 },
                color: '#1976d2',
                fontSize: { xs: '0.8rem', sm: '0.875rem', md: '1rem' } // Адаптивный размер шрифта
              }}
            >
              Download without watermarks (Pro feature)
            </Typography>
            <Button 
              variant="contained" 
              size="large"
              sx={{
                borderRadius: '8px',
                px: { xs: 2.5, sm: 3, md: 4 }, // Адаптивные горизонтальные отступы
                py: { xs: 1, sm: 1.25, md: 1.5 }, // Адаптивные вертикальные отступы
                fontSize: { xs: '0.8rem', sm: '0.875rem', md: '1rem' },
                fontWeight: 600,
                textTransform: 'none',
                bgcolor: '#1976d2',
                minHeight: { xs: 40, sm: 44, md: 48 }, // Минимальная высота для touch
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