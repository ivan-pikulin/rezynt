import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import Avatar from '@mui/material/Avatar';
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
      py: 2,
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

      {/* Прогресс-бар */}
      {showSteps && (
        <Stepper 
          activeStep={activeStep} 
          alternativeLabel 
          sx={{ 
            flex: { xs: 1, sm: 1 }, // Занимаем всю доступную ширину на мобильных
            maxWidth: { xs: '100%', sm: 600 }, // Полная ширина на мобильных
            mx: { xs: 0, sm: 'auto' }, // Убираем отступы на мобильных
            '& .MuiStepLabel-label': {
              fontSize: { xs: '0.75rem', sm: '0.875rem' } // Уменьшаем шрифт на мобильных
            }
          }}
        >
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel 
                onClick={() => handleStepClick(index)}
                sx={{
                  cursor: onStepClick ? 'pointer' : 'default',
                  transition: 'all 0.2s ease',
                  '&:hover': onStepClick ? {
                    transform: 'scale(1.05)',
                  } : {},
                  '& .MuiStepLabel-label': {
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    color: index <= activeStep ? '#1976d2' : '#999',
                    fontWeight: index === activeStep ? 600 : 400, // Выделяем текущий шаг жирным шрифтом
                    transform: index === activeStep ? 'scale(1.1)' : 'scale(1)', // Укрупняем текущий шаг
                    transition: 'all 0.2s ease',
                  },
                  '& .MuiStepLabel-iconContainer': {
                    transform: index === activeStep ? 'scale(1.2)' : 'scale(1)', // Укрупняем иконку текущего шага
                    transition: 'all 0.2s ease',
                  }
                }}
              >
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      )}

            {/* Кнопки навигации */}
      {showSteps ? (
        <Box sx={{ 
          display: { xs: 'none', sm: 'flex' }, // Скрываем кнопки на мобильных
          alignItems: 'center', 
          gap: { xs: 1, sm: 2 }, // Уменьшаем отступы на мобильных
          width: { xs: 150, sm: 200 }, // Уменьшаем ширину на мобильных
          justifyContent: 'flex-end'
        }}>
          {/* Аватар пользователя */}
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
        {showBackButton && onBack && (
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={onBack}
            sx={{
              borderRadius: '6px',
              px: { xs: 2, sm: 3 }, // Адаптивные отступы
              py: 1.5,
              fontSize: { xs: '0.75rem', sm: '0.875rem' }, // Уменьшаем шрифт на мобильных
              fontWeight: 500,
              textTransform: 'none',
              borderColor: '#ddd',
              color: '#666',
              minWidth: { xs: '60px', sm: '80px' }, // Уменьшаем минимальную ширину на мобильных
              whiteSpace: 'nowrap',
              '&:hover': {
                borderColor: '#999',
                bgcolor: '#f8f9fa'
              }
            }}
          >
            {getPreviousStepName(activeStep)}
          </Button>
        )}
        {showNextButton && onNext && (
          <Button 
            variant="contained" 
            endIcon={<ArrowForwardIcon />}
            onClick={onNext}
            sx={{
              borderRadius: '6px',
              px: { xs: 3, sm: 4 }, // Адаптивные отступы
              py: 1.5,
              fontSize: { xs: '0.75rem', sm: '0.875rem' }, // Уменьшаем шрифт на мобильных
              fontWeight: 600,
              textTransform: 'none',
              bgcolor: '#1976d2',
              minWidth: { xs: '60px', sm: '80px' }, // Уменьшаем минимальную ширину на мобильных
              whiteSpace: 'nowrap',
              '&:hover': {
                bgcolor: '#1565c0'
              },
              boxShadow: '0 2px 4px rgba(25, 118, 210, 0.2)'
            }}
          >
            {nextButtonText}
          </Button>
        )}
      </Box>
      ) : (
        // Когда шаги скрыты, показываем только аватар справа
        <Box sx={{ 
          display: { xs: 'none', sm: 'flex' },
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
      )}
      
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