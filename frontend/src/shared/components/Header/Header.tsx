import React from 'react';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import { HeaderProps } from './Header.types';

const Header: React.FC<HeaderProps> = ({ activeStep }) => {
  const steps = ['Start', 'Generate', 'Refine', 'Export'];

  return (
    <Box sx={{ 
      bgcolor: 'white', 
      borderBottom: '1px solid #eee',
      px: 4, 
      py: 2,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      {/* Логотип */}
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
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

      {/* Прогресс-бар */}
      <Stepper activeStep={activeStep} alternativeLabel sx={{ flex: 1, maxWidth: 600, mx: 'auto' }}>
        {steps.map((label, index) => (
          <Step key={label}>
            <StepLabel 
              sx={{
                '& .MuiStepLabel-label': {
                  fontSize: '0.875rem',
                  color: index <= activeStep ? '#1976d2' : '#999'
                }
              }}
            >
              {label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Пустое место для баланса */}
      <Box sx={{ width: 120 }} />
    </Box>
  );
};

export default Header; 