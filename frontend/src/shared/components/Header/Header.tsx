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
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';
import { HeaderProps } from './Header.types';
import UserSidebar from './UserSidebar';
import { COLORS } from '../../theme/theme';
import { useMediaQuery } from '@mui/material';

const Header: React.FC<HeaderProps> = ({ 
  activeStep = 0, 
  onNext, 
  onBack, 
  onStepClick,
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
  onboardingTitle = 'Welcome to Rezynt!'
}) => {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const steps = ['Start', 'Generate', 'Refine', 'Export'];
  
  // Define mobile mode for screens up to 768px
  const isMobile = useMediaQuery('(max-width: 768px)');

  const getInitials = (email: string) => {
    return email.charAt(0).toUpperCase();
  };

  const handleAvatarClick = () => {
    setSidebarOpen(true);
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
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
        return 'Start';
      case 2:
        return 'Generate';
      case 3:
        return 'Refine';
      default:
        return '';
    }
  };

  const handleStepClick = (stepIndex: number) => {
    if (onStepClick) {
      onStepClick(stepIndex);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    if (onTabChange) {
      onTabChange(newValue as 'resumes' | 'ai-writer' | 'editor');
    }
  };

  // Determine if user is pro (use prop or check user context)
  const isPro = isProUser || user?.is_premium;

  return (
    <Box sx={{ 
      bgcolor: 'white', 
      borderBottom: '1px solid #eee',
              px: isMobile ? 2 : 4, // Adaptive padding
      py: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
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
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0
      }}>
        {isOnboarding ? (
          /* Onboarding title and subtitle */
          <Box sx={{ textAlign: 'center' }}>
            <Typography 
              variant="h5" 
              component="h1"
              sx={{
                fontWeight: 600,
                color: COLORS.primary.main,
                fontSize: isMobile ? '1.25rem' : '1.5rem',
                textAlign: 'center',
                mb: 1
              }}
            >
              {onboardingTitle}
            </Typography>
            <Typography 
              variant="body2" 
              component="p"
              sx={{
                fontWeight: 400,
                color: 'text.secondary',
                opacity: 0.7,
                fontSize: isMobile ? '0.875rem' : '1rem',
                textAlign: 'center'
              }}
            >
              Let's get to know you better to personalize your experience
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
              <Tab label="Resumes" value="resumes" />
              <Tab label="AI Writer" value="ai-writer" />
              <Tab label="Editor" value="editor" />
            </Tabs>
          </Box>
        ) : (
          /* Steps for regular users */
          <>
            {/* Back button on left */}
            {showSteps && showBackButton && onBack && (
              <Box
                onClick={onBack}
                sx={{
                  cursor: 'pointer',
                  fontSize: isMobile ? '1.5rem' : '2rem',
                  fontWeight: 'bold',
                  color: '#666',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: isMobile ? 32 : 40,
                  height: isMobile ? 32 : 40,
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

            {/* Stepper area with fixed width */}
            {showSteps && (
              <Box sx={{
                width: isMobile ? '336px' : '480px',
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
                      fontSize: isMobile ? '0.75rem' : '0.875rem'
                    }
                  }}
                >
                  {steps.map((label, index) => (
                    <Step key={label}>
                      <StepLabel 
                        onClick={index === 0 ? undefined : () => handleStepClick(index)}
                        sx={{
                          cursor: index === 0 ? 'default' : (onStepClick ? 'pointer' : 'default'),
                          transition: 'all 0.2s ease',
                          '&:hover': index === 0 ? {} : (onStepClick ? {
                            transform: 'scale(1.05)',
                          } : {}),
                          '& .MuiStepLabel-label': {
                            fontSize: isMobile ? '0.75rem' : '0.875rem',
                            color: index <= activeStep ? `${COLORS.primary.main} !important` : '#999 !important',
                            fontWeight: index === activeStep ? 600 : 400,
                            transform: index === activeStep ? 'scale(1.1)' : 'scale(1)',
                            transition: 'all 0.2s ease',
                          },
                          '& .MuiStepLabel-iconContainer': {
                            transform: index === activeStep ? 'scale(1.2)' : 'scale(1)',
                            transition: 'all 0.2s ease',
                            '& .MuiStepIcon-root': {
                              color: index <= activeStep ? COLORS.primary.main : '#999',
                            }
                          }
                        }}
                      >
                        {label}
                      </StepLabel>
                    </Step>
                  ))}
                </Stepper>
              </Box>
            )}

            {/* Forward button on right */}
            {showSteps && showNextButton && onNext && (
              <Box
                onClick={onNext}
                sx={{
                  cursor: 'pointer',
                  fontSize: isMobile ? '1.5rem' : '2rem',
                  fontWeight: 'bold',
                  color: COLORS.primary.main,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: isMobile ? 32 : 40,
                  height: isMobile ? 32 : 40,
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
          <Tooltip title="Profile">
            <IconButton
              onClick={handleAvatarClick}
              sx={{
                p: 0,
                '&:hover': {
                  transform: 'scale(1.05)'
                }
              }}
            >
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: COLORS.primary.main,
                  fontSize: '1.2rem',
                  fontWeight: 600
                }}
              >
                {user ? getInitials(user.email) : 'U'}
              </Avatar>
            </IconButton>
          </Tooltip>
        </Box>
      )}
      
              {/* User sidebar */}
      <UserSidebar 
        open={sidebarOpen} 
        onClose={handleSidebarClose} 
        anchor="right"
      />
    </Box>
  );
};

export default Header; 