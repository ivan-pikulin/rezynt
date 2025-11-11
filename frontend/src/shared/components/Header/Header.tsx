import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { LoginOutlined as LoginIcon } from '@mui/icons-material';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from '../../contexts/AuthContext';
import { HeaderProps } from './Header.types';
import { COLORS } from '../../theme/theme';
import { useMediaQuery } from '@mui/material';

const Header: React.FC<HeaderProps> = ({ 
  activeStep = 0, 
  onNext, 
  onBack, 
  onStepClick,
  allowFirstStepClick = false,
  disableStepsClick = false,
  nextButtonText = 'Next',
  previousButtonText,
  showBackButton = true,
  showNextButton = true,
  showLogo = true,
  showSteps = true,
  isProUser = false,
  currentTab = 'resumes',
  onTabChange,
  isOnboarding = false,
  onboardingTitle,
  customSteps,
  hideNavigationArrows = false
}) => {
  const { t } = useTranslation();
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const defaultSteps = [t('header.steps.start'), t('header.steps.builder'), t('header.steps.refine'), t('header.steps.export')];
  const steps = customSteps || defaultSteps;
  
  // Define mobile mode for screens up to 768px
  const isMobile = useMediaQuery('(max-width: 768px)');

  const getInitials = (email: string) => {
    return email.charAt(0).toUpperCase();
  };

  const handleAvatarClick = () => {
    // If user is not registered (guest), navigate to login
    if (!user?.is_registered) {
      navigate('/login');
    } else {
      navigate('/profile-settings');
    }
  };

  const handleLogoClick = () => {
    if (!isOnboarding) {
      navigate('/');
    }
  };

  const getPreviousStepName = (step: number) => {
    if (previousButtonText) return previousButtonText;
    
    switch (step) {
      case 1:
        return t('header.steps.start');
      case 2:
        return t('header.steps.builder');
      case 3:
        return t('header.steps.refine');
      default:
        return '';
    }
  };

  const handleStepClick = (stepIndex: number) => {
    if (onStepClick && !disableStepsClick) {
      onStepClick(stepIndex);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    if (onTabChange) {
      onTabChange(newValue as 'resumes' | 'ai-writer' | 'editor' | 'build' | 'analyze' | 'export');
    }
  };

  // Determine if user is pro (use prop or check user context)
  const isPro = isProUser || user?.is_premium;

  return (
    <Box sx={{ 
      bgcolor: 'white', 
      borderBottom: '1px solid #eee',
      px: isMobile ? 2 : 4,
      py: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
              {/* Logo */}
      {showLogo && (
        <Box 
          onClick={handleLogoClick}
          sx={{ 
            display: isMobile ? 'none' : 'flex', // Hide on mobile
            alignItems: 'center',
            cursor: isOnboarding ? 'default' : 'pointer',
            '&:hover': {
              opacity: isOnboarding ? 1 : 0.8
            },
            transition: 'opacity 0.2s ease'
          }}
        >
          <img 
            src="/rezynt-logo-with-name.svg" 
            alt="Rezynt" 
            style={{ 
              height: '32px', 
              width: 'auto',
              maxWidth: '160px'
            }} 
          />
        </Box>
      )}

              {/* Central area with buttons and stepper/tabs */}
      <Box sx={{ 
        flex: 1,
        minWidth: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0
      }}>
        {isOnboarding ? (
          /* Onboarding title */
          <Box sx={{ textAlign: 'center' }}>
            <Typography 
              variant="h5" 
              component="h1"
              sx={{
                fontWeight: 600,
                color: COLORS.primary.main,
                fontSize: isMobile ? '1.25rem' : '1.5rem',
                textAlign: 'center',
              }}
            >
              {onboardingTitle || t('onboarding.title')}
            </Typography>
          </Box>
        ) : isPro ? (
          /* Tabs for pro users */
          <Box sx={{
            width: isMobile ? '300px' : '400px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Tabs
              value={currentTab}
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{
                width: '100%',
                '& .MuiTab-root': {
                  fontSize: isMobile ? '0.75rem' : '0.875rem',
                  fontWeight: 500,
                  textTransform: 'none',
                  minHeight: 40,
                  '&.Mui-selected': {
                    color: COLORS.primary.main,
                    fontWeight: 600,
                  }
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: COLORS.primary.main,
                  height: 3,
                }
              }}
            >
              <Tab label={t('header.tabs.build')} value="build" />
              <Tab label={t('header.tabs.analyze')} value="analyze" />
              <Tab label={t('header.tabs.export')} value="export" />
            </Tabs>
          </Box>
        ) : (
          /* Steps for regular users */
          <>
            {/* Back button on left */}
            {showSteps && showBackButton && onBack && !hideNavigationArrows && (
              <Box
                onClick={onBack}
                sx={{
                  cursor: 'pointer',
                  fontSize: isMobile ? 'clamp(1.1rem, 6vw, 1.5rem)' : '2rem',
                  fontWeight: 'bold',
                  color: '#666',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: isMobile ? 'clamp(28px, 8vw, 40px)' : 40,
                  height: isMobile ? 'clamp(28px, 8vw, 40px)' : 40,
                  lineHeight: 1,
                  '&:hover': {
                    color: COLORS.primary.main,
                    transform: 'scale(1.1)'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                ‹
              </Box>
            )}

            {/* Stepper area with responsive width */}
            {showSteps && (
              <Box sx={{
                // On mobile take remaining space between arrows; on desktop keep fixed max width
                flex: isMobile ? 1 : 'unset',
                minWidth: isMobile ? 0 : 'unset',
                width: isMobile ? 'auto' : '480px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Stepper 
                  activeStep={activeStep} 
                  alternativeLabel 
                  sx={{ 
                    width: '100%',
                    '& .MuiStepLabel-label': {
                      fontSize: isMobile ? 'clamp(0.6rem, 2.8vw, 0.75rem)' : '0.875rem',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    },
                    '& .MuiStepIcon-root': {
                      fontSize: isMobile ? 'clamp(18px, 5vw, 24px)' : 24
                    }
                  }}
                >
                  {steps.map((label, index) => {
                    const canClickStep = (index === 0 ? allowFirstStepClick : true) && Boolean(onStepClick) && !disableStepsClick;
                    return (
                      <Step key={label}>
                        <StepLabel 
                          onClick={canClickStep ? () => handleStepClick(index) : undefined}
                          sx={{
                            cursor: canClickStep ? 'pointer' : 'default',
                            transition: 'all 0.2s ease',
                            '&:hover': canClickStep ? {
                              transform: 'scale(1.05)',
                            } : {},
                            '& .MuiStepLabel-label': {
                              fontSize: isMobile ? 'clamp(0.6rem, 2.8vw, 0.75rem)' : '0.875rem',
                              color: disableStepsClick && index > activeStep ? '#ccc !important' : 
                                     index <= activeStep ? `${COLORS.primary.main} !important` : '#999 !important',
                              fontWeight: index === activeStep ? 600 : 400,
                              transform: index === activeStep ? (isMobile ? 'scale(1.08)' : 'scale(1.1)') : 'scale(1)',
                              transition: 'all 0.2s ease',
                              display: isMobile ? 'none' : 'block',
                            },
                            '& .MuiStepLabel-iconContainer': {
                              transform: index === activeStep ? (isMobile ? 'scale(1.1)' : 'scale(1.2)') : 'scale(1)',
                              transition: 'all 0.2s ease',
                              '& .MuiStepIcon-root': {
                                color: disableStepsClick && index > activeStep ? '#ccc' :
                                       index <= activeStep ? COLORS.primary.main : '#999',
                              }
                            }
                          }}
                        >
                          {label}
                        </StepLabel>
                      </Step>
                    );
                  })}
                </Stepper>
              </Box>
            )}

            {/* Forward button on right */}
            {showSteps && showNextButton && onNext && !hideNavigationArrows && (
              <Box
                onClick={onNext}
                sx={{
                  cursor: 'pointer',
                  fontSize: isMobile ? 'clamp(1.1rem, 6vw, 1.5rem)' : '2rem',
                  fontWeight: 'bold',
                  color: COLORS.primary.main,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: isMobile ? 'clamp(28px, 8vw, 40px)' : 40,
                  height: isMobile ? 'clamp(28px, 8vw, 40px)' : 40,
                  lineHeight: 1,
                  '&:hover': {
                    color: COLORS.primary.dark,
                    transform: 'scale(1.1)'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                ›
              </Box>
            )}
          </>
        )}
      </Box>

              {/* User avatar on right - hide in onboarding mode */}
      {!isOnboarding && (
        <Box sx={{ 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end'
        }}>
          {user?.is_registered ? (
            // Registered user - show avatar
            <Tooltip title={t('header.profile')}>
              <IconButton
                onClick={handleAvatarClick}
                sx={{
                  p: 0,
                  position: 'relative',
                  '&:hover': {
                    transform: 'scale(1.05)'
                  },
                  // Premium glow effect
                  ...(isPro && {
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: isMobile ? 'clamp(48px, 13vw, 60px)' : '60px',
                      height: isMobile ? 'clamp(48px, 13vw, 60px)' : '60px',
                      borderRadius: '50%',
                      background: `radial-gradient(circle, ${COLORS.primary.main}40 0%, ${COLORS.primary.main}20 40%, transparent 70%)`,
                      animation: 'pulse-glow 2s ease-in-out infinite',
                      zIndex: -1,
                    },
                    '@keyframes pulse-glow': {
                      '0%, 100%': {
                        opacity: 0.6,
                        transform: 'translate(-50%, -50%) scale(0.95)',
                      },
                      '50%': {
                        opacity: 1,
                        transform: 'translate(-50%, -50%) scale(1.1)',
                      },
                    },
                  }),
                }}
              >
                <Avatar
                  sx={{
                    width: isMobile ? 'clamp(32px, 9vw, 40px)' : 40,
                    height: isMobile ? 'clamp(32px, 9vw, 40px)' : 40,
                    bgcolor: COLORS.primary.main,
                    fontSize: isMobile ? 'clamp(0.9rem, 3.5vw, 1.2rem)' : '1.2rem',
                    fontWeight: 600,
                    // Premium border
                    ...(isPro && {
                      boxShadow: `0 0 0 2px white, 0 0 0 3px ${COLORS.primary.main}, 0 0 12px ${COLORS.primary.main}60`,
                    }),
                  }}
                >
                  {user?.email ? getInitials(user.email) : 'U'}
                </Avatar>
              </IconButton>
            </Tooltip>
          ) : (
            // Guest user - show login icon
            <Tooltip title={t('header.userSidebar.login')}>
              <IconButton
                onClick={handleAvatarClick}
                sx={{
                  p: 1,
                  '&:hover': {
                    transform: 'scale(1.05)',
                    bgcolor: 'rgba(0, 0, 0, 0.04)'
                  }
                }}
              >
                <LoginIcon
                  sx={{
                    width: isMobile ? 'clamp(24px, 7vw, 28px)' : 28,
                    height: isMobile ? 'clamp(24px, 7vw, 28px)' : 28,
                    color: COLORS.primary.main
                  }}
                />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      )}
    </Box>
  );
};

export default Header; 