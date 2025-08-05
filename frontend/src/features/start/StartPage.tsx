import React from 'react';
import Box from '@mui/material/Box';
import Header from '../../shared/components/Header/Header';
import StartOptions from './components/StartOptions';

const StartPage: React.FC = () => {
  return (
    <Box sx={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      bgcolor: '#f5f6fa'
    }}>
      {/* Общая шапка */}
      <Header 
        activeStep={0} 
        showBackButton={false}
        showNextButton={false}
      />
      
      {/* Основная область */}
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        justifyContent: 'center',
        alignItems: 'center',
        p: 4
      }}>
        <StartOptions />
      </Box>
    </Box>
  );
};

export default StartPage; 