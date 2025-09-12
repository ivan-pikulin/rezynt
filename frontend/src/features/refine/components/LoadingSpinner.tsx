import React from 'react';
import { Box } from '@mui/material';
import GradientSpinnerAnimation from '../../../shared/components/GradientSpinnerAnimation';

const LoadingSpinner: React.FC = () => {
  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      height: '100%'
    }}>
      <GradientSpinnerAnimation size={40} />
    </Box>
  );
};

export default LoadingSpinner;
