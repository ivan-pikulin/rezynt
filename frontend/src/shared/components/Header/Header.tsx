import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import React from 'react';
import { HeaderProps } from './Header.types';

const Header: React.FC<HeaderProps> = ({ 
  activeStep, 
  onNext, 
  onBack, 
  nextButtonText = 'Next',
  previousButtonText,
  showBackButton = true,
  showNextButton = true,
  showLogo = true
}) => {
  const steps = ['Start', 'Generate', 'Refine', 'Export'];

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
              sx={{
                '& .MuiStepLabel-label': {
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  color: index <= activeStep ? '#1976d2' : '#999'
                }
              }}
            >
              {label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Кнопки навигации */}
      <Box sx={{ 
        display: { xs: 'none', sm: 'flex' }, // Скрываем кнопки на мобильных
        alignItems: 'center', 
        gap: { xs: 1, sm: 2 }, // Уменьшаем отступы на мобильных
        width: { xs: 150, sm: 200 }, // Уменьшаем ширину на мобильных
        justifyContent: 'flex-end'
      }}>
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
    </Box>
  );
};

export default Header; 