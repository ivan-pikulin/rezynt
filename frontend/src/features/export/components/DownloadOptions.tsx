import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import DownloadIcon from '@mui/icons-material/Download';
import CircularProgress from '@mui/material/CircularProgress';
import PaywallModal from '../../../shared/components/PaywallModal';
import { COLORS } from '../../../shared/theme/theme';

interface DownloadOptionsProps {
  onExportPDF?: () => Promise<void>;
  isPremium?: boolean;
}

const DownloadOptions: React.FC<DownloadOptionsProps> = ({ onExportPDF, isPremium = false }) => {
  const [isPaywallModalOpen, setIsPaywallModalOpen] = useState(false);
  const [isWatermarkedExporting, setIsWatermarkedExporting] = useState(false);
  const [isCleanExporting, setIsCleanExporting] = useState(false);

  const handleWatermarkedDownload = async () => {
    try {
      setIsWatermarkedExporting(true);
      if (onExportPDF) {
        await onExportPDF();
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
    } finally {
      setIsWatermarkedExporting(false);
    }
  };

  const handleCleanDownload = async () => {
    if (isPremium) {
      // Для premium пользователей напрямую экспортируем
      try {
        setIsCleanExporting(true);
        if (onExportPDF) {
          await onExportPDF();
        }
      } catch (error) {
        console.error('Error downloading PDF:', error);
      } finally {
        setIsCleanExporting(false);
      }
    } else {
      // Для обычных пользователей показываем paywall
      setIsPaywallModalOpen(true);
    }
  };

  const handleClosePaywallModal = () => {
    setIsPaywallModalOpen(false);
  };

  const handlePaywallSuccess = () => {
    setIsPaywallModalOpen(false);
    // После успешной оплаты можно выполнить дополнительную логику
  };

  return (
    <>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', md: isPremium ? 'column' : 'row' }, // Для premium показываем только одну карточку
        gap: { xs: 2, sm: 3, md: 4 }, // Адаптивные отступы между карточками
        maxWidth: { xs: '100%', sm: isPremium ? 500 : 700, md: isPremium ? 600 : 800 }, // Уменьшаем ширину для premium
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        {/* Watermarked Download - показываем только для не-premium пользователей */}
        {!isPremium && (
          <Card 
          sx={{ 
            flex: 1,
            cursor: isWatermarkedExporting ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            opacity: isWatermarkedExporting ? 0.7 : 0.6,
            minHeight: { xs: 200, sm: 250, md: 300 }, // Адаптивная высота
            '&:hover': {
              transform: { xs: 'none', md: isWatermarkedExporting ? 'none' : 'translateY(-4px)' }, // Отключаем hover на мобильных
              boxShadow: { xs: '0 2px 8px rgba(0,0,0,0.1)', md: isWatermarkedExporting ? '0 2px 8px rgba(0,0,0,0.1)' : '0 8px 25px rgba(0,0,0,0.15)' },
              opacity: { xs: 0.6, md: isWatermarkedExporting ? 0.7 : 0.8 }
            },
            '&:active': {
              transform: { xs: 'scale(0.98)', md: isWatermarkedExporting ? 'none' : 'translateY(-4px)' }, // Touch feedback на мобильных
              boxShadow: { xs: '0 1px 4px rgba(0,0,0,0.1)', md: isWatermarkedExporting ? '0 2px 8px rgba(0,0,0,0.1)' : '0 8px 25px rgba(0,0,0,0.15)' }
            }
          }}
          onClick={isWatermarkedExporting ? undefined : handleWatermarkedDownload}
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
            {isWatermarkedExporting ? (
              <CircularProgress 
                size={48} 
                sx={{ 
                  color: COLORS.grey[600],
                  mb: { xs: 1.5, sm: 2 }
                }} 
              />
            ) : (
              <DownloadIcon sx={{ 
                fontSize: { xs: 48, sm: 56, md: 64 }, // Адаптивный размер иконки
                color: COLORS.grey[600],
                mb: { xs: 1.5, sm: 2 }
              }} />
            )}
            <Typography 
              variant="h5" 
              component="h2" 
              sx={{ 
                mb: { xs: 1.5, sm: 2 },
                fontWeight: 600,
                color: COLORS.grey[600],
                fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' } // Адаптивный размер шрифта
              }}
            >
              {isWatermarkedExporting ? 'Generating PDF...' : 'Watermarked Download'}
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                mb: { xs: 2, sm: 3 },
                color: COLORS.grey[600],
                fontSize: { xs: '0.8rem', sm: '0.875rem', md: '1rem' } // Адаптивный размер шрифта
              }}
            >
              {isWatermarkedExporting ? 'Please wait while we prepare your resume' : 'Download your resume with watermarks'}
            </Typography>
            <Button 
              variant="outlined" 
              size="large"
              disabled={isWatermarkedExporting}
              sx={{
                borderRadius: '8px',
                px: { xs: 2.5, sm: 3, md: 4 }, // Адаптивные горизонтальные отступы
                py: { xs: 1, sm: 1.25, md: 1.5 }, // Адаптивные вертикальные отступы
                fontSize: { xs: '0.8rem', sm: '0.875rem', md: '1rem' },
                fontWeight: 600,
                textTransform: 'none',
                borderColor: COLORS.grey[600],
                color: COLORS.grey[600],
                minHeight: { xs: 40, sm: 44, md: 48 }, // Минимальная высота для touch
                '&:hover': {
                  borderColor: COLORS.grey[700],
                  color: COLORS.grey[700]
                },
                '&:disabled': {
                  borderColor: COLORS.grey[400],
                  color: COLORS.grey[400]
                }
              }}
            >
              {isWatermarkedExporting ? 'Processing...' : 'Download'}
            </Button>
          </CardContent>
        </Card>
        )}

        {/* Clean Download */}
        <Card 
          sx={{ 
            flex: 1,
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            border: `2px solid ${COLORS.primary.main}`,
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
            {isCleanExporting ? (
              <CircularProgress 
                size={48} 
                sx={{ 
                  color: COLORS.primary.main,
                  mb: { xs: 1.5, sm: 2 }
                }} 
              />
            ) : (
              <DownloadIcon sx={{ 
                fontSize: { xs: 48, sm: 56, md: 64 }, // Адаптивный размер иконки
                color: COLORS.primary.main,
                mb: { xs: 1.5, sm: 2 }
              }} />
            )}
            <Typography 
              variant="h5" 
              component="h2" 
              sx={{ 
                mb: { xs: 1.5, sm: 2 },
                fontWeight: 600,
                color: COLORS.primary.main,
                fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' } // Адаптивный размер шрифта
              }}
            >
              {isCleanExporting ? 'Generating PDF...' : 'Clean Download'}
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                mb: { xs: 2, sm: 3 },
                color: COLORS.primary.main,
                fontSize: { xs: '0.8rem', sm: '0.875rem', md: '1rem' } // Адаптивный размер шрифта
              }}
            >
              {isCleanExporting ? 'Please wait while we prepare your resume' : 
               isPremium ? 'Download your resume without watermarks' : 
               'Download without watermarks (Pro feature)'}
            </Typography>
            <Button 
              variant="contained" 
              size="large"
              disabled={isCleanExporting}
              sx={{
                borderRadius: '8px',
                px: { xs: 2.5, sm: 3, md: 4 }, // Адаптивные горизонтальные отступы
                py: { xs: 1, sm: 1.25, md: 1.5 }, // Адаптивные вертикальные отступы
                fontSize: { xs: '0.8rem', sm: '0.875rem', md: '1rem' },
                fontWeight: 600,
                textTransform: 'none',
                bgcolor: COLORS.primary.main,
                minHeight: { xs: 40, sm: 44, md: 48 }, // Минимальная высота для touch
                '&:hover': {
                  bgcolor: COLORS.primary.dark
                },
                '&:disabled': {
                  bgcolor: COLORS.grey[400],
                  color: 'white'
                }
              }}
            >
              {isCleanExporting ? 'Processing...' : (isPremium ? 'Download' : 'Upgrade to Pro')}
            </Button>
          </CardContent>
        </Card>
      </Box>

      {/* Paywall Modal */}
      <PaywallModal 
        open={isPaywallModalOpen} 
        onClose={handleClosePaywallModal}
        onSuccess={handlePaywallSuccess}
      />
    </>
  );
};

export default DownloadOptions; 