import React from 'react';
import Box from '@mui/material/Box';
import Header from '../../shared/components/Header/Header';
import DownloadOptions from './components/DownloadOptions';

const ExportPage: React.FC = () => {
  return (
    <Box sx={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      bgcolor: '#f5f6fa'
    }}>
      {/* Общая шапка */}
      <Header activeStep={3} />
      
      {/* Основная область */}
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        justifyContent: 'center',
        alignItems: 'center',
        p: 4
      }}>
        <DownloadOptions />
      </Box>
    </Box>
  );
};

export default ExportPage; 