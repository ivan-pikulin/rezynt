import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import Tooltip from '@mui/material/Tooltip';
import React, { useState } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { HeaderProps } from './Header.types';
import UserSidebar from './UserSidebar';

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
  showSteps = true
}) => {
  const { user } = useAuthContext();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const steps = ['Start', 'Generate', 'Refine', 'Export'];

  const getInitials = (email: string) => {
    return email.charAt(0).toUpperCase();
  };

  const handleAvatarClick = () => {
    setSidebarOpen(true);
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
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

  return (
    <Box sx={{ 
      bgcolor: 'white', 
      borderBottom: '1px solid #eee',
      px: { xs: 2, sm: 4 }, // Адаптивные отступы
      py: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      {/* Логотип */}
      {showLogo && (
        <Box sx={{ 
          display: { xs: 'none', sm: 'flex' }, // Скрываем на мобильных
          alignItems: 'center' 
        }}>
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

      {/* Центральная область с кнопками и степпером */}
      <Box sx={{ 
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0
      }}>
        {/* Кнопка "Назад" слева */}
        {showSteps && showBackButton && onBack && (
          <Box
            onClick={onBack}
            sx={{
              cursor: 'pointer',
              fontSize: { xs: '1.5rem', sm: '2rem' },
              fontWeight: 'bold',
              color: '#666',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: { xs: 32, sm: 40 },
              height: { xs: 32, sm: 40 },
              '&:hover': {
                color: '#1976d2',
                transform: 'scale(1.1)'
              },
              transition: 'all 0.2s ease'
            }}
          >
            ‹
          </Box>
        )}

        {/* Область степпера с фиксированной шириной */}
        {showSteps && (
          <Box sx={{
            width: { xs: '336px', sm: '480px' },
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
                  fontSize: { xs: '0.75rem', sm: '0.875rem' }
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
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        color: index <= activeStep ? '#1976d2' : '#999',
                        fontWeight: index === activeStep ? 600 : 400,
                        transform: index === activeStep ? 'scale(1.1)' : 'scale(1)',
                        transition: 'all 0.2s ease',
                      },
                      '& .MuiStepLabel-iconContainer': {
                        transform: index === activeStep ? 'scale(1.2)' : 'scale(1)',
                        transition: 'all 0.2s ease',
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

        {/* Кнопка "Вперед" справа */}
        {showSteps && showNextButton && onNext && (
          <Box
            onClick={onNext}
            sx={{
              cursor: 'pointer',
              fontSize: { xs: '1.5rem', sm: '2rem' },
              fontWeight: 'bold',
              color: '#1976d2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: { xs: 32, sm: 40 },
              height: { xs: 32, sm: 40 },
              '&:hover': {
                color: '#1565c0',
                transform: 'scale(1.1)'
              },
              transition: 'all 0.2s ease'
            }}
          >
            ›
          </Box>
        )}
      </Box>

      {/* Аватар пользователя справа */}
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
                bgcolor: '#1976d2',
                fontSize: '1.2rem',
                fontWeight: 600
              }}
            >
              {user ? getInitials(user.email) : 'U'}
            </Avatar>
          </IconButton>
        </Tooltip>
      </Box>
      
      {/* Боковая панель пользователя */}
      <UserSidebar 
        open={sidebarOpen} 
        onClose={handleSidebarClose} 
        anchor="right"
      />
    </Box>
  );
};

export default Header; 