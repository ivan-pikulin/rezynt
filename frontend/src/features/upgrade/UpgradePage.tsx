import CheckIcon from '@mui/icons-material/Check';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import ResumeRenderer from '../../shared/components/ResumeRenderer';
import { useResumeQuery } from '../../shared/hooks/useResumeQuery';
import { COLORS } from '../../shared/theme/theme';

export const UpgradePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const { resume: resumeData, isLoading } = useResumeQuery();

  const features = [
    t('upgrade.features.unlimitedAnalysis'),
    t('upgrade.features.aiImprovements'),
    t('upgrade.features.cleanPDF'),
    t('upgrade.features.prioritySupport')
  ];

  const handleUpgrade = async () => {
    setIsProcessing(true);
    try {
      window.location.assign('https://buy.stripe.com/7sY28t1jrf0n1mt3g743S0K');
    } catch (error) {
      console.error('Failed to process upgrade:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Box
      sx={{
        height: '100vh',
        backgroundColor: COLORS.grey[50],
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >

      <Container 
        maxWidth={false}
        sx={{ 
          py: 4,
          px: { xs: 2, sm: 3, md: 4 },
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden'
        }}
      >
        <Paper
          sx={{
            borderRadius: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            width: '100%',
            maxWidth: 900,
            height: 'auto',
            maxHeight: 700,
            overflow: 'hidden',
            display: 'flex'
          }}
        >
          <Box sx={{ display: 'flex', gap: 0, width: '100%', height: '100%' }}>
            {/* Left Side - Resume Preview */}
            <Box 
              sx={{ 
                width: { xs: 300, sm: 350, md: 400 },
                display: 'none',
                '@media (min-width: 800px)': {
                  display: 'flex'
                },
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                p: { xs: 2, sm: 2.5, md: 3 }
              }}
            >
              {isLoading ? (
                <Typography sx={{ color: COLORS.resume.text.secondary }}>
                  {t('common.loading')}
                </Typography>
              ) : resumeData ? (
                <ResumeRenderer
                  data={resumeData}
                  templateId="nume"
                  scale={0.35}
                />
              ) : null}
            </Box>

            {/* Right Side - Upgrade Content */}
            <Box 
              sx={{ 
                flex: 1,
                overflow: 'auto',
                p: 4,
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <Box
                sx={{
                  maxWidth: 650,
                  mx: 'auto',
                  width: '100%',
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
              {/* Header - Fixed at top */}
              <Box sx={{ flexShrink: 0 }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    mb: 1.5,
                    color: COLORS.resume.text.primary,
                    fontSize: { xs: '1.25rem', md: '1.5rem' }
                  }}
                >
                  {t('upgrade.title')}
                </Typography>

                <Typography
                  variant="body1"
                  sx={{
                    color: COLORS.resume.text.secondary,
                    mb: 3,
                    fontSize: '0.875rem',
                    lineHeight: 1.5
                  }}
                >
                  {t('upgrade.subtitle')}
                </Typography>
              </Box>

              {/* Features List - Centered */}
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                {features.map((feature) => (
                  <Box
                    key={feature}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      mb: 1.5
                    }}
                  >
                    <CheckIcon
                      sx={{
                        color: '#4caf50',
                        fontSize: 18,
                        mr: 1.5
                      }}
                    />
                    <Typography
                      variant="body2"
                      sx={{
                        color: COLORS.resume.text.primary,
                        fontSize: '0.85rem',
                        fontWeight: 500
                      }}
                    >
                      {feature}
                    </Typography>
                  </Box>
                ))}
              </Box>

              {/* Bottom Section - Fixed at bottom */}
              <Box sx={{ flexShrink: 0 }}>
                {/* Pricing */}
                <Box
                  sx={{
                    bgcolor: 'rgba(103, 58, 183, 0.08)',
                    borderRadius: '10px',
                    p: 2.5,
                    mb: 3,
                    border: `2px solid ${COLORS.primary.main}`
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                      mb: 1.5
                    }}
                  >
                    <Typography
                      sx={{
                        fontWeight: 600,
                        color: COLORS.resume.text.primary,
                        fontSize: '1rem'
                      }}
                    >
                      {t('upgrade.pricing.period')}
                    </Typography>
                    <Typography
                      sx={{
                        fontWeight: 700,
                        color: COLORS.primary.main,
                        fontSize: '1.35rem'
                      }}
                    >
                      {t('upgrade.pricing.price')}
                    </Typography>
                  </Box>

                  <Typography
                    variant="body2"
                    sx={{
                      color: COLORS.resume.text.secondary,
                      fontSize: '0.8rem',
                      lineHeight: 1.5
                    }}
                  >
                    {t('upgrade.pricing.description')}
                  </Typography>
                </Box>

                {/* CTA Button with Bottom Note */}
                <Box>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleUpgrade}
                  disabled={isProcessing}
                  sx={{
                    bgcolor: COLORS.primary.main,
                    color: 'white',
                    py: 1.1,
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 3px 10px rgba(103, 58, 183, 0.3)',
                    animation: 'pulse 2s ease-in-out infinite',
                    '@keyframes pulse': {
                      '0%, 100%': {
                        transform: 'scale(1)',
                        boxShadow: '0 3px 10px rgba(103, 58, 183, 0.3)'
                      },
                      '50%': {
                        transform: 'scale(1.02)',
                        boxShadow: '0 5px 20px rgba(103, 58, 183, 0.5)'
                      }
                    },
                    '&:hover': {
                      bgcolor: COLORS.primary.dark,
                      boxShadow: '0 4px 14px rgba(103, 58, 183, 0.4)',
                      animation: 'none'
                    },
                    '&:disabled': {
                      bgcolor: 'rgba(103, 58, 183, 0.5)',
                      color: 'rgba(255, 255, 255, 0.7)',
                      animation: 'none'
                    }
                  }}
                >
                  {isProcessing
                    ? t('upgrade.buttons.processing')
                    : t('upgrade.buttons.continue')}
                </Button>

                {/* Bottom Note */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mt: 1.5
                  }}
                >
                  <VerifiedUserIcon
                    sx={{
                      fontSize: '0.9rem',
                      color: COLORS.resume.text.secondary,
                      opacity: 0.8,
                      mr: 0.5
                    }}
                  />
                  <Typography
                    variant="body2"
                    sx={{
                      color: COLORS.resume.text.secondary,
                      fontSize: '0.7rem',
                      fontStyle: 'italic',
                      opacity: 0.8
                    }}
                  >
                    {t('upgrade.bottomNote')}
                  </Typography>
                </Box>
                </Box>
              </Box>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default UpgradePage;

